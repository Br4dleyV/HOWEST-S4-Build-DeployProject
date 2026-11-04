# Azure Service Plan for hosting Azure Container Apps and other services
resource "azurerm_service_plan" "howestprime_service_plan_backoffice" {
  name                = var.resource_names.service_plan_backoffice # Name of the Azure Service Plan
  location            = var.location                               # Azure region for the Service Plan, set to the same location as the resource group
  os_type             = "Linux"                                    # Specify the operating system type for the Service Plan, set to Linux for containerized workloads
  sku_name            = "F1"                                       # Free tier for development as per guide
  resource_group_name = azurerm_resource_group.howestprime.name
}

# Azure Linux Web App for hosting .NET applications, associated with the Azure Service Plan
resource "azurerm_linux_web_app" "client_backoffice" {
  location            = var.location                     # Azure region for the Linux Web App, set to the same location as the resource group
  name                = var.resource_names.linux_web_app_backoffice # Unique name for the backoffice Linux Web App
  resource_group_name = var.resource_names.azurerm_resource_group_howestprime
  service_plan_id     = azurerm_service_plan.howestprime_service_plan_backoffice.id # Associate the Linux Web App with the Azure Service Plan
  https_only          = true                                                        # Enforce HTTPS for the Linux Web App to enhance security
  site_config {
    always_on           = false # Required for F1 tier - Always On not available in Free tier
    minimum_tls_version = "1.2" # Set the minimum TLS version to 1.2 for secure communication
    application_stack {
      dotnet_version = "10.0" # Specify the .NET version for the Linux Web App, set to 10.0 for compatibility with .NET 10 applications
    }
  }
  
  app_settings = {
    "ASPNETCORE_ENVIRONMENT" = "Production"
    "WEBSITES_PORT"          = "8080"
    "SCM_DO_BUILD_DURING_DEPLOYMENT" = "false"
  }
}

locals {
  howestprime_repo_backoffice = "st-client-backoffice-Br4dleyV"
  howestprime-backoffice-gh-action-variables = {
    az_backoffice_webapp = {
      variable_name = "az_backoffice_webapp"
      value         = azurerm_linux_web_app.client_backoffice.name
    }
    az_movies_api_url = {
      variable_name = "az_movies_api_url"
      value         = "https://hp-wide-p-movies.${azurerm_container_app_environment.howestprime.default_domain}"
    }
    az_tenant_id = {
      variable_name = "az_tenant_id"
      value         = var.howestprime_tenant_id
    }
    az_resource_group = {
      variable_name = "az_resource_group"
      value         = azurerm_resource_group.howestprime.name
    }
    az_subscription_id = {
      variable_name = "az_subscription_id"
      value         = var.howestprime_subscription_id
    }
  }

  howestprime-backoffice-gh-action-secrets = {
    howestprime_wide_ci_service_principal = {
      secret_name = "howestprime_wide_ci_service_principal"
      value       = azuread_application.github_ci.client_id
    }
    howestprime_wide_ci_service_principal_password = {
      secret_name = "howestprime_wide_ci_service_principal_password"
      value       = azuread_application_password.github_ci_secret.value
    }
  }
}

resource "github_actions_variable" "howestprime_backoffice" {
  for_each      = local.howestprime-backoffice-gh-action-variables
  repository    = local.howestprime_repo_backoffice
  variable_name = each.value.variable_name
  value         = each.value.value
  depends_on    = [azurerm_container_app_environment.howestprime]
}

resource "github_actions_secret" "howestprime_backoffice" {
  for_each        = local.howestprime-backoffice-gh-action-secrets
  repository      = local.howestprime_repo_backoffice
  secret_name     = each.value.secret_name
  plaintext_value = each.value.value
  depends_on      = [azurerm_container_app_environment.howestprime]
}
