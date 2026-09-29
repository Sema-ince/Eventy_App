import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Dynamically resolves the backend API base URL:
 */
const resolveApiBaseUrl = (): string => {
  // Laravel'in varsayılan portu
  const BACKEND_PORT = 8000;

  // 1. Try to get IP dynamically from Expo Go / Metro hostUri
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ??
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:${BACKEND_PORT}/api`;
    }
  }

  // 2. Bilgisayarının güncel Wi-Fi IP adresi
  const LOCAL_LAN_IP = '10.196.17.60';

  // 3. Platform-specific fallbacks
  if (Platform.OS === 'android') {
    return `http://${LOCAL_LAN_IP}:${BACKEND_PORT}/api`;
  }

  return `http://${LOCAL_LAN_IP}:${BACKEND_PORT}/api`;
};

export const API_BASE_URL = resolveApiBaseUrl();

if (__DEV__) {
  console.log(`🌐 [Evently Config] Active API Base URL: ${API_BASE_URL}`);
}

export const ASYNC_STORAGE_KEYS = {
  AUTH_TOKEN: '@evently_auth_token',
  USER_DATA: '@evently_user_data',
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  FEATURED_LIMIT: 6,
} as const;