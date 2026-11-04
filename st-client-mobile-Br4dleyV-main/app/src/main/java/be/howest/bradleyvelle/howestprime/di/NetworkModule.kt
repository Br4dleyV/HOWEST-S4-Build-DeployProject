package be.howest.bradleyvelle.howestprime.di

import be.howest.bradleyvelle.howestprime.BuildConfig
import be.howest.bradleyvelle.howestprime.data.messaging.json.LocalDateJsonAdapter
import be.howest.bradleyvelle.howestprime.data.remote.api.SnackApi
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import javax.inject.Singleton

// This is a dagger hilt module. It defines how the application creates and provides dependencies related to network communication. It manages them as singletons, so one shared instance for the whole app.
// It isthe central configuration hub of the apps internet connection
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    // This configures the moshi library, converts json data from api into kotlin objects; using a custom localdatejsonadapter
    @Provides
    @Singleton
    fun provideMoshi(): Moshi = lazy {
        Moshi.Builder()
            .add(LocalDateJsonAdapter())
            .addLast(KotlinJsonAdapterFactory())
            .build()
    }.value

    // This configures the okhttp client, which is the engine that makes the http requests
    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient = lazy {
        OkHttpClient.Builder()
            .addInterceptor { chain ->
                val request = chain.request()
                val newRequest = request.newBuilder()
                    .addHeader("x-api-key", BuildConfig.API_KEY)
                    .build()
                chain.proceed(newRequest)
            }.build()
    }.value

    // This is the main engine for api calls, it combines okhttpclient for the connection and moshi for the data conversion
    @Provides
    @Singleton
    fun provideRetrofit(okHttp: OkHttpClient, moshi: Moshi): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.BASE_URL)
            .client(okHttp)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()
    }

    // This generates the actual implementation of the SnackApi interface, whenever a repository or viewmodel needs to fetch snacks from the server, hilt will look at this function to provide the ready-to-use api service
    @Provides
    fun provideSnackApi(retrofit: Retrofit): SnackApi {
        return retrofit.create(SnackApi::class.java)
    }
}