# Azure Log Analytics Workspace for monitoring and analyzing logs from Azure resources, including Azure Container Apps. This workspace will be used to collect and analyze logs from the Container App Environment for better insights and troubleshooting.
resource "azurerm_log_analytics_workspace" "howestprime" {
  name                = var.resource_names["log_analytics_workspace"] # Name of the Log Analytics Workspace
  location            = azurerm_resource_group.howestprime.location   # Location of the Log Analytics Workspace, same as the resource group
  resource_group_name = azurerm_resource_group.howestprime.name       # Name of the resource group where the Log Analytics Workspace will be created
  sku                 = "PerGB2018"                                   # SKU for the Log Analytics Workspace, using PerGB2018 for pay-as-you-go pricing
  retention_in_days   = 30                                            # Retention period for logs in days, set to 30 days for this workspace
}