"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Wifi, LogOut, History, Clock, Download, Upload, 
  Activity, Globe, Server, Gauge, HardDrive,
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

export default function Session() {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [logoutAllDialogOpen, setLogoutAllDialogOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const userStr = typeof window !== 'undefined' ? localStorage.getItem('portalUser') : null;
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
    <>
      <AppLayout
        activePage="session"
        headerRight={
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
        }
      >
        {activeSession ? (
          <Card className="mb-5 overflow-hidden border border-gray-200">
            <div className="p-5 space-y-5">
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

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Thiết bị</p>
                    <p className="text-sm font-medium truncate">{activeSession.device_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Vị trí</p>
                    <p className="text-sm font-medium truncate">{activeSession.ap_location}</p>
                  </div>
                </div>
              </div>

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
      </AppLayout>

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
    </>
  );
}
