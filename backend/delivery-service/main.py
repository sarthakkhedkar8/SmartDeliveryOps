import os
import requests

import psycopg2
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

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
