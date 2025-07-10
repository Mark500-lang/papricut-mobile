import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'papricut.app.mobile',
  appName: 'Papricut',
  webDir: 'www',
  // bundledWebRuntime: false,
  ios: {
    // You can leave this block empty or include valid Capacitor iOS options here
  },
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      backgroundColor: '#d1388b',
      splashFullScreen: true,
      splashImmersive: true,
      launchAutoHide: false,
      androidSplashResourceName: 'custom_splash',
    },
  },
};

export default config;
