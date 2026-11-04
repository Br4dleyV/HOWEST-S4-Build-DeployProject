package be.howest.bradleyvelle.howestprime.ui.map

import com.mapbox.geojson.Point

data class MapUiState(
    val userLocation: Point? = null // User location or null
)