import React, { useMemo } from 'react';
import { useLocation } from 'wouter';
import { useSelector } from 'react-redux';
import {
  ArrowRight,
  Building2,
  KeyRound,
  Network,
  Router,
  Shield,
  ShieldAlert,
  Users,
  UserCog,
} from 'lucide-react';
import { RootState } from '../../../../stores/store';
import { Button } from '@/components/ui/button';

export const SystemOverviewTab = () => {
  const [, setLocation] = useLocation();

  const admin = useSelector((state: RootState) => state.settings.admin);
  const security = useSelector((state: RootState) => state.settings.security);
  const areas = useSelector((state: RootState) => state.settings.areas);
  const devices = useSelector((state: RootState) => state.settings.devices);
  const integrations = useSelector((state: RootState) => state.settings.integrations);
  const logs = useSelector((state: RootState) => state.settings.logs);

  const summary = useMemo(() => {
    const onlineControllers = devices.controllers.filter((item) => item.status === 'ONLINE').length;
    const onlineAps = devices.aps.filter((item) => item.status === 'ONLINE').length;
    const highSeverityLogs = logs.logs.filter((item) => item.level === 'error' || item.level === 'warning').length;

    return {
      totalAdmins: admin.admins.length,
      totalRoles: admin.roles.length,
      totalGroups: security.groups.length,
      totalResources: security.resources.length,
      allowedIps: security.allowedIps.length,
      totalCampuses: areas.campuses.length,
      totalBuildings: areas.buildings.length,
      totalLocations: areas.locations.length,
      totalControllers: devices.controllers.length,
      onlineControllers,
      totalAps: devices.aps.length,
      onlineAps,
      iamConnections: integrations.iamConnections.length,
      radiusConfigs: integrations.radiusConfigs.length,
      captivePortals: integrations.captivePortals.length,
      totalLogs: logs.logs.length,
      highSeverityLogs,
    };
  }, [
    admin.admins.length,
    admin.roles.length,
    areas.buildings.length,
    areas.campuses.length,
    areas.locations.length,
    devices.aps,
    devices.controllers,
    integrations.captivePortals.length,
    integrations.iamConnections.length,
    integrations.radiusConfigs.length,
    logs.logs,
    security.allowedIps.length,
    security.groups.length,
    security.resources.length,
  ]);

  const cards = [
    {
      key: 'users',
      tab: 'users',
      title: 'Quản trị viên',
      icon: UserCog,
      primary: `${summary.totalAdmins} tài khoản quản trị`,
      secondary: `${summary.totalRoles} vai trò hệ thống`,
      color: 'text-blue-700 bg-blue-50',
    },
    {
      key: 'access',
      tab: 'access',
      title: 'Phân quyền & Bảo mật',
      icon: Shield,
      primary: `${summary.totalGroups} nhóm quyền`,
      secondary: `${summary.totalResources} tài nguyên, ${summary.allowedIps} IP whitelist`,
      color: 'text-emerald-700 bg-emerald-50',
    },
    {
      key: 'areas',
      tab: 'areas',
      title: 'Khu vực triển khai',
      icon: Building2,
      primary: `${summary.totalCampuses} cơ sở, ${summary.totalBuildings} tòa nhà`,
      secondary: `${summary.totalLocations} khu vực lắp đặt`,
      color: 'text-cyan-700 bg-cyan-50',
    },
    {
      key: 'devices',
      tab: 'devices',
      title: 'Thiết bị mạng',
      icon: Router,
      primary: `${summary.totalControllers} controller (${summary.onlineControllers} online)`,
      secondary: `${summary.totalAps} AP (${summary.onlineAps} online)`,
      color: 'text-violet-700 bg-violet-50',
    },
    {
      key: 'technical',
      tab: 'technical',
      title: 'Tích hợp hệ thống',
      icon: Network,
      primary: `${summary.iamConnections} kết nối IAM`,
      secondary: `${summary.radiusConfigs} RADIUS, ${summary.captivePortals} captive portal`,
      color: 'text-amber-700 bg-amber-50',
    },
    {
      key: 'logs',
      tab: 'logs',
      title: 'Nhật ký & giám sát',
      icon: ShieldAlert,
      primary: `${summary.totalLogs} bản ghi log`,
      secondary: `${summary.highSeverityLogs} cảnh báo/lỗi`,
      color: 'text-rose-700 bg-rose-50',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-slate-50 via-white to-blue-50 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">Cấu hình hệ thống</h2>
            <p className="mt-2 text-sm text-gray-600">
              Theo dõi nhanh tình trạng cấu hình quản trị, bảo mật, hạ tầng và tích hợp hệ thống.
            </p>
          </div>
          <div className="hidden rounded-lg bg-white p-3 shadow-sm sm:block">
            <KeyRound className="h-6 w-6 text-blue-700" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-3 flex items-center gap-3">
                <span className={`rounded-lg p-2 ${card.color}`}>
                  <Icon size={18} />
                </span>
                <h3 className="text-base font-semibold text-gray-900">{card.title}</h3>
              </div>
              <p className="text-lg font-bold text-gray-900">{card.primary}</p>
              <p className="mt-1 text-sm text-gray-500">{card.secondary}</p>
              <Button
                variant="ghost"
                className="mt-3 h-8 px-0 text-blue-700 hover:text-blue-800"
                onClick={() => setLocation(`/settings?tab=${card.tab}`)}
              >
                Mở cấu hình
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Tổng tài nguyên</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {summary.totalResources + summary.totalLocations + summary.totalAps}
          </p>
          <p className="mt-1 text-sm text-gray-500">resources + vị trí + AP</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Mức sẵn sàng</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {summary.totalAps > 0 ? Math.round((summary.onlineAps / summary.totalAps) * 100) : 0}%
          </p>
          <p className="mt-1 text-sm text-gray-500">AP online trên tổng AP</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Rủi ro theo log</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{summary.highSeverityLogs}</p>
          <p className="mt-1 text-sm text-gray-500">log có mức cảnh báo hoặc lỗi</p>
        </div>
      </div>
    </div>
  );
};
