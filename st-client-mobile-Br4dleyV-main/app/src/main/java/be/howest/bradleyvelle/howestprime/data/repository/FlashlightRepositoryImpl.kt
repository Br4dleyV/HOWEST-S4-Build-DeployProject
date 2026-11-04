package be.howest.bradleyvelle.howestprime.data.repository

import android.content.Context
import android.hardware.camera2.CameraManager
import be.howest.bradleyvelle.howestprime.domain.repository.FlashlightRepository
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject

// This is the implementation of the CartRepository interface
class FlashlightRepositoryImpl @Inject constructor(
    @ApplicationContext private val context: Context
) : FlashlightRepository {
    // Get the camera manager
    private val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
    private var cameraId: String? = null

    // Initialize the camera ID
    init {
        try {
            cameraId = cameraManager.cameraIdList[0]
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // Toggle the flashlight
    override fun toggleFlashlight(isEnabled: Boolean) {
        try {
            cameraId?.let {
                cameraManager.setTorchMode(it, isEnabled)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
