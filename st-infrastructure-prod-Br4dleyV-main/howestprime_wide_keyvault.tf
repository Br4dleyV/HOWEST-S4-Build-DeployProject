# Azure Key Vault for securely storing secrets, keys, and certificates used by applications and services in the Howest Prime environment
resource "azurerm_key_vault" "howestprime" {
  name                            = var.resource_names["azurerm_key_vault_howestprime"] # Name of the Key Vault
  resource_group_name             = azurerm_resource_group.howestprime.name             # Name of the resource group where the Key Vault will be created
  location                        = azurerm_resource_group.howestprime.location         # Location of the Key Vault, same as the resource group
  tenant_id                       = data.azurerm_client_config.current.tenant_id        # Tenant ID for the Azure AD tenant
  sku_name                        = "standard"                                          # SKU means the pricing tier of the Key Vault, "standard" is the entry-level tier suitable for development and testing
  soft_delete_retention_days      = 7                                                   # Retention period for soft-deleted items
  purge_protection_enabled        = false                                               # Whether to enable purge protection for the Key Vault
  enabled_for_disk_encryption     = true                                                # Whether to enable disk encryption for the Key Vault
  enabled_for_deployment          = true                                                # Whether to enable deployment for the Key Vault
  enabled_for_template_deployment = true                                                # Whether to enable template deployment for the Key Vault
  rbac_authorization_enabled      = true                                                # Whether to enable RBAC authorization for the Key Vault
}

# Role assignment for the Key Vault Administrator to allow the Terraform service principal to manage the Key Vault and its contents
resource "azurerm_role_assignment" "howestprime_keyvault_admin" {
  scope                = azurerm_key_vault.howestprime.id      # Scope of the role assignment, set to the Key Vault resource
  role_definition_name = "Key Vault Administrator"             # Name of the role definition to assign, "Key Vault Administrator" allows full management of the Key Vault
  principal_id         = var.service_principal_terraform_sp_id # Object ID of the Terraform service principal to which the role will be assigned
  depends_on           = [azurerm_key_vault.howestprime]       # Ensure the Key Vault is created before assigning the role
}

# Automatically give myself access every time the vault is created
resource "azurerm_role_assignment" "my_admin_access" {
  scope                = azurerm_key_vault.howestprime.id # Scope of the role assignment, set to the Key Vault resource
  role_definition_name = "Key Vault Administrator"        # Name of the role definition to assign, "Key Vault Administrator" allows full management of the Key Vault
  principal_id         = var.my_user_object_id            # Object ID of the user's personal Azure account to which the role will be assigned

  depends_on = [azurerm_key_vault.howestprime] # Ensure the Key Vault is created before assigning the role
}

# Wait for RBAC propagation to prevent errors (failing to read the Key Vault)
resource "time_sleep" "wait_for_rbac" {
  depends_on      = [azurerm_role_assignment.howestprime_keyvault_admin] # Ensure the role assignment is created before starting the sleep timer
  create_duration = "120s"                                               # Duration to wait for RBAC changes to propagate, set to 120 seconds to ensure sufficient time for propagation
}