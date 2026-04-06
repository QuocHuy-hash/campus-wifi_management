import axios, { AxiosRequestConfig } from 'axios';
import { API_HEADERS, HTTP_CONFIG, STORAGE_KEYS } from '@/constants/appKeys';
import { adminRefreshTokenApi } from '@/features/auth/api/authApi';

let hasInitialized = false;
let unauthorizedHandler: (() => void) | null = null;
let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

const getStoredAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Register callback để xử lý 401 Unauthorized (sau khi refresh thất bại)
 * Thường dùng để dispatch logout action
 */
export const registerUnauthorizedHandler = (handler: () => void): void => {
  unauthorizedHandler = handler;
};

export const initializeAxios = (): void => {
  if (hasInitialized) return;

  axios.defaults.timeout = HTTP_CONFIG.DEFAULT_TIMEOUT_MS;
  axios.defaults.headers.common.Accept = HTTP_CONFIG.DEFAULT_HEADERS.Accept;
  axios.defaults.headers.common['Content-Type'] = HTTP_CONFIG.DEFAULT_HEADERS['Content-Type'];
  axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

  // Cho phép gửi cookies (admin_refresh_token) theo yêu cầu (CORS)
  // axios.defaults.withCredentials = true;

  // Request Interceptor: gán token vào Authorization header
  axios.interceptors.request.use(
    (config) => {
      const token = getStoredAuthToken();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers[API_HEADERS.AUTHORIZATION] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response Interceptor: xử lý 401 bằng cách thử refresh token
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // Chỉ thử refresh nếu:
      // 1. Lỗi 401
      // 2. Chưa retry request này
      // 3. Không phải chính request refresh-token (tránh vòng lặp vô hạn)
      const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh-token');
      if (error.response?.status === 401 && !originalRequest._retry && !isRefreshEndpoint) {
        if (isRefreshing) {
          // Có request khác đang refresh — xếp hàng chờ
          return new Promise((resolve) => {
            pendingRequests.push((newToken: string) => {
              if (originalRequest.headers) {
                originalRequest.headers[API_HEADERS.AUTHORIZATION] = `Bearer ${newToken}`;
              }
              resolve(axios(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshed = await adminRefreshTokenApi();
          const newToken = refreshed.accessToken;

          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
          setAxiosAuthToken(newToken);

          // Replay tất cả request đang chờ
          pendingRequests.forEach((cb) => cb(newToken));
          pendingRequests = [];

          // Retry original request
          if (originalRequest.headers) {
            originalRequest.headers[API_HEADERS.AUTHORIZATION] = `Bearer ${newToken}`;
          }
          return axios(originalRequest);
        } catch {
          // Refresh thất bại → logout
          pendingRequests = [];
          console.warn('Refresh token expired. Redirecting to login...');
          if (unauthorizedHandler) {
            unauthorizedHandler();
          }
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
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
