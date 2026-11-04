package be.howest.bradleyvelle.howestprime.domain.repository

import be.howest.bradleyvelle.howestprime.domain.model.CartItem
import kotlinx.coroutines.flow.Flow

// This is the interface for the CartRepository
// It defines the methods that the CartRepositoryImpl needs to implement
// A repository is a class that abstracts access to multiple data sources
interface CartRepository {
    suspend fun addItem(item: CartItem)
    fun getCartItems(): Flow<List<CartItem>>
    suspend fun clearCart()
}