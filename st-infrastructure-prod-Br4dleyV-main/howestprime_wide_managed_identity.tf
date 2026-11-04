# Azure User Assigned Managed Identity for accessing Azure Key Vault secrets
resource "azurerm_user_assigned_identity" "howestprime_reader" {
  name                = var.resource_names["managed_identity"]      # Name of the User Assigned Managed Identity
  location            = azurerm_resource_group.howestprime.location # Location of the User Assigned Managed Identity, same as the resource group
  resource_group_name = azurerm_resource_group.howestprime.name     # Name of the resource group where the User Assigned Managed Identity will be created
}

# Role assignment to grant the User Assigned Managed Identity access to read secrets from the Azure Key Vault
resource "azurerm_role_assignment" "mi_kv_secrets_officer" {
  scope                = azurerm_key_vault.howestprime.id                               # Scope of the role assignment, set to the Azure Key Vault
  role_definition_name = "Key Vault Secrets Officer"                                    # Name of the built-in role for reading secrets from Azure Key Vault
  principal_id         = azurerm_user_assigned_identity.howestprime_reader.principal_id # Principal ID of the User Assigned Managed Identity to which the role will be assigned

  depends_on = [azurerm_key_vault.howestprime] # Ensure the role assignment is created after the Azure Key Vault is created
}