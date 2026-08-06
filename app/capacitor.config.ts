import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.opensource.openwarnde',
  appName: 'OpenWarnDE',
  webDir: 'out',

  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#EF6F2C',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      usingDialog: true,
    },
  },
};

export default config;