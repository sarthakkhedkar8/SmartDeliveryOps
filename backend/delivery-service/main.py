import os

import psycopg2
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


# Create FastAPI application
app = FastAPI(
    title="SmartDeliveryOps Delivery Service",
    description="Smart Delivery Management API",
    version="1.0.0"
)


# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Delivery request model
class Delivery(BaseModel):
    customer_name: str
    address: str
    product: str
    status: str = "pending"


# PostgreSQL connection
def get_db_connection():
    return psycopg2.connect(DATABASE_URL)


# Root endpoint
@app.get("/")
def root():
    return {
        "service": "delivery-service",
        "project": "SmartDeliveryOps",
        "status": "running"
    }


# Health check endpoint
@app.get("/health")
def health():
    connection = get_db_connection()
    connection.close()

    return {
        "status": "healthy",
        "database": "connected"
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


# Create new delivery
@app.post("/deliveries")
def create_delivery(delivery: Delivery):

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO deliveries
        (
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
        "message": "Delivery created successfully",
        "delivery": {
            "id": row[0],
            "customer_name": row[1],
            "address": row[2],
            "product": row[3],
            "status": row[4],
            "created_at": row[5]
        }
    }
