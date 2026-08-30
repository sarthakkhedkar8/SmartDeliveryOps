class DeliveryPredictionAgent:

    def predict(self, delivery):
        status = delivery.get("status", "pending")

        if status == "delivered":
            risk = "LOW"
            delay_probability = 0

        elif status == "out_for_delivery":
            risk = "LOW"
            delay_probability = 10

        elif status == "processing":
            risk = "MEDIUM"
            delay_probability = 30

        else:
            risk = "HIGH"
            delay_probability = 50

        return {
            "delivery_id": delivery.get("id"),
            "risk": risk,
            "delay_probability": delay_probability,
            "status": status
        }


if __name__ == "__main__":

    agent = DeliveryPredictionAgent()

    test_delivery = {
        "id": 1,
        "status": "processing"
    }

    prediction = agent.predict(test_delivery)

    print("Delivery Prediction")
    print("--------------------")
    print(f"Delivery ID: {prediction['delivery_id']}")
    print(f"Status: {prediction['status']}")
    print(f"Risk: {prediction['risk']}")
    print(f"Delay Probability: {prediction['delay_probability']}%")
