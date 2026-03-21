module.exports = {
  name: 'HandTrackApp',
  slug: 'handtrackapp',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.anonymous.handtrackapp'
  },
  android: {
    package: 'com.anonymous.handtrackapp',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    permissions: [
      'android.permission.CAMERA',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.BIND_ACCESSIBILITY_SERVICE',
      'android.permission.INTERNET',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.VIBRATE'
    ]
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [
    './plugins/withAccessibilityService.js'
  ]
};
