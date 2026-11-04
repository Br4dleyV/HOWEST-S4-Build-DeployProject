package be.howest.bradleyvelle.howestprime.ui.sensors

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import be.howest.bradleyvelle.howestprime.domain.repository.FlashlightRepository
import be.howest.bradleyvelle.howestprime.domain.repository.LightSensorRepository
import be.howest.bradleyvelle.howestprime.domain.repository.ProximitySensorRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

// A ViewModel holds the current state of the screen. It decides what data the UI should show. The drawing of that data is the responsibility of the UI/Composable (aka XXXScreen.kt)
// It keeps your data alive if the user rotates their phone or changes settings, preventing unnecessary data reloads. It acts as a middleman keeping the UI code clean by handling data fetching and processing elsewhere.
@HiltViewModel
class SensorsViewModel @Inject constructor(
    private val lightSensorRepository: LightSensorRepository,
    private val proximitySensorRepository: ProximitySensorRepository,
    private val flashlightRepository: FlashlightRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(SensorsUiState())
    val uiState: StateFlow<SensorsUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            lightSensorRepository.lightIntensity.collect { intensity ->
                _uiState.update { it.copy(lightIntensity = intensity) }
            }
        }
        viewModelScope.launch {
            proximitySensorRepository.isNear.collect { isNear ->
                _uiState.update { it.copy(isNear = isNear) }
            }
        }
    }

    fun startListening() {
        lightSensorRepository.startListening()
        proximitySensorRepository.startListening()
    }

    fun stopListening() {
        lightSensorRepository.stopListening()
        proximitySensorRepository.stopListening()
    }

    fun toggleFlashlight(enabled: Boolean) {
        flashlightRepository.toggleFlashlight(enabled)
        _uiState.update { it.copy(isFlashlightEnabled = enabled) }
    }
}
