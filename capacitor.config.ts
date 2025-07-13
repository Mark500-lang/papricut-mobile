import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'papricut.app.mobile',
  appName: 'Papricut',
  webDir: 'www',
  server: {
    hostname: 'papricut.com',
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: [
      'account.papricut.com',  // Explicit API domain
      'papricut.com'           // Public domain
    ]
  },
  ios: {
    limitsNavigationsToAppBoundDomains: true,
    scheme: 'App',
    backgroundColor: '#d1388b' // Fallback if splash plugin fails
  },
  android: {
    // Explicit Android configuration:
    allowMixedContent: false, // Force HTTPS
    backgroundColor: '#d1388b'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000, // REQUIRED for auto-hide (milliseconds)
      launchAutoHide: true,     // Recommended for production
      backgroundColor: '#d1388b',
      splashFullScreen: true,
      splashImmersive: true,
      androidSplashResourceName: 'splash', // Must match actual resource name
      androidScaleType: 'CENTER_CROP',     // Better image handling
      iosSpinnerStyle: 'large',           // iOS loading indicator
      spinnerColor: '#ffffff',            // Spinner color
      showSpinner: true                   // Enable loading indicator
    }
  }
};

export default config;