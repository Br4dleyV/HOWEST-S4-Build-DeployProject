package be.howest.bradleyvelle.howestprime.ui.snacks

import be.howest.bradleyvelle.howestprime.domain.model.Snack

data class SnacksUiState(
    val snacks: List<Snack> = emptyList(), // List of snacks inside the snack list screen
    val errorMessage: String? = null // Error message to show if something goes wrong
)
