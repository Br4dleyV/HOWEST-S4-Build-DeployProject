package be.howest.bradleyvelle.howestprime.data.worker

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters

// This is a worker for showing notifications. It is triggered by the message broker.
class NotificationWorker (
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    // This function is called when the worker is triggered, it shows a notification
    override suspend fun doWork(): Result {
        // Get order ID and send notification
        val orderId = inputData.getString("ORDER_ID") ?: return Result.failure()
        NotificationHelper.showOrderConfirmationNotification(applicationContext, orderId)
        return Result.success()
    }
}