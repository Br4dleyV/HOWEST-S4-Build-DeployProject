package be.howest.bradleyvelle.howestprime.data.repository

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import be.howest.bradleyvelle.howestprime.domain.repository.LightSensorRepository
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.filterNotNull
import javax.inject.Inject

// This is the implementation of the LightSensorRepository interface
class LightSensorRepositoryImpl @Inject constructor(
    @ApplicationContext private val context: Context
) : LightSensorRepository {
    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val lightSensor = sensorManager.getDefaultSensor(Sensor.TYPE_LIGHT)

    // Listen for light intensity changes
    private val _lightIntensity = MutableStateFlow<Float?>(null)
    override val lightIntensity: Flow<Float> =
        _lightIntensity.filterNotNull()

    // Listen for proximity changes
    private val sensorEventListener = object : SensorEventListener {
        override fun onSensorChanged(event: SensorEvent) {
            if (event.sensor.type == Sensor.TYPE_LIGHT) {
                _lightIntensity.value = event.values[0]
            }
        }

        override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
    }

    // Start and stop listening for sensors
    override fun startListening() {
        lightSensor?.let {
            sensorManager.registerListener(sensorEventListener, it, SensorManager.SENSOR_DELAY_NORMAL)
        }
    }

    override fun stopListening() {
        sensorManager.unregisterListener(sensorEventListener)
    }
}
