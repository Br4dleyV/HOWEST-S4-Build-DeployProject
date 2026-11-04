package be.howest.bradleyvelle.howestprime.di

import android.util.Log
import be.howest.bradleyvelle.howestprime.BuildConfig
import be.howest.bradleyvelle.howestprime.data.messaging.ConfirmationConsumer
import be.howest.bradleyvelle.howestprime.data.messaging.OrderPublisher
import be.howest.bradleyvelle.howestprime.data.messaging.RabbitMQOrderConsumer
import be.howest.bradleyvelle.howestprime.data.messaging.RabbitMQOrderPublisher
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

// This is the configuration on how the messaging is to be set up
@Module
@InstallIn(SingletonComponent::class)
class MessagingModule {

    // AMQPurl in local.properties is "host:port" (e.g. "10.0.2.2:40300")
    private val amqpHost: String = BuildConfig.AMQPurl.substringBefore(":")
    private val amqpPort: Int = BuildConfig.AMQPurl.substringAfter(":").toInt()
    private val amqpUser: String = BuildConfig.AMQPusername
    private val amqpPass: String = BuildConfig.AMQPpassword

    @Provides
    @Singleton
    fun providePublishService(): OrderPublisher {
        return RabbitMQOrderPublisher(
            amqpHost = amqpHost,
            amqpPort = amqpPort,
            amqpUser = amqpUser,
            amqpPass = amqpPass,
            queueName = BuildConfig.AMQPpublishtopic
        )
    }

    @Provides
    @Singleton
    fun provideConsumeService(): ConfirmationConsumer {
        return RabbitMQOrderConsumer(
            amqpHost = amqpHost,
            amqpPort = amqpPort,
            amqpUser = amqpUser,
            amqpPass = amqpPass,
            queueName = BuildConfig.AMQPsubscribetopic
        )
    }
}