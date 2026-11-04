package be.howest.bradleyvelle.howestprime.domain.usecase

import be.howest.bradleyvelle.howestprime.domain.model.Snack
import be.howest.bradleyvelle.howestprime.domain.repository.SnackRepository
import javax.inject.Inject

// This is a use case. It is called by the ViewModel and talks to the repository
// It simplifies the communication between the ViewModel and the repository
// and makes it easier to test
// It is used to get the snacks from the data store
class GetSnacksUseCase @Inject constructor(
    private val snackRepository: SnackRepository
) {
    suspend operator fun invoke(): List<Snack> {
        return snackRepository.getSnacks()
    }
}