import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Activity, Clock3, Database, Filter, Timer, Users } from 'lucide-react';
import { RootState, AppDispatch } from '@/stores/store';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchSessionData } from '../../slices/sessionsReportSlice';

const parseDateTime = (value: string) => {
  const date = new Date(value.replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseDurationMinutes = (duration: string) => {
  const hourMatch = duration.match(/(\d+)h/);
  const minuteMatch = duration.match(/(\d+)m/);
  const hours = hourMatch ? Number.parseInt(hourMatch[1], 10) : 0;
  const minutes = minuteMatch ? Number.parseInt(minuteMatch[1], 10) : 0;
  return hours * 60 + minutes;
};

const getEndDateTime = (startTime: string, endTime: string, duration: string) => {
  const explicitEnd = parseDateTime(endTime);
  if (explicitEnd) return explicitEnd;

  const start = parseDateTime(startTime);
  if (!start) return null;

  const fallback = new Date(start);
  fallback.setMinutes(fallback.getMinutes() + parseDurationMinutes(duration));
  return fallback;
};

export const SessionTimelineReportTab = () => {
  const pageSize = 6;
  const dispatch = useDispatch<AppDispatch>();
  const { data: sessionData, status } = useSelector((state: RootState) => state.reports.sessions);
  const [roleFilter, setRoleFilter] = useState('all');
  const [hourFilter, setHourFilter] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSessionData());
    }
  }, [dispatch, status]);

  const availableRoles = useMemo(() => {
    const roles = Array.from(new Set(sessionData.map((item) => item.role)));
    return roles.sort((a, b) => a.localeCompare(b));
  }, [sessionData]);

  const filteredSessions = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return sessionData.filter((session) => {
      const date = parseDateTime(session.startTime);
      const hour = date ? date.getHours() : -1;

      const matchesRole = roleFilter === 'all' || session.role === roleFilter;
      const matchesHour = hourFilter === 'all' || hour === Number.parseInt(hourFilter, 10);
      const matchesKeyword =
        keyword.length === 0 ||
        session.username.toLowerCase().includes(keyword) ||
        session.ap.toLowerCase().includes(keyword) ||
        session.location.toLowerCase().includes(keyword) ||
        session.ipAddress.toLowerCase().includes(keyword) ||
        session.macAddress.toLowerCase().includes(keyword);

      return matchesRole && matchesHour && matchesKeyword;
    });
  }, [sessionData, roleFilter, hourFilter, searchKeyword]);

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, hourFilter, searchKeyword]);

  const analytics = useMemo(() => {
    const hourBuckets = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: 0,
      dataUsed: 0,
    }));

    const roleMap: Record<string, { count: number; dataUsed: number }> = {};
    let totalMinutes = 0;
    let totalActiveMinutes = 0;
    let totalIdleMinutes = 0;
    let totalData = 0;
    const concurrentEvents: Array<{ time: number; delta: number }> = [];
    const unusualLogins: Array<{ username: string; startTime: string; location: string }> = [];

    filteredSessions.forEach((session) => {
      const startDate = parseDateTime(session.startTime);
      if (startDate) {
        const hour = startDate.getHours();
        hourBuckets[hour].count += 1;
        hourBuckets[hour].dataUsed += session.dataUsed;

        if (hour < 6 || hour >= 22) {
          unusualLogins.push({
            username: session.username,
            startTime: session.startTime,
            location: session.location,
          });
        }
      }

      if (!roleMap[session.role]) {
        roleMap[session.role] = { count: 0, dataUsed: 0 };
      }
      roleMap[session.role].count += 1;
      roleMap[session.role].dataUsed += session.dataUsed;

      const durationMinutes = parseDurationMinutes(session.duration);
      const activeMinutes = Math.round(durationMinutes * 0.8);
      const idleMinutes = Math.max(0, durationMinutes - activeMinutes);

      totalMinutes += durationMinutes;
      totalActiveMinutes += activeMinutes;
      totalIdleMinutes += idleMinutes;
      totalData += session.dataUsed;

      const endDate = getEndDateTime(session.startTime, session.endTime, session.duration);
      if (startDate && endDate) {
        concurrentEvents.push({ time: startDate.getTime(), delta: 1 });
        concurrentEvents.push({ time: endDate.getTime(), delta: -1 });
      }
    });

    const peakBucket = hourBuckets.reduce((peak, item) => (item.count > peak.count ? item : peak), hourBuckets[0]);
    const peakHourLabel = `${String(peakBucket.hour).padStart(2, '0')}:00`;
    const averageMinutes = filteredSessions.length > 0 ? Math.round(totalMinutes / filteredSessions.length) : 0;

    const roleStats = Object.entries(roleMap).map(([role, value]) => ({
      role,
      ...value,
    }));

    const dailyMap: Record<string, { date: string; count: number; dataUsed: number; totalMinutes: number }> = {};
    filteredSessions.forEach((session) => {
      const dateKey = session.startTime.split(' ')[0] || 'Unknown';
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { date: dateKey, count: 0, dataUsed: 0, totalMinutes: 0 };
      }
      dailyMap[dateKey].count += 1;
      dailyMap[dateKey].dataUsed += session.dataUsed;
      dailyMap[dateKey].totalMinutes += parseDurationMinutes(session.duration);
    });

    const dailyStats = Object.values(dailyMap).sort((a, b) => b.date.localeCompare(a.date));

    const topUsersMap: Record<string, { username: string; sessions: number; dataUsed: number; totalMinutes: number }> = {};
    filteredSessions.forEach((session) => {
      if (!topUsersMap[session.username]) {
        topUsersMap[session.username] = {
          username: session.username,
          sessions: 0,
          dataUsed: 0,
          totalMinutes: 0,
        };
      }
      topUsersMap[session.username].sessions += 1;
      topUsersMap[session.username].dataUsed += session.dataUsed;
      topUsersMap[session.username].totalMinutes += parseDurationMinutes(session.duration);
    });

    const topUsers = Object.values(topUsersMap)
      .sort((a, b) => b.dataUsed - a.dataUsed)
      .slice(0, 5);

    let concurrentUsers = 0;
    let maxConcurrentUsers = 0;
    concurrentEvents
      .sort((a, b) => a.time - b.time)
      .forEach((event) => {
        concurrentUsers += event.delta;
        if (concurrentUsers > maxConcurrentUsers) {
          maxConcurrentUsers = concurrentUsers;
        }
      });

    const activeHours = hourBuckets.filter((item) => item.count > 0);
    const maxCount = activeHours.length > 0 ? Math.max(...activeHours.map((item) => item.count)) : 0;

    return {
      totalSessions: filteredSessions.length,
      totalData,
      averageMinutes,
      totalActiveMinutes,
      totalIdleMinutes,
      activeRatio: totalMinutes > 0 ? Math.round((totalActiveMinutes / totalMinutes) * 100) : 0,
      idleRatio: totalMinutes > 0 ? Math.round((totalIdleMinutes / totalMinutes) * 100) : 0,
      peakHourLabel,
      peakCount: peakBucket.count,
      maxConcurrentUsers,
      hourBuckets: activeHours,
      roleStats,
      maxCount,
      dailyStats,
      topUsers,
      unusualLogins: unusualLogins.slice(0, 5),
    };
  }, [filteredSessions]);

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize));
  const pagedSessions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSessions.slice(start, start + pageSize);
  }, [filteredSessions, currentPage]);

  const resetFilters = () => {
    setRoleFilter('all');
    setHourFilter('all');
    setSearchKeyword('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1e3a5f]">Thống kê phiên làm việc theo thời gian</h2>
        <p className="text-sm text-gray-500 mt-1">Phân tích xu hướng số phiên, tải dữ liệu và thời lượng hoạt động của người dùng</p>
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter size={16} className="text-blue-600" /> Bộ lọc phân tích
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm username, AP, IP, MAC, vị trí"
          />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              {availableRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={hourFilter} onValueChange={setHourFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Khung giờ bắt đầu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khung giờ</SelectItem>
              {Array.from({ length: 24 }, (_, hour) => (
                <SelectItem key={hour} value={String(hour)}>
                  {String(hour).padStart(2, '0')}:00
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={resetFilters}>Đặt lại bộ lọc</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Users size={16} /> Tổng phiên
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{analytics.totalSessions}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Database size={16} /> Dữ liệu tiêu thụ
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{analytics.totalData.toFixed(2)} GB</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Timer size={16} /> Thời lượng TB
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{analytics.averageMinutes} phút</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Clock3 size={16} /> Khung giờ cao điểm
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{analytics.peakHourLabel}</p>
          <p className="text-xs text-gray-500">{analytics.peakCount} phiên bắt đầu</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">Active / Idle</div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{analytics.activeRatio}% / {analytics.idleRatio}%</p>
          <p className="text-xs text-gray-500">{analytics.totalActiveMinutes}p hoạt động, {analytics.totalIdleMinutes}p chờ</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">Concurrent users</div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{analytics.maxConcurrentUsers}</p>
          <p className="text-xs text-gray-500">Số user đồng thời tối đa</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Activity size={16} className="text-blue-600" />
            Phân bố phiên theo giờ bắt đầu
          </h3>
          <div className="space-y-2">
            {analytics.hourBuckets.length === 0 && (
              <p className="text-sm text-gray-500">Chưa có dữ liệu phiên.</p>
            )}
            {analytics.hourBuckets.map((item) => (
              <div key={item.hour} className="flex items-center gap-3">
                <span className="w-14 text-xs text-gray-600">{String(item.hour).padStart(2, '0')}:00</span>
                <div className="h-2 flex-1 rounded bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded bg-blue-500"
                    style={{
                      width: analytics.maxCount > 0 ? `${Math.max(6, Math.round((item.count / analytics.maxCount) * 100))}%` : '0%',
                    }}
                  />
                </div>
                <span className="w-16 text-right text-xs text-gray-700">{item.count} phiên</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Phân tách theo nhóm người dùng</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left">Nhóm</th>
                  <th className="px-3 py-2 text-right">Số phiên</th>
                  <th className="px-3 py-2 text-right">Dữ liệu (GB)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {analytics.roleStats.map((item) => (
                  <tr key={item.role}>
                    <td className="px-3 py-2">{item.role}</td>
                    <td className="px-3 py-2 text-right font-medium">{item.count}</td>
                    <td className="px-3 py-2 text-right font-medium">{item.dataUsed.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Xu hướng theo ngày</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left">Ngày</th>
                  <th className="px-3 py-2 text-right">Số phiên</th>
                  <th className="px-3 py-2 text-right">Dữ liệu (GB)</th>
                  <th className="px-3 py-2 text-right">TB/phiên</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {analytics.dailyStats.map((item) => (
                  <tr key={item.date}>
                    <td className="px-3 py-2">{item.date}</td>
                    <td className="px-3 py-2 text-right font-medium">{item.count}</td>
                    <td className="px-3 py-2 text-right font-medium">{item.dataUsed.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">{Math.round(item.totalMinutes / item.count)} phút</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Top người dùng theo dữ liệu tiêu thụ</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left">Username</th>
                  <th className="px-3 py-2 text-right">Số phiên</th>
                  <th className="px-3 py-2 text-right">Data (GB)</th>
                  <th className="px-3 py-2 text-right">Thời lượng</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {analytics.topUsers.map((item) => (
                  <tr key={item.username}>
                    <td className="px-3 py-2 text-xs md:text-sm">{item.username}</td>
                    <td className="px-3 py-2 text-right font-medium">{item.sessions}</td>
                    <td className="px-3 py-2 text-right font-medium">{item.dataUsed.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">{item.totalMinutes} phút</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Đăng nhập bất thường ngoài giờ</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-3 py-2 text-left">Username</th>
                <th className="px-3 py-2 text-left">Log in</th>
                <th className="px-3 py-2 text-left">Vị trí</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {analytics.unusualLogins.length === 0 && (
                <tr>
                  <td className="px-3 py-3 text-gray-500" colSpan={3}>Không có phiên ngoài khung 06:00-22:00.</td>
                </tr>
              )}
              {analytics.unusualLogins.map((item, idx) => (
                <tr key={`${item.username}-${idx}`}>
                  <td className="px-3 py-2">{item.username}</td>
                  <td className="px-3 py-2">{item.startTime}</td>
                  <td className="px-3 py-2">{item.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Chi tiết phiên theo thời gian</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-3 py-2 text-left">Username</th>
                <th className="px-3 py-2 text-left">Vai trò</th>
                <th className="px-3 py-2 text-left">Bắt đầu</th>
                <th className="px-3 py-2 text-left">Kết thúc</th>
                <th className="px-3 py-2 text-right">Thời lượng</th>
                <th className="px-3 py-2 text-right">Active</th>
                <th className="px-3 py-2 text-right">Idle</th>
                <th className="px-3 py-2 text-right">Data</th>
                <th className="px-3 py-2 text-left">AP</th>
                <th className="px-3 py-2 text-left">IP / MAC</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pagedSessions.map((session) => (
                <tr key={session.id}>
                  <td className="px-3 py-2">{session.username}</td>
                  <td className="px-3 py-2">{session.role}</td>
                  <td className="px-3 py-2">{session.startTime}</td>
                  <td className="px-3 py-2">{session.endTime}</td>
                  <td className="px-3 py-2 text-right">{session.duration}</td>
                  <td className="px-3 py-2 text-right">{Math.round(parseDurationMinutes(session.duration) * 0.8)}p</td>
                  <td className="px-3 py-2 text-right">{Math.max(0, parseDurationMinutes(session.duration) - Math.round(parseDurationMinutes(session.duration) * 0.8))}p</td>
                  <td className="px-3 py-2 text-right font-medium">{session.dataUsed.toFixed(2)} GB</td>
                  <td className="px-3 py-2">
                    <div>{session.ap}</div>
                    <div className="text-xs text-gray-500">{session.location}</div>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <div>{session.ipAddress}</div>
                    <div className="text-gray-500">{session.macAddress}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <p className="text-gray-500">
            Hiển thị {filteredSessions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredSessions.length)} / {filteredSessions.length} phiên
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
              Trước
            </Button>
            <span className="rounded bg-slate-100 px-2 py-1">{currentPage}/{totalPages}</span>
            <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
              Sau
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Mục đích sử dụng</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>Đánh giá mức độ tương tác: theo dõi user hoạt động lúc nào, bao lâu, và nhóm nào sử dụng nhiều nhất.</p>
          <p>Phân tích tải hệ thống: theo dõi peak hours và concurrent users để lập kế hoạch scale hạ tầng.</p>
          <p>Quản lý bảo mật: phát hiện phiên đăng nhập bất thường như truy cập lúc 03:00 sáng.</p>
        </div>
      </Card>
    </div>
  );
};
