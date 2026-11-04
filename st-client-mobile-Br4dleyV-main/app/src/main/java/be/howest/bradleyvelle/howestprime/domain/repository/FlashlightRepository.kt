package be.howest.bradleyvelle.howestprime.domain.repository

// This is the interface for the FlashlightRepository
// It defines the methods that the FlashlightRepositoryImpl needs to implement
// A repository is a class that abstracts access to multiple data sources
interface FlashlightRepository {
    fun toggleFlashlight(isEnabled: Boolean)
}
