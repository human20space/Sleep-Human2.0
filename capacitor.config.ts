import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.human2.sleep',
  appName: 'Human 2.0',
  webDir: 'dist',
  server: {
    url: 'https://sleep.human2.space',
    cleartext: false
  }
};

export default config;
