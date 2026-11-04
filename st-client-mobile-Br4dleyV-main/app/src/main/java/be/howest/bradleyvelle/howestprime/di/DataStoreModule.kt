package be.howest.bradleyvelle.howestprime.di

import android.content.Context
import be.howest.bradleyvelle.howestprime.data.local.SettingsDataStore
import be.howest.bradleyvelle.howestprime.data.local.dataStore
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent

// This module provides the DataStore to the app.
// It tells Hilt how to create the SettingsDataStore so it can be used in other places.
// It is used to manage settings like the newsletter subscription.
@Module
@InstallIn(SingletonComponent::class)
object DataStoreModule {

    // This function creates the SettingsDataStore object.
    // It is used by Hilt to provide the DataStore to Use Cases.
    // It is called whenever @Inject is used on a Use Case.
    @Provides
    fun provideSettingsDataStore(
        @ApplicationContext context: Context
    ): SettingsDataStore {
        return SettingsDataStore(context.dataStore)
    }
}