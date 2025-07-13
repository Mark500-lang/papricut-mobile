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
      'account.papricut.com',
      'api.papricut.com',
      'cdn.papricut.com'
    ],
    cleartext: false
  },
  ios: {
    limitsNavigationsToAppBoundDomains: true,
    scheme: 'App',
    backgroundColor: '#d1388b',
    contentInset: 'automatic',
    cordovaLinkerFlags: ['-ObjC']
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#d1388b',
    webContentsDebuggingEnabled: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0, // Immediate hide for faster navigation
      launchAutoHide: true,
      backgroundColor: '#d1388b',
      splashFullScreen: true,
      splashImmersive: true,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      iosSpinnerStyle: 'large',
      spinnerColor: '#ffffff',
      showSpinner: false, // Disable spinner for cleaner UX
      layoutName: 'launch_screen',
      useDialog: false
    },
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;