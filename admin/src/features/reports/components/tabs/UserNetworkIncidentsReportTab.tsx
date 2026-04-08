import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { RootState, AppDispatch } from '@/stores/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchIncidents } from '../../slices/incidentsReportSlice';
import { fetchSessionsReport } from '../../slices/usersReportSlice';
import { fetchViolations } from '../../slices/violationsReportSlice';
import { fetchSystemLogs } from '../../slices/logsReportSlice';
import { formatDate, formatDateTime } from '@/utils/dateTimeFormat';

type Severity = 'critical' | 'warning' | 'info';

interface UnifiedIncidentLog {
  time: string;
  severity: Severity;
  issueType: string;
  userMac: string;
  location: string;
  status: string;
}

const severityLabel: Record<Severity, string> = {
  critical: 'Nghiêm trọng',
  warning: 'Cảnh báo',
  info: 'Thông tin',
};


const severityColor: Record<Severity, string> = {
  critical: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-slate-100 text-slate-700',
};

const parseDateLike = (value: string) => {
  const normalized = value.replace(' ', 'T');
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const extractHour = (value: string) => {
  const dateObj = parseDateLike(value);
  if (dateObj) return dateObj.getHours();

  const match = value.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hour = Number.parseInt(match[1], 10);
  return Number.isNaN(hour) ? null : hour;
};

const mapIssueGroup = (issueType: string) => {
  const text = issueType.toLowerCase();
  if (/xác thực|dang nhap|đăng nhập|auth|802\.1x|mật khẩu/.test(text)) return 'Sai mật khẩu/xác thực';
  if (/nhiễu|song yeu|sóng yếu|rssi/.test(text)) return 'Nhiễu sóng / Sóng yếu';
  if (/dhcp|ip/.test(text)) return 'Không nhận IP / DHCP';
  if (/phần cứng|ngừng hoạt động|offline|hardware/.test(text)) return 'Lỗi phần cứng AP';
  return 'Khác';
};

const toSeverityFromPriority = (priority: 'high' | 'medium' | 'low'): Severity => {
  if (priority === 'high') return 'critical';
  if (priority === 'medium') return 'warning';
  return 'info';
};

const toSeverityFromViolation = (severity: 'high' | 'medium' | 'low'): Severity => {
  if (severity === 'high') return 'critical';
  if (severity === 'medium') return 'warning';
  return 'info';
};

export const UserNetworkIncidentsReportTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [timeFilter, setTimeFilter] = useState('today');
  const [areaFilter, setAreaFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | Severity>('all');
  const [searchText, setSearchText] = useState('');

  const incidents = useSelector((state: RootState) => state.reports.incidents);
  const users = useSelector((state: RootState) => state.reports.users);
  const violations = useSelector((state: RootState) => state.reports.violations);
  const logs = useSelector((state: RootState) => state.reports.logs);

  const reloadData = () => {
    dispatch(fetchIncidents());
    dispatch(fetchSessionsReport());
    dispatch(fetchViolations());
    dispatch(fetchSystemLogs());
  };

  useEffect(() => {
    if (incidents.status === 'idle') reloadData();
  }, [dispatch, incidents.status, users.status, violations.status, logs.status]);

  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      reloadData();
    }, 30000);

    return () => clearInterval(timer);
  }, [autoRefresh]);

  const enrichedIncidents = useMemo(
    () =>
      incidents.data.map((incident) => {
      const relatedSessions = users.sessions.filter((session) => session.ap === incident.ap);
      const uniqueUsers = Array.from(new Set(relatedSessions.map((session) => session.username)));

      return {
        ...incident,
        severity: toSeverityFromPriority(incident.priority),
        affectedUsersCount: uniqueUsers.length,
        sampleUsers: uniqueUsers.slice(0, 3),
        relatedSessionsCount: relatedSessions.length,
        sampleMac: relatedSessions[0]?.mac ?? '32:54:76:98:10:43',
      };
    }),
    [incidents.data, users.sessions]
  );

  const unifiedLogs = useMemo<UnifiedIncidentLog[]>(() => {
    const incidentLogs = enrichedIncidents.map((incident, index) => ({
      time: logs.data[index]?.time ?? '--:--:--',
      severity: incident.severity,
      issueType: incident.type,
      userMac:
        incident.sampleUsers.length > 0
          ? `${incident.sampleUsers[0]} (${incident.sampleMac})`
          : incident.sampleMac,
      location: incident.ap,
      status:
        incident.status === 'resolved'
          ? 'Đã xử lý'
          : incident.status === 'processing'
          ? 'Đang theo dõi'
          : 'Mới ghi nhận',
    }));

    const violationLogs = violations.data.map((item) => ({
      time: item.time,
      severity: toSeverityFromViolation(item.severity),
      issueType: item.type,
      userMac: item.user,
      location: '43:43:54:32:10:98', // Placeholder, ideally should be mapped from sessions or incidents
      status: 'Đang theo dõi',
    }));

    const systemLogs = logs.data
      .filter((item) => /auth|wifi|dhcp|controller|connection/i.test(item.message))
      .map((item) => ({
        time: item.time,
        severity: item.level === 'ERROR' ? ('critical' as const) : item.level === 'WARNING' ? ('warning' as const) : ('info' as const),
        issueType: item.message,
        userMac: '23:54:76:98:10:43', // Placeholder, ideally should be mapped from sessions or incidents
        location: 'AP-A1-02',
        status: item.level === 'ERROR' ? 'Cần xử lý' : 'Theo dõi',
      }));

    return [...incidentLogs, ...violationLogs, ...systemLogs];
  }, [enrichedIncidents, violations.data, logs.data]);

  const areas = useMemo(() => {
    const areaSet = new Set<string>();
    enrichedIncidents.forEach((item) => areaSet.add(item.ap));
    users.sessions.forEach((item) => areaSet.add(item.site));
    return Array.from(areaSet);
  }, [enrichedIncidents, users.sessions]);

  const filteredLogs = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();
    const now = new Date('2024-01-15T23:59:59');

    return unifiedLogs.filter((item) => {
      const matchesSeverity = severityFilter === 'all' || item.severity === severityFilter;
      const matchesArea = areaFilter === 'all' || item.location.includes(areaFilter);
      const matchesSearch =
        normalizedSearch.length === 0 ||
        item.userMac.toLowerCase().includes(normalizedSearch) ||
        item.issueType.toLowerCase().includes(normalizedSearch);

      const parsed = parseDateLike(item.time);
      const isToday = parsed ? parsed.toDateString() === now.toDateString() : true;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      const isThisWeek = parsed ? parsed >= weekStart && parsed <= now : true;
      const matchesTime =
        timeFilter === 'today' ? isToday : timeFilter === 'week' ? isThisWeek : true;

      return matchesSeverity && matchesArea && matchesSearch && matchesTime;
    });
  }, [unifiedLogs, severityFilter, areaFilter, searchText, timeFilter]);

  const incidentByHour = useMemo(() => {
    const arr = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));
    filteredLogs.forEach((item) => {
      const hour = extractHour(item.time);
      if (hour !== null && hour >= 0 && hour <= 23) {
        arr[hour].count += 1;
      }
    });
    return arr;
  }, [filteredLogs]);

  const lineChart = useMemo(() => {
    const width = 520;
    const height = 220;
    const maxCount = Math.max(1, ...incidentByHour.map((item) => item.count));

    const points = incidentByHour.map((item, idx) => {
      const x = (idx / 23) * width;
      const y = height - (item.count / maxCount) * height;
      return { x, y, count: item.count, hour: item.hour };
    });

    const linePath = points
      .map((point, idx) => `${idx === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(' ');

    const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

    const peakPoint = points.reduce((peak, point) => (point.count > peak.count ? point : peak), points[0]);

    return { width, height, maxCount, points, linePath, areaPath, peakPoint };
  }, [incidentByHour]);

  const issueDistribution = useMemo(() => {
    const counters: Record<string, number> = {
      'Sai mật khẩu/xác thực': 0,
      'Nhiễu sóng / Sóng yếu': 0,
      'Không nhận IP / DHCP': 0,
      'Lỗi phần cứng AP': 0,
      Khác: 0,
    };

    filteredLogs.forEach((item) => {
      const group = mapIssueGroup(item.issueType);
      counters[group] += 1;
    });

    const total = Math.max(1, Object.values(counters).reduce((sum, value) => sum + value, 0));
    const segments = Object.entries(counters).map(([name, value]) => ({
      name,
      value,
      percent: Math.round((value / total) * 100),
    }));

    const palette = ['#ef4444', '#f59e0b', '#3b82f6', '#6b7280', '#cbd5e1'];
    let cumulative = 0;
    const gradientParts = segments.map((segment, idx) => {
      const from = cumulative;
      cumulative += segment.percent;
      return `${palette[idx]} ${from}% ${cumulative}%`;
    });

    return { segments, gradient: `conic-gradient(${gradientParts.join(', ')})` };
  }, [filteredLogs]);

  const metrics = useMemo(() => {
    const totalIncidents = filteredLogs.length;
    const authFailures = filteredLogs.filter((item) => /xác thực|dang nhap|đăng nhập|auth|802\.1x|mật khẩu/i.test(item.issueType)).length;
    const dropped = filteredLogs.filter((item) => /mất kết nối|ngừng hoạt động|drop|disconnect/i.test(item.issueType)).length;
    const dropRate = users.sessions.length > 0 ? (dropped / users.sessions.length) * 100 : 0;
    const apOfflineList = enrichedIncidents.filter((item) => /ngừng hoạt động|offline/i.test(item.type)).map((item) => item.ap);
    const apOfflineCount = new Set(apOfflineList).size;

    const todayCount = filteredLogs.filter((item) => {
      const date = parseDateLike(item.time);
      return date ? date.toDateString() === new Date('2024-01-15').toDateString() : true;
    }).length;
    const yesterdayCount = filteredLogs.filter((item) => {
      const date = parseDateLike(item.time);
      return date ? date.toDateString() === new Date('2024-01-14').toDateString() : false;
    }).length;
    const deltaPercent = yesterdayCount === 0 ? 100 : Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);

    return {
      totalIncidents,
      authFailures,
      dropRate,
      apOfflineCount,
      apOfflineList,
      deltaPercent,
    };
  }, [filteredLogs, users.sessions.length, enrichedIncidents]);

  const handleExport = (format: 'pdf' | 'excel') => {
    console.log(`Export incident monitoring report as ${format}`);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-wide text-[#1e3a5f]">BÁO CÁO SỰ CỐ NGƯỜI DÙNG</h2>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <AlertTriangle size={16} /> Tổng sự cố
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{metrics.totalIncidents}</p>
          <p className="text-xs text-gray-600">{metrics.deltaPercent >= 0 ? '+' : ''}{metrics.deltaPercent}% so với hôm qua</p>
        </Card>

        <Card className="border-orange-200 bg-orange-50 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <AlertTriangle size={16} /> Lỗi xác thực
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{metrics.authFailures}</p>
          <p className="text-xs text-gray-600">lượt sai mật khẩu/xác thực</p>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <AlertTriangle size={16} /> Tỷ lệ rớt mạng
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{metrics.dropRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-600">theo tổng số phiên đã ghi nhận</p>
        </Card>

        <Card className="border-slate-300 bg-slate-100 p-4" title={metrics.apOfflineList.join(', ')}>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <AlertTriangle size={16} /> AP đang Offline
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{metrics.apOfflineCount}</p>
          <p className="text-xs text-gray-600">click để xem tooltip danh sách AP</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Tần suất sự cố theo thời gian</h3>
            <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
              Đỉnh: {lineChart.peakPoint.hour}h ({lineChart.peakPoint.count} sự cố)
            </span>
          </div>

          <div className="h-64 rounded-lg border bg-gradient-to-b from-slate-50 to-white p-3">
            <svg viewBox={`0 0 ${lineChart.width} ${lineChart.height}`} preserveAspectRatio="none" className="h-full w-full">
              <defs>
                <linearGradient id="incidentArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = lineChart.height * ratio;
                return (
                  <line
                    key={ratio}
                    x1="0"
                    y1={y}
                    x2={lineChart.width}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeDasharray="3 3"
                  />
                );
              })}

              <path d={lineChart.areaPath} fill="url(#incidentArea)" />
              <path d={lineChart.linePath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {lineChart.points.map((point, idx) => (
                <circle
                  key={point.hour}
                  cx={point.x}
                  cy={point.y}
                  r={idx === lineChart.peakPoint.hour ? 4.5 : 2.5}
                  fill={idx === lineChart.peakPoint.hour ? '#dc2626' : '#1d4ed8'}
                />
              ))}

              <text
                x={lineChart.peakPoint.x}
                y={Math.max(14, lineChart.peakPoint.y - 10)}
                textAnchor="middle"
                fontSize="10"
                fill="#991b1b"
                fontWeight="700"
              >
                Peak {lineChart.peakPoint.count}
              </text>
            </svg>
          </div>

          <div className="mt-2 grid grid-cols-8 gap-1 text-center text-xs text-gray-500">
            {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => (
              <span key={h}>{h}h</span>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">Trục X: khung giờ trong ngày. Trục Y: số lượng sự cố phát sinh.</p>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 font-semibold text-gray-900">Phân bổ loại sự cố</h3>
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <div
              className="h-44 w-44 rounded-full"
              style={{ background: issueDistribution.gradient }}
            />
            <div className="space-y-2 text-sm">
              {issueDistribution.segments.map((segment) => (
                <div key={segment.name} className="flex items-center justify-between gap-3">
                  <span>{segment.name}</span>
                  <span className="font-semibold">{segment.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="mb-3 font-semibold text-gray-900">Bảng dữ liệu chi tiết sự cố</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-3 py-2 text-left">Thời gian</th>
                <th className="px-3 py-2 text-left">Mức độ</th>
                <th className="px-3 py-2 text-left">Loại sự cố</th>
                <th className="px-3 py-2 text-left">Người dùng / MAC</th>
                <th className="px-3 py-2 text-left">Vị trí (AP/Zone)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLogs.map((item, idx) => (
                <tr key={`${formatDateTime(item.time)}-${idx}`}>
                  <td className="px-3 py-2">{formatDateTime(item.time)}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${severityColor[item.severity]}`}>
                      {severityLabel[item.severity]}
                    </span>
                  </td>
                  <td className="px-3 py-2">{item.issueType}</td>
                  <td className="px-3 py-2">{item.userMac}</td>
                  <td className="px-3 py-2">{item.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
