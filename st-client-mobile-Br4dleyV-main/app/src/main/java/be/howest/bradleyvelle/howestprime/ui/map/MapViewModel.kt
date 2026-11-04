package be.howest.bradleyvelle.howestprime.ui.map

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import be.howest.bradleyvelle.howestprime.domain.repository.LocationRepository
import com.mapbox.maps.MapView
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MapViewModel @Inject constructor(
    private val locationRepository: LocationRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(MapUiState())
    val uiState: StateFlow<MapUiState> = _uiState

    init {
        viewModelScope.launch {
            locationRepository.location.collect { point ->
                _uiState.update { it.copy(userLocation = point) }
            }
        }
    }

    fun onMapReady(mapView: MapView) {
        locationRepository.attachMapView(mapView)
    }

    fun onMapDisposed() {
        locationRepository.detachMapView()
    }
}