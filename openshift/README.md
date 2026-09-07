# SmartDeliveryOps - OpenShift Deployment

This directory contains OpenShift-compatible resources for SmartDeliveryOps.

## Components

- Frontend
- Backend
- PostgreSQL
- AI Prediction Service
- Local LLM Service
- AI Orchestrator
- Self-Healing Agent

## OpenShift Features

- OpenShift Project
- OpenShift Route
- Kubernetes Deployments
- Kubernetes Services
- PersistentVolumeClaim
- Secrets
- ConfigMaps
- ServiceAccounts
- RBAC

## Deployment

The OpenShift resources are intended to be applied to an actual
OpenShift/OKD cluster.

Example:

oc login <OPENSHIFT_API>
oc new-project smartdeliveryops
oc apply -f ../kubernetes/
oc apply -f routes/

## Important

The current development VM uses ARM64 Ubuntu with approximately
4.2 GiB RAM and currently runs Minikube.

Therefore an OpenShift cluster is not started inside this VM.
The OpenShift manifests are prepared and validated separately so
that the SmartDeliveryOps application can be migrated to OpenShift
when an OpenShift cluster with sufficient resources is available.
