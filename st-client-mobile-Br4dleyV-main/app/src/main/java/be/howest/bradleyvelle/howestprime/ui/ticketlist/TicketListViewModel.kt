package be.howest.bradleyvelle.howestprime.ui.ticketlist

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import be.howest.bradleyvelle.howestprime.data.worker.NotificationHelper
import be.howest.bradleyvelle.howestprime.domain.model.Ticket
import be.howest.bradleyvelle.howestprime.domain.repository.TicketRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.Instant
import javax.inject.Inject

// A ViewModel holds the current state of the screen. It decides what data the UI should show. The drawing of that data is the responsibility of the UI/Composable (aka XXXScreen.kt)
// It keeps your data alive if the user rotates their phone or changes settings, preventing unnecessary data reloads. It acts as a middleman keeping the UI code clean by handling data fetching and processing elsewhere.
@HiltViewModel
class TicketListViewModel @Inject constructor(
    private val ticketRepository: TicketRepository,
    @ApplicationContext private val context: Context
) : ViewModel() {

    private val _uiState = MutableStateFlow(TicketListUiState())
    val uiState: StateFlow<TicketListUiState> = _uiState

    private var allTickets: List<Ticket> = emptyList()

    // When the screen is created, observe the tickets from the repository
    init {
        observeTickets()
    }

    private fun observeTickets() {
        viewModelScope.launch {
            ticketRepository.getAllTickets().collect { tickets ->
                allTickets = tickets
                _uiState.update { currentState ->
                    currentState.copy(
                        tickets = filterTickets(allTickets, currentState.showUpcomingOnly)
                    )
                }
            }
        }
    }

    // Function to switch between showing all tickets and only showing upcoming ones
    fun onShowUpcomingOnlyClick(showUpcomingOnly: Boolean) {
        _uiState.update {
            it.copy(
                showUpcomingOnly = showUpcomingOnly,
                tickets = filterTickets(allTickets, showUpcomingOnly)
            )
        }
    }

    // Function to open the QR code popup
    fun onShowQrCodeClick(ticket: Ticket) {
        _uiState.update { it.copy(selectedTicketForQr = ticket) }
    }

    // Function to open the reminder selection popup
    fun onSetReminderClick(ticket: Ticket) {
        _uiState.update { it.copy(selectedTicketForReminder = ticket) }
    }

    // Closes a popup like the ticket reminder selection or qr code
    fun onCloseDialog() {
        _uiState.update { it.copy(selectedTicketForQr = null, selectedTicketForReminder = null) }
    }

    // Function to close the dialog and schedule a reminder
    fun onReminderOptionSelected(ticket: Ticket, option: String) {
        val minutesBefore = when (option) {
            "1 minute" -> 1
            "15 minutes" -> 15
            "1 hour" -> 60
            else -> 0
        }

        if (minutesBefore > 0) {
            NotificationHelper.scheduleReminder(context, ticket, minutesBefore)
            
            // Calculate the scheduled time to save in DB
            val movieStartTime = NotificationHelper.parseDateTime(ticket.startTime).toEpochMilli()
            val reminderTime = movieStartTime - (minutesBefore * 60 * 1000)
            
            viewModelScope.launch {
                ticketRepository.updateReminder(ticket.id, reminderTime)
            }
        }
        
        onCloseDialog()
    }

    // Function to filter the tickets based on the showUpcomingOnly flag
    private fun filterTickets(tickets: List<Ticket>, showUpcomingOnly: Boolean): List<Ticket> {
        if (!showUpcomingOnly) return tickets

        val now = Instant.now()
        return tickets.filter { ticket ->
            runCatching { NotificationHelper.parseDateTime(ticket.startTime) }
                .getOrNull()
                ?.isAfter(now) == true
        }
    }
}
