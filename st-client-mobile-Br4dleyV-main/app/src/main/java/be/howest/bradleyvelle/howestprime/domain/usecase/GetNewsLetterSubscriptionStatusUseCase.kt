package be.howest.bradleyvelle.howestprime.domain.usecase

import be.howest.bradleyvelle.howestprime.data.local.SettingsDataStore
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

// This is a use case. It is called by the ViewModel and talks to the repository
// It simplifies the communication between the ViewModel and the repository
// and makes it easier to test
// It is used to get the subscription status from the data store
class GetNewsLetterSubscriptionStatusUseCase @Inject constructor(
    private val settingsDataStore: SettingsDataStore
) {
    operator fun invoke(): Flow<Boolean> {
        return settingsDataStore.isSubscribed
    }
}