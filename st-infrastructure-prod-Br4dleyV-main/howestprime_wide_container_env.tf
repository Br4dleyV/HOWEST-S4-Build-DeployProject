# Azure Container App Environment for running containerized applications in Azure Container Apps
resource "azurerm_container_app_environment" "howestprime" {
  name                       = var.resource_names["container_app_environment"] # Name of the Container App Environment
  location                   = azurerm_resource_group.howestprime.location     # Location of the Container App Environment, same as the resource group
  resource_group_name        = azurerm_resource_group.howestprime.name         # Name of the resource group where the Container App Environment will be created
  log_analytics_workspace_id = azurerm_log_analytics_workspace.howestprime.id  # ID of the Log Analytics Workspace for monitoring and logging
}

# The movies (and ticketing) Container Apps are created by the GitHub Actions CI/CD
# pipelines using `az containerapp create`, so Terraform does not manage them and they
# are NOT in state. On `terraform destroy`, Azure refuses to delete the environment
# while those container apps still exist (409 ManagedEnvironmentHasContainerApps).
#
# This null_resource runs a destroy-time provisioner that deletes every container app
# inside the environment BEFORE the environment itself is destroyed. Because it depends
# on the environment, Terraform destroys this resource first (reverse dependency order).
resource "null_resource" "cleanup_container_apps" {
  # Destroy-time provisioners can only reference self.triggers, so capture everything here.
  triggers = {
    resource_group   = azurerm_resource_group.howestprime.name
    environment_name = azurerm_container_app_environment.howestprime.name
    subscription_id  = var.howestprime_subscription_id
    tenant_id        = var.howestprime_tenant_id
    client_id        = var.service_principal_terraform_client_id
    client_secret    = var.service_principal_terraform_secret
  }

  depends_on = [azurerm_container_app_environment.howestprime]

  provisioner "local-exec" {
    when        = destroy
    interpreter = ["powershell", "-Command"]
    environment = {
      AZ_CLIENT_ID     = self.triggers.client_id
      AZ_CLIENT_SECRET = self.triggers.client_secret
      AZ_TENANT_ID     = self.triggers.tenant_id
      AZ_SUBSCRIPTION  = self.triggers.subscription_id
      AZ_RG            = self.triggers.resource_group
      AZ_ENV           = self.triggers.environment_name
    }
    command = <<-EOT
      $ErrorActionPreference = "Stop"

      # Authenticate. Fail loudly if login does not succeed, otherwise the cleanup
      # silently does nothing and the environment delete fails with a 409.
      az login --service-principal --username $env:AZ_CLIENT_ID --password $env:AZ_CLIENT_SECRET --tenant $env:AZ_TENANT_ID | Out-Null
      if ($LASTEXITCODE -ne 0) { throw "az login failed - cannot clean up container apps" }
      az account set --subscription $env:AZ_SUBSCRIPTION
      if ($LASTEXITCODE -ne 0) { throw "az account set failed" }

      # Helper: return the list of container app names in the environment.
      # We only ever use the JMESPath "[].name" query (square brackets are safe to
      # pass through cmd/az.cmd on Windows); we deliberately avoid parenthesised
      # functions like length([]) because PowerShell strips the surrounding quotes
      # and cmd then fails to parse the "()" with "-o was unexpected at this time".
      function Get-AppNames {
        $raw = az containerapp list --resource-group $env:AZ_RG --environment $env:AZ_ENV --query "[].name" -o tsv 2>$null
        if (-not $raw) { return @() }
        return @($raw -split "`r?`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" })
      }

      # Kick off deletion of every container app in the environment in parallel
      # (--no-wait), so we are not deleting them one-by-one.
      $apps = Get-AppNames
      foreach ($name in $apps) {
        Write-Host "Deleting container app: $name"
        az containerapp delete --name $name --resource-group $env:AZ_RG --yes --no-wait
      }

      # Poll until the environment reports zero container apps. Terraform must not
      # proceed to delete the environment until this is true, or it 409s.
      $deadline = (Get-Date).AddMinutes(5)
      while ($true) {
        $remaining = (Get-AppNames).Count
        Write-Host "Container apps remaining in $env:AZ_ENV: $remaining"
        if ($remaining -eq 0) { break }
        if ((Get-Date) -gt $deadline) { throw "Timed out waiting for container apps to delete" }
        Start-Sleep -Seconds 10
      }
      Write-Host "All container apps deleted. Environment is safe to destroy."
    EOT
  }
}