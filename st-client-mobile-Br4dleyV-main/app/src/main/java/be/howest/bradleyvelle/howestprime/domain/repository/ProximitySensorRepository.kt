package be.howest.bradleyvelle.howestprime.domain.repository

import kotlinx.coroutines.flow.Flow

// This is the interface for the ProximitySensorRepository
// It defines the methods that the ProximitySensorRepositoryImpl needs to implement
// A repository is a class that abstracts access to multiple data sources
interface ProximitySensorRepository {
    val isNear: Flow<Boolean>
    fun startListening()
    fun stopListening()
}
