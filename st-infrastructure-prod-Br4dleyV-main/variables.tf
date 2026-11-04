# Terraform variables for the HowestPrime infrastructure project
variable "my_user_object_id" {
  description = "The Object ID of your personal Azure account"
  type        = string
}

# Azure infrastructure variables
variable "howestprime_subscription_id" {
  description = "The subscription ID for the Azure account."
  type        = string
}
variable "howestprime_tenant_id" {
  description = "The tenant ID for the Azure account."
  type        = string
}

# Service principal variables
variable "service_principal_terraform_client_id" {
  description = "The client ID of the Terraform service principal."
  type        = string
}
variable "service_principal_terraform_secret" {
  description = "The client secret of the Terraform service principal."
  type        = string
  sensitive   = true
}
variable "service_principal_terraform_sp_id" {
  description = "The object ID of the Terraform service principal."
  type        = string
}

# Resource configuration variables
variable "location" {
  description = "Azure region for all resources."
  type        = string
}
variable "resource_names" {
  description = "Map of resource names to assign to the resources."
  type        = map(string)
}
variable "resource_login_names" {
  description = "Map of login names for resources."
  type        = map(string)
}

# CloudAMQP variables
variable "cloudamqp_api_token" {
  description = "API token for CloudAMQP to manage instances and credentials."
  type        = string
  sensitive   = true
}

# GitHub variables
variable "github_personal_access_token" {
  description = "GitHub personal access token for managing repositories, secrets, and actions."
  type        = string
  sensitive   = true
}
variable "github_organization_name" {
  description = "GitHub organization name for managing repositories and resources."
  type        = string
  sensitive   = true
}

# Allowed IP ranges
variable "howestprime_allowed_ip_ranges" {
  description = "List allowed IP addresses for documentDB firewall rule"
  type = list(object({
    name             = string
    start_ip_address = string
    end_ip_address   = string
  }))
}