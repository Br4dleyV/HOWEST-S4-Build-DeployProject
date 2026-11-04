package be.howest.bradleyvelle.howestprime.ui.sensors

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Chair
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// A Composable function is a function that draws a screen. It is the building block of the UI.
// The logic of the screen is in the ViewModel. The UI is in the Composable function.
@Composable
fun SensorsScreen(
    uiState: SensorsUiState,
    onStartListening: () -> Unit,
    onStopListening: () -> Unit,
    onToggleFlashlight: (Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    DisposableEffect(Unit) {
        onStartListening()
        onDispose {
            onStopListening()
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(32.dp)
    ) {
        Text(
            text = "SENSORS",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.align(Alignment.Start).padding(bottom = 16.dp)
        )

        // Light Sensor Section
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = Icons.Default.WbSunny,
                contentDescription = null,
                modifier = Modifier.size(80.dp),
                tint = Color(0xFF1E6B8F) // Based on the image's blue tone
            )
            
            // Progress bar
            LinearProgressIndicator(
                progress = { (uiState.lightIntensity / 2000f).coerceIn(0f, 1f) },
                modifier = Modifier
                    .fillMaxWidth(0.8f)
                    .height(24.dp),
                color = Color(0xFFFF5252), // Red color from the image
                trackColor = Color.LightGray,
                strokeCap = ProgressIndicatorDefaults.LinearStrokeCap
            )

            Text(
                text = "${uiState.lightIntensity.toInt()} lux",
                fontSize = 24.sp,
                fontWeight = FontWeight.Medium
            )
            Text(
                text = uiState.lightCategory,
                style = MaterialTheme.typography.bodyLarge
            )
        }

        // Proximity Sensor Section
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Chair,
                contentDescription = null,
                modifier = Modifier.size(80.dp),
                tint = Color(0xFF1E6B8F)
            )
            Text(
                text = uiState.proximityMessage,
                color = Color(0xFF2E7D32), // Green color from the image
                style = MaterialTheme.typography.bodyLarge
            )
        }

        Spacer(modifier = Modifier.weight(1f))

        // Flashlight Section
        Row(
            modifier = Modifier.fillMaxWidth().padding(bottom = 32.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Text(
                text = "Enable flashlight",
                style = MaterialTheme.typography.bodyLarge,
                modifier = Modifier.padding(end = 16.dp)
            )
            Switch(
                checked = uiState.isFlashlightEnabled,
                onCheckedChange = onToggleFlashlight
            )
        }
    }
}
