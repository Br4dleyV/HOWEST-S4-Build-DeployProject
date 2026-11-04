package be.howest.bradleyvelle.howestprime.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences>
        by preferencesDataStore(name = "settings")

// This class handles the actual saving and reading of data on your phone.
// It is used to store simple information like the newsletter subscription status.
// It ensures that your data is kept even if you close the app or restart your phone.
class SettingsDataStore(private val dataStore: DataStore<Preferences>) {

    // This is a key that is used to store the data.
    companion object {
        val IS_SUBSCRIBED = booleanPreferencesKey("is_subscribed")
    }

    // This is a live stream of the subscription status.
    // It automatically sends updates whenever the saved data changes.
    val isSubscribed: Flow<Boolean> =
        dataStore.data.map { prefs ->
            prefs[IS_SUBSCRIBED] ?: false
        }

    // This function is used to save the subscription status.
    // It is called whenever the user clicks the subscribe button.
    suspend fun setSubscribed() {
        dataStore.edit { prefs ->
            prefs[IS_SUBSCRIBED] = true
        }
    }
}
