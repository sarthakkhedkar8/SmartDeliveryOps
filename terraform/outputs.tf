output "smartdeliveryops_namespace" {
  value = var.namespace
}

output "smartdeliveryops_config_map" {
  value = kubernetes_config_map.smartdeliveryops_info.metadata[0].name
}
