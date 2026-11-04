package be.howest.bradleyvelle.howestprime.data.repository

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import be.howest.bradleyvelle.howestprime.domain.repository.ProximitySensorRepository
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.filterNotNull
import javax.inject.Inject

// This is the implementation of the ProximitySensorRepository interface
class ProximitySensorRepositoryImpl @Inject constructor(
    @ApplicationContext private val context: Context
) : ProximitySensorRepository {
    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val proximitySensor = sensorManager.getDefaultSensor(Sensor.TYPE_PROXIMITY)

    private val _isNear = MutableStateFlow<Boolean?>(null)
    override val isNear: Flow<Boolean> = _isNear.filterNotNull()

    private val sensorEventListener = object : SensorEventListener {
        override fun onSensorChanged(event: SensorEvent) {
            if (event.sensor.type == Sensor.TYPE_PROXIMITY) {
                // For proximity sensors, usually index 0 is the distance. 
                // A value of 0.0 typically means "near" and anything else "far" (or the maximum range).
                _isNear.value = event.values[0] < proximitySensor?.maximumRange ?: 0f
            }
        }

        override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
    }

    override fun startListening() {
        proximitySensor?.let {
            sensorManager.registerListener(sensorEventListener, it, SensorManager.SENSOR_DELAY_NORMAL)
        }
    }

    override fun stopListening() {
        sensorManager.unregisterListener(sensorEventListener)
    }
}
