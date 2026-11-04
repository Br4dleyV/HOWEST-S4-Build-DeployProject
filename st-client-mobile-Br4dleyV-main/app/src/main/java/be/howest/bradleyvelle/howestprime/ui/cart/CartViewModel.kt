package be.howest.bradleyvelle.howestprime.ui.cart

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import be.howest.bradleyvelle.howestprime.domain.usecase.ClearCartUseCase
import be.howest.bradleyvelle.howestprime.domain.usecase.GetCartItemsUseCase
import be.howest.bradleyvelle.howestprime.domain.usecase.PlaceOrderUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

// A ViewModel holds the current state of the screen. It decides what data the UI should show. The drawing of that data is the responsibility of the UI/Composable (aka XXXScreen.kt)
// It keeps your data alive if the user rotates their phone or changes settings, preventing unnecessary data reloads. It acts as a middleman keeping the UI code clean by handling data fetching and processing elsewhere.
@HiltViewModel
class CartViewModel @Inject constructor(
    private val getCartItems: GetCartItemsUseCase,
    private val placeOrder: PlaceOrderUseCase,
    private val clearCart: ClearCartUseCase
) : ViewModel() {

    // Read directly from the database and convert it to CartUiState
    val uiState: StateFlow<CartUiState> = getCartItems()
        .map { items -> CartUiState(cartItems = items) }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = CartUiState()
        )

    // Sends the order to a message broker or API
    fun onSendOrderClick() {
        viewModelScope.launch {
            try {
                val state = uiState.value
                // Place the order in the message broker
                placeOrder(state.cartItems, state.totalPrice, LocalDate.now().plusDays(1))
                // Clear the shopping cart
                clearCart()
            } catch (e: Exception) {
                e.printStackTrace() // Log the error
            }
        }
    }

    // Clears the shopping cart
    fun onCancelOrderClick() {
        viewModelScope.launch {
            clearCart()
        }
    }
}
