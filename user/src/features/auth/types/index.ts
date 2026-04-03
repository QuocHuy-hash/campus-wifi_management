export interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

export interface ProviderConfig {
  id: number;
  provider: string;
  displayName: string;
  iconUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export interface RegisterPayload {
  identifier: string;
  password: string;
}

export interface RegisterResult {
  id: number;
  email: string | null;
  fullName: string;
  status: "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED";
  emailVerified: boolean;
  createdAt: string;
  notice: string;
}

export interface VerifyOtpPayload {
  identifier: string;
  otp: string;
}

export interface VerifyOtpResult {
  identifier: string;
  status: "ACTIVE" | "PENDING" | "INACTIVE" | "SUSPENDED";
  verified: boolean;
  message: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  roles: string[];
}

export interface ResendOtpPayload {
  identifier: string;
}

export interface LinkedProvider {
  provider: string;
  providerEmail: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  linkedAt: string;
  lastUsedAt: string | null;
}

export interface MeResponse {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  avatarUrl: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  linkedProviders: LinkedProvider[];
}

export interface ApiErrorBody {
  timestamp?: number;
  code?: number;
  error?: string;
  message?: string;
  path?: string;
}
