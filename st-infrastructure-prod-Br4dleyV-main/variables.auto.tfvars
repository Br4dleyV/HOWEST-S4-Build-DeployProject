# Azure region for all resources
location = "northeurope"

# Resource names map
resource_names = {
  azurerm_resource_group_howestprime     = "hp-wide-p-arg"
  azurerm_key_vault_howestprime          = "hp-wide-p-kv-3" # -3 because it constantly says one already exists
  azurerm_container_registry_howestprime = "hpwidepacrvelleb"
  cloudamqp_instance_howestprime         = "hp-wide-p-mb-instance"
  log_analytics_workspace                = "hp-wide-p-law"
  container_app_environment              = "hp-wide-p-cae"
  managed_identity                       = "hp-wide-p-mi-kvreader"
  postgresql_server                      = "hp-wide-p-postgresql-2"
  movies_db                              = "movies"
  postgresql_admin_password              = "hp-wide-p-postgresql-admin-password"
  service_plan_backoffice                = "hp-wide-p-service-plan-backoffice"
  service_plan_webapp                    = "hp-wide-p-service-plan-webapp"
  linux_web_app                          = "hp-wide-p-linux-web-app"
  linux_web_app_backoffice               = "hp-wide-p-linux-web-app-backoffice"
}

# Login names map
resource_login_names = {
  postgresql_admin = "hpadmin"
  github_owner     = "Howest-TI-Project-BnD"
  cosmosdb_account = "hpticketingcosmosdb"
}

# Allowed IP ranges 
howestprime_allowed_ip_ranges = [
  {
    name             = "allow_all"
    start_ip_address = "0.0.0.0"
    end_ip_address   = "255.255.255.255"
  }
]