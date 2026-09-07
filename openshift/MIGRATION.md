# SmartDeliveryOps Kubernetes to OpenShift Migration

## Current Platform

- Ubuntu ARM64
- Minikube
- Kubernetes
- Docker
- PostgreSQL
- Ollama
- Jenkins
- Terraform

## OpenShift Deployment

Login to an OpenShift cluster:

oc login <OPENSHIFT_API>

Create the project:

oc new-project smartdeliveryops

Deploy Kubernetes workloads:

oc apply -f kubernetes/

Deploy OpenShift Routes:

oc apply -f openshift/routes/

Verify:

oc get pods -n smartdeliveryops
oc get svc -n smartdeliveryops
oc get routes -n smartdeliveryops

Get frontend route:

oc get route frontend -n smartdeliveryops

## Portability

The application workloads remain Kubernetes-compatible.

OpenShift-specific Routes are maintained separately in the
openshift directory.

This allows SmartDeliveryOps to migrate between Kubernetes
and OpenShift with minimal changes.
