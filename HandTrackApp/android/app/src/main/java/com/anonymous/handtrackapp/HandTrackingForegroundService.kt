package com.anonymous.handtrackapp

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log

/**
 * HandTrackingForegroundService - Foreground Service for Camera Tracking
 * 
 * This service keeps hand tracking running in the foreground without being
 * killed by the system. It displays a persistent notification to the user
 * indicating that hand tracking is active.
 * 
 * FOREGROUND SERVICE TYPE:
 * - camera: For camera access
 * - specialUse: For accessibility features
 * 
 * STUB IMPLEMENTATION:
 * This is a minimal stub to prevent crashes. Full implementation would include:
 * - Camera initialization and management
 * - Hand tracking ML model integration
 * - Coordinate calculation and smoothing
 * - Communication with overlay service
 * 
 * The service must be started with startForeground() to comply with Android
 * foreground service requirements.
 */
class HandTrackingForegroundService : Service() {

    companion object {
        private const val TAG = "HandTrackFgService"
        private const val NOTIFICATION_CHANNEL_ID = "hand_tracking_service"
        private const val NOTIFICATION_CHANNEL_NAME = "Hand Tracking Service"
        private const val NOTIFICATION_ID = 1001

        /**
         * Start the hand tracking service
         */
        fun start(context: Context) {
            val intent = Intent(context, HandTrackingForegroundService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        /**
         * Stop the hand tracking service
         */
        fun stop(context: Context) {
            val intent = Intent(context, HandTrackingForegroundService::class.java)
            context.stopService(intent)
        }
    }

    override fun onCreate() {
        super.onCreate()
        Log.i(TAG, "Hand tracking service created")
        
        // Create notification channel for Android O+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            createNotificationChannel()
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.i(TAG, "Hand tracking service started")
        
        // Start as foreground service with notification
        val notification = createNotification()
        startForeground(NOTIFICATION_ID, notification)
        
        // TODO: Initialize camera and start hand tracking
        
        // Return START_STICKY so the service is restarted if killed
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? {
        // This service doesn't support binding
        return null
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.i(TAG, "Hand tracking service destroyed")
        
        // TODO: Release camera and clean up resources
    }

    /**
     * Create notification channel for Android O+
     */
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                NOTIFICATION_CHANNEL_NAME,
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Notification for hand tracking service"
                setShowBadge(false)
            }

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    /**
     * Create persistent notification for foreground service
     */
    private fun createNotification(): Notification {
        // Create intent to open the app when notification is tapped
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        
        val pendingIntentFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        
        val pendingIntent = PendingIntent.getActivity(this, 0, intent, pendingIntentFlags)

        // Build notification
        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, NOTIFICATION_CHANNEL_ID)
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
        }

        return builder
            .setContentTitle("HandTrack Active")
            .setContentText("Hand tracking is running")
            .setSmallIcon(android.R.drawable.ic_menu_camera)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }
}
