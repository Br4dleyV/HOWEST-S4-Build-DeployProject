package be.howest.bradleyvelle.howestprime.data.repository

import android.content.Context
import be.howest.bradleyvelle.howestprime.domain.repository.LocationRepository
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.filterNotNull
import javax.inject.Inject
import com.mapbox.geojson.Point
import com.mapbox.maps.MapView
import com.mapbox.maps.plugin.locationcomponent.location
import com.mapbox.maps.plugin.locationcomponent.OnIndicatorPositionChangedListener

// This is the implementation of the LocationRepository interface
class LocationRepositoryImpl @Inject constructor(
    @ApplicationContext private val context: Context
): LocationRepository {
    private val _location = MutableStateFlow<Point?>(null)
    override val location: Flow<Point> =
        _location.filterNotNull()

    private var listener: OnIndicatorPositionChangedListener? = null
    private var mapView: MapView? = null

    override fun attachMapView(mapView: MapView) {
        this.mapView = mapView

        // We enable the location component so the map starts receiving updates.
        // The visual blue marker is handled in MapScreen.kt using PointAnnotation.
        mapView.location.updateSettings {
            enabled = true
        }

        listener = OnIndicatorPositionChangedListener { point ->
            _location.value = point
        }

        mapView.location.addOnIndicatorPositionChangedListener(listener!!)
    }

    override fun detachMapView(){
        mapView?.let { mv ->
            listener?.let {
                mv.location.removeOnIndicatorPositionChangedListener(it)
            }

            mv.location.updateSettings {
                enabled = false
            }
        }

        listener = null
        mapView = null
    }
}
