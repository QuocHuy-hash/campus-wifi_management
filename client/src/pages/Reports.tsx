import { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Download, 
  FileSpreadsheet, 
  Users, 
  Wifi, 
  Activity, 
  AlertTriangle,
  Clock,
  Server,
  Shield,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ban,
  Tag,
  Power,
  Monitor,
  Smartphone,
  Laptop
} from 'lucide-react';

// Import mock data
import { initialCampuses, initialBuildings, initialControllers } from '@/data/mockData';

// Mock data
const mockUserReportData = [
  { date: '15/01/2024', students: 5234, staff: 1245, guests: 89, total: 6568 },
  { date: '14/01/2024', students: 5102, staff: 1198, guests: 76, total: 6376 },
  { date: '13/01/2024', students: 4987, staff: 1134, guests: 65, total: 6186 },
  { date: '12/01/2024', students: 5321, staff: 1267, guests: 92, total: 6680 },
  { date: '11/01/2024', students: 5089, staff: 1156, guests: 71, total: 6316 },
];

const mockBandwidthData = [
  { date: '15/01/2024', download: '45.2 GB', upload: '11.5 GB', peak: '14:30', avgSpeed: '125 Mbps' },
  { date: '14/01/2024', download: '42.8 GB', upload: '10.2 GB', peak: '15:00', avgSpeed: '118 Mbps' },
  { date: '13/01/2024', download: '38.5 GB', upload: '9.8 GB', peak: '14:00', avgSpeed: '105 Mbps' },
  { date: '12/01/2024', download: '48.1 GB', upload: '12.3 GB', peak: '13:45', avgSpeed: '132 Mbps' },
  { date: '11/01/2024', download: '41.6 GB', upload: '10.7 GB', peak: '15:15', avgSpeed: '115 Mbps' },
];

const mockControllerReportData = [
  { id: 'WLC-Core-01', name: 'WLC-Core-01', ip: '192.168.10.10', model: 'Cisco 9800', firmware: '17.6.4', location: 'Server Room A', apCount: 150, clients: 2500, cpu: 45, memory: 60 },
  { id: 'WLC-Core-02', name: 'WLC-Core-02', ip: '192.168.10.11', model: 'Cisco 9800', firmware: '17.6.4', location: 'Server Room B', apCount: 140, clients: 2100, cpu: 42, memory: 58 },
  { id: 'WLC-Dist-01', name: 'WLC-Dist-01', ip: '192.168.20.10', model: 'Aruba 7210', firmware: '8.10.0', location: 'Cơ sở 2', apCount: 80, clients: 1200, cpu: 35, memory: 45 },
];

const mockAPAccessData = [
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

const mockViolationData = [
  { time: '10:23', user: '10015@student', type: 'Đăng nhập sai', severity: 'high' },
  { time: '11:45', user: '10016@student', type: 'Quá tải băng thông', severity: 'medium' },
  { time: '14:30', user: 'Unknown', type: 'Giả mạo MAC', severity: 'high' },
  { time: '09:15', user: '10017@student', type: 'Truy cập bị chặn', severity: 'low' },
];

const mockSessionData = [
  { 
    id: 1,
    username: '21120001@student.hcmus.edu.vn', 
    role: 'Sinh viên',
    macAddress: 'AA:BB:CC:DD:EE:01',
    ipAddress: '10.0.1.101',
    startTime: '2024-01-15 08:30:00',
    endTime: '2024-01-15 12:45:00',
    duration: '4h 15m',
    dataUsed: 1.24,
    ap: 'AP-DA-A-01',
    location: 'Cơ sở Dĩ An - Tòa A'
  },
  { 
    id: 2,
    username: '21120045@student.hcmus.edu.vn', 
    role: 'Sinh viên',
    macAddress: 'AA:BB:CC:DD:EE:02',
    ipAddress: '10.0.1.102',
    startTime: '2024-01-15 09:00:00',
    endTime: '2024-01-15 17:30:00',
    duration: '8h 30m',
    dataUsed: 2.85,
    ap: 'AP-DA-B-02',
    location: 'Cơ sở Dĩ An - Tòa B'
  },
  { 
    id: 3,
    username: 'nv.nguyen@hcmus.edu.vn', 
    role: 'Cán bộ',
    macAddress: 'AA:BB:CC:DD:EE:03',
    ipAddress: '10.0.2.50',
    startTime: '2024-01-15 07:45:00',
    endTime: '2024-01-15 18:00:00',
    duration: '10h 15m',
    dataUsed: 5.52,
    ap: 'AP-TD-E-01',
    location: 'Cơ sở Thủ Đức - Tòa E'
  },
  { 
    id: 4,
    username: 'guest_event_001', 
    role: 'Khách',
    macAddress: 'AA:BB:CC:DD:EE:04',
    ipAddress: '10.0.3.15',
    startTime: '2024-01-15 14:00:00',
    endTime: '2024-01-15 16:00:00',
    duration: '2h 00m',
    dataUsed: 0.32,
    ap: 'AP-227-G-01',
    location: 'Cơ sở 227 NVC - Hội trường'
  },
  { 
    id: 5,
    username: '21120089@student.hcmus.edu.vn', 
    role: 'Sinh viên',
    macAddress: 'AA:BB:CC:DD:EE:05',
    ipAddress: '10.0.1.156',
    startTime: '2024-01-15 10:15:00',
    endTime: '2024-01-15 15:30:00',
    duration: '5h 15m',
    dataUsed: 1.89,
    ap: 'AP-DA-C-03',
    location: 'Cơ sở Dĩ An - Tòa C'
  },
  { 
    id: 6,
    username: 'pv.tran@hcmus.edu.vn', 
    role: 'Cán bộ',
    macAddress: 'AA:BB:CC:DD:EE:06',
    ipAddress: '10.0.2.78',
    startTime: '2024-01-15 08:00:00',
    endTime: '2024-01-15 17:00:00',
    duration: '9h 00m',
    dataUsed: 3.45,
    ap: 'AP-DA-B-01',
    location: 'Cơ sở Dĩ An - Tòa B'
  },
  { 
    id: 7,
    username: '20120156@student.hcmus.edu.vn', 
    role: 'Sinh viên',
    macAddress: 'AA:BB:CC:DD:EE:07',
    ipAddress: '10.0.1.201',
    startTime: '2024-01-15 13:00:00',
    endTime: '2024-01-15 18:45:00',
    duration: '5h 45m',
    dataUsed: 2.15,
    ap: 'AP-TD-F-02',
    location: 'Cơ sở Thủ Đức - Tòa F'
  },
  { 
    id: 8,
    username: 'guest_visitor_002', 
    role: 'Khách',
    macAddress: 'AA:BB:CC:DD:EE:08',
    ipAddress: '10.0.3.28',
    startTime: '2024-01-15 09:30:00',
    endTime: '2024-01-15 11:00:00',
    duration: '1h 30m',
    dataUsed: 0.18,
    ap: 'AP-227-G-02',
    location: 'Cơ sở 227 NVC - Thư viện'
  },
];

const mockIncidentData = [
  { ap: 'AP-B2-01', type: 'Ngừng hoạt động', status: 'pending', priority: 'high' },
  { ap: 'AP-C1-01', type: 'Quá tải CPU', status: 'processing', priority: 'medium' },
  { ap: 'AP-A1-02', type: 'Nhiệt độ cao', status: 'resolved', priority: 'medium' },
];

// Mock data for WiFi Users Management
const mockWifiUsers = [
  { 
    id: 1, 
    username: '21120001', 
    fullName: 'Nguyễn Văn An', 
    email: '21120001@student.hcmus.edu.vn',
    mssv: '21120001',
    group: 'Sinh viên',
    role: 'User',
    devicesOnline: 2,
    sessionsToday: 3,
    sessionsWeek: 15,
    sessionsMonth: 45,
    trafficIn: '2.5 GB',
    trafficOut: '0.8 GB',
    status: 'active'
  },
  { 
    id: 2, 
    username: '21120045', 
    fullName: 'Trần Thị Bình', 
    email: '21120045@student.hcmus.edu.vn',
    mssv: '21120045',
    group: 'Sinh viên',
    role: 'User',
    devicesOnline: 1,
    sessionsToday: 2,
    sessionsWeek: 12,
    sessionsMonth: 38,
    trafficIn: '1.8 GB',
    trafficOut: '0.5 GB',
    status: 'active'
  },
  { 
    id: 3, 
    username: 'nv.nguyen', 
    fullName: 'Nguyễn Văn Nam', 
    email: 'nv.nguyen@hcmus.edu.vn',
    mssv: '-',
    group: 'Giảng viên',
    role: 'Staff',
    devicesOnline: 3,
    sessionsToday: 5,
    sessionsWeek: 25,
    sessionsMonth: 80,
    trafficIn: '8.2 GB',
    trafficOut: '2.1 GB',
    status: 'active'
  },
  { 
    id: 4, 
    username: 'guest_event_001', 
    fullName: 'Khách Hội nghị', 
    email: 'guest@external.com',
    mssv: '-',
    group: 'Khách',
    role: 'Guest',
    devicesOnline: 1,
    sessionsToday: 1,
    sessionsWeek: 2,
    sessionsMonth: 2,
    trafficIn: '0.3 GB',
    trafficOut: '0.1 GB',
    status: 'active'
  },
  { 
    id: 5, 
    username: '20120156', 
    fullName: 'Lê Hoàng Cường', 
    email: '20120156@student.hcmus.edu.vn',
    mssv: '20120156',
    group: 'Sinh viên',
    role: 'User',
    devicesOnline: 0,
    sessionsToday: 0,
    sessionsWeek: 8,
    sessionsMonth: 32,
    trafficIn: '1.2 GB',
    trafficOut: '0.4 GB',
    status: 'blocked'
  },
  { 
    id: 6, 
    username: 'pv.tran', 
    fullName: 'Trần Phương Vy', 
    email: 'pv.tran@hcmus.edu.vn',
    mssv: '-',
    group: 'Giảng viên',
    role: 'Staff',
    devicesOnline: 2,
    sessionsToday: 4,
    sessionsWeek: 20,
    sessionsMonth: 65,
    trafficIn: '5.5 GB',
    trafficOut: '1.8 GB',
    status: 'active'
  },
];

// Mock data for Sessions
const mockUserSessions = [
  { 
    sessionId: 'SES-2024011501234',
    username: '21120001',
    fullName: 'Nguyễn Văn An',
    deviceType: 'Laptop',
    deviceName: 'MacBook Pro',
    mac: 'AA:BB:CC:DD:EE:01',
    ip: '10.0.1.101',
    ssid: 'HCMUS-Student',
    vlan: 'VLAN 100',
    ap: 'AP-DA-A-01',
    site: 'Cơ sở Dĩ An - Tòa A',
    startTime: '2024-01-15 08:30:00',
    stopTime: '2024-01-15 12:45:00',
    duration: '4h 15m',
    download: '1.24 GB',
    upload: '0.32 GB',
    total: '1.56 GB',
    terminateCause: 'normal',
    status: 'completed',
    tags: []
  },
  { 
    sessionId: 'SES-2024011501235',
    username: '21120045',
    fullName: 'Trần Thị Bình',
    deviceType: 'Smartphone',
    deviceName: 'iPhone 14',
    mac: 'AA:BB:CC:DD:EE:02',
    ip: '10.0.1.102',
    ssid: 'HCMUS-Student',
    vlan: 'VLAN 100',
    ap: 'AP-DA-B-02',
    site: 'Cơ sở Dĩ An - Tòa B',
    startTime: '2024-01-15 09:00:00',
    stopTime: '-',
    duration: '3h 25m',
    download: '0.85 GB',
    upload: '0.15 GB',
    total: '1.00 GB',
    terminateCause: '-',
    status: 'active',
    tags: []
  },
  { 
    sessionId: 'SES-2024011501236',
    username: 'nv.nguyen',
    fullName: 'Nguyễn Văn Nam',
    deviceType: 'Laptop',
    deviceName: 'Dell XPS 15',
    mac: 'AA:BB:CC:DD:EE:03',
    ip: '10.0.2.50',
    ssid: 'HCMUS-Staff',
    vlan: 'VLAN 200',
    ap: 'AP-TD-E-01',
    site: 'Cơ sở Thủ Đức - Tòa E',
    startTime: '2024-01-15 07:45:00',
    stopTime: '2024-01-15 18:00:00',
    duration: '10h 15m',
    download: '5.52 GB',
    upload: '1.25 GB',
    total: '6.77 GB',
    terminateCause: 'user-request',
    status: 'completed',
    tags: []
  },
  { 
    sessionId: 'SES-2024011501237',
    username: 'guest_event_001',
    fullName: 'Khách Hội nghị',
    deviceType: 'Laptop',
    deviceName: 'Windows Laptop',
    mac: 'AA:BB:CC:DD:EE:04',
    ip: '10.0.3.15',
    ssid: 'HCMUS-Guest',
    vlan: 'VLAN 300',
    ap: 'AP-227-G-01',
    site: 'Cơ sở 227 NVC - Hội trường',
    startTime: '2024-01-15 14:00:00',
    stopTime: '2024-01-15 16:00:00',
    duration: '2h 00m',
    download: '0.32 GB',
    upload: '0.05 GB',
    total: '0.37 GB',
    terminateCause: 'idle-timeout',
    status: 'completed',
    tags: []
  },
  { 
    sessionId: 'SES-2024011501238',
    username: '20120156',
    fullName: 'Lê Hoàng Cường',
    deviceType: 'Smartphone',
    deviceName: 'Samsung Galaxy S23',
    mac: 'AA:BB:CC:DD:EE:05',
    ip: '10.0.1.156',
    ssid: 'HCMUS-Student',
    vlan: 'VLAN 100',
    ap: 'AP-DA-C-03',
    site: 'Cơ sở Dĩ An - Tòa C',
    startTime: '2024-01-15 10:15:00',
    stopTime: '2024-01-15 11:30:00',
    duration: '1h 15m',
    download: '2.89 GB',
    upload: '0.45 GB',
    total: '3.34 GB',
    terminateCause: 'quota-exceeded',
    status: 'completed',
    tags: ['nghi-ngo-vi-pham']
  },
  { 
    sessionId: 'SES-2024011501239',
    username: 'pv.tran',
    fullName: 'Trần Phương Vy',
    deviceType: 'Monitor',
    deviceName: 'Desktop PC',
    mac: 'AA:BB:CC:DD:EE:06',
    ip: '10.0.2.78',
    ssid: 'HCMUS-Staff',
    vlan: 'VLAN 200',
    ap: 'AP-DA-B-01',
    site: 'Cơ sở Dĩ An - Tòa B',
    startTime: '2024-01-15 08:00:00',
    stopTime: '-',
    duration: '5h 30m',
    download: '3.45 GB',
    upload: '0.88 GB',
    total: '4.33 GB',
    terminateCause: '-',
    status: 'active',
    tags: []
  },
  { 
    sessionId: 'SES-2024011501240',
    username: '21120001',
    fullName: 'Nguyễn Văn An',
    deviceType: 'Smartphone',
    deviceName: 'iPhone 13',
    mac: 'AA:BB:CC:DD:EE:07',
    ip: '10.0.1.201',
    ssid: 'HCMUS-Student',
    vlan: 'VLAN 100',
    ap: 'AP-TD-F-02',
    site: 'Cơ sở Thủ Đức - Tòa F',
    startTime: '2024-01-15 13:00:00',
    stopTime: '2024-01-15 14:30:00',
    duration: '1h 30m',
    download: '0.65 GB',
    upload: '0.12 GB',
    total: '0.77 GB',
    terminateCause: 'hard-timeout',
    status: 'completed',
    tags: []
  },
];

export default function Reports() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  
  // Helper to parse tab from URL
  const getTab = () => {
    const params = new URLSearchParams(searchString);
    return params.get('tab') || 'users';
  };

  const [activeTab, setActiveTab] = useState(getTab());
  const [dateRange, setDateRange] = useState('week');

  // Sync tab with URL when search params change
  useEffect(() => {
    setActiveTab(getTab());
  }, [searchString]);

  const handleTabChange = (value: string) => {
    setLocation(`/reports?tab=${value}`);
  };
  const [startDate, setStartDate] = useState('2024-01-11');
  const [endDate, setEndDate] = useState('2024-01-15');
  const [controllerFilter, setControllerFilter] = useState('all');
  const [campusFilter, setCampusFilter] = useState('all');

  // Session Logs Filter States
  const [sessionStartDate, setSessionStartDate] = useState('2024-01-15');
  const [sessionEndDate, setSessionEndDate] = useState('2024-01-15');
  const [sessionRoleFilter, setSessionRoleFilter] = useState('all');
  const [sessionCampusFilter, setSessionCampusFilter] = useState('all');
  const [sessionBuildingFilter, setSessionBuildingFilter] = useState('all');
  const [sessionApFilter, setSessionApFilter] = useState('');
  const [sessionIdentityFilter, setSessionIdentityFilter] = useState('');
  const [sessionCurrentPage, setSessionCurrentPage] = useState(1);
  const [filteredBuildings, setFilteredBuildings] = useState(initialBuildings);
  const sessionItemsPerPage = 5;

  // User Management States
  const [userManagementTab, setUserManagementTab] = useState('wifi-users');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userGroupFilter, setUserGroupFilter] = useState('all');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const userItemsPerPage = 5;

  // Session Management States  
  const [sessionTimeRange, setSessionTimeRange] = useState('today');
  const [sessionUsernameFilter, setSessionUsernameFilter] = useState('');
  const [sessionIpFilter, setSessionIpFilter] = useState('');
  const [sessionMacFilter, setSessionMacFilter] = useState('');
  const [sessionSsidFilter, setSessionSsidFilter] = useState('all');
  const [sessionStatusFilter, setSessionStatusFilter] = useState('all');
  const [sessionTerminateFilter, setSessionTerminateFilter] = useState('all');
  const [sessionsCurrentPage, setSessionsCurrentPage] = useState(1);
  const sessionsItemsPerPage = 5;
  const [selectedUserForSessions, setSelectedUserForSessions] = useState<string | null>(null);
  const [selectedController, setSelectedController] = useState<string | null>(null);

  // Update buildings when campus changes
  useEffect(() => {
    if (sessionCampusFilter === 'all') {
      setFilteredBuildings(initialBuildings);
    } else {
      const campusId = parseInt(sessionCampusFilter);
      setFilteredBuildings(initialBuildings.filter(b => b.campusId === campusId));
    }
    setSessionBuildingFilter('all');
  }, [sessionCampusFilter]);

  const handleExport = (format: 'excel' | 'pdf', reportName: string) => {
    if (format === 'excel') {
      alert(`Đang xuất file Excel: ${reportName}`);
    } else {
      alert(`Đang xuất file PDF: ${reportName}`);
    }
  };

  // KPI Summary Cards
  const KPICards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Tổng người dùng</p>
            <p className="text-2xl font-bold">6,568</p>
            <p className="text-blue-200 text-xs flex items-center mt-1">
              <TrendingUp size={14} className="mr-1" /> +3% so với hôm qua
            </p>
          </div>
          <Users size={32} className="text-blue-200" />
        </div>
      </Card>
      
      <Card className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-cyan-100 text-sm">Băng thông hôm nay</p>
            <p className="text-2xl font-bold">56.7 GB</p>
            <p className="text-cyan-200 text-xs flex items-center mt-1">
              <TrendingUp size={14} className="mr-1" /> DL: 45.2 GB | UL: 11.5 GB
            </p>
          </div>
          <Activity size={32} className="text-cyan-200" />
        </div>
      </Card>
      
      <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">AP hoạt động</p>
            <p className="text-2xl font-bold">323/412</p>
            <p className="text-green-200 text-xs flex items-center mt-1">
              <Wifi size={14} className="mr-1" /> 78% online
            </p>
          </div>
          <Server size={32} className="text-green-200" />
        </div>
      </Card>
      
      <Card className="p-4 bg-gradient-to-br from-red-500 to-red-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100 text-sm">Vi phạm hôm nay</p>
            <p className="text-2xl font-bold">12</p>
            <p className="text-red-200 text-xs flex items-center mt-1">
              <TrendingDown size={14} className="mr-1" /> -5% so với hôm qua
            </p>
          </div>
          <AlertTriangle size={32} className="text-red-200" />
        </div>
      </Card>
    </div>
  );

  // Filter Bar
  const FilterBar = () => (
    <Card className="p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-gray-500" />
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hôm nay</SelectItem>
              <SelectItem value="week">7 ngày</SelectItem>
              <SelectItem value="month">30 ngày</SelectItem>
              <SelectItem value="custom">Tùy chỉnh</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {dateRange === 'custom' && (
          <>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-600">Từ:</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-36" />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-600">Đến:</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-36" />
            </div>
          </>
        )}
        
        <Button variant="outline" size="sm">
          <RefreshCw size={16} className="mr-2" />
          Làm mới
        </Button>
        
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('excel', activeTab)}>
            <FileSpreadsheet size={16} className="mr-2" />
            Xuất Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf', activeTab)}>
            <Download size={16} className="mr-2" />
            Xuất PDF
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
     
      {/* KPI Cards */}
      {/* <KPICards /> */}

      {/* Filter Bar */}
      {/* <FilterBar /> */}

      {/* Filter Bar - Ẩn khi ở tab Người dùng */}
      {activeTab !== 'users' && (
        <Card className="p-4 mb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gray-500" />
              <Label className="text-sm text-gray-600">Từ ngày:</Label>
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="w-40" 
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-600">Đến ngày:</Label>
              <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="w-40" 
              />
            </div>
            <div className="flex items-center gap-2">
              <Server size={18} className="text-gray-500" />
              <Select value={controllerFilter} onValueChange={setControllerFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chọn Controller" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả Controller</SelectItem>
                  {initialControllers.map((ctrl) => (
                    <SelectItem key={ctrl.id} value={ctrl.id.toString()}>
                      {ctrl.name} ({ctrl.ipAddress})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Select value={campusFilter} onValueChange={setCampusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Chọn Cơ sở" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả Cơ sở</SelectItem>
                  {initialCampuses.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id.toString()}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw size={16} className="mr-2" />
              Làm mới
            </Button>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('excel', activeTab)}>
                <FileSpreadsheet size={16} className="mr-2" />
                Xuất Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf', activeTab)}>
                <Download size={16} className="mr-2" />
                Xuất PDF
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Report Content */}
      <Card className="overflow-hidden">
        <Tabs value={activeTab} onValueChange={handleTabChange}>

          {/* Tab: Users Report - User Management & Sessions */}
          <TabsContent value="users" className="p-2 m-0">
            <div className="space-y-6">
             
              {/* Sub-tabs */}
              <Tabs value={userManagementTab} onValueChange={(val) => {
                setUserManagementTab(val);
                if (val === 'wifi-users') {
                  setSelectedUserForSessions(null);
                }
              }}>
                <TabsList className="bg-gray-100 p-1">
                  <TabsTrigger value="wifi-users" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
                    <Users size={16} className="mr-2" />
                    Người dùng WiFi
                  </TabsTrigger>
                  <TabsTrigger value="sessions" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
                    <Clock size={16} className="mr-2" />
                    Phiên truy cập (Sessions)
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Người dùng WiFi */}
                <TabsContent value="wifi-users" className="mt-4">
                  <div className="space-y-4">
                    {/* Search & Filter Bar */}
                    <Card className="p-4 bg-gray-50">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Input 
                            placeholder="Tìm username, email, MSSV..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                        <Select value={userGroupFilter} onValueChange={setUserGroupFilter}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Nhóm" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả nhóm</SelectItem>
                            <SelectItem value="Sinh viên">Sinh viên</SelectItem>
                            <SelectItem value="Giảng viên">Giảng viên</SelectItem>
                            <SelectItem value="Khách">Khách</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Vai trò" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="User">User</SelectItem>
                            <SelectItem value="Staff">Staff</SelectItem>
                            <SelectItem value="Guest">Guest</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="outline" onClick={() => {
                          setUserSearchTerm('');
                          setUserGroupFilter('all');
                          setUserRoleFilter('all');
                        }}>
                          <RefreshCw size={14} className="mr-1" />
                          Reset
                        </Button>
                      </div>
                    </Card>

                    {/* Users Table */}
                    <Card className="overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Họ tên</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Thiết bị online</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Phiên (Ngày/Tuần/Tháng)</th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Upload/Download (Gb)</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Trạng thái</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Hành động</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {mockWifiUsers
                              .filter(user => {
                                const matchSearch = userSearchTerm === '' || 
                                  user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                                  user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                                  user.mssv.toLowerCase().includes(userSearchTerm.toLowerCase());
                                const matchGroup = userGroupFilter === 'all' || user.group === userGroupFilter;
                                const matchRole = userRoleFilter === 'all' || user.role === userRoleFilter;
                                return matchSearch && matchGroup && matchRole;
                              })
                              .slice((userCurrentPage - 1) * userItemsPerPage, userCurrentPage * userItemsPerPage)
                              .map((user) => (
                              <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <div>
                                    <p className="text-small font-medium text-gray-900">{user.username}</p>
                                    <p className="text-small text-gray-500">{user.email}</p>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div>
                                    <p className="text-small text-gray-900">{user.fullName}</p>
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-small ${
                                      user.group === 'Sinh viên' ? 'bg-blue-100 text-blue-700' :
                                      user.group === 'Giảng viên' ? 'bg-green-100 text-green-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {user.group}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-small font-medium ${
                                    user.devicesOnline > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                  }`}>
                                    <Wifi size={14} />
                                    {user.devicesOnline}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <div className="text-small">
                                    <span className="text-blue-600 font-medium">{user.sessionsToday}</span>
                                    <span className="text-gray-400 mx-1">/</span>
                                    <span className="text-green-600">{user.sessionsWeek}</span>
                                    <span className="text-gray-400 mx-1">/</span>
                                    <span className="text-purple-600">{user.sessionsMonth}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="text-sm">
                                    <span className="text-cyan-600">↓ {user.trafficIn}</span>
                                    <span className="text-gray-400 mx-1">/</span>
                                    <span className="text-orange-600">↑ {user.trafficOut}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                    user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                    {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      title="Xem chi tiết phiên"
                                      onClick={() => {
                                        setSelectedUserForSessions(user.username);
                                        setUserManagementTab('sessions');
                                      }}
                                    >
                                      <Eye size={16} className="text-blue-600" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      title={user.status === 'active' ? 'Tạm khóa truy cập' : 'Mở khóa truy cập'}
                                    >
                                      <Ban size={16} className={user.status === 'active' ? 'text-red-600' : 'text-green-600'} />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination */}
                      <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Hiển thị {Math.min((userCurrentPage - 1) * userItemsPerPage + 1, mockWifiUsers.length)} - {Math.min(userCurrentPage * userItemsPerPage, mockWifiUsers.length)} / {mockWifiUsers.length} người dùng
                        </p>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={userCurrentPage === 1}
                            onClick={() => setUserCurrentPage(p => p - 1)}
                          >
                            <ChevronLeft size={16} />
                          </Button>
                          <span className="px-3 py-1 bg-[#1e3a5f] text-white rounded text-sm font-medium">
                            {userCurrentPage}
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={userCurrentPage * userItemsPerPage >= mockWifiUsers.length}
                            onClick={() => setUserCurrentPage(p => p + 1)}
                          >
                            <ChevronRight size={16} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                {/* Tab 2: Phiên truy cập (Sessions) */}
                <TabsContent value="sessions" className="mt-4">
                  <div className="space-y-4">
                    {/* Filter Bar */}
                    <Card className="p-4 bg-gray-50">
                      <div className="space-y-3">
                        {/* Row 1 */}
                        <div className="flex flex-wrap items-center gap-3">
                          <Select value={sessionTimeRange} onValueChange={setSessionTimeRange}>
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Thời gian" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="today">Hôm nay</SelectItem>
                              <SelectItem value="7days">7 ngày</SelectItem>
                              <SelectItem value="30days">30 ngày</SelectItem>
                              <SelectItem value="custom">Tùy chỉnh</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="relative">
                            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input 
                              placeholder="Username"
                              value={selectedUserForSessions || sessionUsernameFilter}
                              onChange={(e) => {
                                setSessionUsernameFilter(e.target.value);
                                setSelectedUserForSessions(null);
                              }}
                              className="pl-7 w-[130px]"
                            />
                          </div>
                          <Input 
                            placeholder="IP Address"
                            value={sessionIpFilter}
                            onChange={(e) => setSessionIpFilter(e.target.value)}
                            className="w-[130px]"
                          />
                          <Input 
                            placeholder="MAC Address"
                            value={sessionMacFilter}
                            onChange={(e) => setSessionMacFilter(e.target.value)}
                            className="w-[150px]"
                          />
                        </div>
                        {/* Row 2 */}
                        <div className="flex flex-wrap items-center gap-3">
                          <Select value={sessionSsidFilter} onValueChange={setSessionSsidFilter}>
                            <SelectTrigger className="w-[150px]">
                              <SelectValue placeholder="SSID" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tất cả SSID</SelectItem>
                              <SelectItem value="HCMUS-Student">HCMUS-Student</SelectItem>
                              <SelectItem value="HCMUS-Staff">HCMUS-Staff</SelectItem>
                              <SelectItem value="HCMUS-Guest">HCMUS-Guest</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={sessionCampusFilter} onValueChange={setSessionCampusFilter}>
                            <SelectTrigger className="w-[150px]">
                              <SelectValue placeholder="Khu vực" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tất cả khu vực</SelectItem>
                              {initialCampuses.map((campus) => (
                                <SelectItem key={campus.id} value={campus.id.toString()}>
                                  {campus.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={sessionStatusFilter} onValueChange={setSessionStatusFilter}>
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tất cả</SelectItem>
                              <SelectItem value="active">Đang hoạt động</SelectItem>
                              <SelectItem value="completed">Đã kết thúc</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={sessionTerminateFilter} onValueChange={setSessionTerminateFilter}>
                            <SelectTrigger className="w-[160px]">
                              <SelectValue placeholder="Nguyên nhân KT" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tất cả</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="user-request">User Request</SelectItem>
                              <SelectItem value="idle-timeout">Idle Timeout</SelectItem>
                              <SelectItem value="hard-timeout">Hard Timeout</SelectItem>
                              <SelectItem value="quota-exceeded">Quota Exceeded</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="outline" onClick={() => {
                            setSessionUsernameFilter('');
                            setSessionIpFilter('');
                            setSessionMacFilter('');
                            setSessionSsidFilter('all');
                            setSessionStatusFilter('all');
                            setSessionTerminateFilter('all');
                            setSelectedUserForSessions(null);
                          }}>
                            <RefreshCw size={14} />
                          </Button>
                          <div className="ml-auto">
                            <Button size="sm" variant="outline" onClick={() => handleExport('excel', 'sessions-csv')}>
                              <Download size={14} className="mr-1" />
                              Export CSV 
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {selectedUserForSessions && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                        <span className="text-sm text-blue-700">
                          Đang lọc phiên của user: <strong>{selectedUserForSessions}</strong>
                        </span>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedUserForSessions(null)}>
                          Xóa bộ lọc
                        </Button>
                      </div>
                    )}

                    {/* Sessions Table */}
                    <Card className="overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-3 text-left font-semibold text-gray-700">Session ID</th>
                              <th className="px-3 py-3 text-left font-semibold text-gray-700">User</th>
                              <th className="px-3 py-3 text-left font-semibold text-gray-700">Thiết bị</th>
                              <th className="px-3 py-3 text-left font-semibold text-gray-700">IP</th>
                              <th className="px-3 py-3 text-left font-semibold text-gray-700">SSID/VLAN</th>
                              <th className="px-3 py-3 text-left font-semibold text-gray-700">AP/Site</th>
                              <th className="px-3 py-3 text-left font-semibold text-gray-700">Start/Stop</th>
                              <th className="px-3 py-3 text-right font-semibold text-gray-700">Duration</th>
                              <th className="px-3 py-3 text-right font-semibold text-gray-700">DL/UL/Total</th>
                              <th className="px-3 py-3 text-center font-semibold text-gray-700">Terminate</th>
                              <th className="px-3 py-3 text-center font-semibold text-gray-700">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {mockUserSessions
                              .filter(session => {
                                const matchUser = !selectedUserForSessions || session.username === selectedUserForSessions;
                                const matchUsername = sessionUsernameFilter === '' || session.username.toLowerCase().includes(sessionUsernameFilter.toLowerCase());
                                const matchIp = sessionIpFilter === '' || session.ip.includes(sessionIpFilter);
                                const matchMac = sessionMacFilter === '' || session.mac.toLowerCase().includes(sessionMacFilter.toLowerCase());
                                const matchSsid = sessionSsidFilter === 'all' || session.ssid === sessionSsidFilter;
                                const matchStatus = sessionStatusFilter === 'all' || session.status === sessionStatusFilter;
                                const matchTerminate = sessionTerminateFilter === 'all' || session.terminateCause === sessionTerminateFilter;
                                return matchUser && matchUsername && matchIp && matchMac && matchSsid && matchStatus && matchTerminate;
                              })
                              .slice((sessionsCurrentPage - 1) * sessionsItemsPerPage, sessionsCurrentPage * sessionsItemsPerPage)
                              .map((session) => (
                              <tr key={session.sessionId} className="hover:bg-gray-50">
                                <td className="px-3 py-2">
                                  <p className="font-mono text-small text-gray-600">{session.sessionId}</p>
                                  {session.tags.length > 0 && (
                                    <div className="flex gap-1 mt-1">
                                      {session.tags.map((tag, idx) => (
                                        <span key={idx} className="px-1.5 py-0.5 bg-red-100 text-red-700 text-small rounded">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  <p className="font-medium text-gray-900">{session.username}</p>
                                  <p className="text-small text-gray-500">{session.fullName}</p>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-1">
                                    {session.deviceType === 'Laptop' && <Laptop size={14} className="text-gray-500" />}
                                    {session.deviceType === 'Smartphone' && <Smartphone size={14} className="text-gray-500" />}
                                    {session.deviceType === 'Monitor' && <Monitor size={14} className="text-gray-500" />}
                                    <span className="text-small">{session.deviceName}</span>
                                  </div>
                                  <p className="font-mono text-small text-gray-400">{session.mac}</p>
                                </td>
                                <td className="px-3 py-2 font-mono text-small text-gray-600">{session.ip}</td>
                                <td className="px-3 py-2">
                                  <p className="text-small font-medium">{session.ssid}</p>
                                  <p className="text-small text-gray-500">{session.vlan}</p>
                                </td>
                                <td className="px-3 py-2">
                                  <p className="text-small font-medium">{session.ap}</p>
                                  <p className="text-small text-gray-500">{session.site}</p>
                                </td>
                                <td className="px-3 py-2">
                                  <p className="text-small">{session.startTime}</p>
                                  <p className="text-small text-gray-500">{session.stopTime}</p>
                                </td>
                                <td className="px-3 py-2 text-right font-medium">{session.duration}</td>
                                <td className="px-3 py-2 text-right">
                                  <p className="text-small"><span className="text-cyan-600">↓{session.download}</span></p>
                                  <p className="text-small"><span className="text-orange-600">↑{session.upload}</span></p>
                                  <p className="text-small font-bold">{session.total}</p>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded text-small ${
                                    session.terminateCause === 'normal' ? 'bg-green-100 text-green-700' :
                                    session.terminateCause === 'user-request' ? 'bg-blue-100 text-blue-700' :
                                    session.terminateCause === 'idle-timeout' ? 'bg-yellow-100 text-yellow-700' :
                                    session.terminateCause === 'hard-timeout' ? 'bg-orange-100 text-orange-700' :
                                    session.terminateCause === 'quota-exceeded' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {session.terminateCause}
                                  </span>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center justify-center gap-1">
                                      <Button variant="ghost" size="sm" title="Force Disconnect">
                                        <Power size={14} className="text-red-600" />
                                      </Button>
                                    <Button variant="ghost" size="sm" title="Gắn tag">
                                      <Tag size={14} className="text-amber-600" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination */}
                      <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Hiển thị {Math.min((sessionsCurrentPage - 1) * sessionsItemsPerPage + 1, mockUserSessions.length)} - {Math.min(sessionsCurrentPage * sessionsItemsPerPage, mockUserSessions.length)} / {mockUserSessions.length} phiên
                        </p>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={sessionsCurrentPage === 1}
                            onClick={() => setSessionsCurrentPage(p => p - 1)}
                          >
                            <ChevronLeft size={16} />
                          </Button>
                          <span className="px-3 py-1 bg-[#1e3a5f] text-white rounded text-sm font-medium">
                            {sessionsCurrentPage}
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={sessionsCurrentPage * sessionsItemsPerPage >= mockUserSessions.length}
                            onClick={() => setSessionsCurrentPage(p => p + 1)}
                          >
                            <ChevronRight size={16} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          {/* Tab: Bandwidth Report */}
          <TabsContent value="bandwidth" className="p-6 m-0">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Sử dụng băng thông theo thời gian</h3>
              
              {/* Summary */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">216.2 GB</p>
                  <p className="text-sm text-gray-600">Tổng Download</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">54.5 GB</p>
                  <p className="text-sm text-gray-600">Tổng Upload</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-600">14:30</p>
                  <p className="text-sm text-gray-600">Giờ cao điểm</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">119 Mbps</p>
                  <p className="text-sm text-gray-600">Tốc độ TB</p>
                </div>
              </div>
              
              {/* Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ngày</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Download</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Upload</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Cao điểm</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Tốc độ TB</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {mockBandwidthData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{row.date}</td>
                        <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">{row.download}</td>
                        <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">{row.upload}</td>
                        <td className="px-4 py-3 text-sm text-right">{row.peak}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">{row.avgSpeed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Infrastructure Report (Controllers + APs) */}
          <TabsContent value="infrastructure" className="p-2 m-0">
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Tổng Controller</p>
                      <p className="text-2xl font-bold">{mockControllerReportData.length}</p>
                    </div>
                    <Server size={28} className="text-blue-200" />
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Tổng AP</p>
                      <p className="text-2xl font-bold">{mockControllerReportData.reduce((sum, c) => sum + c.apCount, 0)}</p>
                    </div>
                    <Wifi size={28} className="text-green-200" />
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cyan-100 text-sm">Tổng Clients</p>
                      <p className="text-2xl font-bold">{mockControllerReportData.reduce((sum, c) => sum + c.clients, 0).toLocaleString()}</p>
                    </div>
                    <Users size={28} className="text-cyan-200" />
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-100 text-sm">CPU TB</p>
                      <p className="text-2xl font-bold">{Math.round(mockControllerReportData.reduce((sum, c) => sum + c.cpu, 0) / mockControllerReportData.length)}%</p>
                    </div>
                    <Activity size={28} className="text-amber-200" />
                  </div>
                </Card>
              </div>

              {/* Controllers Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Server size={20} className="text-blue-600" />
                    Bộ điều khiển WiFi (Controllers)
                  </h3>
                  <p className="text-sm text-gray-500">Click vào controller để xem danh sách AP</p>
                </div>
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tên Controller</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Model/Firmware</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vị trí</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Số AP</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Clients</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">CPU/Memory</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {mockControllerReportData.map((row, idx) => (
                          <tr 
                            key={idx} 
                            className={`cursor-pointer transition-colors ${selectedController === row.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
                            onClick={() => setSelectedController(selectedController === row.id ? null : row.id)}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${selectedController === row.id ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                <div>
                                  <div className="font-medium text-sm">{row.name}</div>
                                  <div className="text-xs text-gray-500">{row.ip}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="text-gray-900">{row.model}</div>
                              <div className="text-xs text-gray-500">v{row.firmware}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{row.location}</td>
                            <td className="px-4 py-3 text-sm text-right font-medium">{row.apCount}</td>
                            <td className="px-4 py-3 text-sm text-right">{row.clients.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="text-right">
                                  <div className={`text-xs ${row.cpu > 80 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                                    CPU: {row.cpu}%
                                  </div>
                                  <div className={`text-xs ${row.memory > 80 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                                    Mem: {row.memory}%
                                  </div>
                                </div>
                                <div className="w-12 space-y-1">
                                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${row.cpu > 80 ? 'bg-red-500' : row.cpu > 60 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${row.cpu}%` }} />
                                  </div>
                                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${row.memory > 80 ? 'bg-red-500' : row.memory > 60 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${row.memory}%` }} />
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              {/* Access Points Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Wifi size={20} className="text-green-600" />
                    Điểm phát WiFi (Access Points)
                    {selectedController && (
                      <span className="text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        của {selectedController}
                      </span>
                    )}
                  </h3>
                  {selectedController && (
                    <Button size="sm" variant="outline" onClick={() => setSelectedController(null)}>
                      Xem tất cả AP
                    </Button>
                  )}
                </div>
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tên AP</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vị trí</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Trạng thái</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Lượt truy cập</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Client TB</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">% Sử dụng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {mockAPAccessData
                          .filter(ap => !selectedController || ap.controllerId === selectedController)
                          .map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium">{row.apName}</div>
                              {!selectedController && <div className="text-xs text-gray-400">{row.controllerId}</div>}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{row.location}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                row.status === 'online' ? 'bg-green-100 text-green-700' :
                                row.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  row.status === 'online' ? 'bg-green-500' :
                                  row.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                                }`} />
                                {row.status === 'online' ? 'Online' : row.status === 'warning' ? 'Cảnh báo' : 'Offline'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right">{row.totalAccess.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-right">{row.avgClients}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      row.usage > 80 ? 'bg-red-500' : row.usage > 60 ? 'bg-amber-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${row.usage}%` }}
                                  />
                                </div>
                                <span className={`text-sm font-medium ${
                                  row.usage > 80 ? 'text-red-600' : row.usage > 60 ? 'text-amber-600' : 'text-green-600'
                                }`}>{row.usage}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {selectedController && mockAPAccessData.filter(ap => ap.controllerId === selectedController).length === 0 && (
                    <div className="p-8 text-center text-gray-500">Không có AP nào thuộc controller này</div>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Violations */}
          <TabsContent value="violations" className="p-6 m-0">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Báo cáo vi phạm chính sách</h3>
              
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">4</p>
                      <p className="text-sm text-gray-600">Nghiêm trọng</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <div>
                      <p className="text-2xl font-bold text-amber-600">5</p>
                      <p className="text-sm text-gray-600">Trung bình</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">3</p>
                      <p className="text-sm text-gray-600">Thấp</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* List */}
              <div className="space-y-2">
                {mockViolationData.map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                    item.severity === 'high' ? 'bg-red-50 border-red-500' :
                    item.severity === 'medium' ? 'bg-amber-50 border-amber-500' :
                    'bg-gray-50 border-gray-400'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">{item.time}</span>
                        <span className="font-medium">{item.type}</span>
                      </div>
                      <span className="text-sm text-gray-600">{item.user}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tab: Sessions - Nhật ký Phiên truy cập WIFI */}
          <TabsContent value="sessions" className="p-6 m-0">
            <div className="space-y-6">
              {/* A. Header */}
              <div>
                <h2 className="text-xl font-bold text-[#1e3a5f]">Nhật ký Phiên truy cập WIFI </h2>
                <p className="text-sm text-gray-500 mt-1">Theo dõi và kiểm toán chi tiết các phiên kết nối của người dùng</p>
              </div>
              
              {/* B. Khu vực Bộ lọc (Filter Bar) - Đã chuyển lên filter chung */}
              {/* <Card className="p-3 bg-gray-50 border-[#1e3a5f]/20">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Label className="text-xs text-gray-500 whitespace-nowrap">Từ</Label>
                      <Input 
                        type="date" 
                        value={sessionStartDate} 
                        onChange={(e) => setSessionStartDate(e.target.value)}
                        className="w-[130px] h-9"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Label className="text-xs text-gray-500 whitespace-nowrap">Đến</Label>
                      <Input 
                        type="date" 
                        value={sessionEndDate} 
                        onChange={(e) => setSessionEndDate(e.target.value)}
                        className="w-[130px] h-9"
                      />
                    </div>
                  </div>
                  
                  <Select value={sessionRoleFilter} onValueChange={setSessionRoleFilter}>
                    <SelectTrigger className="w-[120px] h-9">
                      <SelectValue placeholder="Vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="Sinh viên">Sinh viên</SelectItem>
                      <SelectItem value="Cán bộ">Cán bộ</SelectItem>
                      <SelectItem value="Khách">Khách</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sessionCampusFilter} onValueChange={setSessionCampusFilter}>
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue placeholder="Cơ sở" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả cơ sở</SelectItem>
                      {initialCampuses.map((campus) => (
                        <SelectItem key={campus.id} value={campus.id.toString()}>
                          {campus.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={sessionBuildingFilter} onValueChange={setSessionBuildingFilter}>
                    <SelectTrigger className="w-[130px] h-9">
                      <SelectValue placeholder="Tòa nhà" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {filteredBuildings.map((building) => (
                        <SelectItem key={building.id} value={building.id.toString()}>
                          {building.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="relative">
                    <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      placeholder="AP / Controller"
                      value={sessionApFilter}
                      onChange={(e) => setSessionApFilter(e.target.value)}
                      className="pl-7 w-[140px] h-9"
                    />
                  </div>
                  
                  <div className="relative">
                    <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      placeholder="User / MAC / IP"
                      value={sessionIdentityFilter}
                      onChange={(e) => setSessionIdentityFilter(e.target.value)}
                      className="pl-7 w-[150px] h-9"
                    />
                  </div>
                  
                  <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 h-9">
                    <Search size={14} className="mr-1" />
                    Lọc
                  </Button>
                  <Button size="sm" variant="outline" className="h-9" onClick={() => {
                    setSessionRoleFilter('all');
                    setSessionCampusFilter('all');
                    setSessionBuildingFilter('all');
                    setSessionApFilter('');
                    setSessionIdentityFilter('');
                  }}>
                    <RefreshCw size={14} />
                  </Button>
                  
                  <div className="ml-auto flex gap-2">
                    <Button size="sm" variant="outline" className="h-9" onClick={() => handleExport('excel', 'session-logs')}>
                      <FileSpreadsheet size={14} className="mr-1" />
                      Excel
                    </Button>
                    <Button size="sm" variant="outline" className="h-9" onClick={() => handleExport('pdf', 'session-logs')}>
                      <Download size={14} className="mr-1" />
                      CSV
                    </Button>
                  </div>
                </div>
              </Card> */}
              
              {/* D. Tóm tắt Biểu đồ - Summary Stats */}
              {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-2 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8f] text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-200 text-sm">Tổng số Phiên</p>
                      <p className="text-3xl font-bold">{mockSessionData.length}</p>
                    </div>
                    <Clock size={28} className="text-blue-200" />
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cyan-100 text-sm">Tổng Data Used</p>
                      <p className="text-3xl font-bold">
                        {mockSessionData.reduce((sum, s) => sum + s.dataUsed, 0).toFixed(2)} GB
                      </p>
                    </div>
                    <Activity size={28} className="text-cyan-200" />
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Sinh viên</p>
                      <p className="text-3xl font-bold">
                        {mockSessionData.filter(s => s.role === 'Sinh viên').length}
                      </p>
                    </div>
                    <Users size={28} className="text-green-200" />
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-100 text-sm">Cán bộ + Khách</p>
                      <p className="text-3xl font-bold">
                        {mockSessionData.filter(s => s.role !== 'Sinh viên').length}
                      </p>
                    </div>
                    <Users size={28} className="text-amber-200" />
                  </div>
                </Card>
              </div> */}
              
              {/* C. Bảng Dữ liệu (Data Table) */}
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="text-lg font-semibold text-gray-700 bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Username</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Vai trò</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">MAC Address</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">IP Address</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Bắt đầu</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Kết thúc</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Thời lượng</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Data (GB)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {mockSessionData
                        .slice((sessionCurrentPage - 1) * sessionItemsPerPage, sessionCurrentPage * sessionItemsPerPage)
                        .map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{row.username}</p>
                              <p className="text-xs text-gray-500">{row.ap}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              row.role === 'Sinh viên' ? 'bg-blue-100 text-blue-700' :
                              row.role === 'Cán bộ' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {row.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-600">{row.macAddress}</td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-600">{row.ipAddress}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{row.startTime}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{row.endTime}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">{row.duration}</td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-[#1e3a5f]">{row.dataUsed.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Hiển thị {Math.min((sessionCurrentPage - 1) * sessionItemsPerPage + 1, mockSessionData.length)} - {Math.min(sessionCurrentPage * sessionItemsPerPage, mockSessionData.length)} / {mockSessionData.length} phiên
                  </p>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={sessionCurrentPage === 1}
                      onClick={() => setSessionCurrentPage(p => p - 1)}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <span className="px-3 py-1 bg-[#1e3a5f] text-white rounded text-sm font-medium">
                      {sessionCurrentPage}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={sessionCurrentPage * sessionItemsPerPage >= mockSessionData.length}
                      onClick={() => setSessionCurrentPage(p => p + 1)}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Incidents */}
          <TabsContent value="incidents" className="p-6 m-0">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Báo cáo giám sát sự cố</h3>
              
              {/* List */}
              <div className="space-y-3">
                {mockIncidentData.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white border rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.priority === 'high' ? 'bg-red-100' :
                        item.priority === 'medium' ? 'bg-amber-100' : 'bg-gray-100'
                      }`}>
                        <AlertTriangle size={20} className={
                          item.priority === 'high' ? 'text-red-600' :
                          item.priority === 'medium' ? 'text-amber-600' : 'text-gray-600'
                        } />
                      </div>
                      <div>
                        <p className="font-medium">{item.ap}</p>
                        <p className="text-sm text-gray-600">{item.type}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'pending' ? 'bg-red-100 text-red-700' :
                      item.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.status === 'pending' ? 'Chưa xử lý' :
                       item.status === 'processing' ? 'Đang xử lý' : 'Đã xử lý'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tab: Logs */}
          <TabsContent value="logs" className="p-6 m-0">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Nhật ký hệ thống</h3>
              
              {/* Quick filters */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-700">INFO</Button>
                <Button variant="outline" size="sm" className="bg-amber-50 border-amber-200 text-amber-700">WARNING</Button>
                <Button variant="outline" size="sm" className="bg-red-50 border-red-200 text-red-700">ERROR</Button>
              </div>
              
              {/* Log entries */}
              <div className="font-mono text-sm bg-gray-900 text-gray-100 p-4 rounded-lg max-h-96 overflow-auto">
                <p className="text-blue-400">[2024-01-15 10:30:00] <span className="text-green-400">INFO</span>  Auth: User login: superadmin from 192.168.1.100</p>
                <p className="text-blue-400">[2024-01-15 10:35:00] <span className="text-green-400">INFO</span>  Config: AP configuration updated: AP-A1-07</p>
                <p className="text-blue-400">[2024-01-15 11:00:00] <span className="text-amber-400">WARNING</span>  System: High memory usage detected on server</p>
                <p className="text-blue-400">[2024-01-15 11:30:00] <span className="text-red-400">ERROR</span>  Controller: Connection lost to UniFi Controller 2</p>
                <p className="text-blue-400">[2024-01-15 12:00:00] <span className="text-green-400">INFO</span>  Policy: Bandwidth policy updated for Students group</p>
                <p className="text-blue-400">[2024-01-15 12:15:00] <span className="text-green-400">INFO</span>  Auth: User logout: superadmin</p>
                <p className="text-blue-400">[2024-01-15 12:30:00] <span className="text-amber-400">WARNING</span>  AP: High CPU usage on AP-C1-01 (89%)</p>
                <p className="text-blue-400">[2024-01-15 13:00:00] <span className="text-green-400">INFO</span>  Radius: Session started for user 10011@student</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
