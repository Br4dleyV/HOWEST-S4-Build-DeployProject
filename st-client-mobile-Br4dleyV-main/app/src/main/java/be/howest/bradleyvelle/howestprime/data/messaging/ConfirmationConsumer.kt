package be.howest.bradleyvelle.howestprime.data.messaging

// This defines what a message broker consumer should implement
interface ConfirmationConsumer {
    // Function to start consuming messages from the broker
    fun startConsuming()

    // Function to stop consuming messages from the broker
    fun stopConsuming()

    // Callback function to handle received messages
    var onMessageReceived: ((String) -> Unit)
}