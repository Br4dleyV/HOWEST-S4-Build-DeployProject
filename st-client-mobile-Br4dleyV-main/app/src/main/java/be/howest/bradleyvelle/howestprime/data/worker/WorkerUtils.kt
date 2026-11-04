package be.howest.bradleyvelle.howestprime.data.worker

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import androidx.core.app.NotificationCompat
import be.howest.bradleyvelle.howestprime.MainActivity
import be.howest.bradleyvelle.howestprime.R
import be.howest.bradleyvelle.howestprime.data.messaging.ReminderReceiver
import be.howest.bradleyvelle.howestprime.domain.model.Ticket
import be.howest.bradleyvelle.howestprime.utils.CHANNEL_ID
import be.howest.bradleyvelle.howestprime.utils.NOTIFICATION_TITLE
import be.howest.bradleyvelle.howestprime.utils.REQUEST_CODE
import be.howest.bradleyvelle.howestprime.utils.VERBOSE_NOTIFICATION_CHANNEL_NAME
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.format.DateTimeParseException

// This object is a helper for showing notifications
object NotificationHelper {

    fun parseDateTime(dateTimeString: String): Instant {
        return try {
            Instant.parse(dateTimeString)
        } catch (e: DateTimeParseException) {
            // Handle format without timezone like "2026-06-08T20:00:00"
            LocalDateTime.parse(dateTimeString)
                .atZone(ZoneId.systemDefault())
                .toInstant()
        }
    }

    // This function is used to show a notification when an order is ready
    fun showOrderConfirmationNotification(
        context: Context,
        orderId: String
    ) {
        val notificationManager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        createNotificationChannel(context)

        val pendingIntent: PendingIntent = createPendingIntent(context)

        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle(NOTIFICATION_TITLE)
            .setContentText("Your order #$orderId is ready for pickup!")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setVibrate(LongArray(0))
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)

        notificationManager.notify(orderId.hashCode(), builder.build())
    }

    fun showMovieReminderNotification(
        context: Context,
        movieTitle: String,
        room: String,
        ticketId: String
    ) {
        val notificationManager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        createNotificationChannel(context)

        val pendingIntent: PendingIntent = createPendingIntent(context)

        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle("Movie Reminder")
            .setContentText("Your movie '$movieTitle' is starting soon in $room!")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setVibrate(LongArray(0))
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)

        notificationManager.notify(ticketId.hashCode(), builder.build())
    }

    private fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager =
                context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            val channel = NotificationChannel(
                CHANNEL_ID,
                VERBOSE_NOTIFICATION_CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            )
            notificationManager.createNotificationChannel(channel)
        }
    }

    fun scheduleReminder(context: Context, ticket: Ticket, minutesBefore: Int) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        
        val movieStartTime = parseDateTime(ticket.startTime).toEpochMilli()
        val triggerTime = movieStartTime - (minutesBefore * 60 * 1000)

        if (triggerTime <= System.currentTimeMillis()) return

        val intent = Intent(context, ReminderReceiver::class.java).apply {
            putExtra("MOVIE_TITLE", ticket.movieTitle)
            putExtra("ROOM", ticket.room)
            putExtra("TICKET_ID", ticket.id)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            ticket.id.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (alarmManager.canScheduleExactAlarms()) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerTime,
                    pendingIntent
                )
            } else {
                alarmManager.set(
                    AlarmManager.RTC_WAKEUP,
                    triggerTime,
                    pendingIntent
                )
            }
        } else {
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                triggerTime,
                pendingIntent
            )
        }
    }
}

// Function to create a pending intent for the notification
private fun createPendingIntent(appContext: Context): PendingIntent {
    val intent = Intent(appContext, MainActivity::class.java).apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
    }

    var flags = PendingIntent.FLAG_UPDATE_CURRENT
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        flags = flags or PendingIntent.FLAG_IMMUTABLE
    }

    return PendingIntent.getActivity(
        appContext,
        REQUEST_CODE,
        intent,
        flags
    )
}
