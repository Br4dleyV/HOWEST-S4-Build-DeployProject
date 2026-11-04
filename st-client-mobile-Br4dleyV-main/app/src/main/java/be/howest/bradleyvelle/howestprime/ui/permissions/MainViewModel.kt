package be.howest.bradleyvelle.howestprime.ui.permissions

import android.util.Log
import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

// To centralise permission management, we use a MainViewModel
// This way we don't have to know anywhere else in the code
// which permissions are needed and how they are requested
// So you only need to look here
class MainViewModel : ViewModel() {

    private val _permissionRequest =
        MutableStateFlow<AppPermission?>(null)

    val permissionRequest: StateFlow<AppPermission?> =
        _permissionRequest

    fun requestPermission(permission: AppPermission) {
        _permissionRequest.value = permission
    }

    fun onPermissionResult(permission: AppPermission, granted: Boolean) {
        Log.d("Permission", "$permission granted: $granted")
        _permissionRequest.value = null
    }
}