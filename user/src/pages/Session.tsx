import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Wifi, LogOut, History, Clock, Download, Upload, 
  Activity, Globe, Server, Menu, X, User, HelpCircle, Gauge, HardDrive,
  Network
} from 'lucide-react';
import { 
  mockSessions, 
  formatBytes, 
  formatDurationShort,
  getTodayUsage,
  qosPolicies,
  type RadiusSession 
} from '@/data/mockData';

// function getDeviceIcon(deviceType: string, size: number = 18) {
//   switch (deviceType) {
//     case 'Smartphone': return <Smartphone size={size} />;
//     case 'Laptop': return <Laptop size={size} />;
//     case 'Tablet': return <Monitor size={size} />;
//     default: return <Monitor size={size} />;
//   }
// }

export default function Session() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [logoutAllDialogOpen, setLogoutAllDialogOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const userStr = localStorage.getItem('portalUser');
  const user = userStr ? JSON.parse(userStr) : null;

  const activeSession = mockSessions.find(s => s.acctstoptime === null) as RadiusSession | undefined;
  
  const activeDuration = activeSession 
    ? Math.floor((currentTime - new Date(activeSession.acctstarttime).getTime()) / 1000) 
    : 0;

  const todayUsage = getTodayUsage();
  const policy = user && user.role ? (qosPolicies[user.role as keyof typeof qosPolicies] || qosPolicies.Student) : qosPolicies.Student;
  const quotaPercentage = Math.min((todayUsage.total / policy.quota_daily) * 100, 100);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('portalLoggedIn');
    localStorage.removeItem('portalUser');
    window.location.href = '/';
  };

  const handleSessionLogout = () => {
    setLogoutDialogOpen(false);
  };

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
              <Wifi size={20} className="text-gray-700" />
              <span className="font-semibold text-gray-900 hidden sm:inline">Campus WiFi</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.fullname || 'Guest'}</p>
              <p className="text-xs text-gray-500">{user?.role || 'Student'}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLogoutAllDialogOpen(true)}
              className="text-gray-600"
            >
              <LogOut size={16} className="mr-1.5" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed md:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-60 bg-white border-r border-gray-200 
          transform transition-transform duration-300 z-30
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <nav className="p-4 space-y-1">
            <Link href="/session">
              <a className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm bg-gray-100 text-gray-900 font-medium">
                <Activity size={18} />
                Phiên hiện tại
              </a>
            </Link>
            <Link href="/history">
              <a className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                <History size={18} />
                Lịch sử đăng nhập
              </a>
            </Link>
            <Link href="/account">
              <a className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                <User size={18} />
                Thông tin tài khoản
              </a>
            </Link>
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <HelpCircle size={18} />
              Trợ giúp
            </a>
          </nav>
        </aside>

        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 w-full">
          {activeSession ? (
            <Card className="mb-5 overflow-hidden border border-gray-200">
              {/* Session Info */}
              <div className="p-5 space-y-5">
                {/* Network Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-1">
                      <Wifi size={12} /> SSID
                    </p>
                    <p className="text-sm font-medium">{activeSession.ssid}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-1">
                      <Globe size={12} /> IP
                    </p>
                    <p className="text-sm font-mono">{activeSession.ip_address}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-1">
                      <Network size={12} /> MAC
                    </p>
                    <p className="text-sm font-mono">{activeSession.mac_address}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-1">
                      <Clock size={12} /> Online
                    </p>
                    <p className="text-sm font-semibold text-emerald-600">{formatDurationShort(activeDuration)}</p>
                  </div>
                </div>

                {/* Device & Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {/* <div className="w-10 h-10 bg-white border rounded-lg flex items-center justify-center text-gray-600">
                      {getDeviceIcon(activeSession.device_type, 18)}
                    </div> */}
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Thiết bị</p>
                      <p className="text-sm font-medium truncate">{activeSession.device_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {/* <div className="w-10 h-10 bg-white border rounded-lg flex items-center justify-center text-gray-600">
                      <Router size={18} />
                    </div> */}
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Vị trí</p>
                      <p className="text-sm font-medium truncate">{activeSession.ap_location}</p>
                    </div>
                  </div>
                </div>

                {/* Traffic */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Lưu lượng phiên</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <Download size={18} className="mx-auto text-blue-500 mb-1.5" />
                      <p className="text-xs text-gray-500">Download</p>
                      <p className="text-sm font-semibold text-blue-600">{formatBytes(activeSession.acctinputoctets)}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                      <Upload size={18} className="mx-auto text-green-500 mb-1.5" />
                      <p className="text-xs text-gray-500">Upload</p>
                      <p className="text-sm font-semibold text-green-600">{formatBytes(activeSession.acctoutputoctets)}</p>
                    </div>
                    <div className="text-center p-3 bg-violet-50 rounded-lg border border-violet-100">
                      <Activity size={18} className="mx-auto text-violet-500 mb-1.5" />
                      <p className="text-xs text-gray-500">Tổng</p>
                      <p className="text-sm font-semibold text-violet-600">
                        {formatBytes(activeSession.acctinputoctets + activeSession.acctoutputoctets)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quota Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Hạn ngạch hôm nay</p>
                    <span className="text-xs text-gray-500">
                      {formatBytes(todayUsage.total)} / {formatBytes(policy.quota_daily)}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        quotaPercentage > 90 ? 'bg-red-500' : 
                        quotaPercentage > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${quotaPercentage}%` }}
                    />
                  </div>
                  <p className={`text-xs mt-1 ${
                    quotaPercentage > 90 ? 'text-red-600' : 
                    quotaPercentage > 70 ? 'text-amber-600' : 'text-gray-500'
                  }`}>
                    Đã dùng {quotaPercentage.toFixed(1)}%
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button 
                    className="flex-1 bg-gray-900 hover:bg-gray-800"
                    onClick={() => setLogoutDialogOpen(true)}
                  >
                    <LogOut size={16} className="mr-2" />
                    Đăng xuất WiFi
                  </Button>
                  <Link href="/history">
                    <Button variant="outline">
                      <History size={16} className="mr-2" />
                      Lịch sử
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center border border-gray-200">
              <Wifi size={40} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Không có phiên hoạt động</h2>
              <p className="text-sm text-gray-500 mb-4">Bạn chưa kết nối WiFi.</p>
              <Link href="/history">
                <Button variant="outline">
                  <History size={16} className="mr-2" />
                  Xem lịch sử
                </Button>
              </Link>
            </Card>
          )}

          {/* QoS Policy */}
          <Card className="p-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Server size={16} /> Chính sách QoS
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                <Gauge size={16} className="text-gray-400" />
                {policy.bandwidth_limit} Mbps
              </span>
              <span className="flex items-center gap-2 text-gray-600">
                <Clock size={16} className="text-gray-400" />
                {policy.session_timeout / 3600}h/phiên
              </span>
              <span className="flex items-center gap-2 text-gray-600">
                <HardDrive size={16} className="text-gray-400" />
                {formatBytes(policy.quota_daily)}/ngày
              </span>
            </div>
          </Card>
        </main>
      </div>

      {/* Logout WiFi Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đăng xuất WiFi?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sẽ ngắt kết nối. Thời lượng phiên: {formatDurationShort(activeDuration)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleSessionLogout} className="bg-gray-900 hover:bg-gray-800">
              Đăng xuất
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout All Dialog */}
      <AlertDialog open={logoutAllDialogOpen} onOpenChange={setLogoutAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đăng xuất tất cả?</AlertDialogTitle>
            <AlertDialogDescription>
              Tất cả thiết bị sẽ ngắt kết nối WiFi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-gray-900 hover:bg-gray-800">
              Đăng xuất tất cả
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
