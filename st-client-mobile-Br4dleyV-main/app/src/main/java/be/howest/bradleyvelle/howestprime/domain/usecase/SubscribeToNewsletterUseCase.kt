package be.howest.bradleyvelle.howestprime.domain.usecase

import be.howest.bradleyvelle.howestprime.data.local.SettingsDataStore
import javax.inject.Inject

class SubscribeToNewsletterUseCase @Inject constructor(
    private val settingsDataStore: SettingsDataStore
) {
    suspend operator fun invoke() {
        settingsDataStore.setSubscribed()
    }
}