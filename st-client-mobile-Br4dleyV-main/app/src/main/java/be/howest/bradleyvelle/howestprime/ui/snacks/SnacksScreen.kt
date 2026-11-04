package be.howest.bradleyvelle.howestprime.ui.snacks

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Fastfood
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import be.howest.bradleyvelle.howestprime.R
import be.howest.bradleyvelle.howestprime.domain.model.Snack
import be.howest.bradleyvelle.howestprime.ui.theme.HowestprimeTheme

// A Composable function is a function that draws a screen. It is the building block of the UI.
// The logic of the screen is in the ViewModel. The UI is in the Composable function.
@Composable
fun SnacksScreen(
    uiState: SnacksUiState,
    onAddSnackClick: (Snack) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .testTag("snacks_screen")
    ) {
        Text(
            text = stringResource(R.string.snacks_label).uppercase(),
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.ExtraBold,
            modifier = Modifier.padding(vertical = 24.dp)
        )

        // If there is an error message, show it
        uiState.errorMessage?.let { errorMessage ->
            Text(
                text = errorMessage,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.padding(top = 16.dp)
            )
        }

        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            contentPadding = PaddingValues(bottom = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(uiState.snacks) { snack ->
                SnackCard(
                    snack = snack,
                    onAddClick = { onAddSnackClick(snack) }
                )
            }
        }
    }
}

@Composable
fun SnackCard(
    snack: Snack,
    onAddClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFFF1F6FA) // Slightly more blue-ish background as in design
        ),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier
                .fillMaxWidth() // Ensure the column fills the card width for centering
                .padding(16.dp)
        ) {
            // Placeholder for the snack image (Popcorn bucket)
            Icon(
                imageVector = Icons.Default.Fastfood,
                contentDescription = null,
                tint = Color(0xFFE53935),
                modifier = Modifier
                    .size(120.dp)
                    .padding(bottom = 8.dp)
            )

            Text(
                text = snack.name.uppercase(),
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.ExtraBold,
                textAlign = TextAlign.Center,
                minLines = 2,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(64.dp)
            )

            if (snack.promoPrice != null) {
                Text(
                    text = "${stringResource(R.string.promo_label)} €${snack.promoPrice}",
                    color = Color.Red,
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 20.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                )
            } else {
                Text(
                    text = "€${snack.price}",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.ExtraBold,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Button(
                onClick = onAddClick,
                shape = RoundedCornerShape(24.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary
                ),
                contentPadding = PaddingValues(horizontal = 24.dp, vertical = 8.dp),
                modifier = Modifier.testTag("add_snack_${snack.id}")
            ) {
                Text(
                    text = stringResource(R.string.add_to_cart_label),
                    style = MaterialTheme.typography.labelLarge,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun SnacksScreenPreview() {
    HowestprimeTheme {
        SnacksScreen(
            uiState = SnacksUiState(
                snacks = listOf(
                    Snack("1", "Popcorn Zoet", 4.5, 3.5),
                    Snack("2", "Popcorn Zout", 4.5),
                    Snack("3", "Nacho's + Salsa", 5.5),
                    Snack("4", "Cola (50cl)", 3.0)
                )
            ),
            onAddSnackClick = {}
        )
    }
}
