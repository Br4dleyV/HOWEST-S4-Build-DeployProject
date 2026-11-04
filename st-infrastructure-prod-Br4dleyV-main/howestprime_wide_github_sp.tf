# Azure AD application for GitHub CI integration
resource "azuread_application" "github_ci" {
  display_name = "github-ci-howestprime" # Name of the Azure AD application for GitHub CI integration
}

# Time-based secret rotation for the GitHub CI application password
resource "time_rotating" "secret_rotation" {
  rotation_days = 180 # Rotate the secret every 180 days to enhance security
}

# Azure AD application password for GitHub CI, with rotation based on the time_rotating resource
resource "azuread_application_password" "github_ci_secret" {
  application_id = azuread_application.github_ci.id # ID of the Azure AD application for which the password is created
  rotate_when_changed = {
    rotation = time_rotating.secret_rotation.id # Rotate the secret when the time_rotating resource triggers a rotation
  }
  depends_on = [
    azuread_service_principal.github_ci_sp
  ]
}

# Azure AD service principal for GitHub CI, associated with the GitHub CI application
resource "azuread_service_principal" "github_ci_sp" {
  client_id = azuread_application.github_ci.client_id # Client ID of the Azure AD application for GitHub CI
  owners    = [var.service_principal_terraform_sp_id] # Assign ownership of the service principal to the Terraform service principal for management
}

# Role assignment: Allow GitHub CI SP to push to ACR
resource "azurerm_role_assignment" "github_ci_acr_push" {
  scope                = azurerm_container_registry.howestprime.id                                        # Scope of the role assignment is the Container Registry, allowing GitHub CI to push images
  role_definition_name = "AcrPush"                                                                        # Role definition name for pushing to Azure Container Registry
  principal_id         = azuread_service_principal.github_ci_sp.object_id                                 # Use object_id (GUID) for the principal ID
  depends_on           = [azurerm_container_registry.howestprime, azuread_service_principal.github_ci_sp] # Ensure the Container Registry and service principal are created before assigning the role
}

# Role assignment: Allow GitHub CI SP to manage the resource group
resource "azurerm_role_assignment" "github_ci_rg_contributor" {
  scope                = azurerm_resource_group.howestprime.id                                        # Scope of the role assignment is the resource group, allowing GitHub CI to manage resources within the group
  role_definition_name = "Contributor"                                                                # Role definition name for managing resources, "Contributor" allows full management of resources within the scope
  principal_id         = azuread_service_principal.github_ci_sp.object_id                             # Use object_id (GUID) for the principal ID
  depends_on           = [azurerm_resource_group.howestprime, azuread_service_principal.github_ci_sp] # Ensure the resource group and service principal are created before assigning the role
}