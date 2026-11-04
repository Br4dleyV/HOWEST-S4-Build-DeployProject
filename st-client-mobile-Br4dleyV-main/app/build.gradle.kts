plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)

    // Hilt
    alias(libs.plugins.ksp)
    alias(libs.plugins.hilt.gradle)
}

android {
    namespace = "be.howest.bradleyvelle.howestprime"
    compileSdk = 36

    defaultConfig {
        applicationId = "be.howest.bradleyvelle.howestprime"
        minSdk = 34
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        buildConfigField("String", "API_KEY", "\"${project.findProperty("API_KEY")}\"")
        buildConfigField("String", "BASE_URL", "\"${project.findProperty("BASE_URL")}\"")

        buildConfigField("String", "AMQPusername", "\"${project.findProperty("AMQPusername")}\"")
        buildConfigField("String", "AMQPpassword", "\"${project.findProperty("AMQPpassword")}\"")
        buildConfigField("String", "AMQPurl", "\"${project.findProperty("AMQPurl")}\"")
        buildConfigField("String", "AMQPpublishtopic", "\"${project.findProperty("AMQPpublishtopic")}\"")
        buildConfigField("String", "AMQPsubscribetopic", "\"${project.findProperty("AMQPsubscribetopic")}\"")
        buildConfigField("String", "AMQPconsumertag", "\"${project.findProperty("AMQPconsumertag")}\"")

        // Set a public Mapbox token in ~/.gradle/gradle.properties or via
        // ORG_GRADLE_PROJECT_MAPBOX_ACCESS_TOKEN in the build environment.
        val mapboxAccessToken = providers.gradleProperty("MAPBOX_ACCESS_TOKEN").orElse("").get()
        buildConfigField("String", "MAPBOX_ACCESS_TOKEN", "\"$mapboxAccessToken\"")
        resValue("string", "mapbox_access_token", mapboxAccessToken)
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.androidx.navigation.runtime.ktx)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.navigation.testing)
    implementation("androidx.appcompat:appcompat:1.7.0")

    // Persistence
    implementation("androidx.datastore:datastore-preferences:1.1.1")
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // Hilt
    implementation("com.google.dagger:dagger:2.59.2")
    implementation(libs.hilt.android)
    implementation(libs.androidx.hilt.navigation.compose)
    implementation("javax.inject:javax.inject:1")
    ksp(libs.hilt.compiler)

    // Retrofit, Moshi, OkHttp, RabbitMQ
    implementation(libs.coil.compose)
    implementation(libs.moshi.kotlin)
    implementation(libs.retrofit)
    implementation(libs.converter.moshi)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)
    implementation(libs.rabbitmq.amqp.client)

    // WorkManager
    implementation(libs.androidx.work.runtime.ktx)

    // Mapbox
    implementation("com.mapbox.maps:android:11.11.0")
    implementation("com.mapbox.extension:maps-compose:11.11.0")

    // Testing
    testImplementation(libs.androidx.work.testing)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
}
