import { useState } from 'react';
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
  RefreshCw
} from 'lucide-react';

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
  { user: '10011@student', duration: '4h 15m', data: '1.2 GB', ap: 'AP-A1-01' },
  { user: '10012@student', duration: '8h 30m', data: '2.8 GB', ap: 'AP-B1-01' },
  { user: 'admin@hcmus', duration: '10h 15m', data: '5.5 GB', ap: 'AP-C1-01' },
  { user: 'guest001', duration: '2h 00m', data: '0.3 GB', ap: 'AP-A1-02' },
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
        <p className="text-gray-600 mt-1">Xem và xuất báo cáo hệ thống WIFI</p>
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Filter Bar */}
      <FilterBar />

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
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white px-6 py-3"
            >
              <Clock size={16} className="mr-2" />
              Phiên
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

          {/* Tab: Sessions */}
          <TabsContent value="sessions" className="p-6 m-0">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Báo cáo phiên làm việc</h3>
              
              {/* Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Người dùng</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Thời lượng</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Dữ liệu</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Điểm phát</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {mockSessionData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{row.user}</td>
                        <td className="px-4 py-3 text-sm text-right">{row.duration}</td>
                        <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">{row.data}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.ap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
