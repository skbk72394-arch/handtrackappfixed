const {
  withAndroidManifest,
  AndroidConfig,
  withDangerousMod,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Custom Expo Config Plugin for Accessibility Service
 * This plugin modifies AndroidManifest.xml and creates the required XML config
 * during the prebuild process.
 */

/**
 * Add permissions to AndroidManifest.xml
 */
function addPermissions(androidManifest) {
  const { manifest } = androidManifest;

  if (!manifest['uses-permission']) {
    manifest['uses-permission'] = [];
  }

  const permissions = [
    'android.permission.CAMERA',
    'android.permission.SYSTEM_ALERT_WINDOW',
    'android.permission.BIND_ACCESSIBILITY_SERVICE',
  ];

  permissions.forEach((permission) => {
    const existingPermission = manifest['uses-permission'].find(
      (p) => p.$['android:name'] === permission
    );
    if (!existingPermission) {
      manifest['uses-permission'].push({
        $: {
          'android:name': permission,
        },
      });
    }
  });

  return androidManifest;
}

/**
 * Add Accessibility Service to AndroidManifest.xml
 */
function addAccessibilityService(androidManifest, packageName) {
  const { manifest } = androidManifest;

  if (!manifest.application) {
    manifest.application = [{}];
  }

  const application = manifest.application[0];

  if (!application.service) {
    application.service = [];
  }

  // Check if service already exists
  const existingService = application.service.find(
    (s) =>
      s.$['android:name'] === `${packageName}.MyAccessibilityService`
  );

  if (!existingService) {
    application.service.push({
      $: {
        'android:name': `${packageName}.MyAccessibilityService`,
        'android:permission': 'android.permission.BIND_ACCESSIBILITY_SERVICE',
        'android:exported': 'true',
        'android:enabled': 'true',
        'android:label': 'HandTrack Gesture Service',
      },
      'intent-filter': [
        {
          action: [
            {
              $: {
                'android:name': 'android.accessibilityservice.AccessibilityService',
              },
            },
          ],
        },
      ],
      'meta-data': [
        {
          $: {
            'android:name': 'android.accessibilityservice',
            'android:resource': '@xml/accessibility_service_config',
          },
        },
      ],
    });
  }

  return androidManifest;
}

/**
 * Modify AndroidManifest.xml
 */
const withAndroidManifestModifications = (config) => {
  return withAndroidManifest(config, async (config) => {
    const packageName = config.android?.package || 'com.anonymous.handtrackapp';
    
    // Add permissions
    config.modResults = addPermissions(config.modResults);
    
    // Add accessibility service
    config.modResults = addAccessibilityService(config.modResults, packageName);
    
    return config;
  });
};

/**
 * Create accessibility_service_config.xml file
 */
const withAccessibilityConfigXml = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const platformRoot = config.modRequest.platformProjectRoot;
      
      // Define the res/xml directory path
      const xmlDir = path.join(platformRoot, 'app/src/main/res/xml');
      
      // Create the directory if it doesn't exist
      if (!fs.existsSync(xmlDir)) {
        fs.mkdirSync(xmlDir, { recursive: true });
      }

      // Define the XML config content
      const accessibilityConfigXml = `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:accessibilityEventTypes="typeAllMask"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:accessibilityFlags="flagDefault|flagReportViewIds|flagRequestTouchExplorationMode|flagRequestEnhancedWebAccessibility"
    android:canPerformGestures="true"
    android:canRequestTouchExplorationMode="true"
    android:canRetrieveWindowContent="true"
    android:description="@string/accessibility_service_description"
    android:notificationTimeout="100"
    android:packageNames="com.android.systemui"
    android:settingsActivity="${config.android?.package || 'com.anonymous.handtrackapp'}.MainActivity" />
`;

      // Write the file
      const configPath = path.join(xmlDir, 'accessibility_service_config.xml');
      fs.writeFileSync(configPath, accessibilityConfigXml, 'utf-8');

      console.log('✅ Created accessibility_service_config.xml');

      return config;
    },
  ]);
};

/**
 * Add accessibility service description to strings.xml
 */
const withAccessibilityStrings = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const platformRoot = config.modRequest.platformProjectRoot;
      const stringsPath = path.join(
        platformRoot,
        'app/src/main/res/values/strings.xml'
      );

      if (fs.existsSync(stringsPath)) {
        let stringsContent = fs.readFileSync(stringsPath, 'utf-8');
        
        // Check if description already exists
        if (!stringsContent.includes('accessibility_service_description')) {
          // Add the description before closing </resources> tag
          const description = `    <string name="accessibility_service_description">HandTrack uses accessibility services to enable gesture-based control and hand tracking interactions. This allows you to control your device using hand gestures detected through the camera.</string>\n`;
          
          stringsContent = stringsContent.replace(
            '</resources>',
            `${description}</resources>`
          );
          
          fs.writeFileSync(stringsPath, stringsContent, 'utf-8');
          console.log('✅ Added accessibility service description to strings.xml');
        }
      }

      return config;
    },
  ]);
};

/**
 * Main plugin function
 */
const withAccessibilityService = (config) => {
  // Apply all modifications
  config = withAndroidManifestModifications(config);
  config = withAccessibilityConfigXml(config);
  config = withAccessibilityStrings(config);
  
  return config;
};

module.exports = withAccessibilityService;
