package be.howest.bradleyvelle.howestprime.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import be.howest.bradleyvelle.howestprime.domain.usecase.GetNewsLetterSubscriptionStatusUseCase
import be.howest.bradleyvelle.howestprime.domain.usecase.SubscribeToNewsletterUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

// A ViewModel holds the current state of the screen. It decides what data the UI should show. The drawing of that data is the responsibility of the UI/Composable (aka XXXScreen.kt)
// It keeps your data alive if the user rotates their phone or changes settings, preventing unnecessary data reloads. It acts as a middleman keeping the UI code clean by handling data fetching and processing elsewhere.
@HiltViewModel
class HomeViewModel @Inject constructor(
    private val getSubscriptionStatus: GetNewsLetterSubscriptionStatusUseCase,
    private val subscribeToNewsletter: SubscribeToNewsletterUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState

    init {
        viewModelScope.launch {
            getSubscriptionStatus().collect { subscribed ->
                _uiState.update {
                    it.copy(isSubscribed = subscribed)
                }
            }
        }
    }

    // Function to update the email address
    fun onEmailChanged(newEmail: String) {
        _uiState.update { it.copy(emailAddress = newEmail) }
    }

    // Function to subscribe to the newsletter
    fun onSubscribeClick() {
        viewModelScope.launch {
            subscribeToNewsletter()
        }
    }
}
