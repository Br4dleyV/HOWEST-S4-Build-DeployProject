package be.howest.bradleyvelle.howestprime.data.local.room.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

// This is a Room database entity class that represents a cart item.
// It has a primary key, name, price, and quantity.
// This class is used to store cart items in the Room database.
@Entity(tableName = "cart_items") // Database entity in table "cart_items"
data class CartItemEntity(
    @PrimaryKey val id: String, // Primary key of the table
    val name: String, // Name of the item
    val price: Double, // Price of the item
    val quantity: Int // Quantity of the item
)