// =============================================
// POLICIES TYPES - HCMUS WiFi Management System
// Tổng hợp toàn bộ Types cho module Chính sách
// =============================================

// ============ ENUM / UNION TYPES ============

/** Loại người dùng áp dụng chính sách xác thực */
export type AuthUserType =
  | 'teacher'    // Cán bộ / Giảng viên
  | 'student'    // Sinh viên
  | 'guest_reg'  // Khách có đăng ký
  | 'guest_noreg'; // Khách vãng lai

/** Phương thức xác thực */
export type AuthMethod =
  | 'azure_ad'          // Microsoft Azure Active Directory
  | 'google_workspace'  // Google Workspace
  | 'email'             // Email / Mật khẩu
  | 'social'            // Mạng xã hội (Facebook, Google)
  | 'zalo'              // Zalo
  | 'local_db';         // Cơ sở dữ liệu nội bộ

/** Loại chính sách WiFi */
export type WifiPolicyType =
  | 'bandwidth'     // Giới hạn băng thông
  | 'auth'          // Xác thực
  | 'session'       // Quản lý phiên
  | 'audit'         // Kiểm toán / Ghi nhật ký
  | 'security'      // Bảo mật
  | 'authorization'; // Phân quyền VLAN / Access

// ============ IDENTITY PROVIDER CONFIG ============

/** Cấu hình nguồn dữ liệu xác thực bên ngoài (IdP) */
export interface IdPConfig {
  // Azure Active Directory
  azureTenantId?: string;
  azureClientId?: string;
  azureClientSecret?: string;

  // Google Workspace
  googleClientId?: string;
  googleClientSecret?: string;
  googleDomain?: string;

  // Mạng xã hội
  socialPlatform?: 'facebook' | 'google' | 'apple';
  socialAppId?: string;
  socialAppSecret?: string;
}

// ============ WIFI POLICY (Chính sách mạng tổng hợp) ============

/**
 * Chính sách WiFi - bao gồm Băng thông, Xác thực, Phiên, Kiểm toán, Bảo mật, Phân quyền.
 * Mỗi loại chính sách sẽ dùng một tập hợp con của các trường tùy theo `type`.
 */
export interface WifiPolicy {
  id: number;
  name: string;
  description: string;
  type: WifiPolicyType;
  isActive?: boolean;

  // Áp dụng theo đối tượng và thời gian
  applyToRoles: string[];       // Ví dụ: ['student', 'teacher']
  applyToArea?: string;          // Ví dụ: 'campus-a', 'lab'
  applyByTime?: string;          // Ví dụ: 'all', '6:00-22:00', 'T2-T6'

  // ----- Chính sách Băng thông (type: 'bandwidth') -----
  downloadLimit?: number;        // Mb/s tải xuống tối đa
  uploadLimit?: number;          // Mb/s tải lên tối đa

  // ----- Chính sách Phiên (type: 'session') -----
  maxSessionTime?: number;       // Phút - thời gian phiên tối đa
  maxSessionData?: number;       // MB - dữ liệu tối đa/phiên

  // ----- Chính sách Phân quyền / VLAN (type: 'authorization') -----
  vlanId?: number;               // VLAN ID được gán
  maxDailyData?: number;         // MB - lưu lượng tối đa/ngày
  idleTimeout?: number;          // Phút - timeout không hoạt động
  autoReLogin?: boolean;         // Tự động đăng nhập lại
  bindMacAddress?: boolean;      // Gắn với địa chỉ MAC

  // ----- Chính sách Kiểm toán (type: 'audit') -----
  auditMaxSessionTime?: number;
  auditMaxSessionTimeUnit?: 'minute' | 'hour';
  auditMaxDataUsage?: number;
  auditMaxDataUsageUnit?: 'MB' | 'GB';
  accountingInterval?: number;   // Giây - chu kỳ ghi nhận RADIUS
  accountingIntervalUnit?: 'second' | 'minute';
  logRetentionPeriod?: number;   // Thời gian lưu log
  logRetentionUnit?: 'month' | 'year';
  disconnectAction?: 'disconnect' | 'reauth' | 'notify';

  // ----- Chính sách Bảo mật (type: 'security') -----
  maxConcurrentDevices?: number; // Số thiết bị đồng thời tối đa
  macCachingEnabled?: boolean;   // Bật MAC Caching
  macCacheTime?: number;
  macCacheTimeUnit?: 'hour' | 'day';
  reAuthInterval?: number;       // Chu kỳ tái xác thực
  reAuthIntervalUnit?: 'hour' | 'day';
  allowUserMacManagement?: boolean;
  retryLimit?: number;           // Số lần thử lại tối đa khi sai thông tin
}

// ============ AUTH POLICY (Chính sách Xác thực) ============

/**
 * Chính sách Xác thực - định nghĩa phương thức đăng nhập cho từng nhóm người dùng.
 * Ví dụ: Sinh viên dùng Google Workspace, Khách dùng Zalo OTP.
 */
export interface AuthPolicy {
  id: number;
  name: string;
  description: string;
  isActive: boolean;

  // Đối tượng & phương thức
  userType: AuthUserType;
  authMethod: AuthMethod;

  // Cấu hình IdP (nếu dùng SSO bên ngoài)
  idpConfig?: IdPConfig;

  // Cài đặt bảo mật bổ sung
  require2FA: boolean;
  allowRegistration?: boolean;  // Cho phép khách tự đăng ký

  // Thời gian & phạm vi áp dụng
  applyByTime?: string;          // Ví dụ: 'all', '6:00-22:00'
  appliedAreas: string[];        // Ví dụ: ['ctrl:1', 'ap:AA:BB:CC:11:22:33']

  createdAt: string;
  updatedAt: string;
}

// ============ REDUX STATE TYPES ============

/** Redux State cho tab Chính sách WiFi tổng hợp */
export interface PoliciesState {
  data: WifiPolicy[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;

  // Bộ lọc
  filterRole: string;
  filterArea: string;
  filterTime: string;
  filterController: string;
  filterSearch: string;

  // Trạng thái Dialog
  addPolicyDialogOpen: boolean;
  editPolicyDialogOpen: boolean;
  deletePolicyDialogOpen: boolean;
  selectedPolicy: WifiPolicy | null;
  policyForm: Partial<WifiPolicy>;
}

/** Redux State cho tab Chính sách Xác thực */
export interface AuthPoliciesState {
  data: AuthPolicy[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;

  // Trạng thái Dialog
  addAuthPolicyDialogOpen: boolean;
  editAuthPolicyDialogOpen: boolean;
  deleteAuthPolicyDialogOpen: boolean;
  selectedAuthPolicy: AuthPolicy | null;
  authPolicyForm: Partial<AuthPolicy>;
  validationError: string | null;
}

// ============ UI OPTION TYPES ============

/** Tùy chọn dropdown dùng trong Filter và Form */
export interface PolicyOption {
  id: number;
  value: string;
  label: string;
  description?: string;
}
