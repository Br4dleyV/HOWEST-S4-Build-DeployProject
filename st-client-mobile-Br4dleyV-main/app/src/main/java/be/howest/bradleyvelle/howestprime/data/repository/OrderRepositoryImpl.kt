package be.howest.bradleyvelle.howestprime.data.repository

import android.util.Log
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.workDataOf
import be.howest.bradleyvelle.howestprime.data.messaging.ConfirmationConsumer
import be.howest.bradleyvelle.howestprime.data.messaging.OrderPublisher
import be.howest.bradleyvelle.howestprime.data.worker.NotificationWorker
import be.howest.bradleyvelle.howestprime.domain.model.Order
import be.howest.bradleyvelle.howestprime.domain.model.OrderStatusMessage
import be.howest.bradleyvelle.howestprime.domain.model.Ticket
import be.howest.bradleyvelle.howestprime.domain.repository.OrderRepository
import be.howest.bradleyvelle.howestprime.domain.repository.TicketRepository
import com.squareup.moshi.Moshi
import jakarta.inject.Inject
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

// This is the implementation of the OrderRepository interface.
// It acts as the translator for placing orders
// It simplifies the communication between the domain layer and the data layer.
// Because of the dependency injection, it is easier to test
// It asks for OrderPublisher to send the message and moshi to format the data
class OrderRepositoryImpl @Inject constructor(
    private val publisher: OrderPublisher,
    private val moshi: Moshi,
    private val consumer: ConfirmationConsumer,
    private val workManager: WorkManager,
    private val ticketRepository: TicketRepository
) : OrderRepository {

    // Set up listening to the message broker
    init {
        // When a message is received, this is fired
        consumer.onMessageReceived = { json  ->
            try {
                if (json.contains("ticketId")) {
                    val adapter = moshi.adapter(Ticket::class.java)
                    val ticket = adapter.fromJson(json)
                    ticket?.let {
                        CoroutineScope(Dispatchers.IO).launch {
                            ticketRepository.saveTicket(it)
                        }
                    }
                } else {
                    val adapter = moshi.adapter(OrderStatusMessage::class.java)
                    val orderStatusMessage = adapter.fromJson(json)
                    Log.i("OrderRepositoryImpl", "Received order status message: $orderStatusMessage")
                    orderStatusMessage?.let {
                        sendNotification(it.orderId)
                    }
                }
            } catch (e: Exception) {
                Log.e("OrderRepositoryImpl", "Error parsing message: ${e.message}")
            }
        }
        consumer.startConsuming()
    }

    // Function to send a notification to the user
    override fun sendNotification(orderId: String) {
        val data = workDataOf("ORDER_ID" to orderId)
        val workRequest = OneTimeWorkRequestBuilder<NotificationWorker>()
            .setInputData(data)
            .build()
        workManager.enqueue(workRequest)
    }

    // Function to place an order on the message broker
    override suspend fun placeOrder(order: Order) {
        val adapter = moshi.adapter(Order::class.java)
        val orderJson = adapter.toJson(order)
        publisher.publishMessage(orderJson)
    }
}