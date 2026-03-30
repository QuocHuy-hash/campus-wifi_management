import axios from 'axios';
import { API_HEADERS, HTTP_CONFIG, STORAGE_KEYS } from '@/constants/appKeys';

let hasInitialized = false;

const getStoredAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const initializeAxios = (): void => {
  if (hasInitialized) {
    return;
  }

  axios.defaults.timeout = HTTP_CONFIG.DEFAULT_TIMEOUT_MS;
  axios.defaults.headers.common.Accept = HTTP_CONFIG.DEFAULT_HEADERS.Accept;
  axios.defaults.headers.common['Content-Type'] = HTTP_CONFIG.DEFAULT_HEADERS['Content-Type'];

  axios.interceptors.request.use((config) => {
    const token = getStoredAuthToken();

    if (token) {
      config.headers = config.headers ?? {};
      config.headers[API_HEADERS.AUTHORIZATION] = `Bearer ${token}`;
    }

    return config;
  });

  hasInitialized = true;
};

export const setAxiosHeader = (key: string, value: string): void => {
  axios.defaults.headers.common[key] = value;
};

export const removeAxiosHeader = (key: string): void => {
  delete axios.defaults.headers.common[key];
};

export const setAxiosAuthToken = (token: string | null): void => {
  if (token) {
    setAxiosHeader(API_HEADERS.AUTHORIZATION, `Bearer ${token}`);
    return;
  }

  removeAxiosHeader(API_HEADERS.AUTHORIZATION);
};
