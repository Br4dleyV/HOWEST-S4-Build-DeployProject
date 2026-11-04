package be.howest.bradleyvelle.howestprime.ui.ticketlist

import be.howest.bradleyvelle.howestprime.domain.model.Ticket

data class TicketListUiState(
    val tickets: List<Ticket> = emptyList(), // List of tickets inside the ticket list screen
    val showUpcomingOnly: Boolean = false, // Whether or not to show upcoming movies only
    val selectedTicketForQr: Ticket? = null, // Selected ticket to show in the Qr Code
    val selectedTicketForReminder: Ticket? = null, // Selected ticket to set reminder for in reminder popup
    val errorMessage: String? = null // Error message to show if something goes wrong
)
