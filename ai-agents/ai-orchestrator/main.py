import os
import requests

from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI(
    title="SmartDeliveryOps Agentic AI Orchestrator",
    description="Five-agent AI orchestration service for delivery operations",
    version="1.0.0",
)


AI_MODEL_URL = os.getenv(
    "AI_MODEL_URL",
    "http://ai-model-service:8003"
)

AI_PREDICTION_URL = os.getenv(
    "AI_PREDICTION_URL",
    "http://ai-prediction-service:8002"
)


# ============================================================
# REQUEST MODEL
# ============================================================

class DeliveryRequest(BaseModel):
    delivery_id: int
    customer_name: str
    address: str
    product: str
    status: str


# ============================================================
# AGENT 1 - DELIVERY MONITORING AGENT
# ============================================================

class DeliveryMonitoringAgent:

    name = "Delivery Monitoring Agent"

    def analyze(self, delivery):

        status = delivery["status"]

        if status == "delivered":
            condition = "Delivery completed successfully"

        elif status == "out_for_delivery":
            condition = "Delivery is currently out for delivery"

        elif status == "processing":
            condition = "Delivery is being processed"

        elif status == "pending":
            condition = "Delivery is waiting for processing"

        else:
            condition = "Delivery has an unknown status"

        return {
            "agent": self.name,
            "status": status,
            "condition": condition
        }


# ============================================================
# AGENT 2 - DELAY PREDICTION AGENT
# ============================================================

class DelayPredictionAgent:

    name = "Delay Prediction Agent"

    def analyze(self, delivery):

        status = delivery["status"]

        if status == "delivered":
            risk = "LOW"
            probability = 0

        elif status == "out_for_delivery":
            risk = "LOW"
            probability = 10

        elif status == "processing":
            risk = "MEDIUM"
            probability = 30

        else:
            risk = "HIGH"
            probability = 50

        return {
            "agent": self.name,
            "risk": risk,
            "delay_probability": probability
        }


# ============================================================
# AGENT 3 - ROUTE OPTIMIZATION AGENT
# ============================================================

class RouteOptimizationAgent:

    name = "Route Optimization Agent"

    def analyze(self, delivery):

        address = delivery["address"]

        return {
            "agent": self.name,
            "destination": address,
            "recommendation": (
                "Use the shortest available delivery route "
                "and prioritize high-risk deliveries."
            )
        }


# ============================================================
# AGENT 4 - INCIDENT RECOVERY AGENT
# ============================================================

class IncidentRecoveryAgent:

    name = "Incident Recovery Agent"

    def analyze(self, delivery):

        status = delivery["status"]

        if status == "pending":

            action = (
                "Investigate pending delivery, "
                "verify fulfillment status and escalate if required."
            )

        elif status == "processing":

            action = (
                "Monitor processing stage and contact operations "
                "team if processing exceeds expected time."
            )

        else:

            action = "No immediate recovery action required."

        return {
            "agent": self.name,
            "recovery_action": action
        }


# ============================================================
# AGENT 5 - NOTIFICATION & DECISION AGENT
# ============================================================

class NotificationDecisionAgent:

    name = "Notification & Decision Agent"

    def analyze(self, delivery, risk):

        if risk == "HIGH":

            decision = "ESCALATE"
            notification = (
                "Notify operations team immediately "
                "and review the delivery."
            )

        elif risk == "MEDIUM":

            decision = "MONITOR"
            notification = (
                "Continue monitoring and notify operations "
                "if risk increases."
            )

        else:

            decision = "NORMAL"
            notification = "No immediate notification required."

        return {
            "agent": self.name,
            "decision": decision,
            "notification": notification
        }


# ============================================================
# INITIALIZE AGENTS
# ============================================================

monitoring_agent = DeliveryMonitoringAgent()
delay_agent = DelayPredictionAgent()
route_agent = RouteOptimizationAgent()
incident_agent = IncidentRecoveryAgent()
notification_agent = NotificationDecisionAgent()


# ============================================================
# LOCAL LLM REASONING
# ============================================================

def ask_local_llm(delivery, agent_results):

    prompt = f"""
You are the SmartDeliveryOps AI Operations Manager.

Analyze this delivery:

Delivery ID: {delivery['delivery_id']}
Customer: {delivery['customer_name']}
Product: {delivery['product']}
Address: {delivery['address']}
Status: {delivery['status']}

Agent observations:

{agent_results}

Give a concise operational decision.

Return exactly:

Priority: LOW/MEDIUM/HIGH
Action: <one short action>
Reason: <one short reason>
"""

    try:

        response = requests.post(
            f"{AI_MODEL_URL}/generate",
            json={
                "prompt": prompt
            },
            timeout=180
        )

        response.raise_for_status()

        data = response.json()

        return {
            "status": "success",
            "model": data.get("model"),
            "reasoning": data.get("response", "")
        }

    except requests.exceptions.RequestException as error:

        return {
            "status": "fallback",
            "model": None,
            "reasoning": (
                "Local LLM unavailable. "
                "Continue using deterministic agent decisions."
            ),
            "error": str(error)
        }


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "service": "smartdeliveryops-ai-orchestrator",
        "status": "running",
        "agents": 5,
        "llm": "qwen2.5:0.5b"
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    ai_model = "unknown"
    ai_prediction = "unknown"

    try:

        response = requests.get(
            f"{AI_MODEL_URL}/health",
            timeout=10
        )

        if response.status_code == 200:
            ai_model = "healthy"

    except requests.exceptions.RequestException:
        ai_model = "unavailable"

    try:

        response = requests.get(
            f"{AI_PREDICTION_URL}/health",
            timeout=10
        )

        if response.status_code == 200:
            ai_prediction = "healthy"

    except requests.exceptions.RequestException:
        ai_prediction = "unavailable"

    return {
        "status": "healthy",
        "service": "ai-orchestrator",
        "agents": 5,
        "ai_model_service": ai_model,
        "ai_prediction_service": ai_prediction
    }


# ============================================================
# AGENTS INFORMATION
# ============================================================

@app.get("/agents")
def agents():

    return {
        "count": 5,
        "agents": [
            {
                "id": 1,
                "name": "Delivery Monitoring Agent",
                "purpose": "Monitor delivery lifecycle and status"
            },
            {
                "id": 2,
                "name": "Delay Prediction Agent",
                "purpose": "Predict delivery delay risk"
            },
            {
                "id": 3,
                "name": "Route Optimization Agent",
                "purpose": "Recommend delivery route optimization"
            },
            {
                "id": 4,
                "name": "Incident Recovery Agent",
                "purpose": "Recommend recovery actions"
            },
            {
                "id": 5,
                "name": "Notification & Decision Agent",
                "purpose": "Make operational decisions and notifications"
            }
        ]
    }


# ============================================================
# SINGLE DELIVERY ORCHESTRATION
# ============================================================

@app.post("/orchestrate")
def orchestrate(delivery_request: DeliveryRequest):

    delivery = delivery_request.model_dump()

    monitoring = monitoring_agent.analyze(delivery)

    delay = delay_agent.analyze(delivery)

    route = route_agent.analyze(delivery)

    incident = incident_agent.analyze(delivery)

    notification = notification_agent.analyze(
        delivery,
        delay["risk"]
    )

    agent_results = {
        "monitoring_agent": monitoring,
        "delay_prediction_agent": delay,
        "route_optimization_agent": route,
        "incident_recovery_agent": incident,
        "notification_decision_agent": notification
    }

    llm_reasoning = ask_local_llm(
        delivery,
        agent_results
    )

    return {
        "delivery": delivery,
        "orchestrator": "SmartDeliveryOps AI Orchestrator",
        "agent_count": 5,
        "agents": agent_results,
        "local_llm": llm_reasoning
    }


# ============================================================
# ORCHESTRATE ALL CURRENT DELIVERIES
# ============================================================

@app.get("/orchestrate/all")
def orchestrate_all():

    try:

        response = requests.get(
            f"{AI_PREDICTION_URL}/predictions",
            timeout=30
        )

        response.raise_for_status()

        prediction_data = response.json()

        predictions = prediction_data.get(
            "predictions",
            []
        )

    except requests.exceptions.RequestException as error:

        return {
            "status": "error",
            "message": "Unable to retrieve deliveries from AI prediction service",
            "error": str(error)
        }

    results = []

    for prediction in predictions:

        delivery = {
            "delivery_id": prediction["delivery_id"],
            "customer_name": prediction["customer_name"],
            "address": "Available through delivery service",
            "product": prediction["product"],
            "status": prediction["status"]
        }

        monitoring = monitoring_agent.analyze(delivery)

        delay = delay_agent.analyze(delivery)

        route = route_agent.analyze(delivery)

        incident = incident_agent.analyze(delivery)

        notification = notification_agent.analyze(
            delivery,
            delay["risk"]
        )

        agent_results = {
            "monitoring_agent": monitoring,
            "delay_prediction_agent": delay,
            "route_optimization_agent": route,
            "incident_recovery_agent": incident,
            "notification_decision_agent": notification
        }

        llm_reasoning = ask_local_llm(
            delivery,
            agent_results
        )

        results.append({
            "delivery": delivery,
            "agents": agent_results,
            "local_llm": llm_reasoning
        })

    return {
        "status": "success",
        "delivery_count": len(results),
        "agent_count": 5,
        "results": results
    }
