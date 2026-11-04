package be.howest.bradleyvelle.howestprime.data.messaging

import android.util.Log
import com.rabbitmq.client.CancelCallback
import com.rabbitmq.client.ConnectionFactory
import com.rabbitmq.client.DeliverCallback
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.nio.charset.StandardCharsets

// This is the implementation of the ConfirmationConsumer interface.
// It handles real-time background listening of messages from the rabbitmq message broker
// It listens to the queue
class RabbitMQOrderConsumer (
    private val amqpHost: String,
    private val amqpPort: Int,
    private val amqpUser: String,
    private val amqpPass: String,
    private val queueName: String
): ConfirmationConsumer {
    // Connect to the message broker
    private val factory = ConnectionFactory().apply {
        host = amqpHost
        port = amqpPort
        username = amqpUser
        password = amqpPass
        connectionTimeout = 5000
    }

    // consumerJob holds the coroutine job for the consumer, so we can stop it if needed
    private var consumerJob: Job? = null

    // onMessageReceived is the callback function that will be called when a message is received
    override var onMessageReceived: (String) -> Unit = {Log.w("Messagebroker", "onMessageReceived not set")}

    // startConsuming starts the background listening of messages from the message broker
    override fun startConsuming() {
        consumerJob = CoroutineScope(Dispatchers.IO).launch {
            while (isActive) {
                try {
                    val connection = factory.newConnection()
                    val channel = connection.createChannel()

                    channel.queueDeclare(queueName, true, false, false, null)

                    val deliverCallback = DeliverCallback { _, delivery ->
                        val message = String(delivery.body, StandardCharsets.UTF_8)
                        onMessageReceived(message)
                    }

                    channel.basicConsume(queueName, true, deliverCallback, CancelCallback {
                        Log.w("Messagebroker", "Consumer cancelled")
                    })

                    while (isActive && connection.isOpen) {
                        delay(1000)
                    }
                    
                    channel.close()
                    connection.close()

                } catch (e: Exception) {
                    Log.e("Messagebroker", "Error in consumer! Retrying in 5s... - ${e.message}")
                    delay(5000)
                }
            }
        }
    }

    // stopConsuming stops the background listening of messages from the message broker
    override fun stopConsuming() {
        consumerJob?.cancel()
    }
}