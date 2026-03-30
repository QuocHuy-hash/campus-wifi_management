export const STORAGE_KEYS = {
  AUTH_TOKEN: 'accessToken',
} as const;

export const HTTP_CONFIG = {
  DEFAULT_TIMEOUT_MS: 30_000,
  DEFAULT_HEADERS: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
} as const;

export const API_HEADERS = {
  AUTHORIZATION: 'Authorization',
} as const;
