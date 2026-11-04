package be.howest.bradleyvelle.howestprime.data.remote

import be.howest.bradleyvelle.howestprime.data.remote.api.SnackApi
import be.howest.bradleyvelle.howestprime.data.remote.dto.SnackDto
import javax.inject.Inject

// Instead of the viewmodels or repositories calling the Retrofit interface SnackApi, they call this to add a layer of abstraction making it easier to handle errors, log data, test etc.
// Because of the @Inject, it automatically provides the SnackApi to the constructor so it easily injects SnackApiClient into a repository class
// It fetches snacks from the server
class SnackApiClient @Inject constructor(
    private val snackApi: SnackApi
){
    suspend fun getSnacks(): List<SnackDto> {
        return snackApi.getSnacks()

    }
}