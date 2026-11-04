package be.howest.bradleyvelle.howestprime.domain.repository

import be.howest.bradleyvelle.howestprime.domain.model.Ticket
import kotlinx.coroutines.flow.Flow

interface TicketRepository {
    fun getAllTickets(): Flow<List<Ticket>>
    suspend fun saveTicket(ticket: Ticket)
    suspend fun deleteTicket(ticketId: String)
    suspend fun updateReminder(ticketId: String, reminderTime: Long?)
}
