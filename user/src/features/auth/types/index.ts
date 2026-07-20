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
  refreshToken: string | null;
  roles: string[];
}

export type CaptiveEntryMode = 'cna' | 'browser';

export interface CaptivePortalContext {
  id: string;
  ap: string;
  ssid: string;
  url: string;
  t?: string; // Optional timestamp parameter from controller
  entryMode: CaptiveEntryMode; // CNA (mini-browser của OS) hay browser thật — suy ra từ url
}

export interface AuthorizeDevicePayload {
  deviceMac: string;
  apMac: string;
  ssid: string;
  deviceType: string;     // LAPTOP | DESKTOP | MOBILE | TABLET | IOT | OTHER
  deviceName: string;     // Tên thiết bị
  userIpAddress: string;
  userAgent: string;
  duration: number;
  manufacturer: string;   // Hãng sản xuất (VD: Dell, Apple, Samsung)
  operatingSystem: string; // Hệ điều hành (VD: Windows 11, macOS 14, Android 14)
}

export interface ResendOtpPayload {
  identifier: string;
}

export interface ForgotPasswordPayload {
  identifier: string;
}

export interface VerifyResetOtpPayload {
  identifier: string;
  otp: string;
}

export type VerifyResetOtpResult = string;

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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

// Session types - Response from GET /api/v1/user-sessions/me
export interface DeviceUserInfo {
  deviceId: number;        // ID trong user_devices
  macAddress: string;      // MAC thiết bị
  deviceType: string | null; // VD: Laptop, Smartphone
  deviceName: string;      // VD: MacBook Pro
  userId: number;          // ID người dùng
  userName: string;        // Tên người dùng
  userGroup: string | null; // VD: Cán bộ cấp cao
  trafficIn: string | null; // Đã format (VD: 3.18 MB) — realtime từ UniFi
  trafficOut: string | null; // Đã format — realtime từ UniFi
  downloadBytes: string | null; // Lưu lượng download (đã format) — realtime từ UniFi
  uploadBytes: string | null;   // Lưu lượng upload (đã format) — realtime từ UniFi
  isOnline: boolean;       // Có online trên UniFi không?
  ssid: string;            // SSID realtime từ UniFi
  apMac: string;           // AP MAC realtime từ UniFi
}

export interface UserSession {
  sessionId: string;       // Mã session
  ipAddress: string;       // IP client
  startTime: string;       // ISO datetime
  endTime: string | null;  // null nếu ACTIVE
  status: 'ACTIVE' | 'ENDED' | 'EXPIRED' | 'FAILED'; // Trạng thái phiên
  createdAt: string;       // Thời gian tạo
  ssid: string;            // Tên SSID
  vlan: string;            // Tên VLAN
  apMac: string;           // MAC access point
  downloadBytes: number;   // Lưu lượng download (từ DB, sync 5p/lần)
  uploadBytes: number;     // Lưu lượng upload (từ DB, sync 5p/lần)
  terminateCause: string | null; // null nếu ACTIVE
  deviceUserInfo: DeviceUserInfo; // Thông tin thiết bị & user
}

export interface UserSessionPageResponse {
  current: number;         // Trang hiện tại
  size: number;            // Số bản ghi/trang
  total: number;           // Tổng số bản ghi
  pages: number;           // Tổng số trang
  records: UserSession[];  // Danh sách phiên
  orders: string[];        // Sorting (nếu có)
}

export interface UserSessionQueryParams {
  status?: string;         // Lọc theo trạng thái
  ssid?: string;           // Lọc theo SSID
  startDate?: string;      // Lọc từ ngày (yyyy-MM-dd)
  endDate?: string;        // Lọc đến ngày (yyyy-MM-dd)
  page?: number;           // Số trang (default: 1)
  size?: number;           // Số bản ghi/trang (default: 10)
}

// Usage types - Response from GET /api/v1/user-sessions/me/usage
export interface UserDailyUsage {
  date: string;                 // Ngày (yyyy-MM-dd)
  totalDownloadBytes: number;   // Tổng download (bytes)
  totalUploadBytes: number;     // Tổng upload (bytes)
  totalBytes: number;           // Tổng cộng (bytes)
}

export interface UserDailyUsageQueryParams {
  date?: string; // Ngày cần lấy (yyyy-MM-dd), mặc định hôm nay
}

// Device types - Response from GET /api/v1/users/devices
export interface UserDevice {
  id: number;
  deviceMacAddress: string;
  deviceType: string;
  deviceName: string;
  operatingSystem: string;
  manufacturer: string;
  firstSeenAt: string;
  lastSeenAt: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  lastIpAddress: string;
  lastSessionStatus: 'ACTIVE' | 'ENDED' | 'EXPIRED' | 'FAILED';
  isOnline: boolean;
}
