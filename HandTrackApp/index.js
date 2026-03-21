/**
 * HandTrack App Entry Point
 * 
 * This is the main entry point for the React Native application.
 * It wraps the app with PermissionGate to ensure safe startup and
 * prevent permission-related crashes.
 * 
 * The PermissionGate component:
 * - Checks all required permissions on startup
 * - Provides a user-friendly permission request flow
 * - Prevents crashes from missing native modules
 * - Only renders the main app once permissions are handled
 */

import { AppRegistry } from 'react-native';
import React from 'react';
import App from './App';
import PermissionGate from './src/components/PermissionGate';

/**
 * Root Component with Permission Protection
 * 
 * This component ensures that the app never crashes due to missing
 * permissions or unavailable native modules. The PermissionGate handles
 * all permission checks and requests before the main app is rendered.
 */
const RootComponent = () => {
  return (
    <PermissionGate>
      <App />
    </PermissionGate>
  );
};

// Register the root component with React Native
AppRegistry.registerComponent('HandTrackApp', () => RootComponent);
