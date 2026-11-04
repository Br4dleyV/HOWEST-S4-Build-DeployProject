package be.howest.bradleyvelle.howestprime.data.fake

import be.howest.bradleyvelle.howestprime.domain.model.CartItem
import be.howest.bradleyvelle.howestprime.domain.model.Snack
import be.howest.bradleyvelle.howestprime.domain.model.Ticket

// This FakeDataSource class is used to provide fake/mock data for the application
class FakeDataSource() {
    private val tickets = listOf<Ticket>(
        Ticket("0988c8cb-4f91-422a-9549-e7d02decbd3d", "Interstellar", "2025-05-29T11:36:17.011975Z", "Room 1", "TICKET_INT"),
        Ticket("1234abcd-1234-abcd-1234-abcd1234abcd", "The Matrix", "2025-06-01T11:36:17.012354Z", "Room 2", "TICKET_MAT"),
        Ticket("5678efgh-5678-efgh-5678-efgh5678efgh", "Inception", "2027-05-30T11:36:17.012303Z", "Room 3", "TICKET_INC")
    )

    // Function to load the tickets from the list
    fun loadTickets(): List<Ticket> {
        return tickets
    }

    private val cartItems = listOf<CartItem>(
        CartItem("1", "Popcorn Zoet", 1, 3.5),
        CartItem("2", "Popcorn Zout", 1, 4.5)
    )

    // Function to load the cart items from the list
    fun loadCartItems(): List<CartItem> {
        return cartItems
    }

    private val snacks = listOf(
        Snack("1", "Popcorn Zoet", 4.5, 3.5),
        Snack("2", "Popcorn Zout", 4.5),
        Snack("3", "Nacho's + Salsa", 5.5),
        Snack("4", "Cola (50cl)", 3.0),
        Snack("5", "Fanta (50cl)", 3.0),
        Snack("6", "Sprite (50cl)", 3.0)
    )

    // Function to load the snacks from the list
    fun loadSnacks(): List<Snack> {
        return snacks
    }
}