package be.howest.bradleyvelle.howestprime.domain.model

import com.squareup.moshi.JsonClass

// This is a domain model class for incoming order status messages from the message broker
@JsonClass(generateAdapter = true)
data class OrderStatusMessage(
    val orderId: String,
    val status: String,
    val message: String,
    val location: String
)