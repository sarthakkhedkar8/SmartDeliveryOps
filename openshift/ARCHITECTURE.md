# SmartDeliveryOps OpenShift Architecture

## Platform

OpenShift / OKD
|
+-- OpenShift Router
|
+-- Frontend Route
|      |
|      +-- Frontend Service
|             |
|             +-- Frontend Deployment
|
+-- Backend Route
       |
       +-- Backend Service
              |
              +-- Backend Deployment
                     |
                     +-- PostgreSQL
                     |
                     +-- AI Prediction Service
                     |
                     +-- AI Orchestrator
                     |       |
                     |       +-- Delivery Monitoring Agent
                     |       +-- Delay Prediction Agent
                     |       +-- Route Optimization Agent
                     |       +-- Incident Recovery Agent
                     |       +-- Notification & Decision Agent
                     |
                     +-- Local LLM Service
                             |
                             +-- Ollama
                                   |
                                   +-- Qwen2.5 0.5B

## DevOps

Git/GitHub
   |
   v
Jenkins CI/CD
   |
   v
Docker Images
   |
   v
Kubernetes / OpenShift
   |
   +-- Monitoring
   +-- Self-Healing
   +-- Terraform

## AI Flow

Delivery Data
     |
     v
AI Prediction
     |
     v
AI Orchestrator
     |
     +--> 5 Specialized Agents
     |
     v
Local LLM
     |
     v
Decision / Recommendation
     |
     v
SmartDeliveryOps Dashboard
