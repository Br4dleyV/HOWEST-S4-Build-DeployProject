package be.howest.bradleyvelle.howestprime.domain.model

data class Snack(
    val id: String, // Snack ID
    val name: String, // Snack name
    val price: Double, // Snack price
    val promoPrice: Double? = null, // Snack promo price (this is used if not null)
    val imageRes: Int? = null // Resource ID for the image
)