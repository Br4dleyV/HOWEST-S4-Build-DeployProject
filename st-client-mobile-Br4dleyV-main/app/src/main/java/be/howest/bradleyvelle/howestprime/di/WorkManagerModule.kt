package be.howest.bradleyvelle.howestprime.di

import android.content.Context
import androidx.work.WorkManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import jakarta.inject.Singleton

// This is the WorkManager. It is a component that simplifies executing
// background tasks even when the app is closed.
// Here we use it to send notifications when a new message arrives.
// This way the notification is always shown, even when the app is
// closed or the device restarted.
@Module
@InstallIn(SingletonComponent::class)
object WorkManagerModule {

    @Provides
    @Singleton
    fun provideWorkManager(@ApplicationContext context: Context): WorkManager {
        return WorkManager.getInstance(context)
    }
}