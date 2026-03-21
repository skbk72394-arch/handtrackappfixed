package com.anonymous.handtrackapp

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.os.Handler
import android.os.Looper

/**
 * Custom Accessibility Service for HandTrack App
 * Enables gesture injection and accessibility features for hand tracking control
 */
class MyAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "MyAccessibilityService"
        
        // Static reference to the service instance
        @Volatile
        private var instance: MyAccessibilityService? = null
        
        /**
         * Get the current service instance
         */
        fun getInstance(): MyAccessibilityService? {
            return instance
        }
        
        /**
         * Check if the service is enabled
         */
        fun isServiceEnabled(): Boolean {
            return instance != null
        }
    }

    private val handler = Handler(Looper.getMainLooper())

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        Log.d(TAG, "Accessibility Service Connected")
        
        // Service is now ready to receive gesture commands
        // The React Native module can now call dispatchGesture
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Handle accessibility events if needed
        // For basic gesture injection, we don't need to process events
        event?.let {
            Log.v(TAG, "Accessibility Event: ${it.eventType}")
        }
    }

    override fun onInterrupt() {
        Log.d(TAG, "Accessibility Service Interrupted")
    }

    override fun onUnbind(intent: android.content.Intent?): Boolean {
        instance = null
        Log.d(TAG, "Accessibility Service Disconnected")
        return super.onUnbind(intent)
    }

    /**
     * Dispatch a click gesture at specific coordinates
     * @param x The x coordinate on screen
     * @param y The y coordinate on screen
     * @param callback Optional callback for gesture completion
     */
    fun dispatchClickGesture(x: Float, y: Float, callback: GestureResultCallback? = null) {
        val path = Path()
        path.moveTo(x, y)
        
        val gestureBuilder = GestureDescription.Builder()
        val strokeDescription = GestureDescription.StrokeDescription(path, 0, 50)
        gestureBuilder.addStroke(strokeDescription)
        
        val gesture = gestureBuilder.build()
        
        val gestureCallback = object : GestureResultCallback() {
            override fun onCompleted(gestureDescription: GestureDescription?) {
                super.onCompleted(gestureDescription)
                Log.d(TAG, "Click gesture completed at ($x, $y)")
                callback?.onCompleted(gestureDescription)
            }
            
            override fun onCancelled(gestureDescription: GestureDescription?) {
                super.onCancelled(gestureDescription)
                Log.w(TAG, "Click gesture cancelled at ($x, $y)")
                callback?.onCancelled(gestureDescription)
            }
        }
        
        dispatchGesture(gesture, gestureCallback, null)
    }

    /**
     * Dispatch a swipe gesture from one point to another
     * @param startX Starting x coordinate
     * @param startY Starting y coordinate
     * @param endX Ending x coordinate
     * @param endY Ending y coordinate
     * @param duration Duration of the swipe in milliseconds
     * @param callback Optional callback for gesture completion
     */
    fun dispatchSwipeGesture(
        startX: Float,
        startY: Float,
        endX: Float,
        endY: Float,
        duration: Long = 300,
        callback: GestureResultCallback? = null
    ) {
        val path = Path()
        path.moveTo(startX, startY)
        path.lineTo(endX, endY)
        
        val gestureBuilder = GestureDescription.Builder()
        val strokeDescription = GestureDescription.StrokeDescription(path, 0, duration)
        gestureBuilder.addStroke(strokeDescription)
        
        val gesture = gestureBuilder.build()
        
        val gestureCallback = object : GestureResultCallback() {
            override fun onCompleted(gestureDescription: GestureDescription?) {
                super.onCompleted(gestureDescription)
                Log.d(TAG, "Swipe gesture completed from ($startX, $startY) to ($endX, $endY)")
                callback?.onCompleted(gestureDescription)
            }
            
            override fun onCancelled(gestureDescription: GestureDescription?) {
                super.onCancelled(gestureDescription)
                Log.w(TAG, "Swipe gesture cancelled")
                callback?.onCancelled(gestureDescription)
            }
        }
        
        dispatchGesture(gesture, gestureCallback, null)
    }

    /**
     * Dispatch a long press gesture at specific coordinates
     * @param x The x coordinate on screen
     * @param y The y coordinate on screen
     * @param duration Duration of the long press in milliseconds
     * @param callback Optional callback for gesture completion
     */
    fun dispatchLongPressGesture(
        x: Float,
        y: Float,
        duration: Long = 500,
        callback: GestureResultCallback? = null
    ) {
        val path = Path()
        path.moveTo(x, y)
        
        val gestureBuilder = GestureDescription.Builder()
        val strokeDescription = GestureDescription.StrokeDescription(path, 0, duration)
        gestureBuilder.addStroke(strokeDescription)
        
        val gesture = gestureBuilder.build()
        
        val gestureCallback = object : GestureResultCallback() {
            override fun onCompleted(gestureDescription: GestureDescription?) {
                super.onCompleted(gestureDescription)
                Log.d(TAG, "Long press gesture completed at ($x, $y)")
                callback?.onCompleted(gestureDescription)
            }
            
            override fun onCancelled(gestureDescription: GestureDescription?) {
                super.onCancelled(gestureDescription)
                Log.w(TAG, "Long press gesture cancelled")
                callback?.onCancelled(gestureDescription)
            }
        }
        
        dispatchGesture(gesture, gestureCallback, null)
    }

    /**
     * Dispatch a scroll gesture
     * @param startX Starting x coordinate
     * @param startY Starting y coordinate
     * @param scrollAmount Amount to scroll (positive = down, negative = up)
     * @param callback Optional callback for gesture completion
     */
    fun dispatchScrollGesture(
        startX: Float,
        startY: Float,
        scrollAmount: Float,
        callback: GestureResultCallback? = null
    ) {
        dispatchSwipeGesture(
            startX,
            startY,
            startX,
            startY - scrollAmount,
            300,
            callback
        )
    }

    /**
     * Perform a back gesture
     */
    fun performBack() {
        try {
            performGlobalAction(GLOBAL_ACTION_BACK)
            Log.d(TAG, "Back action performed")
        } catch (e: Exception) {
            Log.e(TAG, "Error performing back action", e)
        }
    }

    /**
     * Perform a home gesture
     */
    fun performHome() {
        try {
            performGlobalAction(GLOBAL_ACTION_HOME)
            Log.d(TAG, "Home action performed")
        } catch (e: Exception) {
            Log.e(TAG, "Error performing home action", e)
        }
    }

    /**
     * Perform a recent apps gesture
     */
    fun performRecents() {
        try {
            performGlobalAction(GLOBAL_ACTION_RECENTS)
            Log.d(TAG, "Recents action performed")
        } catch (e: Exception) {
            Log.e(TAG, "Error performing recents action", e)
        }
    }

    /**
     * Perform notifications gesture
     */
    fun performNotifications() {
        try {
            performGlobalAction(GLOBAL_ACTION_NOTIFICATIONS)
            Log.d(TAG, "Notifications action performed")
        } catch (e: Exception) {
            Log.e(TAG, "Error performing notifications action", e)
        }
    }

    /**
     * Perform quick settings gesture
     */
    fun performQuickSettings() {
        try {
            performGlobalAction(GLOBAL_ACTION_QUICK_SETTINGS)
            Log.d(TAG, "Quick settings action performed")
        } catch (e: Exception) {
            Log.e(TAG, "Error performing quick settings action", e)
        }
    }
}
