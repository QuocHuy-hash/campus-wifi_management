"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, History, LogOut, Loader2 } from 'lucide-react';
import { fetchActiveSessions, logoutAllSessions, fetchUserDailyUsage } from './api/sessionApi';
import { useCaptiveAuthorization } from '@/features/auth/hooks/useCaptiveAuthorization';
import { STORAGE_KEYS } from '@/constants/appKeys';
import { getStoredCaptivePortalContext } from '@/lib/captivePortal';
import SessionCard from './components/SessionCard';
import DailyUsageCard from './components/DailyUsageCard';
import LogoutConfirmDialog from './components/LogoutConfirmDialog';
import ComingSoonDialog from '@/components/ComingSoonDialog';
import type { UserSession, UserDailyUsage } from '@/features/auth/types';
import { logger } from '@/lib/logger';
import { logRedirect } from '@/lib/redirectLog';

export default function Session() {
  const router = useRouter();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [dailyUsage, setDailyUsage] = useState<UserDailyUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  const [logoutAllDialogOpen, setLogoutAllDialogOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);

  const [currentDeviceMac, setCurrentDeviceMac] = useState<string | null>(null);
  const [user, setUser] = useState<{ fullname: string; role: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const raw = localStorage.getItem('portalUser');
    setUser(raw ? JSON.parse(raw) : null);
  }, []);

  const { authorize } = useCaptiveAuthorization();

  const [authorizationError, setAuthorizationError] = useState<string | null>(null);
  const [isRetryingAuth, setIsRetryingAuth] = useState(false);

  useEffect(() => {
    const ctx = getStoredCaptivePortalContext();
    if (ctx?.id) {
      localStorage.setItem(STORAGE_KEYS.currentDeviceMac, ctx.id);
      setCurrentDeviceMac(ctx.id);
    } else {
      const mac = localStorage.getItem(STORAGE_KEYS.currentDeviceMac);
      if (mac) setCurrentDeviceMac(mac);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setAuthorizationError(null);

        const result = await authorize();

        // Có captive context + đăng ký thành công → chuyển sang /network-connecting
        if (result.ok && result.hadCaptiveContext) {
          logRedirect('/network-connecting', 'session: register-device OK (còn session + captive context)');
          router.replace('/network-connecting');
          return;
        }

        // Có context nhưng lỗi → hiển thị lỗi + nút retry, KHÔNG load sessions
        if (!result.ok && result.hadCaptiveContext) {
          setAuthorizationError('Không thể xác thực thiết bị. Vui lòng thử lại.');
          setLoading(false);
          return;
        }

        // Không có context (truy cập trực tiếp) → load sessions bình thường
        const [s, u] = await Promise.all([
          fetchActiveSessions(),
          fetchUserDailyUsage(),
        ]);
        setSessions(s);
        setDailyUsage(u);
      } catch (error) {
        logger.error("Failed to fetch sessions:", error);
        setSessions([]);
        setDailyUsage(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authorize, router]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const s = await fetchActiveSessions();
        setSessions(s);
      } catch (error) {
        logger.error("Failed to refresh sessions:", error);
      }
    }, 150000);
    return () => clearInterval(interval);
  }, []);

  const handleLogoutAll = useCallback(async () => {
    try {
      await logoutAllSessions();
      setSessions([]);
      setLogoutAllDialogOpen(false);
    } catch (error) {
      logger.error("Failed to logout all sessions:", error);
    }
  }, []);

  const handleRetryAuthorization = useCallback(async () => {
    setIsRetryingAuth(true);
    setAuthorizationError(null);
    try {
      const result = await authorize();
      if (result.ok && result.hadCaptiveContext) {
        logRedirect('/network-connecting', 'session: retry register-device OK');
        router.replace('/network-connecting');
        return;
      }
      if (!result.ok) {
        setAuthorizationError('Không thể xác thực thiết bị. Vui lòng thử lại.');
      }
    } catch (error) {
      logger.error("Failed to retry authorization:", error);
      setAuthorizationError('Không thể xác thực thiết bị. Vui lòng thử lại.');
    } finally {
      setIsRetryingAuth(false);
    }
  }, [authorize, router]);

  const isCurrentDevice = (session: UserSession) => {
    if (!currentDeviceMac || !session.deviceUserInfo.macAddress) {
      return false;
    }

    return (
      session.deviceUserInfo.macAddress.toUpperCase() ===
      currentDeviceMac.toUpperCase()
    );
  };

  const sessionCount = sessions.length;

  return (
    <>
      <AppLayout
        activePage="session"
        headerRight={
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-card-foreground">
                {isMounted ? (user?.fullname || 'Guest') : '\u00A0'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isMounted ? (user?.role || 'Student') : '\u00A0'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLogoutAllDialogOpen(true)}
              className="text-muted-foreground"
            >
              <LogOut size={16} className="mr-1.5" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          </div>
        }
      >
        {loading ? (
          <Card className="p-8 text-center border-border">
            <Loader2 size={32} className="mx-auto text-muted-foreground mb-4 animate-spin" />
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          </Card>
        ) : authorizationError ? (
          <Card className="p-8 text-center border-border">
            <div className="mb-4">
              <p className="text-sm text-red-600 mb-4">{authorizationError}</p>
              <Button
                onClick={handleRetryAuthorization}
                disabled={isRetryingAuth}
                className="w-full"
              >
                {isRetryingAuth ? 'Đang thử lại...' : 'Thử lại xác thực thiết bị'}
              </Button>
            </div>
          </Card>
        ) : sessionCount === 0 ? (
          <Card className="p-8 text-center border-border">
            <Wifi size={40} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold text-card-foreground mb-2">Chưa có phiên nào</h2>
            <p className="text-sm text-muted-foreground mb-4">Hiện tại bạn chưa kết nối WiFi.</p>
            <Link href="/history">
              <Button variant="outline">
                <History size={16} className="mr-2" />
                Xem lịch sử
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-muted-foreground">Phiên đang hoạt động</h2>
              <span className="text-xs text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full">
                {sessionCount} thiết bị
              </span>
            </div>

            {sessions.map((session) => (
              <SessionCard
                key={session.sessionId}
                session={session}
                isCurrentDevice={isCurrentDevice(session)}
                now={now}
                onLogout={() => setComingSoonOpen(true)}
              />
            ))}

            {dailyUsage && (
              <DailyUsageCard usage={dailyUsage} deviceCount={sessionCount} />
            )}

            <button
              onClick={() => setLogoutAllDialogOpen(true)}
              className="mt-4 w-full text-sm text-muted-foreground bg-card border border-border px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-muted transition-colors"
            >
              <LogOut size={15} /> Đăng xuất tất cả thiết bị
            </button>
          </>
        )}
      </AppLayout>

      <LogoutConfirmDialog
        open={logoutAllDialogOpen}
        onOpenChange={setLogoutAllDialogOpen}
        onConfirm={handleLogoutAll}
        title="Đăng xuất tất cả?"
        description="Tất cả thiết bị sẽ ngắt kết nối WiFi."
        confirmText="Đăng xuất tất cả"
      />

      <ComingSoonDialog open={comingSoonOpen} onOpenChange={setComingSoonOpen} />
    </>
  );
}
