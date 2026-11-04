# Azure PostgreSQL Flexible server
resource "azurerm_postgresql_flexible_server" "postgresql_server" {
  name                          = var.resource_names["postgresql_server"]      # Name of the PostgreSQL server, defined in the resource names map variable
  location                      = var.location                                 # Location of the PostgreSQL server, set to the same location as the resource group
  resource_group_name           = azurerm_resource_group.howestprime.name      # Name of the resource group where the PostgreSQL server will be created
  administrator_login           = var.resource_login_names["postgresql_admin"] # Administrator login name for the PostgreSQL server, defined in the login names map variable
  administrator_password        = random_password.postgresql_password.result   # Administrator password for the PostgreSQL server, generated using the random_password resource
  version                       = "16"                                         # Version of PostgreSQL to use, set to version 16 which is a stable and widely used version
  sku_name                      = "B_Standard_B1ms"                            # SKU name for the PostgreSQL server, set to a basic tier suitable for development and testing
  storage_mb                    = "32768"                                      # Storage size for the PostgreSQL server, set to 32,768 MB (32 GB)
  backup_retention_days         = "7"                                          # Number of days to retain backups for the PostgreSQL server, set to 7 days
  public_network_access_enabled = true                                         # Enable public network access for the PostgreSQL server, allowing connections from outside the Azure network
  # Lifecycle	Ignore zone changes	Prevent zone recreation
  lifecycle {
    ignore_changes = [zone] # Ignore changes to the availability zone to prevent unnecessary recreation of the PostgreSQL server when zone changes occur
  }
}

resource "azurerm_postgresql_flexible_server_database" "movies_db" {
  name       = var.resource_names["movies_db"]                         # Name of the PostgreSQL database to be created, defined in the resource names map variable
  server_id  = azurerm_postgresql_flexible_server.postgresql_server.id # ID of the PostgreSQL server where the database will be created, referencing the ID of the previously defined PostgreSQL server resource
  charset    = "UTF8"                                                  # Character set for the database, set to UTF8 which is a common character set that supports a wide range of characters
  depends_on = [azurerm_postgresql_flexible_server.postgresql_server]  # Ensure that the database is created after the PostgreSQL server is successfully created by adding a dependency on the PostgreSQL server resource
}


# Random password generation for PostgreSQL
resource "random_password" "postgresql_password" {
  length           = 16    # Length of the generated password, set to 16 characters for strong security
  special          = true  # Include special characters in the generated password for increased complexity
  override_special = "_%@" # Override the default set of special characters to include only underscore, percent, and at symbols, which are commonly accepted in passwords and avoid issues with certain characters in connection strings
}

# Azure Key Vault secret to store the PostgreSQL administrator password securely
resource "azurerm_key_vault_secret" "postgresql_admin_password" {
  name         = var.resource_names["postgresql_admin_password"] # Name of the Key Vault secret to store the PostgreSQL administrator password, defined in the resource names map variable
  value        = random_password.postgresql_password.result      # Value of the Key Vault secret, set to the generated password from the random_password resource for secure storage of the PostgreSQL administrator password
  key_vault_id = azurerm_key_vault.howestprime.id                # ID of the Key Vault where the secret will be stored, referencing the ID of the previously defined Key Vault resource

  depends_on = [
    azurerm_postgresql_flexible_server.postgresql_server, # Ensure the PostgreSQL server is created before storing the password in Key Vault
    azurerm_postgresql_flexible_server_database.movies_db # Ensure the PostgreSQL database is created before storing the password in Key Vault
  ]
}

# Firewall rules for PostgreSQL server to allow access from specific IP addresses
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_ranges" {
  for_each = { for rule in var.howestprime_allowed_ip_ranges : rule.name => rule } # Iterate over the allowed IP ranges defined in the howestprime_allowed_ip_ranges variable, creating a firewall rule for each range using the name as the key for the for_each loop

  name             = each.value.name                                         # Name of the firewall rule, set to the name defined in the howestprime_allowed_ip_ranges variable for each rule
  server_id        = azurerm_postgresql_flexible_server.postgresql_server.id # ID of the PostgreSQL server where the firewall rule will be applied, referencing the ID of the previously defined PostgreSQL server resource
  start_ip_address = each.value.start_ip_address                             # Starting IP address for the firewall rule, set to the start_ip_address defined in the howestprime_allowed_ip_ranges variable for each rule
  end_ip_address   = each.value.end_ip_address                               # Ending IP address for the firewall rule, set to the end_ip_address defined in the howestprime_allowed_ip_ranges variable for each rule

  depends_on = []
}

# GitHub 
locals {
  howestprime_repo_movies = "st-microservice-movies-Br4dleyV"
  dotnet_connection_string = format(
    "Server=%s;Database=movies;Port=%s;User Id={username};Password={password};Ssl Mode=Require;",
    azurerm_postgresql_flexible_server.postgresql_server.fqdn,
    5432
  )

  messagebroker_password_uri = regex("(https://[^/]+/secrets/[^/]+)",
  azurerm_key_vault_secret.messagebroker_password.id)[0]

  psql_password_uri = regex("(https://[^/]+/secrets/[^/]+)",
  azurerm_key_vault_secret.postgresql_admin_password.id)[0]

  howestprime-movies-gh-action-variables = {
    howestprime_movies_p_plsql_login = {
      variable_name = "howestprime_movies_p_psql_login"
      value         = var.resource_login_names.postgresql_admin
    }
    howestprime_movies_p_plslq_connection_string = {
      variable_name = "howestprime_movies_p_psql_connection_string"
      value         = local.dotnet_connection_string
    }
    howestprime_wide_messagebroker_login = {
      variable_name = "howestprime_wide_p_messagebroker_login"
      value         = data.cloudamqp_credentials.local-admin.username
    }
    howestprime_wide_keyvault_uri = {
      variable_name = "howestprime_wide_p_keyvault_uri"
      value         = azurerm_key_vault.howestprime.vault_uri
    }
    howestprime_wide_mi_keyvaultreader_uri = {
      variable_name = "howestprime_wide_mi_keyvaultreader_uri"
      value         = azurerm_user_assigned_identity.howestprime_reader.id
    }
    az_tenant_id = {
      variable_name = "az_tenant_id"
      value         = var.howestprime_tenant_id
    }
    az_subscription_id = {
      variable_name = "az_subscription_id"
      value         = var.howestprime_subscription_id
    }
    az_resource_group = {
      variable_name = "az_resource_group"
      value         = azurerm_resource_group.howestprime.name
    }
    az_container_registry = {
      variable_name = "az_container_registry"
      value         = azurerm_container_registry.howestprime.login_server
    }
    az_container_environment = {
      variable_name = "az_container_environment"
      value         = azurerm_container_app_environment.howestprime.name
    }
    howestprime_movies_p_sqlsrv_password_uri = {
      variable_name = "howestprime_movies_p_sqlsrv_password_uri"
      value         = local.psql_password_uri
    }
    howestprime_wide_p_messagebroker_password_uri = {
      variable_name = "howestprime_wide_p_messagebroker_password_uri"
      value         = local.messagebroker_password_uri
    }
    howestprime_wide_p_messagebroker_uri = {
      variable_name = "howestprime_wide_p_messagebroker_hostname"
      value         = cloudamqp_instance.howestprime_messagebroker.host
    }
    howestprime_wide_p_messagebroker_vhost = {
      variable_name = "howestprime_wide_p_messagebroker_vhost"
      value         = cloudamqp_instance.howestprime_messagebroker.vhost
    }
  }

  howestprime-movies-gh-action-secrets = {
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

# GitHub Actions variable
resource "github_actions_variable" "howestprime_movies" {
  for_each      = local.howestprime-movies-gh-action-variables
  repository    = local.howestprime_repo_movies
  variable_name = each.value.variable_name
  value         = each.value.value
}

# GitHub Actions secret
resource "github_actions_secret" "howestprime_movies" {
  for_each        = local.howestprime-movies-gh-action-secrets
  repository      = local.howestprime_repo_movies
  secret_name     = each.value.secret_name
  plaintext_value = each.value.value
}