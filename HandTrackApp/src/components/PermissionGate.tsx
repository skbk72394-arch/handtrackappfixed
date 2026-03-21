/**
 * PermissionGate Component
 * 
 * Advanced permission management wrapper for HandTrack app.
 * Prevents crashes by gracefully handling all permission states and native module failures.
 * 
 * Features:
 * - Crash-resistant startup with comprehensive error handling
 * - Camera permission management (runtime permission)
 * - Overlay permission management (special permission)
 * - Accessibility service detection and prompting
 * - Safe native module bridging with fallbacks
 * - User-friendly permission request flows
 * 
 * This component wraps the main app and ensures no permission-related crashes occur
 * on first launch or when permissions are denied.
 */

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  NativeModules,
  PermissionsAndroid,
  Linking,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';

// ══════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════

interface PermissionGateProps {
  children: ReactNode;
}

interface PermissionState {
  camera: boolean;
  overlay: boolean;
  accessibility: boolean;
}

// ══════════════════════════════════════════════════════════════════════════
// SAFE NATIVE MODULE ACCESS
// 
// Gracefully handle cases where native modules don't exist yet.
// This prevents "Cannot read property 'methodName' of undefined" crashes.
// ══════════════════════════════════════════════════════════════════════════

const safeNativeModule = {
  CursorControlModule: NativeModules.CursorControlModule || null,
  HandTrackingModule: NativeModules.HandTrackingModule || null,
  AccessibilityActionModule: NativeModules.AccessibilityActionModule || null,
};

// ══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════════════

const PermissionGate: React.FC<PermissionGateProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<PermissionState>({
    camera: false,
    overlay: false,
    accessibility: false,
  });
  const [hasCheckedPermissions, setHasCheckedPermissions] = useState(false);

  // ════════════════════════════════════════════════════════════════════════
  // PERMISSION CHECKING FUNCTIONS
  // ════════════════════════════════════════════════════════════════════════

  /**
   * Check Camera Permission (Runtime Permission)
   * 
   * On Android 6.0+, camera is a dangerous permission that must be requested
   * at runtime. This function safely checks and requests it.
   */
  const checkCameraPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      return granted;
    } catch (error) {
      console.warn('[PermissionGate] Camera permission check failed:', error);
      return false;
    }
  }, []);

  /**
   * Request Camera Permission
   * 
   * Prompts the user to grant camera access with a clear rationale.
   */
  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission Required',
          message: 'HandTrack needs camera access to track your hand gestures and convert them into touch interactions.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Grant Access',
        }
      );
      
      const granted = result === PermissionsAndroid.RESULTS.GRANTED;
      setPermissions(prev => ({ ...prev, camera: granted }));
      return granted;
    } catch (error) {
      console.error('[PermissionGate] Camera permission request failed:', error);
      return false;
    }
  }, []);

  /**
   * Check Overlay Permission (Special Permission)
   * 
   * SYSTEM_ALERT_WINDOW is a special permission that cannot be requested
   * via the standard permission API. We need to use the native module bridge.
   */
  const checkOverlayPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      if (safeNativeModule.CursorControlModule?.checkOverlayPermission) {
        const hasPermission = await safeNativeModule.CursorControlModule.checkOverlayPermission();
        return hasPermission === true;
      }
      
      // If native module doesn't exist, assume permission is needed
      console.warn('[PermissionGate] CursorControlModule not available, overlay permission unknown');
      return false;
    } catch (error) {
      console.warn('[PermissionGate] Overlay permission check failed:', error);
      return false;
    }
  }, []);

  /**
   * Request Overlay Permission
   * 
   * Opens Android settings where user can grant "Display over other apps" permission.
   */
  const requestOverlayPermission = useCallback(async (): Promise<void> => {
    if (Platform.OS !== 'android') return;

    try {
      if (safeNativeModule.CursorControlModule?.requestOverlayPermission) {
        await safeNativeModule.CursorControlModule.requestOverlayPermission();
      } else {
        // Fallback: Open app settings
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('[PermissionGate] Failed to open overlay permission settings:', error);
      Alert.alert(
        'Cannot Open Settings',
        'Please manually grant "Display over other apps" permission in Android Settings > Apps > HandTrack > Permissions.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  /**
   * Check Accessibility Service Status
   * 
   * Determines if the HandTrack accessibility service is enabled.
   * This is required for touch injection functionality.
   */
  const checkAccessibilityService = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      if (safeNativeModule.AccessibilityActionModule?.isServiceEnabled) {
        const isEnabled = await safeNativeModule.AccessibilityActionModule.isServiceEnabled();
        return isEnabled === true;
      }
      
      // If native module doesn't exist, assume service is not enabled
      console.warn('[PermissionGate] AccessibilityActionModule not available');
      return false;
    } catch (error) {
      console.warn('[PermissionGate] Accessibility service check failed:', error);
      return false;
    }
  }, []);

  /**
   * Open Accessibility Settings
   * 
   * Directs the user to the accessibility settings page where they can
   * enable the HandTrack accessibility service.
   */
  const openAccessibilitySettings = useCallback(async (): Promise<void> => {
    if (Platform.OS !== 'android') return;

    try {
      // Try to open accessibility settings directly
      const url = 'android.settings.ACCESSIBILITY_SETTINGS';
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.sendIntent(url);
      } else {
        // Fallback to general settings
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('[PermissionGate] Failed to open accessibility settings:', error);
      Alert.alert(
        'Cannot Open Settings',
        'Please manually enable the HandTrack accessibility service:\n\nSettings > Accessibility > Downloaded Services > HandTrack',
        [{ text: 'OK' }]
      );
    }
  }, []);

  /**
   * Comprehensive Permission Check
   * 
   * Checks all required permissions on app startup.
   * Uses try-catch to prevent crashes from native module failures.
   */
  const checkAllPermissions = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      const [cameraGranted, overlayGranted, accessibilityEnabled] = await Promise.all([
        checkCameraPermission(),
        checkOverlayPermission(),
        checkAccessibilityService(),
      ]);

      setPermissions({
        camera: cameraGranted,
        overlay: overlayGranted,
        accessibility: accessibilityEnabled,
      });
      
      setHasCheckedPermissions(true);
    } catch (error) {
      console.error('[PermissionGate] Permission check failed:', error);
      
      // Even if checks fail, mark as checked to prevent infinite loading
      setHasCheckedPermissions(true);
      setPermissions({
        camera: false,
        overlay: false,
        accessibility: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, [checkCameraPermission, checkOverlayPermission, checkAccessibilityService]);

  // ════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    checkAllPermissions();
  }, [checkAllPermissions]);

  // ════════════════════════════════════════════════════════════════════════
  // PERMISSION REQUEST HANDLERS
  // ════════════════════════════════════════════════════════════════════════

  const handleRequestCamera = useCallback(async () => {
    const granted = await requestCameraPermission();
    if (!granted) {
      Alert.alert(
        'Camera Permission Denied',
        'HandTrack needs camera access to track your hand gestures. Please grant camera permission to use the app.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  }, [requestCameraPermission]);

  const handleRequestOverlay = useCallback(async () => {
    Alert.alert(
      'Overlay Permission Required',
      'HandTrack needs "Display over other apps" permission to show the floating cursor.\n\nYou will be taken to Android Settings to grant this permission.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Settings',
          onPress: async () => {
            await requestOverlayPermission();
            
            // Re-check overlay permission after user returns from settings
            setTimeout(async () => {
              const hasOverlay = await checkOverlayPermission();
              setPermissions(prev => ({ ...prev, overlay: hasOverlay }));
            }, 1000);
          }
        },
      ]
    );
  }, [requestOverlayPermission, checkOverlayPermission]);

  const handleRequestAccessibility = useCallback(async () => {
    Alert.alert(
      'Accessibility Service Required',
      'HandTrack uses an accessibility service to inject touch events from your hand gestures.\n\nPlease enable "HandTrack Gesture Controller" in Accessibility Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Settings',
          onPress: async () => {
            await openAccessibilitySettings();
            
            // Re-check accessibility service after user returns
            setTimeout(async () => {
              const isEnabled = await checkAccessibilityService();
              setPermissions(prev => ({ ...prev, accessibility: isEnabled }));
            }, 1000);
          }
        },
      ]
    );
  }, [openAccessibilitySettings, checkAccessibilityService]);

  const handleContinueAnyway = useCallback(() => {
    Alert.alert(
      'Limited Functionality',
      'Some features may not work without the required permissions. You can grant permissions later from the app settings.',
      [{ text: 'I Understand', onPress: () => setHasCheckedPermissions(true) }]
    );
  }, []);

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0F1A" />
        <ActivityIndicator size="large" color="#4F8EF7" />
        <Text style={styles.loadingText}>Checking Permissions...</Text>
      </View>
    );
  }

  // All permissions granted - render main app
  const allPermissionsGranted = permissions.camera && permissions.overlay && permissions.accessibility;
  if (allPermissionsGranted || hasCheckedPermissions) {
    return <>{children}</>;
  }

  // Permission request screen
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0F1A" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Welcome to HandTrack</Text>
        <Text style={styles.subtitle}>
          To use hand gesture control, HandTrack requires the following permissions:
        </Text>

        {/* Camera Permission */}
        <View style={styles.permissionCard}>
          <View style={styles.permissionHeader}>
            <Text style={styles.permissionIcon}>📷</Text>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionTitle}>Camera Access</Text>
              <Text style={styles.permissionDesc}>
                Required to track your hand gestures
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              permissions.camera && styles.statusBadgeGranted
            ]}>
              <Text style={styles.statusText}>
                {permissions.camera ? '✓ Granted' : '✗ Required'}
              </Text>
            </View>
          </View>
          {!permissions.camera && (
            <TouchableOpacity style={styles.permissionButton} onPress={handleRequestCamera}>
              <Text style={styles.permissionButtonText}>Grant Camera Permission</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Overlay Permission */}
        <View style={styles.permissionCard}>
          <View style={styles.permissionHeader}>
            <Text style={styles.permissionIcon}>🎯</Text>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionTitle}>Display Over Other Apps</Text>
              <Text style={styles.permissionDesc}>
                Required to show the floating cursor
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              permissions.overlay && styles.statusBadgeGranted
            ]}>
              <Text style={styles.statusText}>
                {permissions.overlay ? '✓ Granted' : '✗ Required'}
              </Text>
            </View>
          </View>
          {!permissions.overlay && (
            <TouchableOpacity style={styles.permissionButton} onPress={handleRequestOverlay}>
              <Text style={styles.permissionButtonText}>Grant Overlay Permission</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Accessibility Service */}
        <View style={styles.permissionCard}>
          <View style={styles.permissionHeader}>
            <Text style={styles.permissionIcon}>♿</Text>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionTitle}>Accessibility Service</Text>
              <Text style={styles.permissionDesc}>
                Required to inject touch events from gestures
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              permissions.accessibility && styles.statusBadgeGranted
            ]}>
              <Text style={styles.statusText}>
                {permissions.accessibility ? '✓ Enabled' : '✗ Required'}
              </Text>
            </View>
          </View>
          {!permissions.accessibility && (
            <TouchableOpacity style={styles.permissionButton} onPress={handleRequestAccessibility}>
              <Text style={styles.permissionButtonText}>Enable Accessibility Service</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        <TouchableOpacity 
          style={styles.recheckButton}
          onPress={checkAllPermissions}
        >
          <Text style={styles.recheckButtonText}>🔄 Recheck Permissions</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleContinueAnyway}
        >
          <Text style={styles.skipButtonText}>Continue Anyway (Limited Features)</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0F1A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContent: {
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  loadingText: {
    color: '#8A8FA8',
    fontSize: 14,
    marginTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#8A8FA8',
    lineHeight: 22,
    marginBottom: 32,
    textAlign: 'center',
  },
  permissionCard: {
    backgroundColor: '#1A1D2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  permissionDesc: {
    fontSize: 13,
    color: '#8A8FA8',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(231,76,60,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.3)',
  },
  statusBadgeGranted: {
    backgroundColor: 'rgba(39,174,96,0.15)',
    borderColor: 'rgba(39,174,96,0.3)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  permissionButton: {
    backgroundColor: '#4F8EF7',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  recheckButton: {
    backgroundColor: 'rgba(79,142,247,0.15)',
    borderWidth: 1,
    borderColor: '#4F8EF7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  recheckButtonText: {
    color: '#4F8EF7',
    fontSize: 15,
    fontWeight: '700',
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  skipButtonText: {
    color: '#6B7094',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default PermissionGate;
