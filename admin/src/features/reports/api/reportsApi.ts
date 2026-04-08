import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { 
  UserReportData, BandwidthData, ControllerReportData, APAccessData, 
  ViolationData, SessionData, IncidentData, WifiUser, UserReportApiItem
} from '../types';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// Dữ liệu mock (tách từ file Reports.tsx cũ)
const mockUserReportData: UserReportData[] = [
  { date: '15/01/2024', students: 5234, staff: 1245, guests: 89, total: 6568 },
  { date: '14/01/2024', students: 5102, staff: 1198, guests: 76, total: 6376 },
  { date: '13/01/2024', students: 4987, staff: 1134, guests: 65, total: 6186 },
  { date: '12/01/2024', students: 5321, staff: 1267, guests: 92, total: 6680 },
  { date: '11/01/2024', students: 5089, staff: 1156, guests: 71, total: 6316 },
];

const mockBandwidthData: BandwidthData[] = [
  { date: '15/01/2024', download: '45.2 GB', upload: '11.5 GB', peak: '14:30', avgSpeed: '125 Mbps' },
  { date: '14/01/2024', download: '42.8 GB', upload: '10.2 GB', peak: '15:00', avgSpeed: '118 Mbps' },
  { date: '13/01/2024', download: '38.5 GB', upload: '9.8 GB', peak: '14:00', avgSpeed: '105 Mbps' },
  { date: '12/01/2024', download: '48.1 GB', upload: '12.3 GB', peak: '13:45', avgSpeed: '132 Mbps' },
  { date: '11/01/2024', download: '41.6 GB', upload: '10.7 GB', peak: '15:15', avgSpeed: '115 Mbps' },
];

const mockControllerReportData: ControllerReportData[] = [
  { id: 'WLC-Core-01', name: 'WLC-Core-01', ip: '192.168.10.10', model: 'Cisco 9800', firmware: '17.6.4', location: 'Server Room A', apCount: 150, clients: 2500, cpu: 45, memory: 60 },
  { id: 'WLC-Core-02', name: 'WLC-Core-02', ip: '192.168.10.11', model: 'Cisco 9800', firmware: '17.6.4', location: 'Server Room B', apCount: 140, clients: 2100, cpu: 42, memory: 58 },
  { id: 'WLC-Dist-01', name: 'WLC-Dist-01', ip: '192.168.20.10', model: 'Aruba 7210', firmware: '8.10.0', location: 'Cơ sở 2', apCount: 80, clients: 1200, cpu: 35, memory: 45 },
];

const mockAPAccessData: APAccessData[] = [
  { apName: 'AP-A1-01', location: 'Tòa A, Tầng 1', totalAccess: 1245, avgClients: 45, usage: 78, controllerId: 'WLC-Core-01', status: 'online' },
  { apName: 'AP-A1-02', location: 'Tòa A, Tầng 2', totalAccess: 1389, avgClients: 52, usage: 85, controllerId: 'WLC-Core-01', status: 'online' },
  { apName: 'AP-A2-01', location: 'Tòa A, Tầng 3', totalAccess: 1156, avgClients: 48, usage: 72, controllerId: 'WLC-Core-01', status: 'online' },
  { apName: 'AP-A2-02', location: 'Tòa A, Tầng 4', totalAccess: 998, avgClients: 42, usage: 65, controllerId: 'WLC-Core-01', status: 'warning' },
  { apName: 'AP-B1-01', location: 'Tòa B, Tầng 1', totalAccess: 987, avgClients: 38, usage: 62, controllerId: 'WLC-Core-02', status: 'online' },
  { apName: 'AP-B2-01', location: 'Tòa B, Tầng 2', totalAccess: 1102, avgClients: 41, usage: 68, controllerId: 'WLC-Core-02', status: 'online' },
  { apName: 'AP-B2-02', location: 'Tòa B, Tầng 3', totalAccess: 876, avgClients: 35, usage: 55, controllerId: 'WLC-Core-02', status: 'offline' },
  { apName: 'AP-C1-01', location: 'Cơ sở 2 - Tầng 1', totalAccess: 1567, avgClients: 58, usage: 92, controllerId: 'WLC-Dist-01', status: 'online' },
  { apName: 'AP-C1-02', location: 'Cơ sở 2 - Tầng 2', totalAccess: 1234, avgClients: 50, usage: 78, controllerId: 'WLC-Dist-01', status: 'online' },
  { apName: 'AP-C2-01', location: 'Cơ sở 2 - Thư viện', totalAccess: 2105, avgClients: 75, usage: 95, controllerId: 'WLC-Dist-01', status: 'warning' },
];

const mockViolationData: ViolationData[] = [
  { time: '2026-01-15 10:30:00', user: '10015@student', type: 'Đăng nhập sai', severity: 'high' },
  { time: '2026-01-15 11:45:00', user: '10016@student', type: 'Quá tải băng thông', severity: 'medium' },
  { time: '2026-01-15 14:30:00', user: 'Unknown', type: 'Giả mạo MAC', severity: 'high' },
  { time: '2026-01-15 09:15:00', user: '10017@student', type: 'Truy cập bị chặn', severity: 'low' },
];

const mockSessionData: SessionData[] = [
  { id: 1, username: '21120001@student.hcmus.edu.vn', role: 'Sinh viên', macAddress: 'AA:BB:CC:DD:EE:01', ipAddress: '10.0.1.101', startTime: '2024-01-15 08:30:00', endTime: '2024-01-15 12:45:00', duration: '4h 15m', dataUsed: 1.24, ap: 'AP-DA-A-01', location: 'Cơ sở Dĩ An - Tòa A' },
  { id: 2, username: '21120045@student.hcmus.edu.vn', role: 'Sinh viên', macAddress: 'AA:BB:CC:DD:EE:02', ipAddress: '10.0.1.102', startTime: '2024-01-15 09:00:00', endTime: '2024-01-15 17:30:00', duration: '8h 30m', dataUsed: 2.85, ap: 'AP-DA-B-02', location: 'Cơ sở Dĩ An - Tòa B' },
  { id: 3, username: 'nv.nguyen@hcmus.edu.vn', role: 'Cán bộ', macAddress: 'AA:BB:CC:DD:EE:03', ipAddress: '10.0.2.50', startTime: '2024-01-15 07:45:00', endTime: '2024-01-15 18:00:00', duration: '10h 15m', dataUsed: 5.52, ap: 'AP-TD-E-01', location: 'Cơ sở Thủ Đức - Tòa E' },
  { id: 4, username: 'guest_event_001', role: 'Khách', macAddress: 'AA:BB:CC:DD:EE:04', ipAddress: '10.0.3.15', startTime: '2024-01-15 14:00:00', endTime: '2024-01-15 16:00:00', duration: '2h 00m', dataUsed: 0.32, ap: 'AP-227-G-01', location: 'Cơ sở 227 NVC - Hội trường' },
  { id: 5, username: '21120089@student.hcmus.edu.vn', role: 'Sinh viên', macAddress: 'AA:BB:CC:DD:EE:05', ipAddress: '10.0.1.156', startTime: '2024-01-15 10:15:00', endTime: '2024-01-15 15:30:00', duration: '5h 15m', dataUsed: 1.89, ap: 'AP-DA-C-03', location: 'Cơ sở Dĩ An - Tòa C' },
  { id: 6, username: 'pv.tran@hcmus.edu.vn', role: 'Cán bộ', macAddress: 'AA:BB:CC:DD:EE:06', ipAddress: '10.0.2.78', startTime: '2024-01-15 08:00:00', endTime: '2024-01-15 17:00:00', duration: '9h 00m', dataUsed: 3.45, ap: 'AP-DA-B-01', location: 'Cơ sở Dĩ An - Tòa B' },
  { id: 7, username: '20120156@student.hcmus.edu.vn', role: 'Sinh viên', macAddress: 'AA:BB:CC:DD:EE:07', ipAddress: '10.0.1.201', startTime: '2024-01-15 13:00:00', endTime: '2024-01-15 18:45:00', duration: '5h 45m', dataUsed: 2.15, ap: 'AP-TD-F-02', location: 'Cơ sở Thủ Đức - Tòa F' },
  { id: 8, username: 'guest_visitor_002', role: 'Khách', macAddress: 'AA:BB:CC:DD:EE:08', ipAddress: '10.0.3.28', startTime: '2024-01-15 09:30:00', endTime: '2024-01-15 11:00:00', duration: '1h 30m', dataUsed: 0.18, ap: 'AP-227-G-02', location: 'Cơ sở 227 NVC - Thư viện' },
];

const mockIncidentData: IncidentData[] = [
  { ap: 'AP-B2-01', type: 'Ngừng hoạt động', status: 'pending', priority: 'high' },
  { ap: 'AP-C1-01', type: 'Quá tải CPU', status: 'processing', priority: 'medium' },
  { ap: 'AP-A1-02', type: 'Nhiệt độ cao', status: 'resolved', priority: 'medium' },
];

const mapUserReportItem = (item: UserReportApiItem): WifiUser => ({
  id: item.id,
  username: item.username,
  fullName: item.fullName,
  email: item.email,
  mssv: item.mssv,
  group: item.group,
  role: item.role,
  devicesOnline: item.devicesOnline,
  sessionsToday: item.sessionsToday,
  sessionsWeek: item.sessionsWeek,
  sessionsMonth: item.sessionsMonth,
  trafficIn: item.trafficIn,
  trafficOut: item.trafficOut,
  status: item.status.toLowerCase() === 'active' ? 'active' : 'blocked',
});

export const reportsApi = {
  fetchWifiUsers: async (): Promise<WifiUser[]> => {
    const response = await axios.get<ApiResponse<UserReportApiItem[]>>(`${API_BASE_URL}/users/report`);
    return response.data.data.map(mapUserReportItem);
  },
  fetchUserReportData: () => Promise.resolve(mockUserReportData),
  fetchBandwidthData: () => Promise.resolve(mockBandwidthData),
  fetchControllers: () => Promise.resolve(mockControllerReportData),
  fetchApAccess: () => Promise.resolve(mockAPAccessData),
  fetchViolations: () => Promise.resolve(mockViolationData),
  fetchSessionData: () => Promise.resolve(mockSessionData),
  fetchIncidents: () => Promise.resolve(mockIncidentData),
  
  // API tĩnh cho logs hệ thống vì không có data riêng
  fetchSystemLogs: () => Promise.resolve([
    { time: '2024-01-15 10:30:00', level: 'INFO', message: 'Auth: User login: superadmin from 192.168.1.100' },
    { time: '2024-01-15 10:35:00', level: 'INFO', message: 'Config: AP configuration updated: AP-A1-07' },
    { time: '2024-01-15 11:00:00', level: 'WARNING', message: 'System: High memory usage detected on server' },
    { time: '2024-01-15 11:30:00', level: 'ERROR', message: 'Controller: Connection lost to UniFi Controller 2' },
    { time: '2024-01-15 12:00:00', level: 'INFO', message: 'Policy: Bandwidth policy updated for Students group' },
    { time: '2024-01-15 12:15:00', level: 'INFO', message: 'Auth: User logout: superadmin' },
  ])
};
