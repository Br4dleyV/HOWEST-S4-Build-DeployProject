package be.howest.bradleyvelle.howestprime

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.assertIsNotDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextInput
import androidx.compose.ui.test.performScrollTo
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class HomeScreenTest {
    @get:Rule
    val composeTestRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun homeScreen_showsOrderSnackButton(){
        composeTestRule
            .onNodeWithText("ORDER A SNACK!")
            .assertIsDisplayed()
    }

    //week1 test
    @Test
    fun homeScreen_isScrollable() {
        composeTestRule
            .onNodeWithTag("subscribe")
            .performScrollTo()
            .assertIsDisplayed()
    }

    @Test
    fun homeScreen_showsSubscribeForm_whenNotSubscribed() {
        composeTestRule
            .onNodeWithTag("subscribe")
            .assertIsDisplayed()
    }

    @Test
    fun homeScreen_hideSubscribeForm_whenSubscribeClicked() {
        composeTestRule
            .onNodeWithTag("subscribe")
            .performTextInput("test@example.com")

        composeTestRule
            .onNodeWithText("Subscribe")
            .performClick()

        composeTestRule
            .onNodeWithTag("subscribe")
            .assertIsNotDisplayed()
    }

}