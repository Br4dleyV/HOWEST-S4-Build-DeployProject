package be.howest.bradleyvelle.howestprime.domain.repository

import com.mapbox.geojson.Point
import com.mapbox.maps.MapView
import kotlinx.coroutines.flow.Flow

// This is the interface for the LocationRepository
// It defines the methods that the LocationRepositoryImpl needs to implement
// A repository is a class that abstracts access to multiple data sources
interface LocationRepository {
    val location: Flow<Point>
    fun attachMapView(mapView: MapView)
    fun detachMapView()
    //Mapbox locatie werkt via: MapView.location. Dit houdt in dat zonder MapView → geen locatie updates
    //Dus repository kan niet “zelfstandig” starten en heeft mapview nodig
}