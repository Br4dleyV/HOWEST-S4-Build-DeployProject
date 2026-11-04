package be.howest.bradleyvelle.howestprime.ui.cart

import be.howest.bradleyvelle.howestprime.domain.model.CartItem
import java.util.Locale

data class CartUiState(
    val cartItems: List<CartItem> = emptyList(),
    val errorMessage: String? = null
) {
    // Returns the amount of items in the shopping cart
    val totalQuantity: Int
        get() = cartItems.sumOf { it.quantity }

    // Returns the price of the items in the shopping cart
    val totalPrice: Double
        get() = cartItems.sumOf { it.price * it.quantity }

    // Generates a readable summary of the cart items for sharing
    val shareSummary: String
        get() {
            val itemsSummary = cartItems.joinToString(", ") { "${it.quantity}x ${it.name}" }
            return "I just ordered these snacks at Howest Prime: $itemsSummary. Total: €${String.format(Locale.getDefault(), "%.2f", totalPrice)}"
        }
}
