import { WifiPolicy } from '@/data/mockData';

// ─── Shared envelope ────────────────────────────────────────────────────────
export interface UsersApiEnvelope<T> {
  code?: number;
  statusCode?: number;
  message?: string;
  data: T;
}

// ─── User list (GET /api/v1/users?role=) ────────────────────────────────────

/** OAuth account linked to a wifi user (V4 unified endpoint) */
export interface LinkedAccount {
  provider: string;
  providerEmail: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  lastUsedAt: string | null;
  isActive: boolean;
}

/** WiFi user entity returned by GET /api/v1/users */
export interface User {
  id: number;
  email: string;
  name: string;
  unit: string;
  created: string;
  role: string;
  status: string;
  macAddress: string | null;
  bandwidthPolicy: string | null;
  sessionPolicy: string | null;
  auditPolicy: string | null;
  securityPolicy: string | null;
  linkedAccounts: LinkedAccount[];
}

// ─── Auth/Me (GET /api/v1/auth/me) ──────────────────────────────────────────

/** OAuth provider linked to the currently-logged-in admin (V4) */
export interface LinkedProvider {
  provider: string;
  providerEmail: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  linkedAt: string;
  lastUsedAt: string | null;
}

/** Response shape of GET /api/v1/auth/me */
export interface MeResponse {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  avatarUrl: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  linkedProviders: LinkedProvider[];
}

// ─── Auth/ChangePassword (POST /api/v1/auth/change-password) ────────────────

export interface ChangePasswordRequest {
  currentPassword: string;
  /** Minimum 8 characters */
  newPassword: string;
  confirmPassword: string;
}

// ─── Auth/LinkProvider (POST /api/v1/auth/link-provider) ────────────────────

export interface LinkProviderRequest {
  /** "google" | "azure" */
  provider: string;
  /** sub (Google) or oid (Azure) */
  providerUserId: string;
  providerEmail?: string;
  avatarUrl?: string;
  accessToken?: string;
}

// ─── Re-exports ──────────────────────────────────────────────────────────────
export type { WifiPolicy };
