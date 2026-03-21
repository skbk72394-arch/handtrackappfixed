/**
 * Expo Application Configuration
 * 
 * Complete production-level config for Hand Tracking app with all required
 * permissions and native integrations for camera, overlay, and accessibility services.
 */

export default {
  expo: {
    name: "HandTrack",
    slug: "handtrackapp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    
    // Splash screen configuration
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#0D0F1A"
    },
    
    // iOS configuration (for future expansion)
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.handtrackapp",
      infoPlist: {
        NSCameraUsageDescription: "HandTrack uses the camera to track your hand gestures and convert them into touch interactions.",
        NSMicrophoneUsageDescription: "HandTrack does not use the microphone."
      }
    },
    
    // Android configuration with complete permissions and services
    android: {
      package: "com.anonymous.handtrackapp",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0D0F1A"
      },
      
      // Critical permissions that will be injected into AndroidManifest.xml
      permissions: [
        // Camera access for hand tracking
        "android.permission.CAMERA",
        
        // Overlay permission for floating cursor
        "android.permission.SYSTEM_ALERT_WINDOW",
        
        // Internet for potential future features
        "android.permission.INTERNET",
        
        // Storage permissions
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        
        // Vibration feedback
        "android.permission.VIBRATE",
        
        // Wake lock to prevent screen timeout during tracking
        "android.permission.WAKE_LOCK",
        
        // Foreground service for continuous tracking
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.FOREGROUND_SERVICE_CAMERA",
        "android.permission.FOREGROUND_SERVICE_SPECIAL_USE",
      ],
      
      // Blocking permissions that should NOT be requested
      blockedPermissions: [
        "android.permission.RECORD_AUDIO"
      ]
    },
    
    // Expo plugins for native feature integration
    plugins: [
      // Camera plugin - ensures camera permission is properly configured
      [
        "expo-camera",
        {
          "cameraPermission": "HandTrack uses the camera to track your hand gestures in real-time and convert them into on-screen pointer movements and touch actions."
        }
      ],
      
      // Build properties for Android native configuration
      [
        "expo-build-properties",
        {
          "android": {
            // Minimum SDK version - Android 8.0 for accessibility features
            "minSdkVersion": 26,
            // Target SDK version - latest stable
            "targetSdkVersion": 34,
            "compileSdkVersion": 34,
            
            // Enable AndroidX for modern components
            "useAndroidX": true,
            
            // Enable multidex for large app support
            "enableMultidex": true,
            
            // Configure Kotlin for native modules
            "kotlinVersion": "1.9.0",
            
            // Network security config for development
            "networkSecurityConfig": "./android/app/src/main/res/xml/network_security_config.xml",
            
            // Additional gradle properties
            "extraProguardRules": "-keep class com.anonymous.handtrackapp.** { *; }",
            
            // Memory and performance optimizations
            "enableProguardInReleaseBuilds": true,
            "enableShrinkResourcesInReleaseBuilds": true
          }
        }
      ]
    ],
    
    // Update configuration
    updates: {
      fallbackToCacheTimeout: 0,
      url: "https://u.expo.dev/[your-project-id]"
    },
    
    // Runtime version for updates
    runtimeVersion: {
      policy: "sdkVersion"
    },
    
    // Extra configuration
    extra: {
      eas: {
        projectId: "your-project-id-here"
      }
    },
    
    // Hooks for custom native code
    hooks: {
      postPublish: []
    }
  }
};
