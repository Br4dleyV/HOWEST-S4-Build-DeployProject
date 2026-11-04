package be.howest.bradleyvelle.howestprime.ui.home

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import be.howest.bradleyvelle.howestprime.R
import be.howest.bradleyvelle.howestprime.ui.theme.HowestprimeTheme

// A Composable function is a function that draws a screen. It is the building block of the UI.
// The logic of the screen is in the ViewModel. The UI is in the Composable function.
@Composable
fun HomeScreen(
    uiState: HomeUiState,
    onOrderSnackClick: () -> Unit,
    onEmailChanged: (String) -> Unit,
    onSubscribeClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .testTag("home_screen")
    ) {
        HeroImage()

        OrderASnack(
            onOrderSnackClick = onOrderSnackClick
        )

        IntroText()

        // Only show the newsletter if the person is not subscribed
        if (!uiState.isSubscribed) {
            SubscribeToNewsletter(
                emailAddress = uiState.emailAddress,
                onEmailChanged = {
                    onEmailChanged(it)
                },
                onSubscribeClick = {
                    onSubscribeClick()
                }
            )
        }
    }
}

@Composable
fun HeroImage(
    modifier: Modifier = Modifier
) {
    Image(
        painter = painterResource(R.drawable.howest_prime),
        modifier = modifier.aspectRatio(16f / 9f),
        contentScale = ContentScale.Crop,
        contentDescription = null
    )
}

@Composable
fun IntroText(
    modifier: Modifier = Modifier
) {
    Text(
        stringResource(R.string.description_text),
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        fontSize = 18f.sp,
        lineHeight = 28.sp
    )
}

@Composable
fun OrderASnack(
    onOrderSnackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.secondaryContainer)
            .clickable {
                onOrderSnackClick()
            }
            .testTag("order_snack_button")
    ) {
        Text(
            stringResource(id = R.string.order_a_snack_label).uppercase(),
            modifier = modifier
                .fillMaxSize()
                .padding(vertical = 16.dp, horizontal = 4.dp),
            style = MaterialTheme.typography.bodyLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSecondaryContainer,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
private fun SubscribeToNewsletter(
    modifier: Modifier = Modifier,
    emailAddress: String,
    onEmailChanged: (String) -> Unit = {},
    onSubscribeClick: () -> Unit,
) {
    var typedEmailAddress by remember { mutableStateOf(emailAddress) }

    Column(
        modifier = modifier
    ) {
        Text(
            stringResource(R.string.subscribe_to_newsletter_label),
            modifier = modifier
                .fillMaxWidth()
                .padding(16.dp),
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center
        )

        TextField(
            value = typedEmailAddress,
            onValueChange = {
                typedEmailAddress = it
                onEmailChanged(it)
            },
            placeholder = {
                Text(stringResource(R.string.enter_your_email_address_label))
            },
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Email
            ),
            modifier = Modifier
                .testTag("subscribe")
                .fillMaxWidth()
                .padding(16.dp),
        )
        TextButton(
            enabled = typedEmailAddress.isNotBlank(),
            onClick = onSubscribeClick
        ) {
            Text(
                stringResource(R.string.subscribe_button_label),
                modifier = modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
fun HomeScreenPreview() {
    HowestprimeTheme() {
        HomeScreen(
            uiState = HomeUiState("", false),
            onEmailChanged = {},
            onOrderSnackClick = {},
            onSubscribeClick = {}
        )
    }
}
