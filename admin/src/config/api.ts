/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

const envBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const envAdminBaseUrl = import.meta.env.VITE_ADMIN_API_BASE_URL as string | undefined;

// In local dev, default to Vite proxy to avoid CORS issues.
export const API_BASE_URL = envBaseUrl?.trim() || '/api/v1';

// Admin API uses a separate base path per the API spec: /api/admin
export const ADMIN_API_BASE_URL = envAdminBaseUrl?.trim() || '/api/admin';
