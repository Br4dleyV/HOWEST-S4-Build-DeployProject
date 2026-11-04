package be.howest.bradleyvelle.howestprime.data.remote.api

import be.howest.bradleyvelle.howestprime.data.remote.dto.SnackDto
import retrofit2.http.GET

// Retrofit interface for snack-related API endpoints.
// Fetches the snack list from "snacks.json" api route.
// Uses suspend functions for non-blocking network calls.
interface SnackApi {
    @GET("snacks.json")
    suspend fun getSnacks(): List<SnackDto>
}