/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

const normalizeBaseUrl = (url: string): string => url.replace(/\/$/, '');

const envBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL as string | undefined;

// Default to relative path so dev proxy can forward to backend without CORS issues.
export const API_BASE_URL = normalizeBaseUrl(envBaseUrl || '/api/v1');
