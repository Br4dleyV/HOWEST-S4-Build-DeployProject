package be.howest.bradleyvelle.howestprime.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import be.howest.bradleyvelle.howestprime.ui.cart.CartScreen
import be.howest.bradleyvelle.howestprime.ui.cart.CartViewModel
import be.howest.bradleyvelle.howestprime.ui.home.HomeScreen
import be.howest.bradleyvelle.howestprime.ui.home.HomeViewModel
import be.howest.bradleyvelle.howestprime.ui.map.MapScreen
import be.howest.bradleyvelle.howestprime.ui.map.MapViewModel
import be.howest.bradleyvelle.howestprime.ui.permissions.AppPermission
import be.howest.bradleyvelle.howestprime.ui.permissions.MainViewModel
import be.howest.bradleyvelle.howestprime.ui.permissions.PermissionManager
import be.howest.bradleyvelle.howestprime.ui.sensors.SensorsScreen
import be.howest.bradleyvelle.howestprime.ui.sensors.SensorsViewModel
import be.howest.bradleyvelle.howestprime.ui.snacks.SnacksScreen
import be.howest.bradleyvelle.howestprime.ui.snacks.SnacksViewModel
import be.howest.bradleyvelle.howestprime.ui.ticketlist.TicketListScreen
import be.howest.bradleyvelle.howestprime.ui.ticketlist.TicketListViewModel

@Composable
fun HowestPrimeNavGraph(
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController(),
    cartViewModel: CartViewModel = hiltViewModel(),
    mainViewModel: MainViewModel = hiltViewModel()
) {
    val homeViewModel: HomeViewModel = hiltViewModel()
    val homeUiState by homeViewModel.uiState.collectAsStateWithLifecycle()

    val ticketListViewModel: TicketListViewModel = hiltViewModel()
    val ticketListUiState by ticketListViewModel.uiState.collectAsStateWithLifecycle()

    val cartUiState by cartViewModel.uiState.collectAsStateWithLifecycle()

    val mapViewModel: MapViewModel = hiltViewModel()
    val mapUiState by mapViewModel.uiState.collectAsStateWithLifecycle()

    val snacksViewModel: SnacksViewModel = hiltViewModel()
    val snacksUiState by snacksViewModel.uiState.collectAsStateWithLifecycle()

    val sensorsViewModel: SensorsViewModel = hiltViewModel()
    val sensorsUiState by sensorsViewModel.uiState.collectAsStateWithLifecycle()

    val permissionRequest by mainViewModel.permissionRequest.collectAsStateWithLifecycle()
    PermissionManager(
        permissionRequest = permissionRequest,
        onPermissionResult = { permission, granted ->
            mainViewModel.onPermissionResult(permission, granted)
        }
    )

    NavHost(
        navController = navController,
        startDestination = Screen.Home.route,
        modifier = modifier
    ) {
        composable(Screen.Home.route) {
            HomeScreen(
                uiState = homeUiState,
                onEmailChanged = { homeViewModel.onEmailChanged(it) },
                onOrderSnackClick = { navController.navigate(Screen.Snacks.route) },
                onSubscribeClick = { homeViewModel.onSubscribeClick() }
            )
        }

        composable(Screen.Tickets.route) {
            TicketListScreen(
                uiState = ticketListUiState,
                onShowQrCodeClick = { ticketListViewModel.onShowQrCodeClick(it) },
                onSetReminderClick = { ticketListViewModel.onSetReminderClick(it) },
                onShowUpcomingOnlyClick = { ticketListViewModel.onShowUpcomingOnlyClick(it) },
                onCloseDialog = { ticketListViewModel.onCloseDialog() },
                onReminderOptionSelected = { ticket, option ->
                    ticketListViewModel.onReminderOptionSelected(ticket, option)
                },
                modifier = Modifier
            )
        }

        composable(Screen.Snacks.route) {
            SnacksScreen(
                uiState = snacksUiState,
                onAddSnackClick = { snack -> snacksViewModel.onAddSnackClick(snack) },
                modifier = Modifier
            )
        }

        composable(Screen.Cart.route) {
            CartScreen(
                uiState = cartUiState,
                onSendOrderClick = {
                    cartViewModel.onSendOrderClick()
                    mainViewModel.requestPermission(AppPermission.NOTIFICATION)
                },
                onCancelOrderClick = { cartViewModel.onCancelOrderClick() },
                modifier = Modifier
            )
        }

        composable(Screen.Map.route) {
            MapScreen(
                uiState = mapUiState,
                onRequestLocationPermission = { mainViewModel.requestPermission(AppPermission.LOCATION) },
                onMapReady = { mapViewModel.onMapReady(it) },
                onMapDisposed = { mapViewModel.onMapDisposed() },
                onNavigateClick = { }
            )
        }

        composable(Screen.Sensors.route) {
            SensorsScreen(
                uiState = sensorsUiState,
                onStartListening = { sensorsViewModel.startListening() },
                onStopListening = { sensorsViewModel.stopListening() },
                onToggleFlashlight = { sensorsViewModel.toggleFlashlight(it) }
            )
        }
    }
}
