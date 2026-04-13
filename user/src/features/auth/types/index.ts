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

export interface CaptivePortalContext {
  id: string;
  ap: string;
  ssid: string;
  url: string;
  t?: string; // Optional timestamp parameter from controller
}

export interface AuthorizeDevicePayload {
  deviceMac: string;
  apMac: string;
  ssid: string;
  deviceType: string;
  deviceName: string;
  userIpAddress: string;
  userAgent: string;
  duration: number;
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

export interface UserGroup {
  id: number;
  name: string;
  roleName: string;
}

export interface PolicySession {
  maxSessionDuration: number | null;
  idleTimeout: number | null;
  maxConcurrentSessions: number | null;
}

export interface PolicyBandwidth {
  maxDownloadMbps: number | null;
  maxUploadMbps: number | null;
}

export interface PolicySecurity {
  [key: string]: any;
}

export interface PolicyAuthorization {
  authType: string | null;
  allowedMethods: string[] | null;
}

export interface PolicyAudit {
  logConnections: boolean;
  logDisconnections: boolean;
  logAuthFailures: boolean;
  retentionDays: number;
}

export interface UserPolicy {
  id: number;
  name: string;
  type: string;
  isActive: boolean;
  session: PolicySession | null;
  bandwidth: PolicyBandwidth | null;
  security: PolicySecurity | null;
  authorization: PolicyAuthorization | null;
  audit: PolicyAudit | null;
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
  groups: UserGroup[];
  roles: string[];
  policies: UserPolicy[];
  linkedProviders: LinkedProvider[];
}

export interface ApiErrorBody {
  timestamp?: number;
  code?: number;
  error?: string;
  message?: string;
  path?: string;
}
