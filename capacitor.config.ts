import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'papricut.app.mobile',
  appName: 'Papricut',
  webDir: 'www',
  bundledWebRuntime: false, // Recommended for Angular
  server: {
    hostname: 'papricut.com',
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: [
      'account.papricut.com',
      'api.papricut.com', // Add API subdomain
      'cdn.papricut.com'  // Add CDN if used
    ],
    cleartext: false // Force HTTPS
  },
  ios: {
    limitsNavigationsToAppBoundDomains: true,
    scheme: 'App',
    backgroundColor: '#d1388b',
    contentInset: 'automatic', // Better safe area handling
    cordovaLinkerFlags: ['-ObjC'] // Required for some plugins
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#d1388b',
    webContentsDebuggingEnabled: false // Disable in production
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500, // Reduced for better UX
      launchAutoHide: true,
      backgroundColor: '#d1388b',
      splashFullScreen: true,
      splashImmersive: true,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      iosSpinnerStyle: 'large',
      spinnerColor: '#ffffff',
      showSpinner: true,
      layoutName: 'launch_screen', // Explicit layout reference
      useDialog: false
    },
    CapacitorHttp: {
      enabled: true // Enable native HTTP if used
    }
  }
};

export default config;