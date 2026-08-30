from fastapi import FastAPI
from pydantic import BaseModel
from typing import List


app = FastAPI(
    title="SmartDeliveryOps Delivery Service",
    description="Smart Delivery Management API",
    version="1.0.0"
)


class Delivery(BaseModel):
    customer_name: str
    address: str
    product: str
    status: str = "pending"


deliveries: List[Delivery] = []


@app.get("/")
def root():
    return {
        "service": "delivery-service",
        "project": "SmartDeliveryOps",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/deliveries")
def get_deliveries():
    return {
        "count": len(deliveries),
        "deliveries": deliveries
    }


@app.post("/deliveries")
def create_delivery(delivery: Delivery):
    deliveries.append(delivery)

    return {
        "message": "Delivery created successfully",
        "delivery": delivery
    }
