package be.howest.bradleyvelle.howestprime.ui.home

data class HomeUiState(
    val emailAddress: String = "", // Email address entered by the user
    val isSubscribed: Boolean = false // Whether or not the user is subscribed to the newsletter
)