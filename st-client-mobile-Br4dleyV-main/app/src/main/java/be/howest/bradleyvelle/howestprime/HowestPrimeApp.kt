package be.howest.bradleyvelle.howestprime

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Devices
import androidx.compose.ui.tooling.preview.Preview
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import be.howest.bradleyvelle.howestprime.ui.cart.CartViewModel
import be.howest.bradleyvelle.howestprime.ui.navigation.HowestPrimeAppBar
import be.howest.bradleyvelle.howestprime.ui.navigation.HowestPrimeBottomBar
import be.howest.bradleyvelle.howestprime.ui.navigation.HowestPrimeNavGraph
import be.howest.bradleyvelle.howestprime.ui.navigation.Screen
import be.howest.bradleyvelle.howestprime.ui.theme.HowestprimeTheme

@Composable
fun HowestPrimeApp(
    cartViewModel: CartViewModel = hiltViewModel()
){
    HowestprimeTheme {
        val navController = rememberNavController()
        val navBackStackEntry by navController.currentBackStackEntryAsState()
        val currentDestination = navBackStackEntry?.destination

        val cartUiState by cartViewModel.uiState.collectAsStateWithLifecycle()

        Scaffold(
            modifier = Modifier.fillMaxSize(),
            topBar = {
                HowestPrimeAppBar(
                    canNavigateBack = currentDestination?.route == Screen.Cart.route,
                    navigateUp = { navController.navigateUp() },
                    navigateToCart = { navController.navigate(Screen.Cart.route) },
                    cartCount = cartUiState.totalQuantity,
                    appName = R.string.app_name
                )
            },
            bottomBar = {
                HowestPrimeBottomBar(
                    navController = navController,
                    currentDestination = currentDestination
                )
            }
        ) { innerPadding ->
            HowestPrimeNavGraph(
                navController = navController,
                cartViewModel = cartViewModel,
                modifier = Modifier.padding(innerPadding)
            )
        }
    }
}

@Preview(
    showBackground = true,
    device = Devices.PIXEL_5,
)
@Composable
fun HowestPrimeAppPreview() {
    HowestprimeTheme {
        HowestPrimeApp()
    }
}