import { useState, useMemo, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Wifi, History, Clock, Download, Upload, 
  Activity, ChevronRight, ChevronLeft, 
  Laptop, Smartphone, Monitor, Filter, FileSpreadsheet,
  Menu, X, User, HelpCircle, CheckCircle, XCircle, AlertTriangle,
  Network, Server, Package, Gauge, Timer
} from 'lucide-react';
import { 
  mockSessions, 
  formatBytes, 
  formatDuration,
  formatDurationShort,
  formatDateTime,
  formatDateTimeShort,
  getTerminateCauseLabel,
  getUniqueAPLocations,
  type RadiusSession 
} from '@/data/mockData';

function getDeviceIcon(deviceType: string, size: number = 14) {
  switch (deviceType) {
    case 'Smartphone': return <Smartphone size={size} />;
    case 'Laptop': return <Laptop size={size} />;
    case 'Tablet': return <Monitor size={size} />;
    default: return <Monitor size={size} />;
  }
}

function getStatusBadge(session: RadiusSession, compact = false) {
  const baseClass = compact 
    ? "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium"
    : "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium";
  
  if (session.acctstoptime === null) {
    return <span className={`${baseClass} bg-emerald-100 text-emerald-700`}><Activity size={10} className="animate-pulse" /> Online</span>;
  }
  
  switch (session.acctterminatecause) {
    case 'User-Request':
      return <span className={`${baseClass} bg-gray-100 text-gray-600`}><CheckCircle size={10} /> Kết thúc</span>;
    case 'Session-Timeout':
    case 'Idle-Timeout':
      return <span className={`${baseClass} bg-amber-50 text-amber-600`}><Clock size={10} /> Timeout</span>;
    case 'Admin-Reset':
      return <span className={`${baseClass} bg-red-50 text-red-600`}><XCircle size={10} /> Admin</span>;
    case 'Lost-Carrier':
      return <span className={`${baseClass} bg-orange-50 text-orange-600`}><AlertTriangle size={10} /> Mất KN</span>;
    default:
      return <span className={`${baseClass} bg-gray-100 text-gray-600`}><CheckCircle size={10} /> Kết thúc</span>;
  }
}

const ITEMS_PER_PAGE = 20;

export default function HistoryPage() {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSession, setSelectedSession] = useState<RadiusSession | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const userStr = localStorage.getItem('portalUser');
  const user = userStr ? JSON.parse(userStr) : null;

  const apLocations = getUniqueAPLocations();

  const filteredSessions = useMemo(() => {
    return mockSessions.filter(session => {
      if (deviceFilter !== 'all') {
        if (deviceFilter.includes(':')) {
          if (session.mac_address !== deviceFilter) return false;
        } else {
          if (session.device_type !== deviceFilter) return false;
        }
      }
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && session.acctstoptime !== null) return false;
        if (statusFilter === 'ended' && session.acctstoptime === null) return false;
      }
      if (locationFilter !== 'all' && session.ap_location !== locationFilter) return false;
      if (dateFrom) {
        const sessionDate = new Date(session.acctstarttime);
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (sessionDate < fromDate) return false;
      }
      if (dateTo) {
        const sessionDate = new Date(session.acctstarttime);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (sessionDate > toDate) return false;
      }
      return true;
    });
  }, [deviceFilter, statusFilter, locationFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const resetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setDeviceFilter('all');
    setStatusFilter('all');
    setLocationFilter('all');
    setCurrentPage(1);
  };

  const openSessionDetail = (session: RadiusSession) => {
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
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <button 
              className="md:hidden p-1.5 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="flex items-center gap-1.5">
              <Wifi size={18} className="text-gray-700" />
              <span className="font-medium text-sm text-gray-900 hidden sm:inline">Campus WiFi</span>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-xs font-medium text-gray-900">{user.fullname}</p>
            <p className="text-[10px] text-gray-500">{user.role}</p>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed md:sticky top-[49px] left-0 h-[calc(100vh-49px)] w-56 bg-white border-r border-gray-200 
          transform transition-transform duration-300 z-30
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <nav className="p-3 space-y-1">
            <Link href="/session">
              <a className="flex items-center gap-2 px-3 py-2 rounded text-xs text-gray-600 hover:bg-gray-50">
                <Activity size={14} />
                Phiên hiện tại
              </a>
            </Link>
            <Link href="/history">
              <a className="flex items-center gap-2 px-3 py-2 rounded text-xs bg-gray-100 text-gray-900 font-medium">
                <History size={14} />
                Lịch sử đăng nhập
              </a>
            </Link>
            <Link href="/account">
              <a className="flex items-center gap-2 px-3 py-2 rounded text-xs text-gray-600 hover:bg-gray-50">
                <User size={14} />
                Thông tin tài khoản
              </a>
            </Link>
            <a href="#" className="flex items-center gap-2 px-3 py-2 rounded text-xs text-gray-600 hover:bg-gray-50">
              <HelpCircle size={14} />
              Trợ giúp
            </a>
          </nav>
        </aside>

        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 p-3 md:p-4">
          <Card className="overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div>
                  <h1 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <History size={14} />
                    Lịch sử đăng nhập
                  </h1>
                  <p className="text-[10px] text-gray-500">{filteredSessions.length} phiên</p>
                </div>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" className="h-7 text-[10px] px-2" onClick={() => setShowFilters(!showFilters)}>
                    <Filter size={12} className="mr-1" />
                    Lọc
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-[10px] px-2">
                    <FileSpreadsheet size={12} className="mr-1" />
                    Excel
                  </Button>
                </div>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div>
                      <Label className="text-[10px] text-gray-500">Từ ngày</Label>
                      <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }} className="h-7 text-xs mt-0.5" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-500">Đến ngày</Label>
                      <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }} className="h-7 text-xs mt-0.5" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-500">Thiết bị</Label>
                      <Select value={deviceFilter} onValueChange={(v) => { setDeviceFilter(v); setCurrentPage(1); }}>
                        <SelectTrigger className="h-7 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          <SelectItem value="Laptop">Laptop</SelectItem>
                          <SelectItem value="Smartphone">Phone</SelectItem>
                          <SelectItem value="Tablet">Tablet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-500">Trạng thái</Label>
                      <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                        <SelectTrigger className="h-7 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          <SelectItem value="active">Online</SelectItem>
                          <SelectItem value="ended">Kết thúc</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-500">Vị trí</Label>
                      <Select value={locationFilter} onValueChange={(v) => { setLocationFilter(v); setCurrentPage(1); }}>
                        <SelectTrigger className="h-7 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          {apLocations.map(loc => (
                            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2 h-6 text-[10px]" onClick={resetFilters}>Xóa lọc</Button>
                </div>
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Thời gian</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Thiết bị</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Vị trí</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Thời lượng</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Lưu lượng</th>
                    <th className="px-3 py-2 text-center font-medium text-gray-500">Trạng thái</th>
                    <th className="px-3 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedSessions.map((session) => (
                    <tr key={session.session_id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openSessionDetail(session)}>
                      <td className="px-3 py-2">
                        <div className="text-gray-900">{formatDateTimeShort(session.acctstarttime)}</div>
                        {session.acctstoptime && <div className="text-[12px] text-gray-400">→ {formatDateTimeShort(session.acctstoptime)}</div>}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                            {getDeviceIcon(session.device_type, 12)}
                          </div>
                          <div>
                            <div className="text-gray-900 truncate max-w-[120px]">{session.device_name}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{session.mac_address}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-gray-900 truncate max-w-[100px]">{session.ap_name}</div>
                        <div className="text-[10px] text-gray-400 truncate max-w-[100px]">{session.ap_location}</div>
                      </td>
                      <td className="px-3 py-2 text-gray-900">
                        {session.acctstoptime === null 
                          ? formatDurationShort(Math.floor((currentTime - new Date(session.acctstarttime).getTime()) / 1000))
                          : formatDurationShort(session.acctsessiontime)
                        }
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-blue-600">↓{formatBytes(session.acctinputoctets)}</div>
                        <div className="text-[10px] text-green-600">↑{formatBytes(session.acctoutputoctets)}</div>
                      </td>
                      <td className="px-3 py-2 text-center">{getStatusBadge(session, true)}</td>
                      <td className="px-3 py-2"><ChevronRight size={14} className="text-gray-300" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List */}
            <div className="md:hidden divide-y divide-gray-100">
              {paginatedSessions.map((session) => (
                <div key={session.session_id} className="p-3 hover:bg-gray-50" onClick={() => openSessionDetail(session)}>
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                        {getDeviceIcon(session.device_type, 12)}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-900">{session.device_name}</div>
                        <div className="text-[10px] text-gray-400">{session.ap_location}</div>
                      </div>
                    </div>
                    {getStatusBadge(session, true)}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>{formatDateTimeShort(session.acctstarttime)}</span>
                    <span className="flex items-center gap-2">
                      <span>{session.acctstoptime === null 
                        ? formatDurationShort(Math.floor((currentTime - new Date(session.acctstarttime).getTime()) / 1000))
                        : formatDurationShort(session.acctsessiontime)
                      }</span>
                      <span className="text-gray-900 font-medium">{formatBytes(session.acctinputoctets + session.acctoutputoctets)}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {filteredSessions.length === 0 && (
              <div className="p-8 text-center">
                <History size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-xs text-gray-500">Không tìm thấy phiên nào</p>
                <Button variant="ghost" size="sm" className="mt-2 text-[10px]" onClick={resetFilters}>Xóa lọc</Button>
              </div>
            )}

            {/* Pagination */}
            {filteredSessions.length > 0 && (
              <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-500">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredSessions.length)} / {filteredSessions.length}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft size={12} />
                  </Button>
                  <span className="text-[10px] text-gray-600 px-2">{currentPage}/{totalPages}</span>
                  <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    <ChevronRight size={12} />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </main>
      </div>

      {/* Session Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-1.5">
              {selectedSession && getDeviceIcon(selectedSession.device_type, 14)}
              Chi tiết phiên
            </DialogTitle>
           
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500">Trạng thái</span>
                {getStatusBadge(selectedSession)}
              </div>

              {/* User Info */}
              <div className="bg-gray-50 rounded p-2.5">
                <p className="text-[10px] font-medium text-gray-700 mb-1.5 flex items-center gap-1"><User size={10} /> Người dùng</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><p className="text-gray-400 text-[10px]">Username</p><p className="font-mono">{user?.username || selectedSession.username}</p></div>
                  <div><p className="text-gray-400 text-[10px]">Họ tên</p><p>{user?.fullname || '--'}</p></div>
                  <div><p className="text-gray-400 text-[10px]">Vai trò</p><p>{user?.role || 'Student'}</p></div>
                  <div><p className="text-gray-400 text-[10px]">Khoa/Phòng</p><p>{user?.department || 'Khoa CNTT'}</p></div>
                </div>
              </div>

              {/* Time Info */}
              <div className="bg-gray-50 rounded p-2.5">
                <p className="text-[10px] font-medium text-gray-700 mb-1.5 flex items-center gap-1"><Clock size={10} /> Thời gian</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><p className="text-gray-400 text-[10px]">Bắt đầu</p><p>{formatDateTime(selectedSession.acctstarttime)}</p></div>
                  <div><p className="text-gray-400 text-[10px]">Kết thúc</p><p>{selectedSession.acctstoptime ? formatDateTime(selectedSession.acctstoptime) : <span className="text-gray-900">Đang online</span>}</p></div>
                  <div><p className="text-gray-400 text-[10px]">Thời lượng</p><p>{selectedSession.acctstoptime === null ? formatDuration(Math.floor((currentTime - new Date(selectedSession.acctstarttime).getTime()) / 1000)) : formatDuration(selectedSession.acctsessiontime)}</p></div>
                  <div><p className="text-gray-400 text-[10px]">Lý do kết thúc</p><p>{getTerminateCauseLabel(selectedSession.acctterminatecause)}</p></div>
                </div>
              </div>

              {/* Device Info */}
              <div className="bg-gray-50 rounded p-2.5">
                <p className="text-[10px] font-medium text-gray-700 mb-1.5 flex items-center gap-1"><Laptop size={10} /> Thiết bị</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><p className="text-gray-400 text-[10px]">Tên</p><p>{selectedSession.device_name}</p></div>
                  <div><p className="text-gray-400 text-[10px]">Loại</p><p>{selectedSession.device_type}</p></div>
                  <div><p className="text-gray-400 text-[10px]">Vendor</p><p>{selectedSession.device_vendor || '--'}</p></div>
                  <div><p className="text-gray-400 text-[10px]">MAC</p><p className="font-mono text-[10px]">{selectedSession.mac_address}</p></div>
                </div>
              </div>

              {/* Network Info */}
              <div className="bg-gray-50 rounded p-2.5">
                <p className="text-[10px] font-medium text-gray-700 mb-1.5 flex items-center gap-1"><Network size={10} /> Mạng</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><p className="text-gray-400 text-[10px]">SSID</p><p>{selectedSession.ssid}</p></div>
                  <div><p className="text-gray-400 text-[10px]">IP</p><p className="font-mono text-[10px]">{selectedSession.ip_address}</p></div>
                  <div><p className="text-gray-400 text-[10px]">Gateway</p><p className="font-mono text-[10px]">{selectedSession.ip_address.replace(/\.\d+$/, '.1')}</p></div>
                  <div><p className="text-gray-400 text-[10px]">VLAN</p><p>{selectedSession.vlan_id}</p></div>
                  <div><p className="text-gray-400 text-[10px]">AP</p><p>{selectedSession.ap_name}</p></div>
                  <div><p className="text-gray-400 text-[10px]">Vị trí</p><p>{selectedSession.ap_location}</p></div>
                  <div className="col-span-2"><p className="text-gray-400 text-[10px]">NAS IP</p><p className="font-mono text-[10px]">{selectedSession.nas_ip}</p></div>
                </div>
              </div>

              {/* Traffic Info */}
              <div className="bg-gray-50 rounded p-2.5">
                <p className="text-[10px] font-medium text-gray-700 mb-1.5 flex items-center gap-1"><Package size={10} /> Lưu lượng</p>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="text-center p-2 bg-blue-50 rounded border border-blue-100">
                    <Download size={12} className="mx-auto text-blue-500 mb-0.5" />
                    <p className="text-[10px] text-gray-500">Download</p>
                    <p className="text-xs font-semibold text-blue-600">{formatBytes(selectedSession.acctinputoctets)}</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded border border-green-100">
                    <Upload size={12} className="mx-auto text-green-500 mb-0.5" />
                    <p className="text-[10px] text-gray-500">Upload</p>
                    <p className="text-xs font-semibold text-green-600">{formatBytes(selectedSession.acctoutputoctets)}</p>
                  </div>
                  <div className="text-center p-2 bg-violet-50 rounded border border-violet-100">
                    <Activity size={12} className="mx-auto text-violet-500 mb-0.5" />
                    <p className="text-[10px] text-gray-500">Tổng</p>
                    <p className="text-xs font-semibold text-violet-600">{formatBytes(selectedSession.acctinputoctets + selectedSession.acctoutputoctets)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div><span className="text-gray-400">Input packets:</span> <span className="font-mono">{selectedSession.acctinputpackets.toLocaleString()}</span></div>
                  <div><span className="text-gray-400">Output packets:</span> <span className="font-mono">{selectedSession.acctoutputpackets.toLocaleString()}</span></div>
                </div>
              </div>

              {/* QoS Policy */}
              <div className="bg-gray-50 rounded p-2.5">
                <p className="text-[10px] font-medium text-gray-700 mb-1.5 flex items-center gap-1"><Server size={10} /> QoS Policy</p>
                <div className="flex flex-wrap gap-3 text-[11px]">
                  <span className="flex items-center gap-1"><Gauge size={10} className="text-gray-400" /> {selectedSession.bandwidth_limit} Mbps</span>
                  <span className="flex items-center gap-1"><Timer size={10} className="text-gray-400" /> {selectedSession.session_timeout / 3600}h</span>
                  <span className="flex items-center gap-1"><Package size={10} className="text-gray-400" /> {formatBytes(selectedSession.quota_daily)}/ngày</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
