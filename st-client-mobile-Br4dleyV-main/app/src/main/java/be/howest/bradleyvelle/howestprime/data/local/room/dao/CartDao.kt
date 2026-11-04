package be.howest.bradleyvelle.howestprime.data.local.room.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import be.howest.bradleyvelle.howestprime.data.local.room.entity.CartItemEntity
import kotlinx.coroutines.flow.Flow

// This is the DAO interface for the CartItemEntity
@Dao
interface CartDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(item: CartItemEntity)

    @Query("SELECT * FROM cart_items")
    fun getCartItems(): Flow<List<CartItemEntity>>

    @Query("SELECT * FROM cart_items WHERE id = :id")
    suspend fun getCartItemById(id: String): CartItemEntity?

    @Query("DELETE FROM cart_items")
    suspend fun clearCart()
}