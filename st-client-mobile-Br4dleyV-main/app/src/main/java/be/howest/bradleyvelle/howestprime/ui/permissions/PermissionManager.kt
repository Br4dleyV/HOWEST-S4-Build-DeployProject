package be.howest.bradleyvelle.howestprime.ui.permissions

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect

@Composable
fun PermissionManager(
    permissionRequest: AppPermission?,
    onPermissionResult: (AppPermission, Boolean) -> Unit
) {
    val permissionLauncher =
        rememberLauncherForActivityResult(
            ActivityResultContracts.RequestMultiplePermissions()
        ) { results ->
            permissionRequest?.let {
                val allGranted = results.values.all { it }
                onPermissionResult(it, allGranted)
            }
        }

    LaunchedEffect(permissionRequest) {
        permissionRequest ?: return@LaunchedEffect
        val permissions = permissionRequest.toAndroidPermissions()
        permissionLauncher.launch(permissions)
    }
}