import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL } from "@/config/api";
import {
  API_HEADERS,
  HTTP_CONFIG,
  STORAGE_KEYS,
} from "@/constants/appKeys";
import { logger } from "@/lib/logger";
import {
  clearSessionCookie,
  clearStoredAuthSession,
  establishSessionCookie,
} from "@/lib/session";

const REFRESH_TOKEN_ENDPOINT = "/auth/refresh-token";
const LOGIN_PATH = "/login";

let hasInitialized = false;
let refreshTokenPromise: Promise<string> | null = null;
let isHandlingRefreshFailure = false;

const PUBLIC_ENDPOINTS = [
  "/auth/init-session",
  "/auth/login",
  "/auth/register",
  "/auth/verify-otp",
  "/auth/resend-otp",
  "/auth/forgot-password",
  "/auth/verify-reset-otp",
  "/auth/reset-password",
  REFRESH_TOKEN_ENDPOINT,
  "/providers-config",
  "/oauth2/",
] as const;

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

interface RefreshTokenData {
  accessToken?: string;
  access_token?: string;
  "access-token"?: string;
  token?: string;
}

interface RefreshTokenResponse extends RefreshTokenData {
  data?: RefreshTokenData;
}

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: HTTP_CONFIG.DEFAULT_TIMEOUT_MS,
  headers: HTTP_CONFIG.DEFAULT_HEADERS,
});

const getStoredAuthToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

const isPublicRequest = (url?: string): boolean => {
  if (!url) {
    return false;
  }

  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

const persistRefreshedSession = async (accessToken: string): Promise<void> => {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);

  axios.defaults.headers.common[API_HEADERS.AUTHORIZATION] =
    `Bearer ${accessToken}`;

  // Middleware bảo vệ route bằng cookie access_token, nên cần cập nhật cookie
  // cùng lúc với localStorage sau khi backend cấp dynamic token mới.
  await establishSessionCookie(accessToken);
};

const requestNewAccessToken = async (): Promise<string> => {
  const token = getStoredAuthToken();

  if (!token) {
    throw new Error("Không tìm thấy dynamic token để làm mới phiên");
  }

  const response = await refreshClient.post<RefreshTokenResponse>(
    REFRESH_TOKEN_ENDPOINT,
    { refresh_token: token },
  );
  const refreshData = response.data.data ?? response.data;
  const accessToken =
    refreshData.accessToken ??
    refreshData.access_token ??
    refreshData["access-token"] ??
    refreshData.token;

  if (!accessToken) {
    throw new Error("API refresh token không trả về access token");
  }

  await persistRefreshedSession(accessToken);
  return accessToken;
};

const refreshAccessTokenOnce = (): Promise<string> => {
  if (!refreshTokenPromise) {
    refreshTokenPromise = requestNewAccessToken().finally(() => {
      refreshTokenPromise = null;
    });
  }

  return refreshTokenPromise;
};

const clearAuthStateAndRedirect = async (): Promise<void> => {
  if (isHandlingRefreshFailure || typeof window === "undefined") {
    return;
  }

  isHandlingRefreshFailure = true;

  clearStoredAuthSession();
  delete axios.defaults.headers.common[API_HEADERS.AUTHORIZATION];

  try {
    await clearSessionCookie();
  } catch (error) {
    logger.error("Không thể xóa cookie phiên qua logout API:", error);
  }

  const currentPath = window.location.pathname;
  if (currentPath.includes(LOGIN_PATH) || currentPath.includes("/api/")) {
    isHandlingRefreshFailure = false;
    return;
  }

  const returnUrl = `${currentPath}${window.location.search}`;
  window.location.href = `${LOGIN_PATH}?returnUrl=${encodeURIComponent(returnUrl)}`;
};

export const initializeAxios = (): void => {
  if (hasInitialized) {
    return;
  }

  logger.debug("Initializing axios with baseURL:", API_BASE_URL);

  axios.defaults.baseURL = API_BASE_URL;
  axios.defaults.withCredentials = true;
  axios.defaults.timeout = HTTP_CONFIG.DEFAULT_TIMEOUT_MS;
  axios.defaults.headers.common.Accept = HTTP_CONFIG.DEFAULT_HEADERS.Accept;
  axios.defaults.headers.common["Content-Type"] =
    HTTP_CONFIG.DEFAULT_HEADERS["Content-Type"];

  axios.interceptors.request.use((config) => {
    const token = getStoredAuthToken();

    if (isPublicRequest(config.url)) {
      delete config.headers[API_HEADERS.AUTHORIZATION];
      logger.debug("Public request, removing auth header:", config.url);
      return config;
    }

    if (token) {
      config.headers[API_HEADERS.AUTHORIZATION] = `Bearer ${token}`;
      logger.debug("Added auth header to request:", config.url);
    } else {
      logger.debug("No token found for request:", config.url);
    }

    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as
        | RetryableRequestConfig
        | undefined;

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        isPublicRequest(originalRequest.url)
      ) {
        return Promise.reject(error);
      }

      // Access token mới vẫn bị từ chối thì phiên không thể phục hồi thêm.
      if (originalRequest._retry) {
        await clearAuthStateAndRedirect();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const accessToken = await refreshAccessTokenOnce();
        originalRequest.headers[API_HEADERS.AUTHORIZATION] =
          `Bearer ${accessToken}`;

        return axios(originalRequest);
      } catch (refreshError) {
        logger.error("Refresh token thất bại:", refreshError);
        await clearAuthStateAndRedirect();
        return Promise.reject(refreshError);
      }
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

export default axios;
