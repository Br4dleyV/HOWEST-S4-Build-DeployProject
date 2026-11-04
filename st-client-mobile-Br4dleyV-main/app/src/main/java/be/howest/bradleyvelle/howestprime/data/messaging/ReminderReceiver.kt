package be.howest.bradleyvelle.howestprime.data.messaging

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import be.howest.bradleyvelle.howestprime.data.worker.NotificationHelper

class ReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val movieTitle = intent.getStringExtra("MOVIE_TITLE") ?: "Movie"
        val room = intent.getStringExtra("ROOM") ?: "Unknown Room"
        val ticketId = intent.getStringExtra("TICKET_ID") ?: ""

        NotificationHelper.showMovieReminderNotification(context, movieTitle, room, ticketId)
    }
}
