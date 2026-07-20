export const STORAGE_KEYS = {
  AUTH_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  portalLoggedIn: "portalLoggedIn",
  portalUser: "portalUser",
  portalCaptiveContext: "portalCaptiveContext",
  oauthProvider: "oauthProvider",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  currentDeviceMac: "currentDeviceMac",
  savedGuestLoginUsername: "savedGuestLoginUsername",
  // sessionStorage: bàn giao thông tin điều hướng sang /network-connecting sau khi register-device thành công
  captiveEntryMode: "captiveEntryMode",
  captiveOriginalUrl: "captiveOriginalUrl",
} as const;

export const AUTH_COOKIE_KEY = "access_token";

export const HTTP_CONFIG = {
  DEFAULT_TIMEOUT_MS: 30000,
  DEFAULT_HEADERS: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 30000,
} as const;

export const API_HEADERS = {
  AUTHORIZATION: "Authorization",
  contentTypeJson: "application/json",
} as const;
