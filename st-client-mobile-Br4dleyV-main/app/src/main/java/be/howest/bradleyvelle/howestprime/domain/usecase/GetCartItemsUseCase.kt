package be.howest.bradleyvelle.howestprime.domain.usecase

import be.howest.bradleyvelle.howestprime.domain.model.CartItem
import be.howest.bradleyvelle.howestprime.domain.repository.CartRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

// This is a use case. It is called by the ViewModel and talks to the repository
// It simplifies the communication between the ViewModel and the repository
// and makes it easier to test
// It is used to get cart items from the data store
class GetCartItemsUseCase @Inject constructor(
    private val cartRepository: CartRepository
) {
    operator fun invoke(): Flow<List<CartItem>> =
        cartRepository.getCartItems()
}