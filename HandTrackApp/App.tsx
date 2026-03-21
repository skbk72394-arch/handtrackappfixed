// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
  Switch,
  ScrollView,
  Platform,
  NativeModules,
  PermissionsAndroid,
} from 'react-native';
import GestureGuideScreen from './src/screens/GestureGuideScreen';
import AirKeyboard from './src/components/AirKeyboard';
import { useHandGestures, GestureEvent } from './src/hooks/useHandGestures';

const { CursorControlModule, HandTrackingModule, AccessibilityServiceModule } = NativeModules;

// ── Types ──────────────────────────────────────────────────────────────────

type AppStatus = 'idle' | 'running' | 'permission_required';
type PermissionStatus = {
  camera: boolean;
  overlay: boolean;
  accessibility: boolean;
};

// ── Component ──────────────────────────────────────────────────────────────

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [showGuide, setShowGuide] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [lastGesture, setLastGesture] = useState<string>('–');
  const [gestureCount, setGestureCount] = useState(0);
  const [gesturesEnabled, setGesturesEnabled] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({
    camera: false,
    overlay: false,
    accessibility: false,
  });
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // ── Flash gesture label on screen ────────────────────────────────────────
  const gestureFlashOpacity = React.useRef(new Animated.Value(0)).current;

  const flashGesture = useCallback((name: string) => {
    setLastGesture(name);
    setGestureCount((c) => c + 1);
    gestureFlashOpacity.setValue(1);
    Animated.timing(gestureFlashOpacity, {
      toValue: 0,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, [gestureFlashOpacity]);

  // ── Hand gesture hook ─────────────────────────────────────────────────────
  useHandGestures({
    enabled: gesturesEnabled,
    onGesture: (e: GestureEvent) => flashGesture(e.gesture),
    // Return true to suppress system actions when keyboard is open
    onBeforeAction: (e: GestureEvent) => {
      if (showKeyboard && e.gesture === 'CLICK') return true;
      return false;
    },
  });

  // ── Startup animation ─────────────────────────────────────────────────────
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // ── Permission checking functions ─────────────────────────────────────────

  /**
   * Check Camera Permission
   */
  const checkCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    
    try {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      return granted;
    } catch (err) {
      console.warn('Error checking camera permission:', err);
      return false;
    }
  };

  /**
   * Request Camera Permission
   */
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'HandTrack needs camera access to detect hand gestures and track hand movements.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Error requesting camera permission:', err);
      return false;
    }
  };

  /**
   * Check Overlay Permission (SYSTEM_ALERT_WINDOW)
   */
  const checkOverlayPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      if (CursorControlModule?.checkOverlayPermission) {
        const hasPermission = await CursorControlModule.checkOverlayPermission();
        return hasPermission;
      }
      return true; // Assume granted if module not available
    } catch (err) {
      console.warn('Error checking overlay permission:', err);
      return false;
    }
  };

  /**
   * Request Overlay Permission
   */
  const requestOverlayPermission = async (): Promise<void> => {
    if (Platform.OS !== 'android') return;

    try {
      if (CursorControlModule?.requestOverlayPermission) {
        await CursorControlModule.requestOverlayPermission();
      }
    } catch (err) {
      console.warn('Error requesting overlay permission:', err);
    }
  };

  /**
   * Check Accessibility Permission
   */
  const checkAccessibilityPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      if (AccessibilityServiceModule?.checkAccessibilityPermission) {
        const hasPermission = await AccessibilityServiceModule.checkAccessibilityPermission();
        return hasPermission;
      }
      return false;
    } catch (err) {
      console.warn('Error checking accessibility permission:', err);
      return false;
    }
  };

  /**
   * Open Accessibility Settings
   */
  const openAccessibilitySettings = async (): Promise<void> => {
    if (Platform.OS !== 'android') return;

    try {
      if (AccessibilityServiceModule?.openAccessibilitySettings) {
        await AccessibilityServiceModule.openAccessibilitySettings();
      }
    } catch (err) {
      console.warn('Error opening accessibility settings:', err);
      Alert.alert(
        'Error',
        'Could not open accessibility settings. Please enable the HandTrack Gesture Service manually in Settings > Accessibility.'
      );
    }
  };

  /**
   * Check all permissions on mount
   */
  const checkAllPermissions = useCallback(async () => {
    setIsCheckingPermissions(true);
    
    try {
      const [camera, overlay, accessibility] = await Promise.all([
        checkCameraPermission(),
        checkOverlayPermission(),
        checkAccessibilityPermission(),
      ]);

      setPermissionStatus({
        camera,
        overlay,
        accessibility,
      });

      console.log('Permission Status:', { camera, overlay, accessibility });
    } catch (err) {
      console.error('Error checking permissions:', err);
    } finally {
      setIsCheckingPermissions(false);
    }
  }, []);

  /**
   * Request all required permissions
   */
  const requestAllPermissions = useCallback(async () => {
    try {
      // Request Camera Permission
      if (!permissionStatus.camera) {
        const cameraGranted = await requestCameraPermission();
        setPermissionStatus(prev => ({ ...prev, camera: cameraGranted }));
        
        if (!cameraGranted) {
          Alert.alert(
            'Camera Permission Required',
            'HandTrack needs camera access to detect hand gestures. Please grant camera permission to use this app.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      // Request Overlay Permission
      if (!permissionStatus.overlay) {
        Alert.alert(
          'Overlay Permission Required',
          'HandTrack needs permission to display over other apps to show the cursor overlay. Please grant this permission in the next screen.',
          [
            {
              text: 'Open Settings',
              onPress: async () => {
                await requestOverlayPermission();
                // Recheck after 2 seconds
                setTimeout(checkAllPermissions, 2000);
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }

      // Request Accessibility Permission
      if (!permissionStatus.accessibility) {
        Alert.alert(
          'Accessibility Service Required',
          'HandTrack needs accessibility service to perform gesture actions. Please enable "HandTrack Gesture Service" in Accessibility Settings.',
          [
            {
              text: 'Open Settings',
              onPress: async () => {
                await openAccessibilitySettings();
                // Recheck after 2 seconds
                setTimeout(checkAllPermissions, 2000);
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }

      Alert.alert(
        'All Permissions Granted',
        'All required permissions have been granted. You can now start using HandTrack!',
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.error('Error requesting permissions:', err);
      Alert.alert('Error', 'Failed to request permissions. Please try again.');
    }
  }, [permissionStatus, checkAllPermissions]);

  // ── Check permissions on mount ────────────────────────────────────────────
  useEffect(() => {
    // Small delay to ensure native modules are ready
    const timer = setTimeout(() => {
      checkAllPermissions();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // ── Start / Stop cursor + hand tracking ───────────────────────────────────
  const handleStart = useCallback(async () => {
    // Check all permissions before starting
    const allGranted = permissionStatus.camera && permissionStatus.overlay && permissionStatus.accessibility;
    
    if (!allGranted) {
      setStatus('permission_required');
      await requestAllPermissions();
      return;
    }

    try {
      CursorControlModule?.startCursor();
      setStatus('running');
    } catch (err) {
      console.error('Error starting cursor:', err);
      Alert.alert('Error', 'Failed to start cursor. Please try again.');
    }
  }, [permissionStatus, requestAllPermissions]);

  const handleStop = useCallback(() => {
    try {
      CursorControlModule?.stopCursor();
      setStatus('idle');
    } catch (err) {
      console.error('Error stopping cursor:', err);
    }
  }, []);

  // ── Get permission status badge color ─────────────────────────────────────
  const getPermissionBadgeColor = (granted: boolean) => {
    return granted ? '#27AE60' : '#E74C3C';
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0F1A" />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.appName}>✋ HandTrack</Text>
              <Text style={styles.appTagline}>Air Gesture Controller</Text>
            </View>
            <View style={[styles.statusBadge, status === 'running' && styles.statusBadgeActive]}>
              <View style={[styles.statusDot, status === 'running' && styles.statusDotActive]} />
              <Text style={styles.statusText}>
                {status === 'running' ? 'Active' : 'Idle'}
              </Text>
            </View>
          </View>

          {/* ── Gesture flash overlay ── */}
          <Animated.View
            pointerEvents="none"
            style={[styles.gestureFlash, { opacity: gestureFlashOpacity }]}
          >
            <Text style={styles.gestureFlashText}>{lastGesture}</Text>
          </Animated.View>

          {/* ── Permission Status Card ── */}
          {!isCheckingPermissions && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Permission Status</Text>
              <Text style={styles.cardDesc}>
                Grant all permissions below to use HandTrack features
              </Text>

              <View style={styles.permissionList}>
                <View style={styles.permissionRow}>
                  <Text style={styles.permissionLabel}>📷 Camera</Text>
                  <View style={[styles.permissionBadge, { backgroundColor: getPermissionBadgeColor(permissionStatus.camera) }]}>
                    <Text style={styles.permissionBadgeText}>
                      {permissionStatus.camera ? 'Granted' : 'Required'}
                    </Text>
                  </View>
                </View>

                <View style={styles.permissionRow}>
                  <Text style={styles.permissionLabel}>🪟 Overlay</Text>
                  <View style={[styles.permissionBadge, { backgroundColor: getPermissionBadgeColor(permissionStatus.overlay) }]}>
                    <Text style={styles.permissionBadgeText}>
                      {permissionStatus.overlay ? 'Granted' : 'Required'}
                    </Text>
                  </View>
                </View>

                <View style={styles.permissionRow}>
                  <Text style={styles.permissionLabel}>♿ Accessibility</Text>
                  <View style={[styles.permissionBadge, { backgroundColor: getPermissionBadgeColor(permissionStatus.accessibility) }]}>
                    <Text style={styles.permissionBadgeText}>
                      {permissionStatus.accessibility ? 'Granted' : 'Required'}
                    </Text>
                  </View>
                </View>
              </View>

              {!(permissionStatus.camera && permissionStatus.overlay && permissionStatus.accessibility) && (
                <TouchableOpacity
                  style={styles.buttonPermission}
                  onPress={requestAllPermissions}
                >
                  <Text style={styles.buttonText}>Grant Permissions</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.buttonRefresh}
                onPress={checkAllPermissions}
              >
                <Text style={styles.buttonRefreshText}>🔄 Refresh Status</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Main control card ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Cursor Control</Text>
            <Text style={styles.cardDesc}>
              Start tracking to overlay a native floating cursor on your screen.
              Hand position (index MCP) controls cursor movement in real time.
            </Text>

            <View style={styles.controlRow}>
              <TouchableOpacity
                style={[styles.button, status === 'running' && styles.buttonDanger]}
                onPress={status === 'running' ? handleStop : handleStart}
              >
                <Text style={styles.buttonText}>
                  {status === 'running' ? '⏹  Stop Cursor' : '▶  Start Cursor'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Gesture toggle */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Gesture Actions</Text>
              <Switch
                value={gesturesEnabled}
                onValueChange={setGesturesEnabled}
                trackColor={{ false: '#3A3D50', true: '#4F8EF7' }}
                thumbColor={gesturesEnabled ? '#ffffff' : '#8A8FA8'}
              />
            </View>
          </View>

          {/* ── Stats card ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Session Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{gestureCount}</Text>
                <Text style={styles.statLabel}>Gestures</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, styles.statGestureName]}>{lastGesture}</Text>
                <Text style={styles.statLabel}>Last Gesture</Text>
              </View>
            </View>
          </View>

          {/* ── Feature buttons ── */}
          <View style={styles.featureGrid}>
            {/* Air Keyboard */}
            <TouchableOpacity
              style={[styles.featureCard, styles.featureCardKeyboard]}
              onPress={() => setShowKeyboard(true)}
            >
              <Text style={styles.featureIcon}>⌨️</Text>
              <Text style={styles.featureTitle}>Air Keyboard</Text>
              <Text style={styles.featureDesc}>
                Dual-mode floating keyboard
              </Text>
              <View style={styles.featureModeBadge}>
                <Text style={styles.featureModeBadgeText}>
                  {require('react-native').Dimensions.get('window').width >= 600
                    ? '🖐 Spatial / Tablet'
                    : '☝️ Laser / Mobile'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Gesture Guide */}
            <TouchableOpacity
              style={[styles.featureCard, styles.featureCardGuide]}
              onPress={() => setShowGuide(true)}
            >
              <Text style={styles.featureIcon}>📖</Text>
              <Text style={styles.featureTitle}>Gesture Guide</Text>
              <Text style={styles.featureDesc}>
                Learn all 5 hand gestures
              </Text>
              <View style={[styles.featureModeBadge, styles.featureModeBadgeGuide]}>
                <Text style={styles.featureModeBadgeText}>5 gestures →</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ── Gesture quick-reference ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quick Reference</Text>
            {[
              { gesture: 'Thumb + Index pinch', action: 'Click / Tap' },
              { gesture: 'Thumb + Middle pinch', action: 'Go Back' },
              { gesture: 'Thumb + Ring pinch', action: 'Recent Apps' },
              { gesture: 'Open hand swipe', action: 'Scroll / Swipe' },
              { gesture: 'Fist → move → open', action: 'Drag & Drop' },
            ].map((item) => (
              <View key={item.action} style={styles.refRow}>
                <Text style={styles.refGesture}>{item.gesture}</Text>
                <Text style={styles.refAction}>{item.action}</Text>
              </View>
            ))}
          </View>

          {/* ── Typed text (from Air Keyboard) ── */}
          {typedText.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Air Keyboard Output</Text>
              <Text style={styles.typedText}>{typedText}</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* ── Modals ── */}
      <GestureGuideScreen
        visible={showGuide}
        onClose={() => setShowGuide(false)}
      />
      <AirKeyboard
        visible={showKeyboard}
        onClose={() => setShowKeyboard(false)}
        onTextChange={setTypedText}
        initialText={typedText}
      />
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0D0F1A',
  },
  container: { flex: 1 },
  scroll: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerLeft: {},
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 13,
    color: '#6B7094',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(39,174,96,0.15)',
    borderColor: 'rgba(39,174,96,0.4)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6B7094',
  },
  statusDotActive: {
    backgroundColor: '#27AE60',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gestureFlash: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    zIndex: 99,
    backgroundColor: 'rgba(79,142,247,0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  gestureFlashText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#1A1D2E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  cardDesc: {
    fontSize: 13,
    color: '#8A8FA8',
    lineHeight: 20,
    marginBottom: 14,
  },
  permissionList: {
    gap: 10,
    marginBottom: 14,
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  permissionLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  permissionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  permissionBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  buttonPermission: {
    backgroundColor: '#4F8EF7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonRefresh: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  buttonRefreshText: {
    color: '#8A8FA8',
    fontSize: 13,
    fontWeight: '600',
  },
  controlRow: {
    gap: 10,
  },
  button: {
    backgroundColor: '#4F8EF7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDanger: {
    backgroundColor: '#E74C3C',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  toggleLabel: {
    fontSize: 14,
    color: '#C8CEDE',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4F8EF7',
  },
  statGestureName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A29BFE',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7094',
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featureGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  featureCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    gap: 4,
  },
  featureCardKeyboard: {
    backgroundColor: 'rgba(79,142,247,0.10)',
    borderColor: 'rgba(79,142,247,0.25)',
  },
  featureCardGuide: {
    backgroundColor: 'rgba(155,89,182,0.10)',
    borderColor: 'rgba(155,89,182,0.25)',
  },
  featureIcon: { fontSize: 28 },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  featureDesc: {
    fontSize: 11,
    color: '#8A8FA8',
    lineHeight: 16,
  },
  featureModeBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(79,142,247,0.2)',
  },
  featureModeBadgeGuide: {
    backgroundColor: 'rgba(155,89,182,0.2)',
  },
  featureModeBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  refRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  refGesture: {
    flex: 1,
    fontSize: 13,
    color: '#8A8FA8',
  },
  refAction: {
    fontSize: 13,
    color: '#4F8EF7',
    fontWeight: '600',
  },
  typedText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 10,
  },
});

export default App;
