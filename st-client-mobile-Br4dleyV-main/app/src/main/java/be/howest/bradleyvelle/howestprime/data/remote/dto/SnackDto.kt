package be.howest.bradleyvelle.howestprime.data.remote.dto

// Data Transfer Object (DTO) representing the raw snack data structure from the API for easy mapping to domain models
// Used by Retrofit/Moshi to parse the JSON response from the server
data class SnackDto(
    val id: String,
    val name: String,
    val image: String?,
    val category: String?,
    val originalPrice: Double,
    val promoPrice: Double?,
    val stock: Int?,
    val promo: Boolean?,
    val promoDate: String?,
    val description: String?,
    val allergens: List<String>?
)