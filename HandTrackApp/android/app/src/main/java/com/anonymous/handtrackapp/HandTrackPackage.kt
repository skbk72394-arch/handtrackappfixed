package com.anonymous.handtrackapp

import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager

/**
 * HandTrackPackage - React Native Package for Custom Native Modules
 * 
 * This package registers all custom native modules with React Native so they
 * can be accessed from JavaScript via NativeModules.
 * 
 * Registered modules:
 * - CursorControlModule: Overlay permission and cursor control
 * - AccessibilityActionModule: Accessibility service integration
 * - HandTrackingModule: Hand tracking operations
 */
class HandTrackPackage : ReactPackage {

    /**
     * Create and return all native modules
     * 
     * These modules will be available in JavaScript as:
     * - NativeModules.CursorControlModule
     * - NativeModules.AccessibilityActionModule
     * - NativeModules.HandTrackingModule
     */
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(
            CursorControlModule(reactContext),
            AccessibilityActionModule(reactContext),
            HandTrackingModule(reactContext)
        )
    }

    /**
     * Create and return all view managers
     * 
     * Currently not used, but required by ReactPackage interface
     */
    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<View, ReactShadowNode<*>>> {
        return emptyList()
    }
}
