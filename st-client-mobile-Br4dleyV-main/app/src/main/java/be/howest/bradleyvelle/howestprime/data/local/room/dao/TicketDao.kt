package be.howest.bradleyvelle.howestprime.data.local.room.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import be.howest.bradleyvelle.howestprime.data.local.room.entity.TicketEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TicketDao {
    @Query("SELECT * FROM tickets")
    fun getAllTicketsFlow(): Flow<List<TicketEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(ticket: TicketEntity)

    @Query("DELETE FROM tickets WHERE id = :ticketId")
    suspend fun delete(ticketId: String)

    @Query("UPDATE tickets SET reminderTime = :reminderTime WHERE id = :ticketId")
    suspend fun updateReminder(ticketId: String, reminderTime: Long?)
}
