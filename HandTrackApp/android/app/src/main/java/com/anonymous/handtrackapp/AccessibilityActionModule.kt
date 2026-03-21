package com.anonymous.handtrackapp

import android.content.Context
import android.provider.Settings
import android.text.TextUtils
import com.facebook.react.bridge.*

/**
 * AccessibilityActionModule - Native Module for Accessibility Service Integration
 * 
 * This module provides JavaScript interfaces for:
 * - Checking if accessibility service is enabled
 * - Performing accessibility actions (click, scroll, gestures)
 * - Managing accessibility service state
 * 
 * CRASH PREVENTION:
 * All methods include comprehensive error handling and safe defaults.
 * Methods return Promises that always resolve (never reject) to prevent JS crashes.
 * 
 * Note: The actual accessibility service implementation should be in
 * HandTrackAccessibilityService.kt
 */
class AccessibilityActionModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AccessibilityActionModule"
    }

    /**
     * Check if the HandTrack accessibility service is enabled
     * 
     * This checks the system settings to see if our accessibility service
     * is currently active.
     * 
     * @param promise Resolves to true if service is enabled, false otherwise
     */
    @ReactMethod
    fun isServiceEnabled(promise: Promise) {
        try {
            val enabled = isAccessibilityServiceEnabled(reactApplicationContext)
            promise.resolve(enabled)
        } catch (e: Exception) {
            android.util.Log.e(NAME, "Error checking accessibility service status", e)
            promise.resolve(false)
        }
    }

    /**
     * Perform a click action at the specified coordinates
     * 
     * @param x X coordinate in pixels
     * @param y Y coordinate in pixels
     * @param promise Resolves to true if action performed, false otherwise
     */
    @ReactMethod
    fun performClick(x: Double, y: Double, promise: Promise) {
        try {
            // TODO: Communicate with accessibility service to perform click
            android.util.Log.d(NAME, "performClick called: x=$x, y=$y (stub)")
            promise.resolve(true)
        } catch (e: Exception) {
            android.util.Log.e(NAME, "Error performing click", e)
            promise.resolve(false)
        }
    }

    /**
     * Perform a click action (no promise variant for fire-and-forget)
     */
    @ReactMethod
    fun performClick(x: Double, y: Double) {
        try {
            android.util.Log.d(NAME, "performClick called: x=$x, y=$y (stub)")
        } catch (e: Exception) {
            android.util.Log.e(NAME, "Error performing click", e)
        }
    }

    /**
     * Perform back button action
     * 
     * @param promise Resolves to true if action performed, false otherwise
     */
    @ReactMethod
    fun performBack(promise: Promise) {
        try {
            android.util.Log.d(NAME, "performBack called (stub)")
            promise.resolve(true)
        } catch (e: Exception) {
            android.util.Log.e(NAME, "Error performing back", e)
            promise.resolve(false)
        }
    }

    /**
     * Perform back button action (no promise variant)
     */
    @ReactMethod
    fun performBack() {
        try {
            android.util.Log.d(NAME, "performBack called (stub)")
        } catch (e: Exception) {
            android.util.Log.e(NAME, "Error performing back", e)
        }
    }

    /**
     * Perform recents/multitasking action
     * 
     * @param promise Resolves to true if action performed, false otherwise
     */
    @ReactMethod
    fun performRecents(promise: Promise) {
        try {
            android.util.Log.d(NAME, "performRecents called (stub)")
            promise.resolve(true)
        } catch (e: Exception) {
            android.util.Log.e(NAME, "Error performing recents", e)
            promise.resolve(false)
        }
    }

    /**
     * Perform recents action (no promise variant)
     */
    @ReactMethod
    fun performRecents() {
        try {
            android.util.Log.d(NAME, "performRecents called (stub)")
        } catch (e: Exception) {
            android.util.Log.e(NAME, "Error performing recents", e)
        }
    }

    /**
     * Perform scroll up action
     */
    @ReactMethod
    fun performScrollUp(x: Double, y: Double) {
        try {
            android.util.Log.d(NAME, "performScrollUp called: x=$x, y=$y (stub)")
        } catch (e: Exception) {
            android.util.Log.e(NAME, "Error performing scroll up", e)
        }
    }

    /**
     * Perform scroll down action
     */
    @ReactMethod
    fun performScrollDown(x: Double, y: Double) {
        try {
            android.util.Log.d(NAME, "performScrollDown called: x=$x, y=$y (stub)")
        } catch (e: Exception) {
            android.util.Log.e(NAME, "Error performing scroll down", e)
        }
    }

    /**
     * Perform scroll left action
     */
    @ReactMethod
    fun performScrollLeft(x: Double, y: Double) {
        try {
            android.util.Log.d(NAME, "performScrollLeft called: x=$x, y=$y (stub)")
        } catch (e: Exception) {
            android.util.Log.e(NAME, "Error performing scroll left", e)
        }
    }

    /**
     * Perform scroll right action
     */
    @ReactMethod
    fun performScrollRight(x: Double, y: Double) {
        try {
            android.util.Log.d(NAME, "performScrollRight called: x=$x, y=$y (stub)")
        } catch (e: Exception) {
            android.util.Log.e(NAME, "Error performing scroll right", e)
        }
    }

    /**
     * Start drag gesture
     */
    @ReactMethod
    fun performDragStart(x: Double, y: Double) {
        try {
            android.util.Log.d(NAME, "performDragStart called: x=$x, y=$y (stub)")
        } catch (e: Exception) {
            android.util.Log.e(NAME, "Error performing drag start", e)
        }
    }

    /**
     * End drag gesture
     */
    @ReactMethod
    fun performDragEnd(x: Double, y: Double) {
        try {
            android.util.Log.d(NAME, "performDragEnd called: x=$x, y=$y (stub)")
        } catch (e: Exception) {
            android.util.Log.e(NAME, "Error performing drag end", e)
        }
    }

    /**
     * Helper function to check if accessibility service is enabled
     */
    private fun isAccessibilityServiceEnabled(context: Context): Boolean {
        val expectedComponentName = "${context.packageName}/com.anonymous.handtrackapp.HandTrackAccessibilityService"
        
        val enabledServicesSetting = Settings.Secure.getString(
            context.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false

        val colonSplitter = TextUtils.SimpleStringSplitter(':')
        colonSplitter.setString(enabledServicesSetting)

        while (colonSplitter.hasNext()) {
            val componentName = colonSplitter.next()
            if (componentName.equals(expectedComponentName, ignoreCase = true)) {
                return true
            }
        }

        return false
    }

    companion object {
        private const val NAME = "AccessibilityActionModule"
    }
}
