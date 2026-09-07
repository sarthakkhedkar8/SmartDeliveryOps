import os
import threading
import time
from datetime import datetime

from fastapi import FastAPI
from kubernetes import client, config


app = FastAPI(
    title="SmartDeliveryOps Self-Healing Agent",
    description="Kubernetes monitoring and automatic recovery agent",
    version="1.0.0",
)


NAMESPACE = os.getenv("NAMESPACE", "default")

TARGET_DEPLOYMENTS = [
    "backend",
    "frontend",
    "ai-model",
    "ai-prediction",
    "ai-orchestrator",
    "postgres",
]

last_action = {
    "status": "none",
    "deployment": None,
    "action": None,
    "timestamp": None,
}


def load_kubernetes():

    try:
        config.load_incluster_config()
    except Exception:
        config.load_kube_config()


def check_and_recover():

    global last_action

    load_kubernetes()

    apps = client.AppsV1Api()

    while True:

        try:

            deployments = apps.list_namespaced_deployment(
                namespace=NAMESPACE
            )

            for deployment in deployments.items:

                name = deployment.metadata.name

                if name not in TARGET_DEPLOYMENTS:
                    continue

                desired = deployment.spec.replicas or 0
                available = deployment.status.available_replicas or 0

                if desired > 0 and available < desired:

                    timestamp = datetime.utcnow().isoformat()

                    print(
                        f"[SELF-HEALING] "
                        f"{name}: "
                        f"{available}/{desired} available"
                    )

                    patch = {
                        "spec": {
                            "template": {
                                "metadata": {
                                    "annotations": {
                                        "smartdeliveryops.io/restarted-at":
                                        timestamp
                                    }
                                }
                            }
                        }
                    }

                    apps.patch_namespaced_deployment(
                        name=name,
                        namespace=NAMESPACE,
                        body=patch
                    )

                    last_action = {
                        "status": "recovery_triggered",
                        "deployment": name,
                        "action": "deployment_restart",
                        "timestamp": timestamp,
                    }

                    print(
                        f"[SELF-HEALING] "
                        f"Restart triggered for {name}"
                    )

            time.sleep(15)

        except Exception as error:

            print(
                f"[SELF-HEALING] monitor error: {error}"
            )

            time.sleep(15)


@app.on_event("startup")
def startup():

    thread = threading.Thread(
        target=check_and_recover,
        daemon=True
    )

    thread.start()


@app.get("/")
def root():

    return {
        "service": "smartdeliveryops-self-healing-agent",
        "status": "running",
        "mode": "automatic-recovery",
    }


@app.get("/health")
def health():

    return {
        "status": "healthy",
        "service": "self-healing-agent",
        "namespace": NAMESPACE,
        "monitor_interval_seconds": 15,
    }


@app.get("/recovery")
def recovery():

    return last_action
