package be.howest.bradleyvelle.howestprime.ui.map

import android.view.View
import android.widget.Toast
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import be.howest.bradleyvelle.howestprime.R
import com.mapbox.geojson.Point
import com.mapbox.maps.CameraOptions
import com.mapbox.maps.extension.compose.MapEffect
import com.mapbox.maps.extension.compose.MapboxMap
import com.mapbox.maps.extension.compose.animation.viewport.rememberMapViewportState
import com.mapbox.maps.extension.compose.annotation.generated.PointAnnotation
import com.mapbox.maps.extension.compose.annotation.rememberIconImage
import com.mapbox.maps.extension.style.layers.properties.generated.IconAnchor

@Composable
fun MapScreen(
    uiState: MapUiState,
    onRequestLocationPermission: () -> Unit,
    onMapReady: (com.mapbox.maps.MapView) -> Unit,
    onMapDisposed: () -> Unit,
    onNavigateClick: () -> Unit
) {
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        onRequestLocationPermission()
    }

    val cinemaLocation = Point.fromLngLat(3.2172804596421543, 51.194579816491284)

    val mapViewportState = rememberMapViewportState {
        setCameraOptions {
            zoom(15.0)
            center(cinemaLocation)
            pitch(0.0)
            bearing(0.0)
        }
    }

    val pinkMarker = rememberIconImage(R.drawable.ic_pink_marker)
    val blueMarker = rememberIconImage(R.drawable.ic_blue_marker)

    Box(modifier = Modifier.fillMaxSize()) {
        MapboxMap(
            modifier = Modifier.fillMaxSize(),
            mapViewportState = mapViewportState
        ) {
            MapEffect(Unit) { mapView ->
                onMapReady(mapView)
                mapView.addOnAttachStateChangeListener(object : View.OnAttachStateChangeListener {
                    override fun onViewAttachedToWindow(v: View) {}
                    override fun onViewDetachedFromWindow(v: View) {
                        onMapDisposed()
                    }
                })
            }

            // Cinema location marker (Pink)
            PointAnnotation(point = cinemaLocation) {
                iconImage = pinkMarker
                iconAnchor = IconAnchor.BOTTOM
                interactionsState.onClicked {
                    Toast.makeText(
                        context,
                        "HowestPrime",
                        Toast.LENGTH_SHORT
                    ).show()
                    true
                }
            }

            // User location marker (Blue)
            uiState.userLocation?.let { userPoint ->
                PointAnnotation(point = userPoint) {
                    iconImage = blueMarker
                    iconAnchor = IconAnchor.BOTTOM
                }
            }
        }

        FloatingActionButton(
            onClick = {
                uiState.userLocation?.let { userPoint ->
                    mapViewportState.flyTo(
                        CameraOptions.Builder()
                            .center(userPoint)
                            .zoom(15.0)
                            .build()
                    )
                } ?: Toast.makeText(context, "Location not available", Toast.LENGTH_SHORT).show()
            },
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(16.dp),
            containerColor = Color.White,
            contentColor = Color.Black
        ) {
            Icon(imageVector = Icons.Default.MyLocation, contentDescription = "Center on user")
        }
    }
}
