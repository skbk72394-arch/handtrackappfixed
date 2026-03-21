package com.anonymous.handtrackapp

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.*

/**
 * CursorControlModule - Native Module for Cursor Overlay Control
 * 
 * This module provides JavaScript interfaces for:
 * - Checking overlay permission status
 * - Requesting overlay permission
 * - Starting/stopping the floating cursor overlay
 * - Managing cursor position and state
 * 
 * CRASH PREVENTION:
 * All methods include comprehensive error handling and safe defaults.
 * Methods return Promises that always resolve (never reject) to prevent JS crashes.
 */
class CursorControlModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "CursorControlModule"
    }

    /**
     * Check if the app has overlay permission
     * 
     * @param promise Resolves to true if permission is granted, false otherwise
     */
    @ReactMethod
    fun checkOverlayPermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val hasPermission = Settings.canDrawOverlays(reactApplicationContext)
                promise.resolve(hasPermission)
            } else {
                // Pre-Marshmallow devices don't need this permission
                promise.resolve(true)
            }
        } catch (e: Exception) {
            // Never reject - always return a safe value
            android.util.Log.e(NAME, "Error checking overlay permission", e)
            promise.resolve(false)
        }
    }

    /**
     * Request overlay permission from the user
     * 
     * Opens Android Settings where the user can grant "Display over other apps"
     * permission. This cannot be requested via the standard permission dialog.
     * 
     * @param promise Resolves to true when settings are opened, false on error
     */
    @ReactMethod
    fun requestOverlayPermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val currentActivity = currentActivity
                
                if (currentActivity != null) {
                    val intent = Intent(
                        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:" + reactApplicationContext.packageName)
                    )
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    currentActivity.startActivity(intent)
                    promise.resolve(true)
                } else {
                    android.util.Log.w(NAME, "Current activity is null, cannot open settings")
                    promise.resolve(false)
                }
            } else {
                // Pre-Marshmallow devices don't need this permission
                promise.resolve(true)
            }
        } catch (e: Exception) {
            android.util.Log.e(NAME, "Error requesting overlay permission", e)
            promise.resolve(false)
        }
    }

    /**
     * Start the floating cursor overlay
     * 
     * Note: This is a stub implementation. The actual cursor overlay service
     * needs to be implemented separately.
     * 
     * @param promise Resolves to true when started, false on error
     */
    @ReactMethod
    fun startCursor(promise: Promise) {
        try {
            // Check if we have overlay permission first
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!Settings.canDrawOverlays(reactApplicationContext)) {
                    android.util.Log.w(NAME, "Cannot start cursor: overlay permission not granted")
                    promise.resolve(false)
                    return
                }
            }

            // TODO: Start the actual cursor overlay service
            // For now, this is a stub that prevents crashes
            android.util.Log.d(NAME, "startCursor called (stub implementation)")
            
            promise.resolve(true)
        } catch (e: Exception) {
            android.util.Log.e(NAME, "Error starting cursor", e)
            promise.resolve(false)
        }
    }

    /**
     * Start the floating cursor overlay (no promise variant for fire-and-forget)
     */
    @ReactMethod
    fun startCursor() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!Settings.canDrawOverlays(reactApplicationContext)) {
                    android.util.Log.w(NAME, "Cannot start cursor: overlay permission not granted")
                    return
                }
            }

            android.util.Log.d(NAME, "startCursor called (stub implementation)")
        } catch (e: Exception) {
            android.util.Log.e(NAME, "Error starting cursor", e)
        }
    }

    /**
     * Stop the floating cursor overlay
     * 
     * @param promise Resolves to true when stopped, false on error
     */
    @ReactMethod
    fun stopCursor(promise: Promise) {
        try {
            // TODO: Stop the actual cursor overlay service
            android.util.Log.d(NAME, "stopCursor called (stub implementation)")
            promise.resolve(true)
        } catch (e: Exception) {
            android.util.Log.e(NAME, "Error stopping cursor", e)
            promise.resolve(false)
        }
    }

    /**
     * Stop the floating cursor overlay (no promise variant)
     */
    @ReactMethod
    fun stopCursor() {
        try {
            android.util.Log.d(NAME, "stopCursor called (stub implementation)")
        } catch (e: Exception) {
            android.util.Log.e(NAME, "Error stopping cursor", e)
        }
    }

    /**
     * Update cursor position
     * 
     * @param x X coordinate (0-1, normalized to screen width)
     * @param y Y coordinate (0-1, normalized to screen height)
     */
    @ReactMethod
    fun updateCursorPosition(x: Double, y: Double) {
        try {
            // TODO: Update actual cursor position
            // android.util.Log.d(NAME, "updateCursorPosition: x=$x, y=$y")
        } catch (e: Exception) {
            android.util.Log.e(NAME, "Error updating cursor position", e)
        }
    }

    /**
     * Set cursor visibility
     * 
     * @param visible true to show cursor, false to hide
     */
    @ReactMethod
    fun setCursorVisible(visible: Boolean) {
        try {
            // TODO: Update actual cursor visibility
            android.util.Log.d(NAME, "setCursorVisible: $visible")
        } catch (e: Exception) {
            android.util.Log.e(NAME, "Error setting cursor visibility", e)
        }
    }

    companion object {
        private const val NAME = "CursorControlModule"
    }
}
