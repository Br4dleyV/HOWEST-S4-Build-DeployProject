package be.howest.bradleyvelle.howestprime.di

import android.content.Context
import androidx.room.Room
import be.howest.bradleyvelle.howestprime.data.local.room.dao.CartDao
import be.howest.bradleyvelle.howestprime.data.local.room.dao.TicketDao
import be.howest.bradleyvelle.howestprime.data.local.room.database.AppDatabase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

// This module tells Hilt how to create the Room Database and DAOs
// For example, CartRepositoryImpl needs a CartDao, hilt looks here to
// find out how to get one
@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(
        @ApplicationContext context: Context
    ): AppDatabase =
        Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "howestprime-db"
        )
        .fallbackToDestructiveMigration() // Added to handle version changes easily during development
        .build()

    @Provides
    fun provideCartDao(db: AppDatabase): CartDao =
        db.cartDao()

    @Provides
    fun provideTicketDao(db: AppDatabase): TicketDao =
        db.ticketDao()
}