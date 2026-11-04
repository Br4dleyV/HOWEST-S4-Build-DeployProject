package be.howest.bradleyvelle.howestprime.ui.snacks

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import be.howest.bradleyvelle.howestprime.domain.model.Snack
import be.howest.bradleyvelle.howestprime.domain.usecase.AddSnackToCartUseCase
import be.howest.bradleyvelle.howestprime.domain.usecase.GetSnacksUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

// A ViewModel holds the current state of the screen. It decides what data the UI should show. The drawing of that data is the responsibility of the UI/Composable (aka XXXScreen.kt)
// It keeps your data alive if the user rotates their phone or changes settings, preventing unnecessary data reloads. It acts as a middleman keeping the UI code clean by handling data fetching and processing elsewhere.
@HiltViewModel
class SnacksViewModel @Inject constructor(
    private val getSnacks: GetSnacksUseCase,
    private val addSnackToCart: AddSnackToCartUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(SnacksUiState())
    val uiState: StateFlow<SnacksUiState> = _uiState.asStateFlow()

    // When the screen is created, load the snacks from the repository
    init {
        loadSnacks()
    }

    // Function to add a snack to the cart using the use case
    fun onAddSnackClick(snack: Snack) {
        viewModelScope.launch {
            addSnackToCart(snack)
        }
    }

    // Function to load the snacks from the repository
    private fun loadSnacks() {
        viewModelScope.launch {
            try {
                val snacks = getSnacks()
                _uiState.update { it.copy(snacks = snacks) }
            } catch (e: Exception) {
                _uiState.update { it.copy(errorMessage = e.message) }
            }
        }
    }
}
