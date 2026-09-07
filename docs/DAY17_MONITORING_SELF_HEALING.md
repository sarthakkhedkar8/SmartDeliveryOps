# SmartDeliveryOps - Day 17

## Monitoring + Kubernetes Self-Healing

Day 17 adds operational monitoring and automatic Kubernetes
recovery capabilities to SmartDeliveryOps.

---

## 1. Backend AI Integration

The React dashboard no longer communicates directly with the
Kubernetes AI Orchestrator.

The architecture is now:

React
→ Backend
→ AI Orchestrator

This removes browser-side dependency on Kubernetes ClusterIP
services.

---

## 2. New Backend APIs

### AI Agents

GET /ai/agents

Returns the five AI agents from the orchestrator.

### AI Orchestration

GET /ai/orchestrate

Triggers orchestration through the backend.

### System Health

GET /system/health

Checks:

- Backend
- AI Prediction
- AI Model
- AI Orchestrator

and reports the overall system condition.

---

## 3. Self-Healing Agent

Service:

self-healing-service:8005

The self-healing agent continuously monitors important
Kubernetes deployments.

Monitored deployments:

- backend
- frontend
- ai-model
- ai-prediction
- ai-orchestrator
- postgres

---

## 4. Recovery Logic

Every 15 seconds the agent checks deployment availability.

If:

available replicas < desired replicas

the agent triggers a Kubernetes Deployment restart.

This demonstrates automated incident recovery.

---

## 5. Kubernetes RBAC

The self-healing agent uses:

- ServiceAccount
- Role
- RoleBinding

Permissions are limited to required deployment and pod
operations.

---

## 6. Dashboard Monitoring

The dashboard periodically checks:

GET /system/health

The dashboard displays:

- Healthy
- Degraded
- Critical
- Individual service health
- HTTP status
- Healthy service count

---

## 7. Self-Healing Architecture

                         Kubernetes
                              |
                    Self-Healing Agent
                              |
                +-------------+-------------+
                |             |             |
             Monitor       Detect         Recover
                |             |             |
                +-------------+-------------+
                              |
                       Deployment Patch
                              |
                              v
                     Kubernetes Restart
                              |
                              v
                       Healthy Pod

---

## 8. Technology Stack

Frontend:
React + Vite

Backend:
FastAPI

AI:
Five-Agent Orchestrator

LLM:
Ollama + qwen2.5:0.5b

Containers:
Docker

Orchestration:
Kubernetes / Minikube

Database:
PostgreSQL

Monitoring:
FastAPI System Health API

Self-Healing:
Python Kubernetes Client + RBAC

---

## 9. Day 17 Result

SmartDeliveryOps now provides:

- AI-powered delivery operations
- Five autonomous AI agents
- Local LLM reasoning
- Kubernetes service monitoring
- Automatic deployment recovery
- Backend-mediated AI orchestration
- Dashboard health monitoring
