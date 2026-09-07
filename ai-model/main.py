import os

import requests
from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI(
    title="SmartDeliveryOps Local LLM Service",
    description="Local LLM inference service using Ollama",
    version="1.0.0",
)


OLLAMA_URL = os.getenv(
    "OLLAMA_URL",
    "http://host.docker.internal:11434"
)

OLLAMA_MODEL = os.getenv(
    "OLLAMA_MODEL",
    "qwen2.5:0.5b"
)


class GenerateRequest(BaseModel):
    prompt: str


@app.get("/")
def root():
    return {
        "service": "smartdeliveryops-local-llm",
        "status": "running",
        "model": OLLAMA_MODEL,
    }


@app.get("/health")
def health():

    try:

        response = requests.get(
            f"{OLLAMA_URL}/api/tags",
            timeout=10
        )

        response.raise_for_status()

        return {
            "status": "healthy",
            "ollama": "connected",
            "model": OLLAMA_MODEL,
        }

    except requests.exceptions.RequestException as error:

        return {
            "status": "unhealthy",
            "ollama": "disconnected",
            "error": str(error),
        }


@app.post("/generate")
def generate(request: GenerateRequest):

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": request.prompt,
        "stream": False,
    }

    try:

        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json=payload,
            timeout=120,
        )

        response.raise_for_status()

        data = response.json()

        return {
            "model": OLLAMA_MODEL,
            "prompt": request.prompt,
            "response": data.get("response", ""),
        }

    except requests.exceptions.RequestException as error:

        return {
            "error": str(error),
            "model": OLLAMA_MODEL,
        }
