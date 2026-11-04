package be.howest.bradleyvelle.howestprime.ui.ticketlist

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Alarm
import androidx.compose.material.icons.filled.QrCode
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import be.howest.bradleyvelle.howestprime.domain.model.Ticket
import be.howest.bradleyvelle.howestprime.ui.theme.HowestprimeTheme

// A Composable function is a function that draws a screen. It is the building block of the UI.
// The logic of the screen is in the ViewModel. The UI is in the Composable function.
@Composable
fun TicketListScreen(
    uiState: TicketListUiState,
    onShowQrCodeClick: (Ticket) -> Unit,
    onSetReminderClick: (Ticket) -> Unit,
    onShowUpcomingOnlyClick: (Boolean) -> Unit,
    onCloseDialog: () -> Unit,
    onReminderOptionSelected: (Ticket, String) -> Unit,
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
                .testTag("ticket_list_screen")
        ) {
            Text(
                text = "TICKETS",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 24.dp)
            )

            // Switch to show upcoming tickets only
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Show upcoming only",
                    style = MaterialTheme.typography.bodyLarge
                )

                Switch(
                    checked = uiState.showUpcomingOnly,
                    onCheckedChange = { onShowUpcomingOnlyClick(it) },
                    modifier = Modifier.testTag("upcoming_only_switch")
                )
            }

            // If there is an error message, show it
            uiState.errorMessage?.let { errorMessage ->
                Text(
                    text = errorMessage,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(top = 16.dp)
                )
            }

            // List of tickets
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(uiState.tickets) { ticket ->
                    TicketItem(
                        ticket = ticket,
                        onQrCodeClick = { onShowQrCodeClick(ticket) },
                        onReminderClick = { onSetReminderClick(ticket) }
                    )
                }
            }
        }

        // Show the QR code dialog if a ticket is selected
        uiState.selectedTicketForQr?.let { ticket ->
            QrCodeDialog(
                // TODO: Create custom qr code with ticket info
                onDismissRequest = onCloseDialog
            )
        }

        // Show the reminder dialog if a ticket is selected
        uiState.selectedTicketForReminder?.let { ticket ->
            ReminderDialog(
                ticket = ticket,
                onDismissRequest = onCloseDialog,
                onOptionSelected = { option -> onReminderOptionSelected(ticket, option) }
            )
        }
    }
}

@Composable
fun TicketItem(
    ticket: Ticket,
    onQrCodeClick: () -> Unit,
    onReminderClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    ElevatedCard(
        modifier = modifier
            .fillMaxWidth()
            .testTag("ticket_item_${ticket.id}"),
        colors = CardDefaults.elevatedCardColors(
            containerColor = Color(0xFFE1E9F0)
        ),
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(20.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = ticket.movieTitle,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = ticket.startTime,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.DarkGray,
                    modifier = Modifier.padding(vertical = 4.dp)
                )
                Text(
                    text = "Room: ${ticket.room}",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
            }

            IconButton(onClick = onQrCodeClick) {
                Icon(
                    imageVector = Icons.Default.QrCode,
                    contentDescription = "Show QR Code",
                    tint = Color(0xFF1B5E8A),
                    modifier = Modifier.size(32.dp)
                )
            }

            IconButton(onClick = onReminderClick) {
                Icon(
                    imageVector = Icons.Default.Alarm,
                    contentDescription = "Set Reminder",
                    tint = Color(0xFF1B5E8A),
                    modifier = Modifier.size(32.dp)
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QrCodeDialog(
    onDismissRequest: () -> Unit
) {
    Dialog(onDismissRequest = onDismissRequest) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(28.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFE1E9F0))
        ) {
            Column(
                modifier = Modifier
                    .padding(24.dp)
                    .fillMaxWidth(),
                horizontalAlignment = Alignment.Start
            ) {
                Text(
                    text = "Scan this ticket",
                    style = MaterialTheme.typography.headlineSmall,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
                
                Surface(
                    modifier = Modifier
                        .size(200.dp)
                        .align(Alignment.CenterHorizontally),
                    color = Color.White,
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.QrCode,
                        contentDescription = "QR Code Placeholder",
                        modifier = Modifier.padding(16.dp).fillMaxSize(),
                        tint = Color.Black
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                TextButton(
                    onClick = onDismissRequest,
                    modifier = Modifier.align(Alignment.End)
                ) {
                    Text("Close", color = Color(0xFF1B5E8A))
                }
            }
        }
    }
}

@Composable
fun ReminderDialog(
    ticket: Ticket,
    onDismissRequest: () -> Unit,
    onOptionSelected: (String) -> Unit
) {
    Dialog(onDismissRequest = onDismissRequest) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(28.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFE1E9F0))
        ) {
            Column(
                modifier = Modifier
                    .padding(24.dp)
                    .fillMaxWidth()
            ) {
                Text(
                    text = "Remind me to see my movie ${ticket.id} in...",
                    style = MaterialTheme.typography.headlineSmall,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                ReminderOption("15 minutes", onOptionSelected)
                ReminderOption("1 hour", onOptionSelected)
                ReminderOption("1 minute", onOptionSelected)
            }
        }
    }
}

@Composable
fun ReminderOption(
    text: String,
    onOptionSelected: (String) -> Unit
) {
    Text(
        text = text,
        style = MaterialTheme.typography.bodyLarge,
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onOptionSelected(text) }
            .padding(vertical = 12.dp)
    )
}

@Preview(showBackground = true)
@Composable
fun TicketListScreenPreview() {
    val sampleTickets = listOf(
        Ticket("1", "Interstellar", "2025-05-29T11:36:17.011975Z", "Room 1", "QR1"),
        Ticket("2", "The Matrix", "2025-06-01T11:36:17.012354Z", "Room 2", "QR2"),
        Ticket("3", "Inception", "2025-05-30T11:36:17.012303Z", "Room 3", "QR3")
    )
    HowestprimeTheme {
        TicketListScreen(
            uiState = TicketListUiState(
                tickets = sampleTickets,
            ),
            onShowQrCodeClick = {},
            onSetReminderClick = {},
            onShowUpcomingOnlyClick = {},
            onCloseDialog = {},
            onReminderOptionSelected = { _, _ -> }
        )
    }
}
