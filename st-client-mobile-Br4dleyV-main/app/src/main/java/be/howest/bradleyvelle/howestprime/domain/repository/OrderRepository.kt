package be.howest.bradleyvelle.howestprime.domain.repository

import be.howest.bradleyvelle.howestprime.domain.model.Order

// This is the repository interface for orders
interface OrderRepository {
    // Function to place an order
    suspend fun placeOrder(order: Order)

    // Function to send notification
    fun sendNotification(orderId: String)
}