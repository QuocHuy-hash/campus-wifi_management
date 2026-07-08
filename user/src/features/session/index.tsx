"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Wifi, LogOut, History, Clock, Download, Upload,
  Activity, Globe, Network, Loader2
} from 'lucide-react';
import { formatBytes, formatDurationShort } from '@/data/mockData';
import { fetchUserSessions } from './api/sessionApi';
import type { UserSession } from '@/features/auth/types';

export default function Session() {
  const router = useRouter();
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [logoutAllDialogOpen, setLogoutAllDialogOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Lấy thông tin user từ localStorage để hiển thị header
  // FIX: Thêm state isMounted để tránh hydration mismatch
  const [user, setUser] = useState<{ fullname: string; role: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Đợi component mount xong mới đọc localStorage
    setIsMounted(true);
    const userStr = localStorage.getItem('portalUser');
    setUser(userStr ? JSON.parse(userStr) : null);
  }, []);

  // Gọi API lấy phiên hiện tại (chỉ lấy 1 record)
  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        const data = await fetchUserSessions({ page: 1, size: 1 });
        console.log("Fetched user sessions:", data);
        // Kiểm tra record đầu tiên có status ACTIVE hay không
        if (data.records.length > 0 && data.records[0].status === 'ACTIVE') {
          setCurrentSession(data.records[0]);
        } else {
          setCurrentSession(null);
        }
      } catch (error) {
        console.error("Failed to fetch user sessions:", error);
        // FIX: Don't set null immediately - the interceptor will handle redirect
        // Setting null here causes the "no session" UI to flash before redirect
        setCurrentSession(null);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  // Cập nhật thời gian online mỗi 60s
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Tính thời lượng online hiện tại (giây)
  const activeDuration = currentSession
    ? Math.floor((currentTime - new Date(currentSession.startTime).getTime()) / 1000)
    : 0;

  // Đăng xuất tất cả (xóa localStorage và cookie)
  const handleLogout = async () => {
    const { performLogout } = await import('@/lib/auth');
    await performLogout('/login');
  };

  // TODO: Gọi API logout session khi có endpoint
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
              {/* FIX: Hiển thị placeholder khi chưa mount để tránh hydration mismatch */}
              <p className="text-sm font-medium text-gray-900">
                {isMounted ? (user?.fullname || 'Guest') : '\u00A0'}
              </p>
              <p className="text-xs text-gray-500">
                {isMounted ? (user?.role || 'Student') : '\u00A0'}
              </p>
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
        {loading ? (
          // Trạng thái loading
          <Card className="p-8 text-center border border-gray-200">
            <Loader2 size={32} className="mx-auto text-gray-300 mb-4 animate-spin" />
            <p className="text-sm text-gray-500">Đang tải...</p>
          </Card>
        ) : currentSession ? (
          // Có phiên ACTIVE -> hiển thị thông tin phiên
          <Card className="mb-5 overflow-hidden border border-gray-200">
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-1">
                    <Wifi size={12} /> SSID
                  </p>
                  <p className="text-sm font-medium">{currentSession.ssid}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-1">
                    <Globe size={12} /> IP
                  </p>
                  <p className="text-sm font-mono">{currentSession.ipAddress}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-1">
                    <Network size={12} /> MAC
                  </p>
                  <p className="text-sm font-mono">{currentSession.deviceUserInfo.macAddress}</p>
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
                    <p className="text-sm font-medium truncate">{currentSession.deviceUserInfo.deviceName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">AP MAC</p>
                    <p className="text-sm font-mono truncate">{currentSession.apMac}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Lưu lượng phiên</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <Download size={18} className="mx-auto text-blue-500 mb-1.5" />
                    <p className="text-xs text-gray-500">Download</p>
                    <p className="text-sm text-blue-600">
                      {currentSession.deviceUserInfo?.downloadBytes || formatBytes(currentSession.downloadBytes)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                    <Upload size={18} className="mx-auto text-green-500 mb-1.5" />
                    <p className="text-xs text-gray-500">Upload</p>
                    <p className="text-sm text-green-600">
                      {currentSession.deviceUserInfo?.uploadBytes || formatBytes(currentSession.uploadBytes)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-violet-50 rounded-lg border border-violet-100">
                    <Activity size={18} className="mx-auto text-violet-500 mb-1.5" />
                    <p className="text-xs text-gray-500">Tổng</p>
                    <p className="text-sm text-violet-600">
                      {(() => {
                        const down = currentSession.deviceUserInfo?.downloadBytes;
                        const up = currentSession.deviceUserInfo?.uploadBytes;
                        if (down && up) {
                          // Parse formatted strings like "4.29 MB", "124.37 MB"
                          const parseNumber = (s: string) => {
                            const parts = s.split(' ');
                            const val = parseFloat(parts[0]);
                            const unit = parts[1]?.toLowerCase();
                            if (unit === 'gb') return val * 1024;
                            if (unit === 'mb') return val;
                            if (unit === 'kb') return val / 1024;
                            return val;
                          };
                          const totalMB = parseNumber(down) + parseNumber(up);
                          return `${totalMB.toFixed(2)} MB`;
                        }
                        return formatBytes(currentSession.downloadBytes + currentSession.uploadBytes);
                      })()}
                    </p>
                  </div>
                </div>
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
          // Không có phiên ACTIVE -> thông báo chưa có phiên nào
          <Card className="p-8 text-center border border-gray-200">
            <Wifi size={40} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Chưa có phiên nào</h2>
            <p className="text-sm text-gray-500 mb-4">Hiện tại bạn chưa kết nối WiFi.</p>
            <Link href="/history">
              <Button variant="outline">
                <History size={16} className="mr-2" />
                Xem lịch sử
              </Button>
            </Link>
          </Card>
        )}
      </AppLayout>

      {/* Dialog xác nhận đăng xuất WiFi */}
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

      {/* Dialog xác nhận đăng xuất tất cả */}
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
