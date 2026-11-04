package be.howest.bradleyvelle.howestprime.data.local.room.database

import androidx.room.Database
import androidx.room.RoomDatabase
import be.howest.bradleyvelle.howestprime.data.local.room.dao.CartDao
import be.howest.bradleyvelle.howestprime.data.local.room.dao.TicketDao
import be.howest.bradleyvelle.howestprime.data.local.room.entity.CartItemEntity
import be.howest.bradleyvelle.howestprime.data.local.room.entity.TicketEntity

// This is the Room database
// We define the entities and DAO's of the database
@Database(
    entities = [CartItemEntity::class, TicketEntity::class],
    version = 5
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun cartDao(): CartDao
    abstract fun ticketDao(): TicketDao
}