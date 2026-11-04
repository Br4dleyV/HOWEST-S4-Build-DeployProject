# CloudAMQP instance for message brokering in the Howest Prime application
resource "cloudamqp_instance" "howestprime_messagebroker" {
  name   = var.resource_names["cloudamqp_instance_howestprime"] # Name of the CloudAMQP instance, defined in the resource names map
  plan   = "lemming"                                            # Plan for the CloudAMQP instance, "lemming" is a small plan suitable for development and testing
  region = "amazon-web-services::eu-west-1"                     # Region for the CloudAMQP instance, set to AWS Europe (Ireland) for low latency with Azure resources in West Europe
}

# CloudAMQP credentials data source to retrieve the credentials for the local admin user of the CloudAMQP instance
data "cloudamqp_credentials" "local-admin" {
  instance_id = cloudamqp_instance.howestprime_messagebroker.id # ID of the CloudAMQP instance to retrieve credentials for, using the ID from the created instance
}

# Key Vault secret to store the CloudAMQP password securely in Azure Key Vault
resource "azurerm_key_vault_secret" "messagebroker_password" {
  name         = "messagebroker-password"                        # Name of the Key Vault secret to store the CloudAMQP password
  value        = data.cloudamqp_credentials.local-admin.password # Value of the secret, set to the password retrieved from the CloudAMQP credentials data source
  key_vault_id = azurerm_key_vault.howestprime.id                # ID of the Key Vault where the secret will be stored, using the ID from the created Key Vault

  # Forces secret creation to wait 60s for RBAC to propagate
  depends_on = [
    time_sleep.wait_for_rbac # Wait for RBAC propagation before creating the secret to avoid permission issues
  ]
}