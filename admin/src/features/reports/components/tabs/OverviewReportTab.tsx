import { useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useDispatch, useSelector } from 'react-redux';
import {
  BarChart3,
  ChevronRight,
  ClipboardList,
  Database,
  FileText,
  ShieldAlert,
  Users,
  Wifi,
  Wrench,
} from 'lucide-react';
import { RootState, AppDispatch } from '@/stores/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchUsersReport, fetchSessionsReport } from '../../slices/usersReportSlice';
import { fetchBandwidthData } from '../../slices/bandwidthReportSlice';
import { fetchControllers, fetchApAccess } from '../../slices/infrastructureReportSlice';
import { fetchViolations } from '../../slices/violationsReportSlice';
import { fetchSessionData } from '../../slices/sessionsReportSlice';
import { fetchIncidents } from '../../slices/incidentsReportSlice';
import { fetchSystemLogs } from '../../slices/logsReportSlice';

const parseNumericValue = (value: string) => {
  const raw = Number.parseFloat(value);
  return Number.isNaN(raw) ? 0 : raw;
};

export const OverviewReportTab = () => {
  const [, setLocation] = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const usersState = useSelector((state: RootState) => state.reports.users);
  const bandwidthState = useSelector((state: RootState) => state.reports.bandwidth);
  const infrastructureState = useSelector((state: RootState) => state.reports.infrastructure);
  const violationsState = useSelector((state: RootState) => state.reports.violations);
  const sessionsState = useSelector((state: RootState) => state.reports.sessions);
  const incidentsState = useSelector((state: RootState) => state.reports.incidents);
  const logsState = useSelector((state: RootState) => state.reports.logs);

  useEffect(() => {
    if (usersState.status === 'idle') {
      dispatch(fetchUsersReport());
      dispatch(fetchSessionsReport());
    }
    if (bandwidthState.status === 'idle') {
      dispatch(fetchBandwidthData());
    }
    if (infrastructureState.status === 'idle') {
      dispatch(fetchControllers());
      dispatch(fetchApAccess());
    }
    if (violationsState.status === 'idle') {
      dispatch(fetchViolations());
    }
    if (sessionsState.status === 'idle') {
      dispatch(fetchSessionData());
    }
    if (incidentsState.status === 'idle') {
      dispatch(fetchIncidents());
    }
    if (logsState.status === 'idle') {
      dispatch(fetchSystemLogs());
    }
  }, [
    dispatch,
    usersState.status,
    bandwidthState.status,
    infrastructureState.status,
    violationsState.status,
    sessionsState.status,
    incidentsState.status,
    logsState.status,
  ]);

  const summary = useMemo(() => {
    const totalDownload = bandwidthState.data.reduce((sum, item) => sum + parseNumericValue(item.download), 0);
    const totalUpload = bandwidthState.data.reduce((sum, item) => sum + parseNumericValue(item.upload), 0);

    const onlineApCount = infrastructureState.apAccessList.filter((item) => item.status === 'online').length;
    const warningApCount = infrastructureState.apAccessList.filter((item) => item.status === 'warning').length;
    const offlineApCount = infrastructureState.apAccessList.filter((item) => item.status === 'offline').length;

    const highViolations = violationsState.data.filter((item) => item.severity === 'high').length;
    const activeSessions = usersState.sessions.filter((item) => item.status === 'active').length;
    const pendingIncidents = incidentsState.data.filter((item) => item.status !== 'resolved').length;
    const errorLogs = logsState.data.filter((item) => item.level === 'ERROR').length;

    return {
      totalUsers: usersState.users.length,
      totalUserSessions: usersState.sessions.length,
      activeSessions,
      totalDownload,
      totalUpload,
      totalControllers: infrastructureState.controllers.length,
      totalAp: infrastructureState.apAccessList.length,
      onlineApCount,
      warningApCount,
      offlineApCount,
      totalViolations: violationsState.data.length,
      highViolations,
      totalSessions: sessionsState.data.length,
      totalIncidents: incidentsState.data.length,
      pendingIncidents,
      totalLogs: logsState.data.length,
      errorLogs,
    };
  }, [
    bandwidthState.data,
    infrastructureState.apAccessList,
    infrastructureState.controllers.length,
    incidentsState.data,
    logsState.data,
    sessionsState.data.length,
    usersState.sessions,
    usersState.users.length,
    violationsState.data,
  ]);

  const reportCards = [
    {
      key: 'users',
      title: 'Người dùng',
      icon: Users,
      tab: 'users',
      primary: `${summary.totalUsers} tài khoản`,
      secondary: `${summary.activeSessions}/${summary.totalUserSessions} phiên đang hoạt động`,
      tone: 'bg-blue-50 text-blue-700',
    },
    {
      key: 'bandwidth',
      title: 'Băng thông',
      icon: BarChart3,
      tab: 'bandwidth',
      primary: `${summary.totalDownload.toFixed(1)} GB download`,
      secondary: `${summary.totalUpload.toFixed(1)} GB upload`,
      tone: 'bg-emerald-50 text-emerald-700',
    },
    {
      key: 'infrastructure',
      title: 'Hạ tầng WiFi',
      icon: Wifi,
      tab: 'infrastructure',
      primary: `${summary.totalControllers} controller / ${summary.totalAp} AP`,
      secondary: `Online ${summary.onlineApCount} - Cảnh báo ${summary.warningApCount} - Offline ${summary.offlineApCount}`,
      tone: 'bg-cyan-50 text-cyan-700',
    },
    {
      key: 'violations',
      title: 'Vi phạm',
      icon: ShieldAlert,
      tab: 'violations',
      primary: `${summary.totalViolations} bản ghi vi phạm`,
      secondary: `${summary.highViolations} mức độ cao`,
      tone: 'bg-amber-50 text-amber-700',
    },
    {
      key: 'sessions',
      title: 'Phiên truy cập',
      icon: ClipboardList,
      tab: 'sessions',
      primary: `${summary.totalSessions} phiên`,
      secondary: 'Theo dõi xu hướng truy cập theo thời gian',
      tone: 'bg-indigo-50 text-indigo-700',
    },
    {
      key: 'incidents',
      title: 'Sự cố',
      icon: Wrench,
      tab: 'incidents',
      primary: `${summary.totalIncidents} sự cố`,
      secondary: `${summary.pendingIncidents} sự cố chưa xử lý xong`,
      tone: 'bg-rose-50 text-rose-700',
    },
    {
      key: 'logs',
      title: 'Nhật ký hệ thống',
      icon: FileText,
      tab: 'logs',
      primary: `${summary.totalLogs} log`,
      secondary: `${summary.errorLogs} lỗi mức ERROR`,
      tone: 'bg-slate-100 text-slate-700',
    },
  ];

  return (
    <div className="space-y-4 p-4 md:p-6">
      <Card className="border-blue-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Database className="h-5 w-5 text-blue-700" />
            Báo cáo tổng thể
          </CardTitle>
          <CardDescription>
            Tổng hợp nhanh số liệu của tất cả danh mục trong phân hệ báo cáo
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.key} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-lg p-2 ${card.tone}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <CardTitle className="text-base">{card.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-lg font-semibold text-gray-900">{card.primary}</p>
                <p className="text-sm text-gray-500">{card.secondary}</p>
                <Button
                  variant="ghost"
                  className="h-8 px-0 text-blue-700 hover:text-blue-800"
                  onClick={() => setLocation(`/reports?tab=${card.tab}`)}
                >
                  Xem chi tiết
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};