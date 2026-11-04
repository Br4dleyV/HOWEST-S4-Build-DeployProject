package be.howest.bradleyvelle.howestprime.ui.permissions

import android.Manifest

enum class AppPermission {
    NOTIFICATION,
    INTERNET,
    CAMERA,
    LOCATION
}

fun AppPermission.toAndroidPermissions(): Array<String> {
    return when (this) {
        AppPermission.NOTIFICATION -> arrayOf(Manifest.permission.POST_NOTIFICATIONS)
        AppPermission.INTERNET -> arrayOf(Manifest.permission.INTERNET)
        AppPermission.CAMERA -> arrayOf(Manifest.permission.CAMERA)
        AppPermission.LOCATION -> arrayOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )
    }
}