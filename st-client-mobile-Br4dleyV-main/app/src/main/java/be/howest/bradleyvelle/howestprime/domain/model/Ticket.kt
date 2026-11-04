package be.howest.bradleyvelle.howestprime.domain.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

// This data class is used to represent a ticket
@JsonClass(generateAdapter = true)
data class Ticket(
    @Json(name = "ticketId") val id: String,
    @Json(name = "movieName") val movieTitle: String,
    val startTime: String,
    val room: String,
    val qrCodeData: String,
    val reminderTime: Long? = null
)
