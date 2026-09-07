import os
import requests

import psycopg2
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

ORCHESTRATOR_URL = os.getenv(
    "ORCHESTRATOR_URL",
    "http://ai-orchestrator-service:8004"
)


AI_SERVICE_URL = os.getenv(
    "AI_SERVICE_URL",
    "http://ai-prediction-service:8002"
)

app = FastAPI(
    title="SmartDeliveryOps Delivery Service",
    version="1.0.0"
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Delivery model
class Delivery(BaseModel):
    customer_name: str
    address: str
    product: str
    status: str = "pending"


# Status update model
class StatusUpdate(BaseModel):
    status: str


# PostgreSQL connection
def get_db_connection():
    if not DATABASE_URL:
        raise Exception("DATABASE_URL is not configured")

    return psycopg2.connect(DATABASE_URL)


# Health check
@app.get("/health")
def health_check():

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT 1")
        cursor.fetchone()

        cursor.close()
        connection.close()

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as error:

        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(error)
        }


# Get all deliveries
@app.get("/deliveries")
def get_deliveries():

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            id,
            customer_name,
            address,
            product,
            status,
            created_at
        FROM deliveries
        ORDER BY id
    """)

    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    deliveries = []

    for row in rows:

        deliveries.append({
            "id": row[0],
            "customer_name": row[1],
            "address": row[2],
            "product": row[3],
            "status": row[4],
            "created_at": row[5]
        })

    return {
        "count": len(deliveries),
        "deliveries": deliveries
    }


# Get single delivery
@app.get("/deliveries/{delivery_id}")
def get_delivery(delivery_id: int):

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            id,
            customer_name,
            address,
            product,
            status,
            created_at
        FROM deliveries
        WHERE id = %s
    """, (delivery_id,))

    row = cursor.fetchone()

    cursor.close()
    connection.close()

    if not row:
        raise HTTPException(
            status_code=404,
            detail="Delivery not found"
        )

    return {
        "id": row[0],
        "customer_name": row[1],
        "address": row[2],
        "product": row[3],
        "status": row[4],
        "created_at": row[5]
    }


# Create delivery
@app.post("/deliveries")
def create_delivery(delivery: Delivery):

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO deliveries (
            customer_name,
            address,
            product,
            status
        )
        VALUES (%s, %s, %s, %s)
        RETURNING
            id,
            customer_name,
            address,
            product,
            status,
            created_at
    """, (
        delivery.customer_name,
        delivery.address,
        delivery.product,
        delivery.status
    ))

    row = cursor.fetchone()

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "id": row[0],
        "customer_name": row[1],
        "address": row[2],
        "product": row[3],
        "status": row[4],
        "created_at": row[5]
    }


# Update delivery status
@app.patch("/deliveries/{delivery_id}/status")
def update_delivery_status(
    delivery_id: int,
    status_update: StatusUpdate
):

    allowed_statuses = [
        "pending",
        "processing",
        "out_for_delivery",
        "delivered",
        "cancelled"
    ]

    if status_update.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Invalid delivery status",
                "allowed_statuses": allowed_statuses
            }
        )

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        UPDATE deliveries
        SET status = %s
        WHERE id = %s
        RETURNING
            id,
            customer_name,
            address,
            product,
            status,
            created_at
    """, (
        status_update.status,
        delivery_id
    ))

    row = cursor.fetchone()

    if not row:
        connection.rollback()
        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Delivery not found"
        )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "id": row[0],
        "customer_name": row[1],
        "address": row[2],
        "product": row[3],
        "status": row[4],
        "created_at": row[5]
    }


# AI Prediction endpoint
@app.get("/ai/predictions")
def get_ai_predictions():

    try:

        response = requests.get(
            f"{AI_SERVICE_URL}/predictions",
            timeout=10
        )

        response.raise_for_status()

        ai_result = response.json()

        return {
            "source": "ai-prediction-service",
            "ai_service_url": AI_SERVICE_URL,
            "count": ai_result.get("count", 0),
            "predictions": ai_result.get("predictions", [])
        }

    except requests.exceptions.RequestException as error:

        return {
            "source": "backend-fallback",
            "ai_service_url": AI_SERVICE_URL,
            "error": str(error),
            "count": 0,
            "predictions": []
        }


# ============================================================
# DAY 17 - AI ORCHESTRATOR INTEGRATION
# ============================================================

@app.get("/ai/agents")
def get_ai_agents():

    try:

        response = requests.get(
            f"{ORCHESTRATOR_URL}/agents",
            timeout=30
        )

        response.raise_for_status()

        data = response.json()

        return {
            "source": "ai-orchestrator-service",
            "orchestrator_url": ORCHESTRATOR_URL,
            "count": data.get("count", 0),
            "agents": data.get("agents", [])
        }

    except requests.exceptions.RequestException as error:

        return {
            "source": "backend-fallback",
            "orchestrator_url": ORCHESTRATOR_URL,
            "count": 0,
            "agents": [],
            "error": str(error)
        }


@app.get("/ai/orchestrate")
def run_ai_orchestration():

    try:

        response = requests.get(
            f"{ORCHESTRATOR_URL}/orchestrate/all",
            timeout=600
        )

        response.raise_for_status()

        data = response.json()

        return {
            "source": "ai-orchestrator-service",
            "orchestrator_url": ORCHESTRATOR_URL,
            "status": data.get("status", "unknown"),
            "delivery_count": data.get("delivery_count", 0),
            "agent_count": data.get("agent_count", 0),
            "results": data.get("results", [])
        }

    except requests.exceptions.RequestException as error:

        return {
            "source": "backend-fallback",
            "orchestrator_url": ORCHESTRATOR_URL,
            "status": "error",
            "delivery_count": 0,
            "agent_count": 0,
            "results": [],
            "error": str(error)
        }


# ============================================================
# DAY 17 - SYSTEM HEALTH
# ============================================================

@app.get("/system/health")
def system_health():

    services = {
        "backend": "http://backend-service:8001/health",
        "ai_prediction": "http://ai-prediction-service:8002/health",
        "ai_model": "http://ai-model-service:8003/health",
        "ai_orchestrator": "http://ai-orchestrator-service:8004/health",
    }

    results = {}

    for service_name, url in services.items():

        try:

            response = requests.get(
                url,
                timeout=10
            )

            response.raise_for_status()

            data = response.json()

            results[service_name] = {
                "status": "healthy",
                "http_status": response.status_code,
                "details": data
            }

        except Exception as error:

            results[service_name] = {
                "status": "unhealthy",
                "http_status": 0,
                "error": str(error)
            }

    healthy = sum(
        1
        for item in results.values()
        if item["status"] == "healthy"
    )

    total = len(results)

    overall = (
        "healthy"
        if healthy == total
        else "degraded"
        if healthy > 0
        else "critical"
    )

    return {
        "overall_status": overall,
        "healthy_services": healthy,
        "total_services": total,
        "services": results
    }
