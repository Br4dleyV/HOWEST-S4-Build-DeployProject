# Azure Resource Group for organizing and managing Azure resources related to the Howest Prime project
resource "azurerm_resource_group" "howestprime" {
  name     = var.resource_names["azurerm_resource_group_howestprime"] # Name of the resource group, defined in the resource_names variable map
  location = var.location                                             # Azure region for the resource group, defined in the location variable
}