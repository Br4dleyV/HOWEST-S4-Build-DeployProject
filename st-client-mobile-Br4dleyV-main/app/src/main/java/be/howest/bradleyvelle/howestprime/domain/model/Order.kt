package be.howest.bradleyvelle.howestprime.domain.model

import com.squareup.moshi.JsonClass
import java.time.LocalDate

// This is a domain model for the order entity
@JsonClass(generateAdapter = true) // It automatically creates the logic needed to turn this into json and back
data class Order(
    val id: Int,
    val items: List<CartItem>,
    val totalPrice: Double,
    val pickupDate: LocalDate,
    val pickupLocation: String?,
    val customerName: String
)