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

export interface UserSession {
  sessionId: string;
  username: string;
  fullName: string;
  deviceType: string;
  deviceName: string;
  mac: string;
  ip: string;
  ssid: string;
  vlan: string;
  ap: string;
  site: string;
  startTime: string;
  stopTime: string;
  duration: string;
  download: string;
  upload: string;
  total: string;
  terminateCause: string;
  status: 'active' | 'completed';
  tags: string[];
}
