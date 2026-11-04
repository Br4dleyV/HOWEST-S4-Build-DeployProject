# Azure CosmosDB account for ticketing microservice
resource "azurerm_cosmosdb_account" "ticketing_cosmosdb_account" {
  name                = var.resource_login_names["cosmosdb_account"] # Name of the CosmosDB account, defined in the resource login names map variable
  location            = var.location                                 # Location of the CosmosDB account, set to the same location as the resource group
  resource_group_name = azurerm_resource_group.howestprime.name      # Name of the resource group where the CosmosDB account will be created, referencing the name of the previously defined resource group
  offer_type          = "Standard"                                   # Offer type for the CosmosDB account, set to "Standard" which is suitable for most workloads and provides a good balance of performance and cost
  kind                = "MongoDB"                                    # Kind of the CosmosDB account, set to "MongoDB" to use the MongoDB API which is compatible with MongoDB drivers and tools, making it easier to integrate with existing applications that use MongoDB
  capabilities {
    name = "EnableMongo" # Enable MongoDB API support for the CosmosDB account, allowing it to be used with MongoDB-compatible applications and tools
  }
  mongo_server_version = "7.0" # Version of MongoDB to use for the CosmosDB account, set to version 7.0 which is a stable and widely used version that provides new features and improvements over previous versions
  consistency_policy {
    consistency_level = "Session" # Consistency level for the CosmosDB account, set to "Session" which provides a good balance between performance and consistency for most applications
  }
  geo_location {
    location          = var.location
    failover_priority = 0
  }                        # Geo-location configuration for the CosmosDB account, defining a single location with a failover priority of 0, which means it is the primary location for the account. Additional locations can be added with higher failover priorities to provide redundancy and high availability.
  free_tier_enabled = true # Enable free tier for the CosmosDB account, allowing it to use up to 400 RU/s of provisioned throughput and 5 GB of storage for free, which is ideal for development and testing scenarios without incurring costs
}

# Azure MongoDB database in CosmosDB account
resource "azurerm_cosmosdb_mongo_database" "ticketing_db" {
  name                = "ticketingdb"                                            # Name of the MongoDB database to be created, set to "ticketingdb" which is a descriptive name for the database used by the ticketing microservice
  resource_group_name = azurerm_resource_group.howestprime.name                  # Name of the resource group where the MongoDB database will be created, referencing the name of the previously defined resource group
  account_name        = azurerm_cosmosdb_account.ticketing_cosmosdb_account.name # Name of the CosmosDB account where the MongoDB database will be created, referencing the name of the previously defined CosmosDB account resource
}

# Add generated db password to Key Vault
resource "azurerm_key_vault_secret" "ticketing_db_password" {
  name         = "ticketing-db-password"          # Name of the Key Vault secret to store the MongoDB database password, set to "ticketing-db-password" which is a descriptive name for the secret that indicates it is used for the ticketing database password
  value        = local.mongo_pwd                  # Value of the Key Vault secret, set to the generated MongoDB password extracted from the CosmosDB account's primary MongoDB connection string using a regular expression and stored in a local variable for secure storage of the database password
  key_vault_id = azurerm_key_vault.howestprime.id # ID of the Key Vault where the secret will be stored, referencing the ID of the previously defined Key Vault resource

  depends_on = [
    azurerm_cosmosdb_mongo_database.ticketing_db, # Ensure the MongoDB database is created before storing the password in Key Vault
    time_sleep.wait_for_rbac # Ensure RBAC permissions are in place before storing the password in Key Vault, as the application will need access to this secret to connect to the database
  ]
}

locals {
  mongo_pwd = regex("mongodb://[^:]+:([^@]+)@", azurerm_cosmosdb_account.ticketing_cosmosdb_account.primary_mongodb_connection_string)[0]
  mongo_host = regex("mongodb://[^:]+:[^@]+@([^:]+):",
  azurerm_cosmosdb_account.ticketing_cosmosdb_account.primary_mongodb_connection_string)[0]
  mongo_port = regex("mongodb://[^:]+:[^@]+@[^:]+:(\\d+)",
  azurerm_cosmosdb_account.ticketing_cosmosdb_account.primary_mongodb_connection_string)[0]
  mongo_options = regex("mongodb://[^:]+:[^@]+@[^:]+:\\d+/\\?([^#]+)",
  azurerm_cosmosdb_account.ticketing_cosmosdb_account.primary_mongodb_connection_string)[0]
  ticketing_documentdb_password_uri = regex("(https://[^/]+/secrets/[^/]+)",
  azurerm_key_vault_secret.ticketing_db_password.id)[0]
  ticketing_messagebroker_password_uri = regex("(https://[^/]+/secrets/[^/]+)",
  azurerm_key_vault_secret.messagebroker_password.id)[0]
  howestprime_repo_ticketing = "st-microservice-ticketing-Br4dleyV"

  howestprime-ticketing-gh-action-variables = {
    howestprime_wide_messagebroker_login = {
      variable_name = "howestprime_wide_p_messagebroker_login"
      value         = data.cloudamqp_credentials.local-admin.username
    }
    howestprime_wide_p_messagebroker_password_uri = {
      variable_name = "howestprime_wide_p_messagebroker_password_uri"
      value         = local.ticketing_messagebroker_password_uri
    }
    howestprime_wide_p_messagebroker_uri = {
      variable_name = "howestprime_wide_p_messagebroker_hostname"
      value         = cloudamqp_instance.howestprime_messagebroker.host
    }
    howestprime_wide_p_messagebroker_vhost = {
      variable_name = "howestprime_wide_p_messagebroker_vhost"
      value         = cloudamqp_instance.howestprime_messagebroker.vhost
    }
    howestprime_ticketing_p_asyncapi_uri = {
      variable_name = "howestprime_ticketing_p_asyncapi_uri"
      value         = "config/asyncapi.yaml"
    }
    howestprime_ticketing_p_webapi_host = {
      variable_name = "howestprime_ticketing_p_webapi_host"
      value         = "0.0.0.0"
    }
    howestprime_ticketing_p_webapi_port = {
      variable_name = "howestprime_ticketing_p_webapi_port"
      value         = "8000"
    }
    howestprime_ticketing_p_documentdb_login = {
      variable_name = "howestprime_ticketing_p_documentdb_login"
      value         = var.resource_login_names.cosmosdb_account
    }
    howestprime_ticketing_p_documentdb_port = {
      variable_name = "howestprime_ticketing_p_documentdb_port"
      value         = local.mongo_port
    }
    howestprime_ticketing_p_documentdb_host = {
      variable_name = "howestprime_ticketing_p_documentdb_host"
      value         = local.mongo_host
    }
    howestprime_ticketing_p_documentdb_options = {
      variable_name = "howestprime_ticketing_p_documentdb_options"
      value         = local.mongo_options
    }
    howestprime_ticketing_p_documentdb_protocol = {
      variable_name = "howestprime_ticketing_p_documentdb_protocol"
      value         = "mongodb"
    }
    howestprime_ticketing_p_documentdb_password_uri = {
      variable_name = "howestprime_ticketing_p_documentdb_password_uri"
      value         = local.ticketing_documentdb_password_uri
    }
    howestprime_ticketing_p_documentdb_db = {
      variable_name = "howestprime_ticketing_p_documentdb_db"
      value         = azurerm_cosmosdb_mongo_database.ticketing_db.name
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
  }

  howestprime-ticketing-gh-action-secrets = {
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

resource "github_actions_variable" "howestprime_ticketing" {
  for_each      = local.howestprime-ticketing-gh-action-variables
  repository    = local.howestprime_repo_ticketing
  variable_name = each.value.variable_name
  value         = each.value.value
  depends_on = [
    azurerm_cosmosdb_account.ticketing_cosmosdb_account,
    azurerm_cosmosdb_mongo_database.ticketing_db
  ]
}

resource "github_actions_secret" "howestprime_ticketing" {
  for_each        = local.howestprime-ticketing-gh-action-secrets
  repository      = local.howestprime_repo_ticketing
  secret_name     = each.value.secret_name
  plaintext_value = each.value.value
  depends_on = [
    azurerm_cosmosdb_account.ticketing_cosmosdb_account,
    azurerm_cosmosdb_mongo_database.ticketing_db
  ]
}