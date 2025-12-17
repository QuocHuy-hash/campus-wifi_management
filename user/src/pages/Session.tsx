import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Wifi, LogOut, History, Clock, Monitor, Smartphone, Laptop, 
  Download, Upload, MapPin, Calendar, Filter, ChevronRight,
  Activity, Globe, Server, CheckCircle, XCircle,
  Menu, X, User, Settings, HelpCircle
} from 'lucide-react';

// Mock session data
const mockSessions = [
  {
    id: 'sess_001',
    startTime: '2024-12-16T08:30:00',
    endTime: null,
    duration: null,
    status: 'active',
    device: 'Laptop',
    deviceName: 'MacBook Pro',
    mac: 'AA:BB:CC:DD:EE:01',
    ip: '10.0.15.45',
    apName: 'AP-Library-F2-01',
    apLocation: 'Thư viện - Tầng 2',
    ssid: 'HCMUS-Student',
    upload: 156000000,
    download: 892000000,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    gateway: '10.0.0.1',
    terminateCause: null
  },
  {
    id: 'sess_002',
    startTime: '2024-12-15T14:20:00',
    endTime: '2024-12-15T18:20:00',
    duration: 14400,
    status: 'ended',
    device: 'Smartphone',
    deviceName: 'iPhone 15',
    mac: 'AA:BB:CC:DD:EE:02',
    ip: '10.0.15.102',
    apName: 'AP-Canteen-F1-03',
    apLocation: 'Căng tin - Tầng 1',
    ssid: 'HCMUS-Student',
    upload: 45000000,
    download: 320000000,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
    gateway: '10.0.0.1',
    terminateCause: 'Session-Timeout'
  },
  {
    id: 'sess_003',
    startTime: '2024-12-15T09:00:00',
    endTime: '2024-12-15T11:30:00',
    duration: 9000,
    status: 'ended',
    device: 'Laptop',
    deviceName: 'Dell XPS 15',
    mac: 'AA:BB:CC:DD:EE:03',
    ip: '10.0.15.78',
    apName: 'AP-ClassA-F3-02',
    apLocation: 'Phòng học A305',
    ssid: 'HCMUS-Student',
    upload: 89000000,
    download: 567000000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    gateway: '10.0.0.1',
    terminateCause: 'User-Request'
  },
  {
    id: 'sess_004',
    startTime: '2024-12-14T16:45:00',
    endTime: '2024-12-14T17:15:00',
    duration: 1800,
    status: 'timeout',
    device: 'Tablet',
    deviceName: 'iPad Pro',
    mac: 'AA:BB:CC:DD:EE:04',
    ip: '10.0.15.156',
    apName: 'AP-Lab-F2-01',
    apLocation: 'Phòng Lab CNTT',
    ssid: 'HCMUS-Student',
    upload: 12000000,
    download: 45000000,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0)',
    gateway: '10.0.0.1',
    terminateCause: 'Idle-Timeout'
  },
  {
    id: 'sess_005',
    startTime: '2024-12-14T08:00:00',
    endTime: '2024-12-14T08:05:00',
    duration: 300,
    status: 'blocked',
    device: 'Smartphone',
    deviceName: 'Samsung Galaxy',
    mac: 'AA:BB:CC:DD:EE:05',
    ip: '10.0.15.200',
    apName: 'AP-Lobby-F1-01',
    apLocation: 'Sảnh chính',
    ssid: 'HCMUS-Student',
    upload: 1000000,
    download: 5000000,
    userAgent: 'Mozilla/5.0 (Linux; Android 14)',
    gateway: '10.0.0.1',
    terminateCause: 'Admin-Reset'
  },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '--';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} phút`;
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('vi-VN', { 
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function getDeviceIcon(device: string) {
  switch (device) {
    case 'Smartphone': return <Smartphone size={18} />;
    case 'Laptop': return <Laptop size={18} />;
    case 'Tablet': return <Monitor size={18} />;
    default: return <Monitor size={18} />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><Activity size={12} /> Đang hoạt động</span>;
    case 'ended':
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"><CheckCircle size={12} /> Đã kết thúc</span>;
    case 'timeout':
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><Clock size={12} /> Hết thời gian</span>;
    case 'blocked':
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle size={12} /> Bị chặn</span>;
    default:
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
  }
}

export default function Session() {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<typeof mockSessions[0] | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [logoutAllDialogOpen, setLogoutAllDialogOpen] = useState(false);
  
  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Get user info
  const userStr = localStorage.getItem('portalUser');
  const user = userStr ? JSON.parse(userStr) : null;

  // Calculate active session duration
  const activeSession = mockSessions.find(s => s.status === 'active');
  const activeDuration = activeSession ? Math.floor((Date.now() - new Date(activeSession.startTime).getTime()) / 1000) : 0;

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return mockSessions.filter(session => {
      if (deviceFilter !== 'all' && session.device !== deviceFilter) return false;
      if (statusFilter !== 'all' && session.status !== statusFilter) return false;
      if (dateFrom && new Date(session.startTime) < new Date(dateFrom)) return false;
      if (dateTo && new Date(session.startTime) > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    });
  }, [deviceFilter, statusFilter, dateFrom, dateTo]);

  const handleLogout = () => {
    localStorage.removeItem('portalLoggedIn');
    localStorage.removeItem('portalUser');
    setLocation('/');
  };

  const handleSessionLogout = () => {
    setLogoutDialogOpen(false);
    setDetailModalOpen(false);
  };

  const openSessionDetail = (session: typeof mockSessions[0]) => {
    setSelectedSession(session);
    setDetailModalOpen(true);
  };

  if (!user) {
    setLocation('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Wifi size={18} className="text-white" />
              </div>
              <span className="font-semibold text-gray-900 hidden sm:inline">HCMUS WiFi</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right mr-2">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLogoutAllDialogOpen(true)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut size={16} className="mr-1" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className={`
          fixed md:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-64 bg-white border-r border-gray-200 
          transform transition-transform duration-300 z-30
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <nav className="p-4 space-y-2">
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-700 font-medium">
              <History size={20} />
              Lịch sử phiên
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100">
              <User size={20} />
              Thông tin tài khoản
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100">
              <Settings size={20} />
              Cài đặt
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100">
              <HelpCircle size={20} />
              Trợ giúp
            </a>
          </nav>
        </aside>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 max-w-6xl">
          {/* Current Session Card */}
          {activeSession && (
            <Card className="p-4 md:p-6 mb-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity size={20} className="animate-pulse" />
                    <span className="text-sm font-medium text-blue-100">Phiên đang hoạt động</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold mb-1">{user.name}</h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-blue-100">
                    <span className="flex items-center gap-1"><Globe size={14} /> IP: {user.ip}</span>
                    <span className="flex items-center gap-1"><Wifi size={14} /> {user.ssid}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {user.apName}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
                    <p className="text-xs text-blue-100">Thời gian online</p>
                    <p className="text-xl font-bold">{formatDuration(activeDuration)}</p>
                  </div>
                  <Button 
                    variant="secondary"
                    className="bg-white text-blue-700 hover:bg-blue-50"
                    onClick={() => setLogoutDialogOpen(true)}
                  >
                    <LogOut size={16} className="mr-2" />
                    Đăng xuất WiFi
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Session History */}
          <Card className="overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <History size={20} className="text-blue-600" />
                    Lịch sử các phiên truy cập
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{filteredSessions.length} phiên</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full sm:w-auto"
                >
                  <Filter size={16} className="mr-2" />
                  Bộ lọc
                </Button>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs">Từ ngày</Label>
                    <Input 
                      type="date" 
                      value={dateFrom} 
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Đến ngày</Label>
                    <Input 
                      type="date" 
                      value={dateTo} 
                      onChange={(e) => setDateTo(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Thiết bị</Label>
                    <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả thiết bị</SelectItem>
                        <SelectItem value="Laptop">Laptop</SelectItem>
                        <SelectItem value="Smartphone">Smartphone</SelectItem>
                        <SelectItem value="Tablet">Tablet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Trạng thái</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="active">Đang hoạt động</SelectItem>
                        <SelectItem value="ended">Đã kết thúc</SelectItem>
                        <SelectItem value="timeout">Hết thời gian</SelectItem>
                        <SelectItem value="blocked">Bị chặn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Thời gian</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Thiết bị & Vị trí</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Thời lượng</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Lưu lượng</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Trạng thái</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openSessionDetail(session)}>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{formatDateTime(session.startTime)}</div>
                        {session.endTime && (
                          <div className="text-xs text-gray-500">→ {formatDateTime(session.endTime)}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                            {getDeviceIcon(session.device)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{session.deviceName}</div>
                            <div className="text-xs text-gray-500">{session.apLocation}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {session.status === 'active' ? (
                          <span className="text-green-600 font-medium">{formatDuration(activeDuration)}</span>
                        ) : formatDuration(session.duration)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <span className="text-blue-600">↓ {formatBytes(session.download)}</span>
                          <span className="text-gray-400 mx-1">/</span>
                          <span className="text-green-600">↑ {formatBytes(session.upload)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(session.status)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ChevronRight size={16} className="text-gray-400 mx-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredSessions.map((session) => (
                <div 
                  key={session.id} 
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => openSessionDetail(session)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                        {getDeviceIcon(session.device)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{session.deviceName}</div>
                        <div className="text-xs text-gray-500">{session.apLocation}</div>
                      </div>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-500">
                      <Calendar size={12} className="inline mr-1" />
                      {formatDateTime(session.startTime)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">
                        <Clock size={12} className="inline mr-1" />
                        {session.status === 'active' ? formatDuration(activeDuration) : formatDuration(session.duration)}
                      </span>
                      <span className="text-blue-600 font-medium">
                        {formatBytes(session.download + session.upload)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredSessions.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <History size={48} className="mx-auto mb-3 text-gray-300" />
                <p>Không tìm thấy phiên nào</p>
              </div>
            )}
          </Card>
        </main>
      </div>

      {/* Session Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedSession && getDeviceIcon(selectedSession.device)}
              Chi tiết phiên truy cập
            </DialogTitle>
            <DialogDescription>
              {selectedSession && formatDateTime(selectedSession.startTime)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Trạng thái</span>
                {getStatusBadge(selectedSession.status)}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-gray-900 text-sm">Thông tin thiết bị</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Thiết bị</p>
                    <p className="font-medium">{selectedSession.deviceName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Loại</p>
                    <p className="font-medium">{selectedSession.device}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">MAC Address</p>
                    <p className="font-mono text-xs">{selectedSession.mac}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">IP Address</p>
                    <p className="font-mono text-xs">{selectedSession.ip}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-gray-900 text-sm">Thông tin mạng</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">SSID</p>
                    <p className="font-medium">{selectedSession.ssid}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Gateway</p>
                    <p className="font-mono text-xs">{selectedSession.gateway}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs">Access Point</p>
                    <p className="font-medium">{selectedSession.apName}</p>
                    <p className="text-xs text-gray-500">{selectedSession.apLocation}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-gray-900 text-sm">Thời gian & Lưu lượng</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Bắt đầu</p>
                    <p className="font-medium">{formatDateTime(selectedSession.startTime)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Kết thúc</p>
                    <p className="font-medium">{selectedSession.endTime ? formatDateTime(selectedSession.endTime) : 'Đang hoạt động'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Thời lượng</p>
                    <p className="font-medium">
                      {selectedSession.status === 'active' ? formatDuration(activeDuration) : formatDuration(selectedSession.duration)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Nguyên nhân kết thúc</p>
                    <p className="font-medium">{selectedSession.terminateCause || '--'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-gray-500 text-xs">Download</p>
                    <p className="font-medium text-blue-600">{formatBytes(selectedSession.download)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-xs">Upload</p>
                    <p className="font-medium text-green-600">{formatBytes(selectedSession.upload)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-xs">Tổng</p>
                    <p className="font-medium">{formatBytes(selectedSession.download + selectedSession.upload)}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-gray-500 text-xs mb-1">User-Agent</p>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">{selectedSession.userAgent}</p>
              </div>

              {selectedSession.status === 'active' && (
                <DialogFooter>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => {
                      setDetailModalOpen(false);
                      setLogoutDialogOpen(true);
                    }}
                  >
                    <LogOut size={16} className="mr-2" />
                    Đăng xuất phiên này
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đăng xuất khỏi WiFi?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sẽ bị ngắt kết nối khỏi mạng WiFi. Để truy cập lại, bạn cần đăng nhập lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleSessionLogout} className="bg-red-600 hover:bg-red-700">
              Đăng xuất
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout All Confirmation */}
      <AlertDialog open={logoutAllDialogOpen} onOpenChange={setLogoutAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đăng xuất tất cả thiết bị?</AlertDialogTitle>
            <AlertDialogDescription>
              Tất cả thiết bị của bạn sẽ bị ngắt kết nối khỏi mạng WiFi, bao gồm cả thiết bị đang sử dụng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              Đăng xuất tất cả
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
