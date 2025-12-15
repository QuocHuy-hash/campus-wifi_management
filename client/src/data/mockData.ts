// ==========================================
// MOCK DATA - HCMUS WiFi Management System
// ==========================================

// ============ TYPES ============

// Access Points Types
export interface AP {
  id: number;
  name: string;
  location: string;
  building: string;
  uptime: string;
  ipModel: string;
  controller: string;
  clients: number;
  usage: number;
  status: "Online" | "Offline" | "Warning";
  usagePercent: number;
}

export interface Controller {
  id: number;
  name: string;
  ipAddress: string;
  version: string;
  status: "Online" | "Offline" | "Warning";
  apCount: number;
  totalClients: number;
  location: string;
}

// Area/Location Types
export interface Campus {
  id: number;
  name: string;
  code: string;
  address?: string;
  description?: string;
}

export interface Building {
  id: number;
  campusId: number;
  name: string;
  code: string;
  floors?: number;
  description?: string;
}

export interface AreaLocation {
  id: string;
  label: string;
  campusName: string;
  buildingName: string;
}

// Admin & Policy Types
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  status: "Active" | "Locked";
  group: string;
  accessTimeLimit?: string;
}

export interface WifiPolicy {
  id: number;
  name: string;
  description: string;
  type: "bandwidth" | "auth" | "session" | "audit" | "security" | "authorization";
  downloadLimit?: number;
  uploadLimit?: number;
  maxSessionTime?: number;
  maxSessionData?: number;
  applyToRoles: string[];
  applyToArea?: string;
  applyByTime?: string;
  // Authorization policy specific fields
  vlanId?: number;
  maxDailyData?: number; // Lưu lượng tối đa/ngày (MB/GB)
  idleTimeout?: number; // Timeout không hoạt động (phút)
  autoReLogin?: boolean; // Cho phép đăng nhập lại tự động
  bindMacAddress?: boolean; // Gắn với MAC address
  isActive?: boolean; // Trạng thái Bật/Tắt
  // Audit policy specific fields
  auditMaxSessionTime?: number; // Giới hạn thời gian phiên (phút)
  auditMaxSessionTimeUnit?: "minute" | "hour";
  auditMaxDataUsage?: number; // Giới hạn tổng dung lượng (MB)
  auditMaxDataUsageUnit?: "MB" | "GB";
  accountingInterval?: number; // Chu kỳ ghi nhận (giây)
  accountingIntervalUnit?: "second" | "minute";
  logRetentionPeriod?: number; // Thời gian lưu trữ logs
  logRetentionUnit?: "month" | "year";
  disconnectAction?: "disconnect" | "reauth" | "notify"; // Hành động ngắt kết nối
  // Security policy specific fields
  maxConcurrentDevices?: number; // Giới hạn thiết bị đồng thời
  macCachingEnabled?: boolean; // Bật/tắt MAC Caching
  macCacheTime?: number; // Thời gian cache MAC
  macCacheTimeUnit?: "hour" | "day"; // Đơn vị thời gian cache
  reAuthInterval?: number; // Thời gian tái xác thực
  reAuthIntervalUnit?: "hour" | "day"; // Đơn vị tái xác thực
  allowUserMacManagement?: boolean; // Cho phép user quản lý MAC
  retryLimit?: number; // Số lần thử lại tối đa
}

export interface Permission {
  resource: string;
  canView: boolean;
  canEdit: boolean;
}

// Authentication Policy Types
export type AuthUserType = 'teacher' | 'student' | 'guest_reg' | 'guest_noreg';
export type AuthMethod = 'azure_ad' | 'google_workspace' | 'email' | 'social' | 'zalo' | 'local_db';

export interface IdPConfig {
  // Azure AD
  azureTenantId?: string;
  azureClientId?: string;
  azureClientSecret?: string;
  
  // Google Workspace
  googleClientId?: string;
  googleClientSecret?: string;
  googleDomain?: string;
  
  // Social
  socialPlatform?: 'facebook' | 'google' | 'apple';
  socialAppId?: string;
  socialAppSecret?: string;
}

export interface AuthPolicy {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  
  // User & Method
  userType: AuthUserType;
  authMethod: AuthMethod;
  
  // IdP Config
  idpConfig?: IdPConfig;
  
  // Additional Config
  require2FA: boolean;
  allowRegistration?: boolean; // For guests
  applyByTime?: string; // 'all', '6-22', etc.
  appliedAreas: string[]; // 'all', 'cs1', 'ap:1', etc.
  
  createdAt: string;
  updatedAt: string;
}

export interface UserGroup {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface LogEntry {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  type: "access" | "error" | "config" | "account";
}

// ============ MOCK DATA ============

// Campuses
export const initialCampuses: Campus[] = [
  {
    id: 1,
    name: "Cơ sở Dĩ An",
    code: "DA",
    address: "Khu phố 6, P. Linh Trung, Thủ Đức, HCM",
    description: "Cơ sở chính tại Dĩ An",
  },
  {
    id: 2,
    name: "Cơ sở Thủ Đức",
    code: "TD",
    address: "Khu phố 6, P. Linh Trung, Thủ Đức, HCM",
    description: "Cơ sở Thủ Đức",
  },
  {
    id: 3,
    name: "Cơ sở 227 NVC",
    code: "227NVC",
    address: "227 Nguyễn Văn Cừ, Q.5, HCM",
    description: "Cơ sở trung tâm thành phố",
  },
];
// users 
export interface User {
  id: number;
  email: string;
  name: string;
  unit: string;
  created: string;
  role: string;
  status: string;
  macAddress: string;
  bandwidthPolicy: string;
  sessionPolicy: string;
  auditPolicy: string;
  securityPolicy: string;
}

export const initialUsers: User[] = [
  {
    id: 1,
    email: '10011@student.hcmus.edu.vn',
    name: 'Nguyễn Văn Minh',
    unit: 'Khoa CNTT',
    created: '2024-01-15',
    role: 'Sinh viên',
    status: 'Active',
    macAddress: 'AA:BB:CC:DD:EE:01',
    bandwidthPolicy: 'Băng thông Sinh viên',
    sessionPolicy: 'Sinh viên - AUTHZ_Standard',
    auditPolicy: 'Accounting Policy - Sinh viên 8H',
    securityPolicy: 'SEC_Sinh_viên_Standard',
  },
  {
    id: 2,
    email: '10012@student.hcmus.edu.vn',
    name: 'Trần Thị Hương',
    unit: 'Khoa Toán',
    created: '2024-01-14',
    role: 'Sinh viên',
    status: 'Active',
    macAddress: 'AA:BB:CC:DD:EE:02',
    bandwidthPolicy: 'Băng thông Sinh viên',
    sessionPolicy: 'Sinh viên - AUTHZ_Standard',
    auditPolicy: 'Accounting Policy - Sinh viên 8H',
    securityPolicy: 'SEC_Sinh_viên_Standard',
  },
  {
    id: 3,
    email: 'admin@hcmus.edu.vn',
    name: 'Phạm Văn Tuấn',
    unit: 'Phòng Công nghệ Thông tin',
    created: '2024-01-10',
    role: 'Cán bộ',
    status: 'Active',
    macAddress: 'AA:BB:CC:DD:EE:03',
    bandwidthPolicy: 'Băng thông Cán bộ',
    sessionPolicy: 'AUTHZ_Cán_bộ_VIP',
    auditPolicy: 'Accounting Policy - Sinh viên 8H', // Fallback as no specific Teacher audit
    securityPolicy: 'SEC_Cán_bộ_Premium',
  },
  {
    id: 4,
    email: '10013@student.hcmus.edu.vn',
    name: 'Lê Quốc Huy',
    unit: 'Khoa Hóa',
    created: '2024-01-12',
    role: 'Sinh viên',
    status: 'Disabled',
    macAddress: 'AA:BB:CC:DD:EE:04',
    bandwidthPolicy: 'Băng thông Sinh viên',
    sessionPolicy: 'Sinh viên - AUTHZ_Standard',
    auditPolicy: 'Accounting Policy - Sinh viên 8H',
    securityPolicy: 'SEC_Sinh_viên_Standard',
  },
  {
    id: 5,
    email: 'guest@example.com',
    name: 'Khách Vãng lai',
    unit: 'Ngoài',
    created: '2024-01-11',
    role: 'Khách',
    status: 'Active',
    macAddress: '',
    bandwidthPolicy: 'Băng thông Khách',
    sessionPolicy: 'AUTHZ_Khách_Portal',
    auditPolicy: 'Accounting Policy - Khách 2H',
    securityPolicy: 'SEC_Khách_Restricted',
  },
  {
    id: 6,
    email: '10014@student.hcmus.edu.vn',
    name: 'Võ Minh Tâm',
    unit: 'Khoa Vật lý',
    created: '2024-01-09',
    role: 'Sinh viên',
    status: 'Active',
    macAddress: 'AA:BB:CC:DD:EE:06',
    bandwidthPolicy: 'Băng thông Sinh viên',
    sessionPolicy: 'Sinh viên - AUTHZ_Standard',
    auditPolicy: 'Accounting Policy - Sinh viên 8H',
    securityPolicy: 'SEC_Sinh_viên_Standard',
  },
];

// Buildings
export const initialBuildings: Building[] = [
  // Dĩ An Campus
  {
    id: 1,
    campusId: 1,
    name: "Tòa nhà A",
    code: "A",
    floors: 7,
    description: "Khu giảng đường và phòng học chính",
  },
  {
    id: 2,
    campusId: 1,
    name: "Tòa nhà B",
    code: "B",
    floors: 5,
    description: "Khu văn phòng và phòng thí nghiệm",
  },
  {
    id: 3,
    campusId: 1,
    name: "Tòa nhà C",
    code: "C",
    floors: 4,
    description: "Khu ký túc xá sinh viên",
  },
  {
    id: 4,
    campusId: 1,
    name: "Thư viện",
    code: "LIB",
    floors: 3,
    description: "Thư viện và trung tâm học liệu",
  },
  {
    id: 5,
    campusId: 1,
    name: "Nhà điều hành",
    code: "NDH",
    floors: 5,
    description: "Khu điều hành và hành chính",
  },
  // Thủ Đức Campus
  {
    id: 6,
    campusId: 2,
    name: "Tòa nhà E",
    code: "E",
    floors: 6,
    description: "Khu giảng đường",
  },
  {
    id: 7,
    campusId: 2,
    name: "Tòa nhà F",
    code: "F",
    floors: 4,
    description: "Khu thí nghiệm CNTT",
  },
  // 227 NVC Campus
  {
    id: 8,
    campusId: 3,
    name: "Tòa nhà chính",
    code: "MAIN",
    floors: 8,
    description: "Tòa nhà chính 227 NVC",
  },
  {
    id: 9,
    campusId: 3,
    name: "Nhà I",
    code: "I",
    floors: 11,
    description: "Nhà I - 11 tầng",
  },
  {
    id: 10,
    campusId: 3,
    name: "Giảng đường",
    code: "GD",
    floors: 3,
    description: "Khu giảng đường",
  },
  {
    id: 11,
    campusId: 3,
    name: "Phòng Server",
    code: "SERVER",
    floors: 1,
    description: "Phòng máy chủ",
  },
  {
    id: 12,
    campusId: 3,
    name: "Phòng IT",
    code: "IT",
    floors: 1,
    description: "Phòng IT",
  },
];

// Controllers
export const initialControllers: Controller[] = [
  {
    id: 1,
    name: "UniFi 1",
    ipAddress: "172.29.99.254",
    version: "7.4.156",
    status: "Online",
    apCount: 4,
    totalClients: 438,
    location: "Cơ sở 227 NVC - Phòng Server",
  },
  {
    id: 2,
    name: "UniFi 2",
    ipAddress: "10.29.29.254",
    version: "7.4.156",
    status: "Online",
    apCount: 2,
    totalClients: 133,
    location: "Cơ sở 227 NVC - Phòng IT",
  },
  {
    id: 3,
    name: "UniFi 3",
    ipAddress: "172.29.100.254",
    version: "7.3.83",
    status: "Warning",
    apCount: 2,
    totalClients: 173,
    location: "Cơ sở Dĩ An - Nhà điều hành",
  },
];

// Authentication
// Authentication Policy Helper Types
export interface AuthOption {
  id: number;
  value: string;
  label: string;
  description?: string;
}

export const authUserTypeOptions: AuthOption[] = [
  { id: 1, value: "teacher", label: "Cán bộ/Giáo viên", description: "Giảng viên và cán bộ nhân viên" },
  { id: 2, value: "student", label: "Sinh viên", description: "Sinh viên chính quy và liên thông" },
  { id: 3, value: "guest_reg", label: "Khách (Có đăng ký)", description: "Khách đã được cấp tài khoản" },
  { id: 4, value: "guest_noreg", label: "Khách (Vãng lai)", description: "Khách chưa có tài khoản" },
];

export const authMethodOptions: AuthOption[] = [
  { id: 1, value: "azure_ad", label: "Microsoft Azure AD", description: "Sử dụng tài khoản Office 365" },
  { id: 2, value: "google_workspace", label: "Google Workspace", description: "Sử dụng Gmail tổ chức" },
  { id: 3, value: "email", label: "Email & Password", description: "Đăng nhập bằng Email cá nhân" },
  { id: 4, value: "social", label: "Mạng xã hội", description: "Facebook, Google, Apple" },
  { id: 5, value: "zalo", label: "Zalo OA", description: "Xác thực qua Zalo" },
  { id: 6, value: "local_db", label: "Tài khoản nội bộ", description: "Database cục bộ" },
];

// Auth Policies
export const initialAuthPolicies: AuthPolicy[] = [
  {
    id: 1,
    name: "Cán bộ - LDAP/Azure",
    description: "Xác thực cán bộ qua Azure AD",
    isActive: true,
    userType: 'teacher',
    authMethod: 'azure_ad',
    idpConfig: {
      azureTenantId: "tenant-123",
      azureClientId: "client-abc",
    },
    require2FA: true,
    applyByTime: 'all',
    appliedAreas: ['all'],
    createdAt: "2023-01-01",
    updatedAt: "2023-06-15"
  },
  {
    id: 2,
    name: "Sinh viên - Google",
    description: "Xác thực sinh viên qua Google Workspace",
    isActive: true,
    userType: 'student',
    authMethod: 'google_workspace',
    idpConfig: {
      googleClientId: "google-client-123",
      googleDomain: "hcmus.edu.vn"
    },
    require2FA: false,
    applyByTime: '8:00-17:00',
    appliedAreas: ['all'],
    createdAt: "2023-01-01",
    updatedAt: "2023-08-20"
  },
  {
    id: 3,
    name: "Khách - Social",
    description: "Khách đăng nhập qua Facebook",
    isActive: true,
    userType: 'guest_reg',
    authMethod: 'social',
    idpConfig: {
      socialPlatform: 'facebook',
      socialAppId: "fb-app-123"
    },
    require2FA: false,
    allowRegistration: true,
    appliedAreas: ['DA', 'TD'],
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01"
  }
];

// Authentication Source Types for dropdown
export const authSourceTypes = [
  { value: "azure_ad", label: "Azure AD" },
  { value: "google_workspace", label: "Google Workspace" },
  { value: "ldap", label: "LDAP Server" },
  { value: "radius", label: "RADIUS Server" },
  { value: "local_db", label: "Local Database" },
  { value: "guest_db", label: "Guest Portal Database" },
];

// Access Points
export const initialAPs: AP[] = [
  {
    id: 1,
    name: "GD1-01",
    location: "Giảng đường 1",
    building: "227 NVC",
    uptime: "15h00 1days",
    ipModel: "172.29.99.1 - AC Mesh Pro",
    controller: "UniFi 1",
    clients: 112,
    usage: 90,
    status: "Online",
    usagePercent: 90,
  },
  {
    id: 2,
    name: "I1-01",
    location: "Sảnh nhà I",
    building: "227NVC",
    uptime: "03h15 98days",
    ipModel: "172.29.99.2 - AC Pro 7",
    controller: "UniFi 1",
    clients: 69,
    usage: 88,
    status: "Online",
    usagePercent: 88,
  },
  {
    id: 3,
    name: "I11-01",
    location: "Nhà I lầu 11",
    building: "227NVC",
    uptime: "05h00 1days",
    ipModel: "172.29.99.9 - AC Mesh Pro",
    controller: "UniFi 1",
    clients: 225,
    usage: 92,
    status: "Warning",
    usagePercent: 92,
  },
  {
    id: 4,
    name: "F103-02",
    location: "Nhà F",
    building: "227NVC",
    uptime: "01h00 1days",
    ipModel: "10.29.29.5 - U7 Pro",
    controller: "UniFi 2",
    clients: 88,
    usage: 70,
    status: "Online",
    usagePercent: 70,
  },
  {
    id: 5,
    name: "GD2-01",
    location: "Giảng đường 2",
    building: "227NVC",
    uptime: "03h00 0days",
    ipModel: "10.29.29.6 - U7 Pro",
    controller: "UniFi 2",
    clients: 45,
    usage: 55,
    status: "Offline",
    usagePercent: 55,
  },
  {
    id: 6,
    name: "A1-01",
    location: "Nhà A Tầng 1",
    building: "227NVC",
    uptime: "12h30 5days",
    ipModel: "172.29.99.10 - AC Lite",
    controller: "UniFi 1",
    clients: 32,
    usage: 45,
    status: "Online",
    usagePercent: 45,
  },
  {
    id: 7,
    name: "B2-03",
    location: "Nhà B Tầng 2",
    building: "Dĩ An",
    uptime: "08h45 3days",
    ipModel: "172.29.99.15 - AC Pro",
    controller: "UniFi 3",
    clients: 78,
    usage: 82,
    status: "Warning",
    usagePercent: 82,
  },
  {
    id: 8,
    name: "C3-02",
    location: "Nhà C Tầng 3",
    building: "Dĩ An",
    uptime: "20h00 7days",
    ipModel: "172.29.99.20 - U6 Pro",
    controller: "UniFi 3",
    clients: 95,
    usage: 78,
    status: "Online",
    usagePercent: 78,
  },
];

// Admin Users
export const initialAdminUsers: AdminUser[] = [
  {
    id: 1,
    username: "superadmin",
    email: "superadmin@hcmus.edu.vn",
    role: "Super Admin",
    status: "Active",
    group: "Quản trị viên cấp cao",
  },
  {
    id: 2,
    username: "admin_it",
    email: "admin_it@hcmus.edu.vn",
    role: "Admin",
    status: "Active",
    group: "Quản trị viên",
  },
  {
    id: 3,
    username: "tech_user",
    email: "tech@hcmus.edu.vn",
    role: "Nhân viên IT",
    status: "Active",
    group: "Nhóm kỹ thuật",
  },
  {
    id: 4,
    username: "monitor_user",
    email: "monitor@hcmus.edu.vn",
    role: "Người giám sát",
    status: "Locked",
    group: "Nhóm giám sát",
  },
];

// WiFi Policies
export const initialPolicies: WifiPolicy[] = [
  {
    id: 1,
    name: "Băng thông Sinh viên",
    description: "Giới hạn băng thông cho sinh viên",
    type: "bandwidth",
    downloadLimit: 10,
    uploadLimit: 5,
    applyToRoles: ["Sinh viên"],
  },
  {
    id: 2,
    name: "Băng thông Cán bộ",
    description: "Băng thông cao cấp cho cán bộ",
    type: "bandwidth",
    downloadLimit: 50,
    uploadLimit: 20,
    applyToRoles: ["Cán bộ"],
  },
  {
    id: 13,
    name: "Băng thông Khách",
    description: "Giới hạn băng thông cho khách",
    type: "bandwidth",
    downloadLimit: 5,
    uploadLimit: 2,
    applyToRoles: ["Khách"],
  },
  {
    id: 3,
    name: "Phiên Sinh viên",
    description: "Thời gian phiên cho sinh viên",
    type: "session",
    maxSessionTime: 480,
    maxSessionData: 5000,
    applyToRoles: ["Sinh viên"],
  },
  {
    id: 4,
    name: "Phiên Khách",
    description: "Thời gian phiên cho khách",
    type: "session",
    maxSessionTime: 120,
    maxSessionData: 1000,
    applyToRoles: ["Khách"],
  },
  {
    id: 5,
    name: "Accounting Policy - Sinh viên 8H",
    description: "Chính sách kiểm toán cho sinh viên với giới hạn 8 giờ",
    type: "audit",
    applyToRoles: ["Sinh viên"],
    auditMaxSessionTime: 8,
    auditMaxSessionTimeUnit: "hour",
    auditMaxDataUsage: 5,
    auditMaxDataUsageUnit: "GB",
    accountingInterval: 60,
    accountingIntervalUnit: "second",
    logRetentionPeriod: 12,
    logRetentionUnit: "month",
    disconnectAction: "reauth",
  },
  {
    id: 6,
    name: "Accounting Policy - Khách 2H",
    description: "Chính sách kiểm toán cho khách với giới hạn 2 giờ",
    type: "audit",
    applyToRoles: ["Khách"],
    auditMaxSessionTime: 2,
    auditMaxSessionTimeUnit: "hour",
    auditMaxDataUsage: 1,
    auditMaxDataUsageUnit: "GB",
    accountingInterval: 30,
    accountingIntervalUnit: "second",
    logRetentionPeriod: 6,
    logRetentionUnit: "month",
    disconnectAction: "disconnect",
  },
  {
    id: 7,
    name: "SEC_Sinh_viên_Standard",
    description: "Chính sách bảo mật tiêu chuẩn cho sinh viên",
    type: "security",
    applyToRoles: ["Sinh viên"],
    maxConcurrentDevices: 3,
    macCachingEnabled: true,
    macCacheTime: 24,
    macCacheTimeUnit: "hour",
    reAuthInterval: 7,
    reAuthIntervalUnit: "day",
    allowUserMacManagement: true,
    retryLimit: 5,
  },
  {
    id: 8,
    name: "SEC_Cán_bộ_Premium",
    description: "Chính sách bảo mật nâng cao cho cán bộ",
    type: "security",
    applyToRoles: ["Cán bộ"],
    maxConcurrentDevices: 5,
    macCachingEnabled: true,
    macCacheTime: 30,
    macCacheTimeUnit: "day",
    reAuthInterval: 30,
    reAuthIntervalUnit: "day",
    allowUserMacManagement: true,
    retryLimit: 10,
  },
  {
    id: 9,
    name: "SEC_Khách_Restricted",
    description: "Chính sách bảo mật hạn chế cho khách",
    type: "security",
    applyToRoles: ["Khách"],
    maxConcurrentDevices: 1,
    macCachingEnabled: false,
    reAuthInterval: 4,
    reAuthIntervalUnit: "hour",
    allowUserMacManagement: false,
    retryLimit: 3,
  },
  {
    id: 10,
    name: "Sinh viên - AUTHZ_Standard",
    description: "Chính sách cấp quyền mặc định cho sinh viên",
    type: "authorization",
    applyToRoles: ["Sinh viên"],
    vlanId: 10,
    downloadLimit: 20,
    uploadLimit: 20,
    maxSessionTime: 4, // 4 hours
    maxDailyData: 5, // 5 GB
    idleTimeout: 30, // 30 mins
    autoReLogin: true,
    bindMacAddress: true,
    isActive: true,
    maxConcurrentDevices: 2,
  },
  {
    id: 11,
    name: "AUTHZ_Cán_bộ_VIP",
    description: "Chính sách cấp quyền ưu tiên cho cán bộ",
    type: "authorization",
    applyToRoles: ["Cán bộ"],
    vlanId: 20,
    downloadLimit: 100,
    uploadLimit: 100,
    maxSessionTime: 12, // 12 hours
    maxDailyData: 50, // 50 GB
    idleTimeout: 120, // 2 hours
    autoReLogin: true,
    bindMacAddress: false,
    isActive: true,
    maxConcurrentDevices: 5,
  },
  {
    id: 12,
    name: "AUTHZ_Khách_Portal",
    description: "Chính sách cấp quyền cho khách qua Portal",
    type: "authorization",
    applyToRoles: ["Khách"],
    vlanId: 30,
    downloadLimit: 5,
    uploadLimit: 2,
    maxSessionTime: 2, // 2 hours
    maxDailyData: 1, // 1 GB
    idleTimeout: 15, // 15 mins
    autoReLogin: false,
    bindMacAddress: false,
    isActive: true,
    maxConcurrentDevices: 1,
  },
];


// Logs
export const initialLogs: LogEntry[] = [
  {
    id: 1,
    timestamp: "2024-01-15 10:30:00",
    user: "superadmin",
    action: "Đăng nhập",
    details: "Đăng nhập thành công từ IP 192.168.1.100",
    type: "access",
  },
  {
    id: 2,
    timestamp: "2024-01-15 10:35:00",
    user: "superadmin",
    action: "Thêm AP",
    details: "Thêm mới AP-A1-07 tại Tòa A Tầng 1",
    type: "config",
  },
  {
    id: 3,
    timestamp: "2024-01-15 11:00:00",
    user: "admin_it",
    action: "Sửa Policy",
    details: "Cập nhật chính sách băng thông Sinh viên",
    type: "config",
  },
  {
    id: 4,
    timestamp: "2024-01-15 11:30:00",
    user: "system",
    action: "Lỗi kết nối",
    details: "Mất kết nối đến Controller UniFi 2",
    type: "error",
  },
  {
    id: 5,
    timestamp: "2024-01-15 12:00:00",
    user: "superadmin",
    action: "Khóa tài khoản",
    details: "Khóa tài khoản monitor_user",
    type: "account",
  },
];

// Static filter options
export const systemRoles = [
  "Super Admin",
  "Admin",
  "Nhân viên IT",
  "Người giám sát",
];
export const userGroups = [
  "Quản trị viên cấp cao",
  "Quản trị viên",
  "Nhóm kỹ thuật",
  "Nhóm giám sát",
];
export const resourceList = [
  "Quản lý AP",
  "Quản lý Policy",
  "Quản lý Người dùng",
  "Báo cáo",
  "Cài đặt hệ thống",
  "Nhật ký",
];
export const buildingFilters = ["All", "227NVC", "Dĩ An", "Thủ Đức"];
export const campusFilters = ["Dĩ An", "Thủ Đức", "227 NVC"];
export const areaFilters = ["Nhà A", "Nhà B", "Nhà C", "Nhà I", "Giảng đường"];
export const getPolicyTypeLabel = (type: WifiPolicy["type"]) => {
  switch (type) {
    case "bandwidth":
      return "Băng thông";
    case "auth":
      return "Xác thực";
    case "session":
      return "Phiên truy cập";
    case "audit":
      return "Kiểm toán";
    case "security":
      return "Bảo mật";
    case "authorization":
      return "Cấp quyền (Phiên)";
  }
};

export const getDisconnectActionLabel = (action?: string) => {
  switch (action) {
    case "disconnect":
      return "Ngắt kết nối";
    case "reauth":
      return "Yêu cầu xác thực lại";
    case "notify":
      return "Chỉ thông báo";
    default:
      return "Ngắt kết nối";
  }
};
// ============ MOCK API FUNCTIONS ============

// Simulate delay for API calls
const simulateDelay = (ms: number = 300) =>
  new Promise(resolve => setTimeout(resolve, ms));

// Fetch Campuses
export const fetchCampuses = async (): Promise<Campus[]> => {
  await simulateDelay();
  return initialCampuses.map(({ id, name, code }) => ({ id, name, code }));
};

// Fetch Buildings
export const fetchBuildings = async (): Promise<Building[]> => {
  await simulateDelay();
  return initialBuildings.map(({ id, campusId, name, code }) => ({
    id,
    campusId,
    name,
    code,
  }));
};

// Fetch combined area locations (Campus + Building)
export const fetchAreaLocations = async (): Promise<AreaLocation[]> => {
  const [campuses, buildings] = await Promise.all([
    fetchCampuses(),
    fetchBuildings(),
  ]);

  const locations: AreaLocation[] = [];

  buildings.forEach(building => {
    const campus = campuses.find(c => c.id === building.campusId);
    if (campus) {
      locations.push({
        id: `${campus.code}-${building.code}`,
        label: `${campus.name} - ${building.name}`,
        campusName: campus.name,
        buildingName: building.name,
      });
    }
  });

  return locations;
};

// Fetch Controllers
export const fetchControllers = async (): Promise<Controller[]> => {
  await simulateDelay();
  return [...initialControllers];
};

// Fetch Access Points
export const fetchAccessPoints = async (): Promise<AP[]> => {
  await simulateDelay();
  return [...initialAPs];
};

// Fetch Admin Users
export const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  await simulateDelay();
  return [...initialAdminUsers];
};

// Fetch Policies
export const fetchPolicies = async (): Promise<WifiPolicy[]> => {
  await simulateDelay();
  return [...initialPolicies];
};

// Fetch Logs
export const fetchLogs = async (): Promise<LogEntry[]> => {
  await simulateDelay();
  return [...initialLogs];
};

// ============ HELPER FUNCTIONS ============

// Get overloaded APs (usage >= threshold)
export const getOverloadedAPs = (
  aps: AP[],
  threshold: number = 70,
  limit: number = 4
): AP[] => {
  return aps
    .filter(ap => ap.usage >= threshold)
    .sort((a, b) => b.usage - a.usage)
    .slice(0, limit);
};

// Get buildings by campus
export const getBuildingsByCampus = (campusId: number): Building[] => {
  return initialBuildings.filter(b => b.campusId === campusId);
};

// Get campus by code
export const getCampusByCode = (code: string): Campus | undefined => {
  return initialCampuses.find(c => c.code === code);
};

// Get building by campus code and building code
export const getBuildingByCode = (
  campusCode: string,
  buildingCode: string
): Building | undefined => {
  const campus = getCampusByCode(campusCode);
  if (!campus) return undefined;
  return initialBuildings.find(
    b => b.campusId === campus.id && b.code === buildingCode
  );
};
