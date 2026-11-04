package be.howest.bradleyvelle.howestprime

import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import androidx.navigation.compose.ComposeNavigator
import androidx.navigation.testing.TestNavHostController
import androidx.test.ext.junit.runners.AndroidJUnit4
import be.howest.bradleyvelle.howestprime.ui.navigation.HowestPrimeNavGraph
import junit.framework.TestCase.assertEquals
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class NavigationTest {
    @get:Rule
    val composeTestRule = createComposeRule()

    lateinit var navController: TestNavHostController

    @Before
    fun setupHomwestPrimeNavGraph() {
        composeTestRule.setContent {
            navController = TestNavHostController(LocalContext.current)
            navController.navigatorProvider.addNavigator(ComposeNavigator())
            HowestPrimeNavGraph(navController = navController)
        }
    }

    @Test
    fun howestPrimeNavGraph_verifyHomeStartDestination(){
        composeTestRule
            .onNodeWithTag("home_screen")
            .assertIsDisplayed()
    }

    @Test
    fun howestPrimeNavGraph_navigateToSnacks(){
        composeTestRule.onNodeWithTag("order_snack_button")
            .performScrollTo()
            .performClick()

        val route = navController.currentBackStackEntry?.destination?.route
        assertEquals(route, "snacks")
    }
}