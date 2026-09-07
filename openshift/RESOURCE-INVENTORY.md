# SmartDeliveryOps OpenShift Resource Inventory

## Application Components

| Component | Type | Port |
|---|---|---:|
| Frontend | Deployment + Service + OpenShift Route | 5173 |
| Backend | Deployment + Service + OpenShift Route | 8001 |
| PostgreSQL | Deployment + Service + PVC | 5432 |
| AI Prediction | Deployment + Service | 8002 |
| Local LLM | Deployment + Service | 8003 |
| AI Orchestrator | Deployment + Service | 8004 |
| Self-Healing Agent | Deployment + Service + RBAC | 8005 |

## OpenShift Resources

- Project
- Route
- Deployments
- Services
- ConfigMaps
- Secrets
- PersistentVolumeClaim
- ServiceAccounts
- Role
- RoleBinding

## AI Agents

1. Delivery Monitoring Agent
2. Delay Prediction Agent
3. Route Optimization Agent
4. Incident Recovery Agent
5. Notification & Decision Agent

## Platform

Development:
Minikube + Kubernetes

Target:
OpenShift / OKD

Infrastructure:
Terraform

CI/CD:
Jenkins

Local AI:
Ollama + Qwen2.5 0.5B
