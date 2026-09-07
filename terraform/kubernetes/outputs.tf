output "namespace" {
  value = data.kubernetes_namespace.default.metadata[0].name
}

output "backend_deployment" {
  value = data.kubernetes_deployment.backend.metadata[0].name
}

output "frontend_deployment" {
  value = data.kubernetes_deployment.frontend.metadata[0].name
}

output "ai_model_deployment" {
  value = data.kubernetes_deployment.ai_model.metadata[0].name
}

output "ai_prediction_deployment" {
  value = data.kubernetes_deployment.ai_prediction.metadata[0].name
}

output "ai_orchestrator_deployment" {
  value = data.kubernetes_deployment.ai_orchestrator.metadata[0].name
}

output "self_healing_deployment" {
  value = data.kubernetes_deployment.self_healing.metadata[0].name
}

output "postgres_deployment" {
  value = data.kubernetes_deployment.postgres.metadata[0].name
}
