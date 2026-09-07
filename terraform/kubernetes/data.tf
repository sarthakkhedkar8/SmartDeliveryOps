data "kubernetes_namespace" "default" {
  metadata {
    name = var.namespace
  }
}

data "kubernetes_deployment" "backend" {
  metadata {
    name      = "backend"
    namespace = var.namespace
  }
}

data "kubernetes_deployment" "frontend" {
  metadata {
    name      = "frontend"
    namespace = var.namespace
  }
}

data "kubernetes_deployment" "ai_model" {
  metadata {
    name      = "ai-model"
    namespace = var.namespace
  }
}

data "kubernetes_deployment" "ai_prediction" {
  metadata {
    name      = "ai-prediction"
    namespace = var.namespace
  }
}

data "kubernetes_deployment" "ai_orchestrator" {
  metadata {
    name      = "ai-orchestrator"
    namespace = var.namespace
  }
}

data "kubernetes_deployment" "self_healing" {
  metadata {
    name      = "self-healing-agent"
    namespace = var.namespace
  }
}

data "kubernetes_deployment" "postgres" {
  metadata {
    name      = "postgres"
    namespace = var.namespace
  }
}
