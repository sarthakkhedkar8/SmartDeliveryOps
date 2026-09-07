resource "kubernetes_config_map" "smartdeliveryops_info" {
  metadata {
    name      = "smartdeliveryops-terraform-info"
    namespace = var.namespace

    labels = {
      app         = "smartdeliveryops"
      managed_by  = "terraform"
      project_day = "20"
    }
  }

  data = {
    project        = "SmartDeliveryOps"
    infrastructure = "Kubernetes"
    automation     = "Terraform"
    ai_platform    = "Local Ollama"
    ai_model       = "qwen2.5:0.5b"
    agents         = "5"
    self_healing   = "enabled"
    platform       = "Minikube"
  }
}
