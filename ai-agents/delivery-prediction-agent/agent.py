import os

import psycopg2
from dotenv import load_dotenv


load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


class DeliveryPredictionAgent:

    def predict(self, delivery):
        status = delivery["status"]

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
            "delivery_id": delivery["id"],
            "customer_name": delivery["customer_name"],
            "product": delivery["product"],
            "status": status,
            "risk": risk,
            "delay_probability": delay_probability,
        }


def get_deliveries_from_database():

    connection = psycopg2.connect(DATABASE_URL)
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            id,
            customer_name,
            product,
            status
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
            "product": row[2],
            "status": row[3],
        })

    return deliveries


if __name__ == "__main__":

    agent = DeliveryPredictionAgent()

    deliveries = get_deliveries_from_database()

    print()
    print("======================================")
    print(" SmartDeliveryOps AI Prediction Agent")
    print("======================================")
    print()

    for delivery in deliveries:

        prediction = agent.predict(delivery)

        print(
            f"Delivery #{prediction['delivery_id']} | "
            f"{prediction['customer_name']} | "
            f"{prediction['product']}"
        )

        print(
            f"Status: {prediction['status']} | "
            f"Risk: {prediction['risk']} | "
            f"Delay Probability: "
            f"{prediction['delay_probability']}%"
        )

        print("--------------------------------------")
