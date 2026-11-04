package be.howest.bradleyvelle.howestprime.domain.model

// This data class is used to represent a shopping cart item
data class CartItem(
    val id: String,
    val name: String,
    val quantity: Int,
    val price: Double
)
