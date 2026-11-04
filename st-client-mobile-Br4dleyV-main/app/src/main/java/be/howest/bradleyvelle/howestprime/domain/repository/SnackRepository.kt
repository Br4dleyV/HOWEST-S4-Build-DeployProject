package be.howest.bradleyvelle.howestprime.domain.repository

import be.howest.bradleyvelle.howestprime.domain.model.Snack

// This is the interface for the SnackRepository
// It defines the methods that the SnackRepositoryImpl needs to implement
// A repository is a class that abstracts access to multiple data sources
interface SnackRepository {
    // Get all snacks in a list
    suspend fun getSnacks(): List<Snack>
}
