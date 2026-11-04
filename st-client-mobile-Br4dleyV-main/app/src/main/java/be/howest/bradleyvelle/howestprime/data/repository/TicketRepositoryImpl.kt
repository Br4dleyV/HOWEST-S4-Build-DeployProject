package be.howest.bradleyvelle.howestprime.data.repository

import be.howest.bradleyvelle.howestprime.data.local.room.dao.TicketDao
import be.howest.bradleyvelle.howestprime.data.local.room.entity.asDomainModel
import be.howest.bradleyvelle.howestprime.data.local.room.entity.asEntity
import be.howest.bradleyvelle.howestprime.domain.model.Ticket
import be.howest.bradleyvelle.howestprime.domain.repository.TicketRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject

class TicketRepositoryImpl @Inject constructor(
    private val ticketDao: TicketDao
) : TicketRepository {

    override fun getAllTickets(): Flow<List<Ticket>> {
        return ticketDao.getAllTicketsFlow().map { entities ->
            entities.map { it.asDomainModel() }
        }
    }

    override suspend fun saveTicket(ticket: Ticket) {
        ticketDao.insert(ticket.asEntity())
    }

    override suspend fun deleteTicket(ticketId: String) {
        ticketDao.delete(ticketId)
    }

    override suspend fun updateReminder(ticketId: String, reminderTime: Long?) {
        ticketDao.updateReminder(ticketId, reminderTime)
    }
}
