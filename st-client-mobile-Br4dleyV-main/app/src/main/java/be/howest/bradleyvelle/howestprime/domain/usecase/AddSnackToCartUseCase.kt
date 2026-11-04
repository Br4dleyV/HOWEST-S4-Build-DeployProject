package be.howest.bradleyvelle.howestprime.domain.usecase

import be.howest.bradleyvelle.howestprime.domain.model.CartItem
import be.howest.bradleyvelle.howestprime.domain.model.Snack
import be.howest.bradleyvelle.howestprime.domain.repository.CartRepository
import javax.inject.Inject

// This is a use case. It is called by the ViewModel and talks to the repository
// It simplifies the communication between the ViewModel and the repository
// and makes it easier to test
// It is used to add a snack to the cart in the data store
class AddSnackToCartUseCase @Inject constructor(
    private val cartRepository: CartRepository
) {
    suspend operator fun invoke(snack: Snack) {
        cartRepository.addItem(
            CartItem(
                id = snack.id,
                name = snack.name,
                price = snack.promoPrice ?: snack.price,
                quantity = 1
            )
        )
    }
}