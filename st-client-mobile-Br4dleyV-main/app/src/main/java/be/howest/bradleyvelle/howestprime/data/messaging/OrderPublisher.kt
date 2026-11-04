package be.howest.bradleyvelle.howestprime.data.messaging

// Defines what a message broker publisher should implement
interface OrderPublisher {
    // Function to publish a message to the broker
    suspend fun publishMessage(message: String)
}