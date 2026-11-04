package be.howest.bradleyvelle.howestprime.data.repository

import be.howest.bradleyvelle.howestprime.data.local.room.dao.CartDao
import be.howest.bradleyvelle.howestprime.data.local.room.entity.CartItemEntity
import be.howest.bradleyvelle.howestprime.domain.model.CartItem
import be.howest.bradleyvelle.howestprime.domain.repository.CartRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject

// This is the implementation of the CartRepository interface
class CartRepositoryImpl @Inject constructor(
    private val cartDao: CartDao
) : CartRepository {

    override suspend fun addItem(item: CartItem) {
        val existingItem = cartDao.getCartItemById(item.id)
        val entity = CartItemEntity(
            id = item.id,
            name = item.name,
            price = item.price,
            quantity = if (existingItem != null) existingItem.quantity + item.quantity else item.quantity
        )
        cartDao.insert(entity)
    }

    override fun getCartItems(): Flow<List<CartItem>> {
        return cartDao.getCartItems().map { entities ->
            entities.map {
                CartItem(
                    id = it.id,
                    name = it.name,
                    price = it.price,
                    quantity = it.quantity
                )
            }
        }
    }

    override suspend fun clearCart() {
        cartDao.clearCart()
    }
}