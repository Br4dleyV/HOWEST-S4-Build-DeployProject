package be.howest.bradleyvelle.howestprime.ui.navigation

import androidx.annotation.StringRes
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.AirplaneTicket
import androidx.compose.material.icons.filled.Fastfood
import androidx.compose.material.icons.filled.FlashlightOn
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.ui.graphics.vector.ImageVector
import be.howest.bradleyvelle.howestprime.R

// This defines the screens in the app. They are used to navigate between the different screens.
sealed class Screen(
    val route: String,
    @StringRes val labelResourceId: Int,
    val icon: ImageVector
) {
    data object Home: Screen("home", R.string.home_label, Icons.Filled.Home)
    data object Tickets: Screen("tickets", R.string.tickets_label, Icons.AutoMirrored.Filled.AirplaneTicket)
    data object Snacks: Screen("snacks", R.string.snacks_label, Icons.Filled.Fastfood)
    data object Map: Screen("map", R.string.map_label, Icons.Filled.Map)
    data object Sensors: Screen("sensors", R.string.sensors_label, Icons.Filled.FlashlightOn)
    data object Cart: Screen("cart", R.string.cart_label, Icons.Filled.ShoppingCart)

    //data object SnackDetail: Screen("snack/{snackId}", R.string.snacks_label, Icons.Filled.Search)
}

// Screens to render in the HowestPrimeBottomBar
val screens = listOf(
    Screen.Home,
    Screen.Tickets,
    Screen.Snacks,
    Screen.Map,
    Screen.Sensors,
)