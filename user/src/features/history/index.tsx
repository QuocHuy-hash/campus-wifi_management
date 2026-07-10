"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  History,
  Clock,
  Download,
  Upload,
  Activity,
  ChevronRight,
  ChevronLeft,
  Laptop,
  Smartphone,
  Monitor,
  Filter,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Network,
  User,
  Loader2,
} from "lucide-react";
import { formatBytes, formatDuration, formatDurationShort, formatDateTime, formatDateTimeShort } from "@/data/mockData";
import { fetchUserSessions } from "@/features/session/api/sessionApi";
import type { UserSession, UserSessionQueryParams } from "@/features/auth/types";

// Icon thiết bị dựa trên deviceType
function getDeviceIcon(deviceType: string | null, size: number = 14) {
  switch (deviceType) {
    case "Smartphone":
      return <Smartphone size={size} />;
    case "Laptop":
      return <Laptop size={size} />;
    case "Tablet":
      return <Monitor size={size} />;
    default:
      return <Monitor size={size} />;
  }
}

// Ưu tiên deviceUserInfo (realtime UniFi) rồi mới đến top-level (DB sync 5p)
function getTraffic(session: UserSession, type: 'download' | 'upload'): string {
  const fromDevice = type === 'download' ? session.deviceUserInfo?.downloadBytes : session.deviceUserInfo?.uploadBytes;
  if (fromDevice) return fromDevice;
  return formatBytes(type === 'download' ? session.downloadBytes : session.uploadBytes);
}

function getTrafficTotal(session: UserSession): string {
  const down = session.deviceUserInfo?.downloadBytes;
  const up = session.deviceUserInfo?.uploadBytes;
  if (down && up) {
    const parseMB = (s: string) => { const p = s.split(' '); const v = parseFloat(p[0]); const u = p[1]?.toLowerCase(); if (u === 'gb') return v * 1024; if (u === 'kb') return v / 1024; return v; };
    return `${(parseMB(down) + parseMB(up)).toFixed(2)} MB`;
  }
  return formatBytes(session.downloadBytes + session.uploadBytes);
}

// Badge trạng thái phiên
function getStatusBadge(session: UserSession, compact = false) {
  const baseClass = compact
    ? "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium"
    : "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium";

  switch (session.status) {
    case "ACTIVE":
      return (
        <span className={`${baseClass} bg-emerald-100 text-emerald-700`}>
          <Activity size={10} className="animate-pulse" /> Online
        </span>
      );
    case "ENDED":
      return (
        <span className={`${baseClass} bg-gray-100 text-gray-600`}>
          <CheckCircle size={10} /> Kết thúc
        </span>
      );
    case "EXPIRED":
      return (
        <span className={`${baseClass} bg-amber-50 text-amber-600`}>
          <Clock size={10} /> Hết hạn
        </span>
      );
    case "FAILED":
      return (
        <span className={`${baseClass} bg-red-50 text-red-600`}>
          <XCircle size={10} /> Thất bại
        </span>
      );
    default:
      return (
        <span className={`${baseClass} bg-gray-100 text-gray-600`}>
          <CheckCircle size={10} /> Kết thúc
        </span>
      );
  }
}

// Map lý do kết thúc từ API
function getTerminateCauseLabel(cause: string | null): string {
  switch (cause) {
    case "User-Request":
      return "Người dùng đăng xuất";
    case "Session-Timeout":
      return "Hết thời gian phiên";
    case "Idle-Timeout":
      return "Không hoạt động";
    case "Admin-Reset":
      return "Admin ngắt kết nối";
    case "Lost-Carrier":
      return "Mất kết nối";
    default:
      return cause || "--";
  }
}

// Format ngày thành yyyy-MM-dd
function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function HistoryPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSession, setSelectedSession] = useState<UserSession | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);

  // Bộ lọc
  const today = toDateString(new Date());
  const oneWeekAgo = toDateString(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [dateFrom, setDateFrom] = useState(oneWeekAgo);
  const [dateTo, setDateTo] = useState(today);
  const [statusFilter, setStatusFilter] = useState("all");
  const [ssidFilter, setSsidFilter] = useState("");

  // Dữ liệu từ API
  const [pageData, setPageData] = useState({
    current: 1,
    size: 10,
    total: 0,
    pages: 0,
    records: [] as UserSession[],
  });

  const ITEMS_PER_PAGE = 10;

  // Gọi API lấy danh sách phiên
  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const params: UserSessionQueryParams = {
        page: currentPage,
        size: ITEMS_PER_PAGE,
        startDate: dateFrom,
        endDate: dateTo,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(ssidFilter.trim() && { ssid: ssidFilter.trim() }),
      };

      let data = await fetchUserSessions(params);
      // Client-side filter fallback (server không hỗ trợ lọc theo status)
      if (statusFilter !== "all") {
        data = {
          ...data,
          records: data.records.filter((r) => r.status === statusFilter),
        };
      }
      setPageData(data);
    } catch {
      setPageData(prev => ({ ...prev, records: [], total: 0, pages: 0 }));
    } finally {
      setLoading(false);
    }
  }, [currentPage, dateFrom, dateTo, statusFilter, ssidFilter]);

  // Load khi filters hoặc page thay đổi
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Cập nhật thời gian mỗi 60s (cho duration của session đang online)
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const [user, setUser] = useState<{ fullname: string; role: string } | null>(null);

  // FIX: Thêm state isMounted để tránh hydration mismatch
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const userStr = localStorage.getItem("portalUser");
    setUser(userStr ? JSON.parse(userStr) : null);
  }, []);

  // Reset filters
  const resetFilters = () => {
    setDateFrom(oneWeekAgo);
    setDateTo(today);
    setStatusFilter("all");
    setSsidFilter("");
    setCurrentPage(1);
  };

  // Mở modal chi tiết
  const openSessionDetail = (session: UserSession) => {
    setSelectedSession(session);
    setDetailModalOpen(true);
  };

  return (
    <>
      <AppLayout
        activePage="history"
        headerRight={
          <div className="hidden sm:block text-right">
            {/* FIX: Hiển thị placeholder khi chưa mount để tránh hydration mismatch */}
            <p className="text-sm font-medium text-gray-900">
              {isMounted ? (user?.fullname || "Guest") : '\u00A0'}
            </p>
            <p className="text-xs text-gray-500">
              {isMounted ? (user?.role || "Student") : '\u00A0'}
            </p>
          </div>
        }
      >
        <Card className="overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div>
                <h1 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <History size={14} />
                  Lịch sử đăng nhập
                </h1>
                <p className="text-[10px] text-gray-500">{pageData.total} phiên</p>
              </div>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] px-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={12} className="mr-1" />
                  Lọc
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-[10px] px-2">
                  <FileSpreadsheet size={12} className="mr-1" />
                  Excel
                </Button>
              </div>
            </div>

            {/* Bộ lọc */}
            {showFilters && (
              <div className="pt-2 border-t border-gray-100">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <Label className="text-[10px] text-gray-500">Từ ngày</Label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="h-7 text-xs mt-0.5"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-gray-500">Đến ngày</Label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => {
                        setDateTo(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="h-7 text-xs mt-0.5"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-gray-500">Trạng thái</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={(v) => {
                        setStatusFilter(v);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="h-7 text-xs mt-0.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="ACTIVE">Online</SelectItem>
                        <SelectItem value="ENDED">Kết thúc</SelectItem>
                        <SelectItem value="EXPIRED">Hết hạn</SelectItem>
                        <SelectItem value="FAILED">Thất bại</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* <div>
                    <Label className="text-[10px] text-gray-500">SSID</Label>
                    <Input
                      type="text"
                      placeholder="Tên WiFi..."
                      value={ssidFilter}
                      onChange={(e) => {
                        setSsidFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="h-7 text-xs mt-0.5"
                    />
                  </div> */}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-6 text-[10px]"
                  onClick={resetFilters}
                >
                  Xóa lọc
                </Button>
              </div>
            )}
          </div>

          {/* Loading spinner */}
          {loading && (
            <div className="p-8 text-center">
              <Loader2 size={24} className="mx-auto mb-2 text-gray-300 animate-spin" />
              <p className="text-xs text-gray-500">Đang tải...</p>
            </div>
          )}

          {/* Bảng desktop */}
          {!loading && (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Thời gian</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Thiết bị</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Mạng</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Thời lượng</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Lưu lượng</th>
                    <th className="px-3 py-2 text-center font-medium text-gray-500">Trạng thái</th>
                    <th className="px-3 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageData.records.map((session) => (
                    <tr
                      key={session.sessionId}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => openSessionDetail(session)}
                    >
                      <td className="px-3 py-2">
                        <div className="text-gray-900">
                          {formatDateTimeShort(session.startTime)}
                        </div>
                        {session.endTime && (
                          <div className="text-[12px] text-gray-400">
                            → {formatDateTimeShort(session.endTime)}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                            {getDeviceIcon(session.deviceUserInfo.deviceType, 12)}
                          </div>
                          <div>
                            <div className="text-gray-900 truncate max-w-[120px]">
                              {session.deviceUserInfo.deviceName}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              {session.deviceUserInfo.macAddress}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-gray-900 truncate max-w-[100px]">
                          {session.ssid}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono truncate max-w-[100px]">
                          {session.apMac}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-900">
                        {session.status === "ACTIVE"
                          ? formatDurationShort(
                              Math.floor(
                                (currentTime - new Date(session.startTime).getTime()) / 1000
                              )
                            )
                          : session.endTime
                          ? formatDurationShort(
                              Math.floor(
                                (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000
                              )
                            )
                          : "--"}
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-blue-600">
                          ↓{getTraffic(session, 'download')}
                        </div>
                        <div className="text-[10px] text-green-600">
                          ↑{getTraffic(session, 'upload')}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">{getStatusBadge(session, true)}</td>
                      <td className="px-3 py-2">
                        <ChevronRight size={14} className="text-gray-300" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Danh sách mobile */}
          {!loading && (
            <div className="md:hidden divide-y divide-gray-100">
              {pageData.records.map((session) => (
                <div
                  key={session.sessionId}
                  className="p-3 hover:bg-gray-50"
                  onClick={() => openSessionDetail(session)}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                        {getDeviceIcon(session.deviceUserInfo.deviceType, 12)}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-900">
                          {session.deviceUserInfo.deviceName}
                        </div>
                        <div className="text-[10px] text-gray-400">{session.ssid}</div>
                      </div>
                    </div>
                    {getStatusBadge(session, true)}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>{formatDateTimeShort(session.startTime)}</span>
                    <span className="flex items-center gap-2">
                      <span>
                        {session.status === "ACTIVE"
                          ? formatDurationShort(
                              Math.floor(
                                (currentTime - new Date(session.startTime).getTime()) / 1000
                              )
                            )
                          : session.endTime
                          ? formatDurationShort(
                              Math.floor(
                                (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000
                              )
                            )
                          : "--"}
                      </span>
                      <span className="text-gray-900 font-medium">
                        {getTrafficTotal(session)}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && pageData.records.length === 0 && (
            <div className="p-8 text-center">
              <History size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-xs text-gray-500">Không tìm thấy phiên nào</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-[10px]"
                onClick={resetFilters}
              >
                Xóa lọc
              </Button>
            </div>
          )}

          {/* Phân trang */}
          {!loading && pageData.records.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10px] text-gray-500">
                {(pageData.current - 1) * pageData.size + 1}-
                {Math.min(pageData.current * pageData.size, pageData.total)} /{" "}
                {pageData.total}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={12} />
                </Button>
                <span className="text-[10px] text-gray-600 px-2">
                  {pageData.current}/{pageData.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setCurrentPage((p) => Math.min(pageData.pages, p + 1))}
                  disabled={currentPage === pageData.pages}
                >
                  <ChevronRight size={12} />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </AppLayout>

      {/* Modal chi tiết phiên */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              {selectedSession && getDeviceIcon(selectedSession.deviceUserInfo.deviceType, 18)}
              Chi tiết phiên đăng nhập
            </DialogTitle>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-2 py-1">
              {/* Trạng thái */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Trạng thái</span>
                {getStatusBadge(selectedSession)}
              </div>

              {/* Thông tin người dùng */}
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <User size={14} /> Người dùng
                </p>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="mb-2">
                    <p className="text-gray-400 text-xs mb-0.5">Username</p>
                    <p className="font-mono">{selectedSession.deviceUserInfo.userName}</p>
                  </div>       
                </div> 
                  {/* <div>
                    <p className="text-gray-400 text-xs">Nhóm</p>
                    <p className="text-sm">{selectedSession.deviceUserInfo.userGroup || "--"}</p>
                  </div> */}
              </div>

              {/* Thời gian */}
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <Clock size={14} /> Thời gian
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Bắt đầu</p>
                    <p>{formatDateTime(selectedSession.startTime)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Kết thúc</p>
                    <p>
                      {selectedSession.endTime ? (
                        formatDateTime(selectedSession.endTime)
                      ) : (
                        <span className="text-green-600 font-medium">Đang online</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Thời lượng</p>
                    <p>
                      {selectedSession.status === "ACTIVE"
                        ? formatDuration(
                            Math.floor(
                              (currentTime - new Date(selectedSession.startTime).getTime()) / 1000
                            )
                          )
                        : selectedSession.endTime
                        ? formatDuration(
                            Math.floor(
                              (new Date(selectedSession.endTime).getTime() - new Date(selectedSession.startTime).getTime()) / 1000
                            )
                          )
                        : "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Lý do kết thúc</p>
                    <p>{getTerminateCauseLabel(selectedSession.terminateCause)}</p>
                  </div>
                </div>
              </div>

              {/* Thiết bị */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <Laptop size={14} /> Thiết bị
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Tên</p>
                    <p>{selectedSession.deviceUserInfo.deviceName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Loại</p>
                    <p>{selectedSession.deviceUserInfo.deviceType || "--"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">MAC</p>
                    <p className="font-mono text-xs">{selectedSession.deviceUserInfo.macAddress}</p>
                  </div>
                </div>
              </div>

              {/* Mạng */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <Network size={14} /> Mạng
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">SSID</p>
                    <p>{selectedSession.ssid}</p>
                  </div>
                  {/* <div>
                    <p className="text-gray-400 text-xs mb-0.5">IP</p>
                    <p className="font-mono text-xs">{selectedSession.ipAddress}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">VLAN</p>
                    <p>{selectedSession.vlan}</p>
                  </div> */}
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">AP MAC</p>
                    <p className="font-mono text-xs">{selectedSession.apMac}</p>
                  </div>
                </div>
              </div>

              {/* Lưu lượng */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <Activity size={14} /> Lưu lượng
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-1 bg-blue-50 rounded-lg border border-blue-100">
                    <Download size={16} className="mx-auto text-blue-500 mb-1" />
                    <p className="text-xs text-gray-500">Download</p>
                    <p className="text-sm  text-blue-600">
                      {getTraffic(selectedSession, 'download')}
                    </p>
                  </div>
                  <div className="text-center p-1 bg-green-50 rounded-lg border border-green-100">
                    <Upload size={16} className="mx-auto text-green-500 mb-1" />
                    <p className="text-xs text-gray-500">Upload</p>
                    <p className="text-sm  text-green-600">
                      {getTraffic(selectedSession, 'upload')}
                    </p>
                  </div>
                  <div className="text-center p-1 bg-violet-50 rounded-lg border border-violet-100">
                    <Activity size={16} className="mx-auto text-violet-500 mb-1" />
                    <p className="text-xs text-gray-500">Tổng</p>
                    <p className="text-sm  text-violet-600">
                      {getTrafficTotal(selectedSession)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
