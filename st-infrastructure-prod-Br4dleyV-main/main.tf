# Terraform configuration for Azure resources and CloudAMQP provider
terraform {
  required_version = ">= 1.14.5"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "4.61.0"
    }
    cloudamqp = {
      source  = "cloudamqp/cloudamqp"
      version = "~>1.42.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 3.8.0"
    }
    time = {
      source  = "hashicorp/time"
      version = "0.13.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "3.8.1"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
    github = {
      source  = "integrations/github"
      version = "~> 6.11.1"
    }
  }
}

# Configure the Azure provider with credentials and settings
provider "azurerm" {
  subscription_id = var.howestprime_subscription_id           # Subscription ID for the Azure account
  tenant_id       = var.howestprime_tenant_id                 # Tenant ID for the Azure account
  client_id       = var.service_principal_terraform_client_id # Client ID for the service principal
  client_secret   = var.service_principal_terraform_secret    # Client secret for the service principal

  # Register the Microsoft.App provider for Azure Container Apps resources (required for container app environment)
  resource_providers_to_register = ["Microsoft.App"]

  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
    key_vault {
      # Skip the slow purge on destroy. The vault is only soft-deleted (near-instant),
      # and recovered automatically on the next apply (recover defaults are true).
      # This makes destroy/apply cycles dramatically faster for dev iteration.
      purge_soft_delete_on_destroy          = false
      purge_soft_deleted_secrets_on_destroy = false
      recover_soft_deleted_key_vaults       = true
      recover_soft_deleted_secrets          = true
    }
  }
}

# Configure the Azure AD provider to manage Azure Active Directory resources
provider "azuread" {
  tenant_id = var.howestprime_tenant_id # Tenant ID for the Azure Active Directory
  client_id = var.service_principal_terraform_client_id # Client ID for the service principal to manage Azure AD resources
  client_secret = var.service_principal_terraform_secret # Client secret for the service principal to manage Azure AD resources
}

# Configure the CloudAMQP provider with API token for managing RabbitMQ instances and credentials
provider "cloudamqp" {
  apikey = var.cloudamqp_api_token # API token for CloudAMQP to manage instances and credentials
}

# Configure GitHub provder to manage GitHub resources such as repositories, secrets, and actions
provider "github" {
  owner = var.resource_login_names.github_owner # GitHub organization name for managing repositories and resources
  token = var.github_personal_access_token # Personal access token for GitHub to manage resources
}

# Get current Azure client config for use in resources
data "azurerm_client_config" "current" {}