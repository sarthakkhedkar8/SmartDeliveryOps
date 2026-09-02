from fastapi import FastAPI
from agent import DeliveryPredictionAgent, get_deliveries_from_database


app = FastAPI(
    title="SmartDeliveryOps AI Prediction Service",
    description="AI-based delivery risk prediction microservice",
    version="1.0.0"
)


agent = DeliveryPredictionAgent()


@app.get("/")
def root():
    return {
        "service": "ai-prediction-service",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "ai-prediction-service"
    }


@app.get("/predictions")
def get_predictions():

    deliveries = get_deliveries_from_database()

    predictions = []

    for delivery in deliveries:
        prediction = agent.predict(delivery)
        predictions.append(prediction)

    return {
        "count": len(predictions),
        "predictions": predictions
    }
