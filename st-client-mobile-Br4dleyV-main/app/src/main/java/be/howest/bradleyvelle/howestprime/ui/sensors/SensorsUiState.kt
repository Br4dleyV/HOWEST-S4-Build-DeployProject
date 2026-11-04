package be.howest.bradleyvelle.howestprime.ui.sensors

data class SensorsUiState(
    val lightIntensity: Float = 0f,
    val isNear: Boolean = false,
    val isFlashlightEnabled: Boolean = false
) {
    val lightCategory: String
        get() = when {
            lightIntensity < 10 -> "Dark"
            lightIntensity < 100 -> "Dim"
            lightIntensity < 2000 -> "Bright"
            else -> "Very Bright"
        }
    
    val proximityMessage: String
        get() = if (isNear) "You appear to be seated" else "You don't appear to be seated"
}
