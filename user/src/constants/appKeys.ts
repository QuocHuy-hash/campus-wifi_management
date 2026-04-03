export const STORAGE_KEYS = {
  AUTH_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  portalLoggedIn: "portalLoggedIn",
  portalUser: "portalUser",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
} as const;

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
