export const STORAGE_KEYS = {
  portalLoggedIn: "portalLoggedIn",
  portalUser: "portalUser",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
} as const;

export const HTTP_CONFIG = {
  timeout: 30000,
} as const;

export const API_HEADERS = {
  contentTypeJson: "application/json",
} as const;
