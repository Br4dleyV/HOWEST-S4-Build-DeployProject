package be.howest.bradleyvelle.howestprime.data.repository

import be.howest.bradleyvelle.howestprime.data.remote.SnackApiClient
import be.howest.bradleyvelle.howestprime.domain.model.Snack
import be.howest.bradleyvelle.howestprime.domain.repository.SnackRepository
import javax.inject.Inject

// This is the implementation of the SnackRepository interface
class SnackRepositoryImpl @Inject constructor(
    private val snackApiClient: SnackApiClient
) : SnackRepository {
    override suspend fun getSnacks(): List<Snack> {
        // Map the received data to a Snack
        return snackApiClient.getSnacks().map { dto ->
            Snack(
                id = dto.id,
                name = dto.name,
                price = dto.originalPrice,
                promoPrice = dto.promoPrice,
                imageRes = null
            )
        }
    }
}
