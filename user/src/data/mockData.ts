// RADIUS Accounting Mock Data Types
export interface RadiusSession {
  // Basic session info
  session_id: string;
  username: string;
  user_fullname: string;
  user_role: 'Student' | 'Teacher' | 'Staff' | 'Guest';
  user_department?: string;
  acctstarttime: string;
  acctstoptime: string | null;
  acctsessiontime: number | null; // seconds
  acctterminatecause: 'User-Request' | 'Session-Timeout' | 'Idle-Timeout' | 'Admin-Reset' | 'Lost-Carrier' | null;

  // Device info
  mac_address: string;
  ip_address: string;
  ipv6_address?: string;
  device_type: 'Laptop' | 'Smartphone' | 'Tablet' | 'Desktop' | 'Other';
  device_name: string;
  device_vendor?: string;
  user_agent: string;

  // Network info
  ssid: string;
  ap_name: string;
  ap_location: string;
  nas_ip: string;
  nas_identifier: string;

  // Traffic info
  acctinputoctets: number; // download bytes
  acctoutputoctets: number; // upload bytes
  acctinputpackets: number;
  acctoutputpackets: number;
  acctinputgigawords?: number;
  acctoutputgigawords?: number;

  // QoS & Policy
  vlan_id: number;
  bandwidth_limit: number; // Mbps
  quota_daily: number; // bytes
  session_timeout: number; // seconds
}

export interface UserInfo {
  username: string;
  fullname: string;
  mssv?: string;
  email: string;
  role: 'Student' | 'Teacher' | 'Staff' | 'Guest';
  department: string;
  status: 'Active' | 'Suspended';
  avatar?: string;
}

export interface AccessPoint {
  ap_name: string;
  ap_location: string;
  ip_address: string;
  model: string;
  firmware: string;
  status: 'Online' | 'Offline';
  uptime: number;
  connected_users: number;
  bandwidth_usage: number;
}

// Current user mock
export const currentUser: UserInfo = {
  username: '21120001',
  fullname: 'Nguyễn Văn An',
  mssv: '21120001',
  email: '21120001@student.hcmus.edu.vn',
  role: 'Student',
  department: 'Khoa Công nghệ Thông tin',
  status: 'Active',
};

// QoS Policies by role
export const qosPolicies = {
  Student: {
    session_timeout: 14400, // 4 hours
    bandwidth_limit: 10, // 10 Mbps
    quota_daily: 5 * 1024 * 1024 * 1024, // 5 GB
  },
  Teacher: {
    session_timeout: 28800, // 8 hours
    bandwidth_limit: 50, // 50 Mbps
    quota_daily: 20 * 1024 * 1024 * 1024, // 20 GB
  },
  Staff: {
    session_timeout: 28800, // 8 hours
    bandwidth_limit: 30, // 30 Mbps
    quota_daily: 10 * 1024 * 1024 * 1024, // 10 GB
  },
  Guest: {
    session_timeout: 3600, // 1 hour
    bandwidth_limit: 5, // 5 Mbps
    quota_daily: 1 * 1024 * 1024 * 1024, // 1 GB
  },
};

// Access Points
export const accessPoints: AccessPoint[] = [
  { ap_name: 'AP-Library-F1-01', ap_location: 'Thư viện - Tầng 1', ip_address: '10.0.1.1', model: 'Cisco Aironet 3800', firmware: '8.10.151.0', status: 'Online', uptime: 2592000, connected_users: 45, bandwidth_usage: 320 },
  { ap_name: 'AP-Library-F2-01', ap_location: 'Thư viện - Tầng 2', ip_address: '10.0.1.2', model: 'Cisco Aironet 3800', firmware: '8.10.151.0', status: 'Online', uptime: 2592000, connected_users: 52, bandwidth_usage: 410 },
  { ap_name: 'AP-Library-F3-01', ap_location: 'Thư viện - Tầng 3', ip_address: '10.0.1.3', model: 'Cisco Aironet 3800', firmware: '8.10.151.0', status: 'Online', uptime: 2592000, connected_users: 38, bandwidth_usage: 280 },
  { ap_name: 'AP-Canteen-F1-01', ap_location: 'Căng tin - Tầng 1', ip_address: '10.0.2.1', model: 'Cisco Aironet 2800', firmware: '8.10.151.0', status: 'Online', uptime: 1296000, connected_users: 78, bandwidth_usage: 520 },
  { ap_name: 'AP-ClassA-F3-01', ap_location: 'Phòng học A.301', ip_address: '10.0.3.1', model: 'Cisco Aironet 2800', firmware: '8.10.151.0', status: 'Online', uptime: 1296000, connected_users: 35, bandwidth_usage: 180 },
  { ap_name: 'AP-ClassA-F3-02', ap_location: 'Phòng học A.305', ip_address: '10.0.3.2', model: 'Cisco Aironet 2800', firmware: '8.10.151.0', status: 'Online', uptime: 1296000, connected_users: 42, bandwidth_usage: 220 },
  { ap_name: 'AP-Lab-CNTT-01', ap_location: 'Phòng Lab CNTT - B.201', ip_address: '10.0.4.1', model: 'Cisco Aironet 3800', firmware: '8.10.151.0', status: 'Online', uptime: 2592000, connected_users: 30, bandwidth_usage: 450 },
  { ap_name: 'AP-Lab-CNTT-02', ap_location: 'Phòng Lab CNTT - B.203', ip_address: '10.0.4.2', model: 'Cisco Aironet 3800', firmware: '8.10.151.0', status: 'Online', uptime: 2592000, connected_users: 28, bandwidth_usage: 380 },
  { ap_name: 'AP-Lobby-F1-01', ap_location: 'Sảnh chính - Tầng 1', ip_address: '10.0.5.1', model: 'Cisco Aironet 2800', firmware: '8.10.151.0', status: 'Online', uptime: 864000, connected_users: 65, bandwidth_usage: 340 },
  { ap_name: 'AP-Office-F4-01', ap_location: 'Văn phòng Khoa - Tầng 4', ip_address: '10.0.6.1', model: 'Cisco Aironet 2800', firmware: '8.10.151.0', status: 'Offline', uptime: 0, connected_users: 0, bandwidth_usage: 0 },
];

// Generate random MAC address
function generateMAC(): string {
  const hexDigits = '0123456789ABCDEF';
  let mac = '';
  for (let i = 0; i < 6; i++) {
    if (i > 0) mac += ':';
    mac += hexDigits[Math.floor(Math.random() * 16)];
    mac += hexDigits[Math.floor(Math.random() * 16)];
  }
  return mac;
}

// Generate random IP
function generateIP(): string {
  return `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
}

// Device vendors by OUI
const deviceVendors: Record<string, string[]> = {
  Laptop: ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'Microsoft'],
  Smartphone: ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo', 'Realme', 'Huawei'],
  Tablet: ['Apple', 'Samsung', 'Lenovo', 'Microsoft', 'Huawei'],
  Desktop: ['Dell', 'HP', 'Lenovo', 'ASUS'],
  Other: ['Unknown'],
};

const deviceNames: Record<string, string[]> = {
  Laptop: ['MacBook Pro 14"', 'MacBook Air M2', 'Dell XPS 15', 'Dell Latitude 5540', 'HP ProBook 450', 'Lenovo ThinkPad X1', 'ASUS ZenBook 14'],
  Smartphone: ['iPhone 15 Pro', 'iPhone 14', 'iPhone 13', 'Samsung Galaxy S24', 'Samsung Galaxy A54', 'Xiaomi 14', 'OPPO Reno 11', 'Vivo V30'],
  Tablet: ['iPad Pro 12.9"', 'iPad Air', 'iPad 10th Gen', 'Samsung Galaxy Tab S9', 'Lenovo Tab P12'],
  Desktop: ['iMac 24"', 'Dell OptiPlex 7090', 'HP ProDesk 400'],
  Other: ['Unknown Device'],
};

const userAgents: Record<string, string[]> = {
  Laptop: [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  ],
  Smartphone: [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 14; 2312DRA50G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  ],
  Tablet: [
    'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 14; SM-X910) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ],
  Desktop: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ],
  Other: ['Unknown'],
};

const terminateCauses: (RadiusSession['acctterminatecause'])[] = [
  'User-Request',
  'Session-Timeout',
  'Idle-Timeout',
  'Admin-Reset',
  'Lost-Carrier',
];

// Generate mock sessions
function generateMockSessions(): RadiusSession[] {
  const sessions: RadiusSession[] = [];
  const now = new Date();
  const policy = qosPolicies[currentUser.role];

  // Active session (current)
  const activeAP = accessPoints[Math.floor(Math.random() * (accessPoints.length - 1))];
  const deviceType: RadiusSession['device_type'] = 'Laptop';
  const activeSession: RadiusSession = {
    session_id: `sess_${Date.now()}_001`,
    username: currentUser.username,
    user_fullname: currentUser.fullname,
    user_role: currentUser.role,
    user_department: currentUser.department,
    acctstarttime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    acctstoptime: null,
    acctsessiontime: null,
    acctterminatecause: null,
    mac_address: 'AA:BB:CC:DD:EE:01',
    ip_address: '10.0.15.45',
    ipv6_address: '2001:db8::1',
    device_type: deviceType,
    device_name: 'MacBook Pro 14"',
    device_vendor: 'Apple',
    user_agent: userAgents[deviceType][0],
    ssid: 'HCMUS-Student',
    ap_name: activeAP.ap_name,
    ap_location: activeAP.ap_location,
    nas_ip: '10.0.0.1',
    nas_identifier: 'RADIUS-NAS-01',
    acctinputoctets: 892000000, // ~850MB download
    acctoutputoctets: 156000000, // ~150MB upload
    acctinputpackets: 650000,
    acctoutputpackets: 180000,
    vlan_id: 100,
    bandwidth_limit: policy.bandwidth_limit,
    quota_daily: policy.quota_daily,
    session_timeout: policy.session_timeout,
  };
  sessions.push(activeSession);

  // Generate historical sessions (last 30 days)
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const startHour = 7 + Math.floor(Math.random() * 14); // 7 AM to 9 PM
    const sessionDuration = 1800 + Math.floor(Math.random() * 14400); // 30 min to 4 hours
    
    const startTime = new Date(now);
    startTime.setDate(startTime.getDate() - daysAgo);
    startTime.setHours(startHour, Math.floor(Math.random() * 60), 0, 0);
    
    const endTime = new Date(startTime.getTime() + sessionDuration * 1000);
    
    // Skip if end time is in the future
    if (endTime > now) continue;
    
    const deviceTypes: RadiusSession['device_type'][] = ['Laptop', 'Smartphone', 'Tablet'];
    const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
    const vendor = deviceVendors[deviceType][Math.floor(Math.random() * deviceVendors[deviceType].length)];
    const deviceName = deviceNames[deviceType][Math.floor(Math.random() * deviceNames[deviceType].length)];
    const ap = accessPoints[Math.floor(Math.random() * accessPoints.length)];
    
    const downloadBytes = Math.floor(Math.random() * 2000000000); // up to 2GB
    const uploadBytes = Math.floor(Math.random() * 500000000); // up to 500MB
    
    const session: RadiusSession = {
      session_id: `sess_${startTime.getTime()}_${i.toString().padStart(3, '0')}`,
      username: currentUser.username,
      user_fullname: currentUser.fullname,
      user_role: currentUser.role,
      user_department: currentUser.department,
      acctstarttime: startTime.toISOString(),
      acctstoptime: endTime.toISOString(),
      acctsessiontime: sessionDuration,
      acctterminatecause: terminateCauses[Math.floor(Math.random() * terminateCauses.length)],
      mac_address: i < 5 ? 'AA:BB:CC:DD:EE:01' : generateMAC(), // First few sessions use same MAC
      ip_address: generateIP(),
      device_type: deviceType,
      device_name: deviceName,
      device_vendor: vendor,
      user_agent: userAgents[deviceType][Math.floor(Math.random() * userAgents[deviceType].length)],
      ssid: 'HCMUS-Student',
      ap_name: ap.ap_name,
      ap_location: ap.ap_location,
      nas_ip: '10.0.0.1',
      nas_identifier: 'RADIUS-NAS-01',
      acctinputoctets: downloadBytes,
      acctoutputoctets: uploadBytes,
      acctinputpackets: Math.floor(downloadBytes / 1400),
      acctoutputpackets: Math.floor(uploadBytes / 1400),
      acctinputgigawords: downloadBytes > 4294967296 ? Math.floor(downloadBytes / 4294967296) : undefined,
      acctoutputgigawords: uploadBytes > 4294967296 ? Math.floor(uploadBytes / 4294967296) : undefined,
      vlan_id: 100,
      bandwidth_limit: policy.bandwidth_limit,
      quota_daily: policy.quota_daily,
      session_timeout: policy.session_timeout,
    };
    
    sessions.push(session);
  }

  // Sort by start time descending
  sessions.sort((a, b) => new Date(b.acctstarttime).getTime() - new Date(a.acctstarttime).getTime());
  
  return sessions;
}

export const mockSessions = generateMockSessions();

// Helper functions
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number | null): string {
  if (!seconds) return '--';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatDurationShort(seconds: number | null): string {
  if (!seconds) return '--';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} phút`;
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTimeShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getTerminateCauseLabel(cause: RadiusSession['acctterminatecause']): string {
  switch (cause) {
    case 'User-Request':
      return 'Người dùng đăng xuất';
    case 'Session-Timeout':
      return 'Hết thời gian phiên';
    case 'Idle-Timeout':
      return 'Không hoạt động';
    case 'Admin-Reset':
      return 'Admin ngắt kết nối';
    case 'Lost-Carrier':
      return 'Mất kết nối';
    default:
      return '--';
  }
}

// Get unique AP locations for filter
export function getUniqueAPLocations(): string[] {
  return [...new Set(mockSessions.map(s => s.ap_location))].sort();
}

// Get unique devices for filter  
export function getUniqueDevices(): { mac: string; name: string; type: string }[] {
  const deviceMap = new Map<string, { mac: string; name: string; type: string }>();
  mockSessions.forEach(s => {
    if (!deviceMap.has(s.mac_address)) {
      deviceMap.set(s.mac_address, {
        mac: s.mac_address,
        name: s.device_name,
        type: s.device_type,
      });
    }
  });
  return Array.from(deviceMap.values());
}

// Calculate today's usage
export function getTodayUsage(): { download: number; upload: number; total: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let download = 0;
  let upload = 0;
  
  mockSessions.forEach(session => {
    const sessionDate = new Date(session.acctstarttime);
    if (sessionDate >= today) {
      download += session.acctinputoctets;
      upload += session.acctoutputoctets;
    }
  });
  
  return { download, upload, total: download + upload };
}
