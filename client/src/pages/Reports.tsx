import { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';

// Import mock data
import { initialCampuses, initialBuildings } from '@/data/mockData';

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

const mockAPAccessData = [
  { apName: 'AP-A1-01', location: 'Tòa A, Tầng 1', totalAccess: 1245, avgClients: 45, usage: 78 },
  { apName: 'AP-A1-02', location: 'Tòa A, Tầng 2', totalAccess: 1389, avgClients: 52, usage: 85 },
  { apName: 'AP-B1-01', location: 'Tòa B, Tầng 1', totalAccess: 987, avgClients: 38, usage: 62 },
  { apName: 'AP-B2-01', location: 'Tòa B, Tầng 2', totalAccess: 1102, avgClients: 41, usage: 68 },
  { apName: 'AP-C1-01', location: 'Tòa C, Tầng 1', totalAccess: 1567, avgClients: 58, usage: 92 },
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

export default function Reports() {
  const [activeTab, setActiveTab] = useState('users');
  const [dateRange, setDateRange] = useState('week');
  const [startDate, setStartDate] = useState('2024-01-11');
  const [endDate, setEndDate] = useState('2024-01-15');

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

      {/* Report Tabs */}
      <Card className="overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start rounded-none border-b bg-gray-50 p-0 h-auto flex-wrap">
            <TabsTrigger 
              value="users" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white px-6 py-3"
            >
              <Users size={16} className="mr-2" />
              Người dùng
            </TabsTrigger>
            <TabsTrigger 
              value="bandwidth"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white px-6 py-3"
            >
              <Activity size={16} className="mr-2" />
              Băng thông
            </TabsTrigger>
            <TabsTrigger 
              value="ap"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white px-6 py-3"
            >
              <Wifi size={16} className="mr-2" />
              Điểm phát
            </TabsTrigger>
            <TabsTrigger 
              value="violations"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white px-6 py-3"
            >
              <Shield size={16} className="mr-2" />
              Vi phạm
            </TabsTrigger>
            <TabsTrigger 
              value="sessions"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1e3a5f] data-[state=active]:bg-white px-6 py-3"
            >
              <Clock size={16} className="mr-2" />
              Nhật ký Phiên
            </TabsTrigger>
            <TabsTrigger 
              value="incidents"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white px-6 py-3"
            >
              <AlertTriangle size={16} className="mr-2" />
              Sự cố
            </TabsTrigger>
            <TabsTrigger 
              value="logs"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white px-6 py-3"
            >
              <FileText size={16} className="mr-2" />
              Nhật ký
            </TabsTrigger>
          </TabsList>

          {/* Tab: Users Report */}
          <TabsContent value="users" className="p-6 m-0">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Báo cáo người dùng theo thời gian</h3>
              
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-600">79%</p>
                  <p className="text-sm text-gray-600">Sinh viên</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-600">19%</p>
                  <p className="text-sm text-gray-600">Cán bộ</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg text-center">
                  <p className="text-3xl font-bold text-gray-600">2%</p>
                  <p className="text-sm text-gray-600">Khách</p>
                </div>
              </div>
              
              {/* Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ngày</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Sinh viên</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Cán bộ</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Khách</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Tổng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {mockUserReportData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{row.date}</td>
                        <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">{row.students.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">{row.staff.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-500">{row.guests}</td>
                        <td className="px-4 py-3 text-sm text-right font-bold">{row.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

          {/* Tab: AP Report */}
          <TabsContent value="ap" className="p-6 m-0">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Lượt truy cập theo điểm phát WIFI</h3>
              
              {/* Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tên AP</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vị trí</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Lượt truy cập</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Client TB</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">% Sử dụng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {mockAPAccessData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{row.apName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.location}</td>
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
              
              {/* B. Khu vực Bộ lọc (Filter Bar) - Compact */}
              <Card className="p-3 bg-gray-50 border-[#1e3a5f]/20">
                <div className="flex flex-wrap items-end gap-3">
                  {/* Thời gian */}
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
                  
                  {/* Vai trò */}
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
                  
                  {/* Cơ sở */}
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
                  
                  {/* Tòa nhà */}
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
                  
                  {/* AP/Controller */}
                  <div className="relative">
                    <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      placeholder="AP / Controller"
                      value={sessionApFilter}
                      onChange={(e) => setSessionApFilter(e.target.value)}
                      className="pl-7 w-[140px] h-9"
                    />
                  </div>
                  
                  {/* Username/MAC/IP */}
                  <div className="relative">
                    <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      placeholder="User / MAC / IP"
                      value={sessionIdentityFilter}
                      onChange={(e) => setSessionIdentityFilter(e.target.value)}
                      className="pl-7 w-[150px] h-9"
                    />
                  </div>
                  
                  {/* Buttons */}
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
              </Card>
              
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
                    <thead className="bg-[#1e3a5f] text-white">
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
