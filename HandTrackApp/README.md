# HandTrack - Hand Gesture Control App

A React Native Expo app that enables touchless device control using hand gestures captured via camera.

## Overview

HandTrack converts hand gestures into on-screen touch interactions, allowing you to control your Android device without touching the screen. The app uses computer vision to track hand movements and translates them into cursor movements, taps, swipes, and other gestures.

## Features

- **Hand Tracking**: Real-time hand detection and tracking via camera
- **Floating Cursor**: System-wide overlay cursor controlled by hand position
- **Gesture Recognition**: Multiple gesture types (pinch, swipe, fist, etc.)
- **Accessibility Integration**: Touch injection using Android Accessibility Services
- **Air Keyboard**: Virtual keyboard controlled by hand gestures
- **Permission Management**: Comprehensive permission handling with user-friendly UI

## Required Permissions

### Runtime Permissions
- **Camera**: Required for hand tracking
- **Storage**: For saving settings and preferences

### Special Permissions
- **Display Over Other Apps** (SYSTEM_ALERT_WINDOW): Required for floating cursor overlay
- **Accessibility Service**: Required for touch injection and gesture actions

## Installation

### Prerequisites
- Node.js 18+ and npm
- Android SDK
- Expo CLI
- EAS CLI (for building)

### Setup

1. **Install dependencies**:
```bash
cd HandTrackApp
npm install
```

2. **Prebuild Android native code**:
```bash
npm run prebuild
```

3. **Run on Android device/emulator**:
```bash
npm run android
```

### Building APK with EAS

1. **Install EAS CLI** (if not already installed):
```bash
npm install -g eas-cli
```

2. **Configure EAS**:
```bash
eas build:configure
```

3. **Build APK**:
```bash
npm run build:android
```

## First Launch Setup

When you first launch the app, you'll be guided through the permission setup process:

### Step 1: Camera Permission
- Tap "Grant Camera Permission"
- Allow camera access in the Android permission dialog

### Step 2: Overlay Permission
- Tap "Grant Overlay Permission"
- Enable "Display over other apps" in Android Settings
- Return to the app

### Step 3: Accessibility Service
- Tap "Enable Accessibility Service"
- Navigate to: Settings > Accessibility > Downloaded Services > HandTrack
- Enable "HandTrack Gesture Controller"
- Read and accept the permissions warning
- Return to the app

### Step 4: Start Tracking
- Once all permissions are granted, tap "Start Cursor" to begin hand tracking
- Your camera will activate and begin tracking your hand
- A floating cursor will appear on screen, controlled by your hand position

## Gesture Guide

### Supported Gestures

1. **Thumb + Index Pinch**: Click/Tap
   - Pinch thumb and index finger together to perform a click

2. **Thumb + Middle Pinch**: Go Back
   - Pinch thumb and middle finger to navigate back

3. **Thumb + Ring Pinch**: Recent Apps
   - Pinch thumb and ring finger to open recent apps

4. **Open Hand Swipe**: Scroll/Swipe
   - Move open hand up/down/left/right to scroll

5. **Fist → Move → Open**: Drag & Drop
   - Make a fist to start dragging
   - Move hand while holding fist
   - Open hand to drop

## Architecture

### React Native Layer
- **App.tsx**: Main app component with UI
- **PermissionGate.tsx**: Permission management wrapper
- **index.js**: App entry point with permission protection

### Native Android Layer

#### Services
- **HandTrackAccessibilityService**: Accessibility service for touch injection
- **HandTrackingForegroundService**: Foreground service for camera tracking
- **CursorOverlayService**: Overlay service for floating cursor

#### Native Modules
- **CursorControlModule**: Overlay permission and cursor control
- **AccessibilityActionModule**: Accessibility service integration
- **HandTrackingModule**: Hand tracking operations

#### Configuration
- **AndroidManifest.xml**: Permissions and service declarations
- **accessibility_service_config.xml**: Accessibility service configuration
- **app.config.js**: Expo configuration with plugins

## Troubleshooting

### App Crashes on Launch

**Problem**: App crashes immediately after opening

**Solutions**:
1. Ensure all permissions are granted
2. Check if accessibility service is enabled
3. Clear app data and restart
4. Reinstall the app

### No Permissions Available in Settings

**Problem**: Android App Settings shows zero permissions

**Solutions**:
1. This is fixed in the latest version
2. Rebuild the app with `npm run prebuild`
3. Permissions should now appear in Settings

### Accessibility Service Not Appearing

**Problem**: HandTrack doesn't appear in Accessibility Settings

**Solutions**:
1. Ensure you've run `npm run prebuild` to inject the service
2. Reinstall the app
3. Check that `accessibility_service_config.xml` exists
4. Verify `AndroidManifest.xml` includes the service declaration

### Cursor Not Showing

**Problem**: Cursor doesn't appear even with permissions granted

**Solutions**:
1. Check overlay permission is granted
2. Ensure "Display over other apps" is enabled
3. Try stopping and restarting the cursor
4. Check battery optimization settings (disable for HandTrack)

### Camera Not Working

**Problem**: Camera permission granted but camera doesn't start

**Solutions**:
1. Check that no other app is using the camera
2. Restart the app
3. Check camera permission in Android Settings
4. Clear app cache

## Development

### Project Structure

```
HandTrackApp/
├── android/                          # Native Android code
│   └── app/src/main/
│       ├── AndroidManifest.xml      # App manifest with permissions
│       ├── java/com/anonymous/handtrackapp/
│       │   ├── MainActivity.kt
│       │   ├── MainApplication.kt
│       │   ├── HandTrackPackage.kt  # Native module package
│       │   ├── CursorControlModule.kt
│       │   ├── AccessibilityActionModule.kt
│       │   ├── HandTrackingModule.kt
│       │   ├── HandTrackAccessibilityService.kt
│       │   ├── HandTrackingForegroundService.kt
│       │   └── CursorOverlayService.kt
│       └── res/
│           ├── xml/
│           │   └── accessibility_service_config.xml
│           └── values/
│               └── strings.xml
├── src/
│   ├── components/
│   │   ├── PermissionGate.tsx       # Permission management
│   │   └── AirKeyboard.tsx          # Virtual keyboard
│   ├── hooks/
│   │   └── useHandGestures.ts       # Gesture recognition hook
│   ├── native/
│   │   └── AccessibilityBridge.ts   # Native module bridge
│   └── screens/
│       └── GestureGuideScreen.tsx   # Gesture tutorial
├── app.config.js                     # Expo configuration
├── App.tsx                           # Main app component
├── index.js                          # App entry point
└── package.json                      # Dependencies
```

### Adding New Gestures

1. Define gesture pattern in hand tracking logic
2. Add gesture handler in `useHandGestures.ts`
3. Map gesture to accessibility action in `AccessibilityActionModule.kt`
4. Update UI and documentation

### Building for Production

1. **Update version** in `app.config.js` and `package.json`
2. **Run prebuild** to generate latest native code
3. **Build with EAS**:
   ```bash
   eas build --platform android --profile production
   ```
4. **Test APK** thoroughly before release
5. **Sign and publish** to Play Store or distribute directly

## Privacy & Security

- **Local Processing**: All hand tracking is done on-device
- **No Data Collection**: No gesture data is sent to external servers
- **Accessibility Permissions**: Used only for touch injection, not data collection
- **Camera Access**: Used only for hand tracking, no recording or storage
- **Transparent Logging**: All actions are logged for debugging

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Credits

Built with:
- React Native
- Expo
- Android Accessibility Services
- MediaPipe (planned for hand tracking ML)

---

**Note**: This is a development version with stub implementations for some features. Full hand tracking requires integration with a computer vision library like MediaPipe or TensorFlow Lite.
