/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

const envBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

// In local dev, default to Vite proxy to avoid CORS issues.
export const API_BASE_URL = envBaseUrl?.trim() || '/api/v1';
