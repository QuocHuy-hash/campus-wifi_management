import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { API_HEADERS, HTTP_CONFIG, STORAGE_KEYS } from '@/constants/appKeys';

let hasInitialized = false;
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-otp',
  '/auth/resend-otp',
  '/providers-config',
  '/oauth2/',
] as const;

const getStoredAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  console.log('🔑 getStoredAuthToken:', token ? 'Token exists' : 'No token');
  return token;
};

const isPublicRequest = (url?: string): boolean => {
  if (!url) {
    return false;
  }

  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

export const initializeAxios = (): void => {
  if (hasInitialized) {
    return;
  }

  axios.defaults.baseURL = API_BASE_URL;
  axios.defaults.withCredentials = true;
  axios.defaults.timeout = HTTP_CONFIG.DEFAULT_TIMEOUT_MS;
  axios.defaults.headers.common.Accept = HTTP_CONFIG.DEFAULT_HEADERS.Accept;
  axios.defaults.headers.common['Content-Type'] = HTTP_CONFIG.DEFAULT_HEADERS['Content-Type'];
  // axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

  axios.interceptors.request.use((config) => {
    const token = getStoredAuthToken();

    if (isPublicRequest(config.url)) {
      if (config.headers) {
        delete config.headers[API_HEADERS.AUTHORIZATION];
      }
      console.log('🌐 Public request, removing auth header:', config.url);
      return config;
    }

    if (token) {
      config.headers = config.headers ?? {};
      config.headers[API_HEADERS.AUTHORIZATION] = `Bearer ${token}`;
      console.log('🔐 Added auth header to request:', config.url);
    } else {
      console.log('⚠️ No token found for request:', config.url);
    }

    return config;
  });

  // Response interceptor for handling 401 (token expired)
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // Check if it's a 401 error and not already retried
      if (error.response?.status === 401 && !originalRequest._retry) {
        console.log('🔒 Token expired, redirecting to login...');
        originalRequest._retry = true;
        
        // Clear auth state
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.accessToken);
        localStorage.removeItem(STORAGE_KEYS.refreshToken);
        localStorage.removeItem(STORAGE_KEYS.portalLoggedIn);
        localStorage.removeItem(STORAGE_KEYS.portalUser);
        
        // Get current URL for return
        const currentPath = window.location.pathname;
        const searchParams = window.location.search;
        
        // Only redirect if not already on login page
        if (!currentPath.includes('/login')) {
          window.location.href = `/login?returnUrl=${encodeURIComponent(currentPath + searchParams)}`;
        }
        
        return Promise.reject(error);
      }
      
      return Promise.reject(error);
    }
  );

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

export default axios;
