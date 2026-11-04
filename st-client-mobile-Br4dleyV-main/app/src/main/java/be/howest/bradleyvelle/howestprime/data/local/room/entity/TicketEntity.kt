package be.howest.bradleyvelle.howestprime.data.local.room.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import be.howest.bradleyvelle.howestprime.domain.model.Ticket

@Entity(tableName = "tickets")
data class TicketEntity(
    @PrimaryKey val id: String,
    val movieTitle: String,
    val startTime: String,
    val room: String,
    val qrCodeData: String,
    val reminderTime: Long? = null
)

fun TicketEntity.asDomainModel(): Ticket {
    return Ticket(
        id = id,
        movieTitle = movieTitle,
        startTime = startTime,
        room = room,
        qrCodeData = qrCodeData,
        reminderTime = reminderTime
    )
}

fun Ticket.asEntity(): TicketEntity {
    return TicketEntity(
        id = id,
        movieTitle = movieTitle,
        startTime = startTime,
        room = room,
        qrCodeData = qrCodeData,
        reminderTime = reminderTime
    )
}
