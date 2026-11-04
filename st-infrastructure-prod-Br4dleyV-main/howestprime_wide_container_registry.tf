# Azure Container Registry for storing container images used in Azure Container Apps and other containerized applications
resource "azurerm_container_registry" "howestprime" {
  name                = var.resource_names["azurerm_container_registry_howestprime"] # Name of the Container Registry, must be globally unique
  resource_group_name = azurerm_resource_group.howestprime.name                      # Name of the resource group where the Container Registry will be created
  location            = azurerm_resource_group.howestprime.location                  # Location of the Container Registry, same as the resource group
  sku                 = "Basic"                                                      # SKU means the pricing tier of the Container Registry, "Basic" is the entry-level tier suitable for development and testing
}