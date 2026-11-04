package be.howest.bradleyvelle.howestprime.domain.repository

import kotlinx.coroutines.flow.Flow

// This is the interface for the LightSensorRepository
// It defines the methods that the LightSensorRepositoryImpl needs to implement
// A repository is a class that abstracts access to multiple data sources
interface LightSensorRepository {
    val lightIntensity: Flow<Float>
    fun startListening()
    fun stopListening()
}