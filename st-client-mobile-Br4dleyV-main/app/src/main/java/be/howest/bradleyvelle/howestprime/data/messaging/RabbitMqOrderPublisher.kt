package be.howest.bradleyvelle.howestprime.data.messaging

import android.util.Log
import com.rabbitmq.client.ConnectionFactory
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.nio.charset.StandardCharsets

// This is the implementation of the OrderPublisher interface.
// It handles sending messages to the RabbitMQ message broker.
class RabbitMQOrderPublisher(
    private val amqpHost: String,
    private val amqpPort: Int,
    private val amqpUser: String,
    private val amqpPass: String,
    private val queueName: String
): OrderPublisher {
    // It connects to the broker
    private val factory = ConnectionFactory().apply {
        host = amqpHost
        port = amqpPort
        username = amqpUser
        password = amqpPass
        connectionTimeout = 5000
    }

    // Function to publish a message with the given message content
    override suspend fun publishMessage(message: String) {
        withContext(Dispatchers.IO) {
            try {
                val connection = factory.newConnection()
                val channel = connection.createChannel()

                channel.queueDeclare(queueName, true, false, false, null)
                channel.basicPublish(
                    "",
                    queueName,
                    null,
                    message.toByteArray(StandardCharsets.UTF_8)
                )
                Log.i("Messagebroker", "Message sent to broker: $message")

                channel.close()
                connection.close()

            } catch (e: Exception) {
                Log.e("Messagebroker", "Error publishing to Messagebroker! - ${e.message}")
            }
        }
    }
}