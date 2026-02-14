output "acr_login_server" {
  value = azurerm_container_registry.acr.login_server
}

output "acr_username" {
  value = azurerm_container_registry.acr.admin_username
}

output "acr_password" {
  value     = azurerm_container_registry.acr.admin_password
  sensitive = true
}

output "container_app_url" {
  value = "https://${azurerm_container_app.api.ingress[0].fqdn}"
}

output "static_web_api_key" {
  value     = azurerm_static_web_app.swa.api_key
  sensitive = true
}
