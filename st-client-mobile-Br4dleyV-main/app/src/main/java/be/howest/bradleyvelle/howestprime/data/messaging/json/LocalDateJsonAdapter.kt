package be.howest.bradleyvelle.howestprime.data.messaging.json

import com.squareup.moshi.FromJson
import com.squareup.moshi.ToJson
import java.time.LocalDate

// This is just a helper class to go from and to json dates
class LocalDateJsonAdapter {

    @ToJson
    fun toJson(value: LocalDate): String {
        return value.toString() // ISO-8601 yyyy-MM-dd
    }

    @FromJson
    fun fromJson(value: String): LocalDate {
        return LocalDate.parse(value)
    }
}