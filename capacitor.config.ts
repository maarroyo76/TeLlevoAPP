import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tellevo.app',
  appName: 'Te Llevo APP',
  webDir: 'www',
  plugins: {
    GoogleMaps: {
      apiKey: 'AIzaSyDeLWnIYTm82oiKpfqz42CAjxWnP9gHjLs',
    },
  },
};

export default config;
