// Định nghĩa các Interface cho module Reports

export interface UserReportData {
  date: string;
  students: number;
  staff: number;
  guests: number;
  total: number;
}

export interface BandwidthData {
  date: string;
  download: string;
  upload: string;
  peak: string;
  avgSpeed: string;
}

export interface ControllerReportData {
  id: string;
  name: string;
  ip: string;
  model: string;
  firmware: string;
  location: string;
  apCount: number;
  clients: number;
  cpu: number;
  memory: number;
}

export interface APAccessData {
  apName: string;
  location: string;
  totalAccess: number;
  avgClients: number;
  usage: number;
  controllerId: string;
  status: 'online' | 'warning' | 'offline';
}

export interface ViolationData {
  time: string;
  user: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
}

export interface SessionData {
  id: number;
  username: string;
  role: string;
  macAddress: string;
  ipAddress: string;
  startTime: string;
  endTime: string;
  duration: string;
  dataUsed: number;
  ap: string;
  location: string;
}

export interface IncidentData {
  ap: string;
  type: string;
  status: 'pending' | 'processing' | 'resolved';
  priority: 'high' | 'medium' | 'low';
}

export interface WifiUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  mssv: string;
  group: string;
  role: string;
  devicesOnline: number;
  sessionsToday: number;
  sessionsWeek: number;
  sessionsMonth: number;
  trafficIn: string;
  trafficOut: string;
  status: 'active' | 'blocked';
}

export interface UserReportApiItem {
  id: number;
  username: string;
  fullName: string;
  email: string;
  mssv: string;
  group: string;
  role: string;
  devicesOnline: number;
  sessionsToday: number;
  sessionsWeek: number;
  sessionsMonth: number;
  trafficIn: string;
  trafficOut: string;
  status: string;
}

export interface UserSession {
  sessionId: string;
  userId: number;
  username: string;
  fullName: string;
  deviceType: 'Laptop' | 'Smartphone' | 'Monitor' | 'Tablet' | 'Unknown';
  deviceName: string;
  mac: string;
  ip: string;
  ssid: string;
  vlan: string;
  ap: string;
  site: string;
  campus?: string;
  building?: string;
  identity?: string;
  startTime: string;
  stopTime: string;
  duration: string;
  download: string;
  upload: string;
  total: string;
  terminateCause: 'normal' | 'user-request' | 'idle-timeout' | 'hard-timeout' | 'quota-exceeded' | '-';
  status: 'active' | 'completed';
  tags: string[];
  trafficIn?: string;
  trafficOut?: string;
  isOnline?: boolean;
  userAgent?: string;
  createdAt?: string;
}

// ─── API Response DTOs từ backend (v7) ───────────────────────────────────────

export interface DeviceUserInfo {
  macAddress: string;
  deviceType: string;
  deviceName: string;
  userId: number;
  userName: string;
  userGroup: string;
  trafficIn?: string;
  trafficOut?: string;
  isOnline?: boolean;
}

export interface UserSessionResponse {
  sessionId: string;
  ipAddress: string;
  userId?: number;
  userAgent: string;
  startTime: string;
  endTime: string | null;
  status: 'ACTIVE' | 'ENDED' | 'EXPIRED';
  createdAt: string;
  ssid: string | null;
  vlan: string | null;
  apMac: string | null;
  campusId: number | null;
  buildingId: number | null;
  roleId: number | null;
  downloadBytes: number;
  uploadBytes: number;
  terminateCause: string | null;
  deviceUserInfo: DeviceUserInfo;
}

// ─── Register Device ──────────────────────────────────────────────────────────

export interface RegisterDeviceRequest {
  deviceMacAddress: string;
  deviceType: string;
  deviceName: string;
}
