# Azure Service Plan for client web application
resource "azurerm_service_plan" "howestprime_service_plan_webapp" {
  name                = var.resource_names.service_plan_webapp # Name of the Azure Service Plan for the web application
  location            = var.location                           # Azure region for the Service Plan, set to the same location as the resource group
  os_type             = "Linux"                                # Specify the operating system type for the Service Plan, set to Linux for containerized workloads
  sku_name            = "F1"                                   # SKU name for the Service Plan, set to F1 for the free tier
  resource_group_name = azurerm_resource_group.howestprime.name
}

# Azure Linux Web App for hosting the client web application, associated with the Azure Service Plan
resource "azurerm_linux_web_app" "client_webapp" {

  service_plan_id     = azurerm_service_plan.howestprime_service_plan_webapp.id # Associate the Linux Web App with the Azure Service Plan
  name                = var.resource_names.linux_web_app                        # Name of the Linux Web App
  location            = var.location                                            # Azure region for the Linux Web App, set to the same location as the resource group
  resource_group_name = var.resource_names.azurerm_resource_group_howestprime

  site_config {
    always_on           = false #
    minimum_tls_version = "1.2" # Set the minimum TLS version to 1.2 for secure communication    
    application_stack {
      docker_image_name   = "howestprime-client-webapp:latest"
      docker_registry_url = "https://hcr.technet.howest.be"

    }
    cors { allowed_origins = ["*"] } # Allow CORS requests from any origin for the client web application

  }

  app_settings = {
    DOCKER_REGISTRY_URL                 = "https://hcr.technet.howest.be" # Registry URL used by the web app container runtime
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = "false"                         # Disable persistent App Service storage for container deployment
    VITE_APP_MOVIES_BASE_API_URL = "https://hp-wide-p-movies.${azurerm_container_app_environment.howestprime.default_domain}"
    VITE_APP_TICKETING_API_URL   = "https://hp-wide-p-ticketing.${azurerm_container_app_environment.howestprime.default_domain}"
  }
}
