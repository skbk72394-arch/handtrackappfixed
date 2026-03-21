package com.anonymous.handtrackapp

import android.content.Context
import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.util.Log

/**
 * React Native Module for Accessibility Service Bridge
 * Provides methods to check status and interact with MyAccessibilityService
 */
class AccessibilityServiceModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "AccessibilityModule"
        private const val MODULE_NAME = "AccessibilityServiceModule"
    }

    override fun getName(): String {
        return MODULE_NAME
    }

    /**
     * Check if accessibility service is enabled
     */
    @ReactMethod
    fun isAccessibilityServiceEnabled(promise: Promise) {
        try {
            val enabled = MyAccessibilityService.isServiceEnabled()
            promise.resolve(enabled)
        } catch (e: Exception) {
            Log.e(TAG, "Error checking accessibility service status", e)
            promise.reject("ERROR", "Failed to check accessibility service status", e)
        }
    }

    /**
     * Open accessibility settings
     */
    @ReactMethod
    fun openAccessibilitySettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error opening accessibility settings", e)
            promise.reject("ERROR", "Failed to open accessibility settings", e)
        }
    }

    /**
     * Dispatch a click gesture
     */
    @ReactMethod
    fun dispatchClick(x: Float, y: Float, promise: Promise) {
        try {
            val service = MyAccessibilityService.getInstance()
            if (service == null) {
                promise.reject("SERVICE_NOT_ENABLED", "Accessibility service is not enabled")
                return
            }

            service.dispatchClickGesture(x, y, object : AccessibilityService.GestureResultCallback() {
                override fun onCompleted(gestureDescription: android.accessibilityservice.GestureDescription?) {
                    promise.resolve(true)
                }

                override fun onCancelled(gestureDescription: android.accessibilityservice.GestureDescription?) {
                    promise.reject("GESTURE_CANCELLED", "Click gesture was cancelled")
                }
            })
        } catch (e: Exception) {
            Log.e(TAG, "Error dispatching click", e)
            promise.reject("ERROR", "Failed to dispatch click gesture", e)
        }
    }

    /**
     * Dispatch a swipe gesture
     */
    @ReactMethod
    fun dispatchSwipe(
        startX: Float,
        startY: Float,
        endX: Float,
        endY: Float,
        duration: Int,
        promise: Promise
    ) {
        try {
            val service = MyAccessibilityService.getInstance()
            if (service == null) {
                promise.reject("SERVICE_NOT_ENABLED", "Accessibility service is not enabled")
                return
            }

            service.dispatchSwipeGesture(
                startX,
                startY,
                endX,
                endY,
                duration.toLong(),
                object : AccessibilityService.GestureResultCallback() {
                    override fun onCompleted(gestureDescription: android.accessibilityservice.GestureDescription?) {
                        promise.resolve(true)
                    }

                    override fun onCancelled(gestureDescription: android.accessibilityservice.GestureDescription?) {
                        promise.reject("GESTURE_CANCELLED", "Swipe gesture was cancelled")
                    }
                }
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error dispatching swipe", e)
            promise.reject("ERROR", "Failed to dispatch swipe gesture", e)
        }
    }

    /**
     * Dispatch a long press gesture
     */
    @ReactMethod
    fun dispatchLongPress(x: Float, y: Float, duration: Int, promise: Promise) {
        try {
            val service = MyAccessibilityService.getInstance()
            if (service == null) {
                promise.reject("SERVICE_NOT_ENABLED", "Accessibility service is not enabled")
                return
            }

            service.dispatchLongPressGesture(
                x,
                y,
                duration.toLong(),
                object : AccessibilityService.GestureResultCallback() {
                    override fun onCompleted(gestureDescription: android.accessibilityservice.GestureDescription?) {
                        promise.resolve(true)
                    }

                    override fun onCancelled(gestureDescription: android.accessibilityservice.GestureDescription?) {
                        promise.reject("GESTURE_CANCELLED", "Long press gesture was cancelled")
                    }
                }
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error dispatching long press", e)
            promise.reject("ERROR", "Failed to dispatch long press gesture", e)
        }
    }

    /**
     * Perform back action
     */
    @ReactMethod
    fun performBack(promise: Promise) {
        try {
            val service = MyAccessibilityService.getInstance()
            if (service == null) {
                promise.reject("SERVICE_NOT_ENABLED", "Accessibility service is not enabled")
                return
            }

            service.performBack()
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error performing back", e)
            promise.reject("ERROR", "Failed to perform back action", e)
        }
    }

    /**
     * Perform home action
     */
    @ReactMethod
    fun performHome(promise: Promise) {
        try {
            val service = MyAccessibilityService.getInstance()
            if (service == null) {
                promise.reject("SERVICE_NOT_ENABLED", "Accessibility service is not enabled")
                return
            }

            service.performHome()
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error performing home", e)
            promise.reject("ERROR", "Failed to perform home action", e)
        }
    }

    /**
     * Perform recent apps action
     */
    @ReactMethod
    fun performRecents(promise: Promise) {
        try {
            val service = MyAccessibilityService.getInstance()
            if (service == null) {
                promise.reject("SERVICE_NOT_ENABLED", "Accessibility service is not enabled")
                return
            }

            service.performRecents()
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error performing recents", e)
            promise.reject("ERROR", "Failed to perform recents action", e)
        }
    }

    /**
     * Perform notifications action
     */
    @ReactMethod
    fun performNotifications(promise: Promise) {
        try {
            val service = MyAccessibilityService.getInstance()
            if (service == null) {
                promise.reject("SERVICE_NOT_ENABLED", "Accessibility service is not enabled")
                return
            }

            service.performNotifications()
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error performing notifications", e)
            promise.reject("ERROR", "Failed to perform notifications action", e)
        }
    }

    /**
     * Check if accessibility service is enabled in system settings
     */
    @ReactMethod
    fun checkAccessibilityPermission(promise: Promise) {
        try {
            val packageName = reactApplicationContext.packageName
            val serviceName = "$packageName/.MyAccessibilityService"
            
            val settingValue = Settings.Secure.getString(
                reactApplicationContext.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            )
            
            val enabled = settingValue?.contains(serviceName) ?: false
            promise.resolve(enabled)
        } catch (e: Exception) {
            Log.e(TAG, "Error checking accessibility permission", e)
            promise.reject("ERROR", "Failed to check accessibility permission", e)
        }
    }
}
