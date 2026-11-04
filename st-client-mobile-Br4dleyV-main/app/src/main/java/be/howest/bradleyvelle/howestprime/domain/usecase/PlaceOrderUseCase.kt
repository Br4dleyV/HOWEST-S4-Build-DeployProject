package be.howest.bradleyvelle.howestprime.domain.usecase

import be.howest.bradleyvelle.howestprime.domain.model.CartItem
import be.howest.bradleyvelle.howestprime.domain.model.Order
import be.howest.bradleyvelle.howestprime.domain.repository.OrderRepository
import java.time.LocalDate
import java.util.UUID
import javax.inject.Inject

// This is a use case. It is called by the ViewModel and talks to the repository
// It simplifies the communication between the ViewModel and the repository
// and makes it easier to test
// It is used to place an order on the message broker
class PlaceOrderUseCase @Inject constructor(
    private val orderRepository: OrderRepository
) {
    suspend operator fun invoke(items: List<CartItem>, totalPrice: Double, pickupDate: LocalDate){
        // If cart is empty, do nothing
        if (items.count() == 0)
            return

        // Create order object and place it on the message broker
        val order = Order( // ID is an int
            id = UUID.randomUUID().hashCode(),
            items = items,
            totalPrice = totalPrice,
            pickupDate = pickupDate,
            pickupLocation = "Howest Brugge",
            customerName = "John Doe"
        )
        orderRepository.placeOrder(order)
    }
}