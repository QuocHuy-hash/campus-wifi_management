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
import { useCaptiveAuthorization } from "@/features/auth/hooks/useCaptiveAuthorization";
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

function getTraffic(session: UserSession, type: 'download' | 'upload'): string {
  return formatBytes(type === 'download' ? session.downloadBytes : session.uploadBytes);
}

function getTrafficTotal(session: UserSession): string {
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
        <span className={`${baseClass} bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400`}>
          <Activity size={10} className="animate-pulse" /> Online
        </span>
      );
    case "ENDED":
      return (
        <span className={`${baseClass} bg-muted text-muted-foreground`}>
          <CheckCircle size={10} /> Kết thúc
        </span>
      );
    case "EXPIRED":
      return (
        <span className={`${baseClass} bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400`}>
          <Clock size={10} /> Hết hạn
        </span>
      );
    case "FAILED":
      return (
        <span className={`${baseClass} bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400`}>
          <XCircle size={10} /> Thất bại
        </span>
      );
    default:
      return (
        <span className={`${baseClass} bg-muted text-muted-foreground`}>
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
  // Authorize thiết bị nếu còn captive context
  const { authorize: authorizeDeviceIfNeeded } = useCaptiveAuthorization();

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
      await authorizeDeviceIfNeeded();
      const params: UserSessionQueryParams = {
        page: currentPage,
        size: ITEMS_PER_PAGE,
        startDate: dateFrom,
        endDate: dateTo,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(ssidFilter.trim() && { ssid: ssidFilter.trim() }),
      };

      let data = await fetchUserSessions(params);
      console.log('History records:', data.records.length, data.records);
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
  }, [currentPage, dateFrom, dateTo, statusFilter, ssidFilter, authorizeDeviceIfNeeded]);

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
            <p className="text-sm font-medium text-card-foreground">
              {isMounted ? (user?.fullname || "Guest") : '\u00A0'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isMounted ? (user?.role || "Student") : '\u00A0'}
            </p>
          </div>
        }
      >
        <Card className="overflow-hidden border-border">
          {/* Header */}
          <div className="p-3 border-b border-border">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div>
                <h1 className="text-sm font-semibold text-card-foreground flex items-center gap-1.5">
                  <History size={14} />
                  Lịch sử đăng nhập
                </h1>
                <p className="text-[10px] text-muted-foreground">{pageData.total} phiên</p>
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
              <div className="pt-2 border-t border-border">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Từ ngày</Label>
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
                    <Label className="text-[10px] text-muted-foreground">Đến ngày</Label>
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
                    <Label className="text-[10px] text-muted-foreground">Trạng thái</Label>
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
              <Loader2 size={24} className="mx-auto mb-2 text-muted-foreground animate-spin" />
              <p className="text-xs text-muted-foreground">Đang tải...</p>
            </div>
          )}

          {/* Bảng desktop */}
          {!loading && (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Thời gian</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Thiết bị</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Mạng</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Thời lượng</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Lưu lượng</th>
                    <th className="px-3 py-2 text-center font-medium text-muted-foreground">Trạng thái</th>
                    <th className="px-3 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageData.records.map((session, index) => (
                    <tr
                      key={session.sessionId || `sess-${index}`}
                      className="hover:bg-muted/30 cursor-pointer"
                      onClick={() => openSessionDetail(session)}
                    >
                      <td className="px-3 py-2">
                        <div className="text-card-foreground">
                          {formatDateTimeShort(session.startTime)}
                        </div>
                        {session.endTime && (
                          <div className="text-[12px] text-muted-foreground">
                            → {formatDateTimeShort(session.endTime)}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-muted rounded flex items-center justify-center text-muted-foreground">
                            {getDeviceIcon(session.deviceUserInfo.deviceType, 12)}
                          </div>
                          <div>
                            <div className="text-card-foreground truncate max-w-[120px]">
                              {session.deviceUserInfo.deviceName}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {session.deviceUserInfo.macAddress}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-card-foreground truncate max-w-[100px]">
                          {session.ssid}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[100px]">
                          {session.apMac}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-card-foreground">
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
                        <div className="text-blue-600 dark:text-blue-400">
                          ↓{getTraffic(session, 'download')}
                        </div>
                        <div className="text-[10px] text-green-600 dark:text-green-400">
                          ↑{getTraffic(session, 'upload')}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">{getStatusBadge(session, true)}</td>
                      <td className="px-3 py-2">
                        <ChevronRight size={14} className="text-muted-foreground" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Danh sách mobile */}
          {!loading && (
            <div className="md:hidden divide-y divide-border">
              {pageData.records.map((session, index) => (
                <div
                  key={session.sessionId || `sess-m-${index}`}
                  className="p-3 hover:bg-muted/30"
                  onClick={() => openSessionDetail(session)}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-muted rounded flex items-center justify-center text-muted-foreground">
                        {getDeviceIcon(session.deviceUserInfo.deviceType, 12)}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-card-foreground">
                          {session.deviceUserInfo.deviceName}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{session.ssid}</div>
                      </div>
                    </div>
                    {getStatusBadge(session, true)}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
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
                      <span className="text-card-foreground font-medium">
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
              <History size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Không tìm thấy phiên nào</p>
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
            <div className="px-3 py-2 border-t border-border flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
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
                <span className="text-[10px] text-muted-foreground px-2">
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
                <span className="text-xs text-muted-foreground">Trạng thái</span>
                {getStatusBadge(selectedSession)}
              </div>

              {/* Thông tin người dùng */}
              <div className="bg-muted/50 rounded-lg p-2">
                <p className="text-xs font-semibold text-card-foreground mb-3 flex items-center gap-1.5">
                  <User size={14} /> Người dùng
                </p>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="mb-2">
                    <p className="text-muted-foreground text-xs mb-0.5">Username</p>
                    <p className="font-mono text-card-foreground">{selectedSession.deviceUserInfo.userName}</p>
                  </div>       
                </div> 
                  {/* <div>
                    <p className="text-gray-400 text-xs">Nhóm</p>
                    <p className="text-sm">{selectedSession.deviceUserInfo.userGroup || "--"}</p>
                  </div> */}
              </div>

              {/* Thời gian */}
              <div className="bg-muted/50 rounded-lg p-2">
                <p className="text-xs font-semibold text-card-foreground mb-3 flex items-center gap-1.5">
                  <Clock size={14} /> Thời gian
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Bắt đầu</p>
                    <p className="text-card-foreground">{formatDateTime(selectedSession.startTime)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Kết thúc</p>
                    <p className="text-card-foreground">
                      {selectedSession.endTime ? (
                        formatDateTime(selectedSession.endTime)
                      ) : (
                        <span className="text-green-600 font-medium">Đang online</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Thời lượng</p>
                    <p className="text-card-foreground">
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
                    <p className="text-muted-foreground text-xs mb-0.5">Lý do kết thúc</p>
                    <p className="text-card-foreground">{getTerminateCauseLabel(selectedSession.terminateCause)}</p>
                  </div>
                </div>
              </div>

              {/* Thiết bị */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs font-semibold text-card-foreground mb-3 flex items-center gap-1.5">
                  <Laptop size={14} /> Thiết bị
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Tên</p>
                    <p className="text-card-foreground">{selectedSession.deviceUserInfo.deviceName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Loại</p>
                    <p className="text-card-foreground">{selectedSession.deviceUserInfo.deviceType || "--"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">MAC</p>
                    <p className="font-mono text-xs text-card-foreground">{selectedSession.deviceUserInfo.macAddress}</p>
                  </div>
                </div>
              </div>

              {/* Mạng */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs font-semibold text-card-foreground mb-3 flex items-center gap-1.5">
                  <Network size={14} /> Mạng
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">SSID</p>
                    <p className="text-card-foreground">{selectedSession.ssid}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">AP MAC</p>
                    <p className="font-mono text-xs text-card-foreground">{selectedSession.apMac}</p>
                  </div>
                </div>
              </div>

              {/* Lưu lượng */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs font-semibold text-card-foreground mb-3 flex items-center gap-1.5">
                  <Activity size={14} /> Lưu lượng
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-1 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900">
                    <Download size={16} className="mx-auto text-blue-500 mb-1" />
                    <p className="text-xs text-muted-foreground">Download</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {getTraffic(selectedSession, 'download')}
                    </p>
                  </div>
                  <div className="text-center p-1 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-100 dark:border-green-900">
                    <Upload size={16} className="mx-auto text-green-500 mb-1" />
                    <p className="text-xs text-muted-foreground">Upload</p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {getTraffic(selectedSession, 'upload')}
                    </p>
                  </div>
                  <div className="text-center p-1 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900">
                    <Activity size={16} className="mx-auto text-indigo-500 mb-1" />
                    <p className="text-xs text-muted-foreground">Tổng</p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">
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
