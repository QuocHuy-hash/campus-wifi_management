"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Wifi,
  History,
  Clock,
  Download,
  Upload,
  Activity,
  Laptop,
  Smartphone,
  Monitor,
  User,
  Mail,
  Building,
  Shield,
  Gauge,
  HardDrive,
  Package,
  LogOut,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Globe,
  Facebook,
} from "lucide-react";
import { formatBytes, getTodayUsage } from "@/data/mockData";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import {
  getUserProfile,
  clearProfile,
  changePassword,
  clearChangePasswordStatus,
} from "@/features/user/slices/userProfileSlice";
import { getUserDevices } from "@/features/devices/slices/devicesSlice";
import type { UserPolicy, UserDevice, DeviceUserInfo } from "@/features/auth/types";
import { performLogout } from "@/lib/auth";
import { STORAGE_KEYS } from "@/constants/appKeys";

function getDeviceIcon(deviceType: string, size: number = 16) {
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

interface PolicyDetailShape {
  downloadLimit?: number;
  uploadLimit?: number;
  maxSessionTime?: number;
  maxSessionDuration?: number;
  maxConcurrentSessions?: number;
  authType?: string;
}

const getPolicyDetail = (policy: UserPolicy | null): PolicyDetailShape => {
  if (!policy) return {};
  const maybeDetail = (policy as UserPolicy & { detail?: PolicyDetailShape }).detail;
  return maybeDetail || {};
};

const getPolicyBandwidthText = (policy: UserPolicy | null): string => {
  if (!policy) return "Không giới hạn";
  const detail = getPolicyDetail(policy);
  const download = detail.downloadLimit ?? policy.bandwidth?.maxDownloadMbps;
  const upload = detail.uploadLimit ?? policy.bandwidth?.maxUploadMbps ?? 0;
  if (!download) return "Không giới hạn";
  return `${download} ↓ / ${upload} ↑ Mbps`;
};

const getPolicySessionHoursText = (policy: UserPolicy | null): string => {
  if (!policy) return "Không giới hạn";
  const detail = getPolicyDetail(policy);
  const sessionSeconds =
    detail.maxSessionTime ?? detail.maxSessionDuration ?? policy.session?.maxSessionDuration;
  if (!sessionSeconds) return "Không giới hạn";
  return `${Math.round(sessionSeconds / 3600)}h`;
};

const getPolicyDeviceLimitText = (policy: UserPolicy | null): string => {
  if (!policy) return "Không giới hạn";
  const detail = getPolicyDetail(policy);
  const maxDevices =
    detail.maxConcurrentSessions ?? policy.session?.maxConcurrentSessions;
  if (!maxDevices) return "Không giới hạn";
  return `${maxDevices} thiết bị`;
};

const getPolicyAuthType = (policy: UserPolicy | null): string | null => {
  if (!policy) return null;
  const detail = getPolicyDetail(policy);
  return detail.authType ?? policy.authorization?.authType ?? null;
};

const safeParsePortalUser = () => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("portalUser");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export default function Account() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { profile, loading, error, changePasswordLoading, changePasswordError, changePasswordSuccess } =
    useAppSelector((state) => state.userProfile);
  const { devices: userDevices, loading: devicesLoading } = useAppSelector((state) => state.devices);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  
  // FIX: Thêm state isMounted và fallbackUser để tránh hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  const [fallbackUser, setFallbackUser] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    setFallbackUser(safeParsePortalUser());
    dispatch(getUserProfile());
    dispatch(getUserDevices());
  }, [dispatch]);
  const user = profile || fallbackUser;

  const primaryRole =
    user?.roles?.[0] || user?.groups?.[0]?.roleName || "Unknown";
  const primaryPolicy =
    user?.policies?.find((p: UserPolicy) => p.isActive) || user?.policies?.[0] || null;
  const displayName =
    user?.fullName || user?.fullname || user?.username || "Guest";
  const displayRole = primaryRole !== "Unknown" ? primaryRole : user?.role || "Student";

  const todayUsage = getTodayUsage();

  const handleLogout = async () => {
    dispatch(clearProfile());
    await performLogout('/login');
  };

  // Tự động đóng modal khi đổi mật khẩu thành công
  useEffect(() => {
    if (changePasswordSuccess) {
      const timer = setTimeout(() => {
        setPasswordModalOpen(false);
        resetPasswordForm();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [changePasswordSuccess]);

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    dispatch(clearChangePasswordStatus());
  };

  const handleChangePassword = () => {
    setPasswordError("");
    if (!currentPassword) {
      setPasswordError("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    if (!newPassword) {
      setPasswordError("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Xác nhận mật khẩu không khớp");
      return;
    }
    dispatch(
      changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    );
  };

  return (
    <>
      <AppLayout
        activePage="account"
        headerRight={
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right">
              {/* FIX: Hiển thị placeholder khi chưa mount để tránh hydration mismatch */}
              <p className="text-sm font-medium text-gray-900">
                {isMounted ? displayName : '\u00A0'}
              </p>
              <p className="text-xs text-gray-500">
                {isMounted ? displayRole : '\u00A0'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-600"
            >
              <LogOut size={14} />
            </Button>
          </div>
        }
      >
        {loading && !user && (
          <Card className="p-8 text-center border border-gray-200">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-600">Đang tải thông tin tài khoản...</p>
            </div>
          </Card>
        )}

        {error && !user && (
          <Card className="mb-4 p-4 border border-red-200 bg-red-50">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Lỗi tải thông tin tài khoản</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 h-8 text-xs"
                  onClick={() => dispatch(getUserProfile())}
                >
                  Thử lại
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card className="mb-4 overflow-hidden border border-gray-200">
          <div className="bg-gray-900 text-white p-5">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  (user?.fullName || user?.username || "User").charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold">{user?.fullName || "Guest User"}</h2>
                <p className="text-sm text-gray-400">@{user?.username || "guest"}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                    {primaryRole}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      user?.status === "ACTIVE"
                        ? "bg-green-500/20 text-green-300"
                        : "bg-gray-500/20 text-gray-300"
                    }`}
                  >
                    {user?.status || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <User size={12} /> Thông tin cá nhân
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User size={16} className="text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-500">ID</p>
                    <p className="text-sm font-mono">#{user?.id || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail size={16} className="text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-500">Email</p>
                    <p className="text-sm truncate">
                      {user?.email || "N/A"}
                      {user?.emailVerified && (
                        <CheckCircle size={12} className="inline text-green-500 ml-1" />
                      )}
                    </p>
                  </div>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Shield size={16} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-500">Phone</p>
                      <p className="text-sm">{user.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Shield size={16} className="text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-500">Vai trò</p>
                    <p className="text-sm">{primaryRole}</p>
                  </div>
                </div>
                {user?.groups && user.groups.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg sm:col-span-2">
                    <Building size={16} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-500">Nhóm</p>
                      <p className="text-sm">
                        {user.groups.map((g: any) => g.name).join(", ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setPasswordModalOpen(true)}
              >
                <Key size={12} className="mr-1.5" />
                Đổi mật khẩu
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <Globe size={12} /> Tài khoản liên kết (OAuth)
              </p>
              <div className="space-y-2">
                {user?.linkedProviders && user.linkedProviders.length > 0 ? (
                  user.linkedProviders.map((provider: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
                    >
                      {provider.provider === "google" && (
                        <Mail size={18} className="text-red-500" />
                      )}
                      {provider.provider === "microsoft" && (
                        <Globe size={18} className="text-blue-500" />
                      )}
                      {provider.provider === "facebook" && (
                        <Facebook size={18} className="text-blue-600" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold capitalize">{provider.provider}</p>
                        <p className="text-sm text-gray-600 truncate">
                          {provider.providerEmail || "N/A"}
                        </p>
                        {provider.lastUsedAt && (
                          <p className="text-[10px] text-gray-400">
                            Sử dụng lần cuối:{" "}
                            {new Date(provider.lastUsedAt).toLocaleDateString("vi-VN")}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded-full ${
                          provider.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {provider.isActive ? "Đang hoạt động" : "Không hoạt động"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                    <p className="text-xs text-gray-500 italic mb-3">
                      Bạn chưa liên kết tài khoản mạng xã hội
                    </p>
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" size="sm" className="h-8 px-2">
                        <Mail size={14} className="text-red-500 mr-1" /> Google
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 px-2">
                        <Facebook size={14} className="text-blue-600 mr-1" /> Facebook
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="mb-4 p-4 border border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-3 flex items-center gap-1.5">
            <Gauge size={12} /> Chính sách: {primaryPolicy?.name || primaryRole}
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
              <Gauge size={18} className="mx-auto text-blue-500 mb-1" />
              <p className="text-[10px] text-gray-500">Băng thông</p>
              <p className="text-sm font-semibold text-blue-600">
                {getPolicyBandwidthText(primaryPolicy)}
              </p>
            </div>
            <div className="text-center p-3 bg-violet-50 rounded-lg border border-violet-100">
              <Clock size={18} className="mx-auto text-violet-500 mb-1" />
              <p className="text-[10px] text-gray-500">Phiên tối đa</p>
              <p className="text-sm font-semibold text-violet-600">
                {getPolicySessionHoursText(primaryPolicy)}
              </p>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <HardDrive size={18} className="mx-auto text-emerald-500 mb-1" />
              <p className="text-[10px] text-gray-500">Giới hạn phiên</p>
              <p className="text-sm font-semibold text-emerald-600">
                {getPolicyDeviceLimitText(primaryPolicy)}
              </p>
            </div>
          </div>
          {getPolicyAuthType(primaryPolicy) && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-[10px] text-gray-500 mb-1">Loại xác thực</p>
              <p className="text-sm font-medium">{getPolicyAuthType(primaryPolicy)}</p>
            </div>
          )}
        </Card>

        <Card className="mb-4 p-4 border border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-3 flex items-center gap-1.5">
            <Package size={12} /> Thống kê sử dụng
          </p>
          <div className="mb-4">
            <p className="text-[10px] text-gray-500 mb-2">Hôm nay</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-blue-50 rounded border border-blue-100 text-center">
                <Download size={14} className="mx-auto text-blue-500 mb-0.5" />
                <p className="text-xs font-semibold text-blue-600">
                  {formatBytes(todayUsage.download)}
                </p>
              </div>
              <div className="p-2 bg-green-50 rounded border border-green-100 text-center">
                <Upload size={14} className="mx-auto text-green-500 mb-0.5" />
                <p className="text-xs font-semibold text-green-600">
                  {formatBytes(todayUsage.upload)}
                </p>
              </div>
              <div className="p-2 bg-violet-50 rounded border border-violet-100 text-center">
                <Activity size={14} className="mx-auto text-violet-500 mb-0.5" />
                <p className="text-xs font-semibold text-violet-600">
                  {formatBytes(todayUsage.total)}
                </p>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <p className="text-[10px] text-gray-500 mb-2">Thông tin tài khoản</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-gray-600">
                <History size={14} className="text-gray-400" />
                Tạo: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "N/A"}
              </span>
              {user?.lastLoginAt && (
                <span className="flex items-center gap-1.5 text-blue-600">
                  <Clock size={14} />
                  Đăng nhập cuối:{" "}
                  {new Date(user.lastLoginAt).toLocaleDateString("vi-VN")}
                </span>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
              <Laptop size={12} /> Thiết bị đã duyệt
            </p>
            <span className="text-[10px] text-gray-500">
              {primaryPolicy
                ? `Tối đa: ${getPolicyDeviceLimitText(primaryPolicy)}`
                : "Không giới hạn thiết bị"}
            </span>
          </div>
          {devicesLoading ? (
            <div className="text-center py-6">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-500">Đang tải danh sách thiết bị...</p>
            </div>
          ) : userDevices.length === 0 ? (
            <div className="text-center py-6">
              <Wifi size={24} className="mx-auto text-gray-300 mb-2" />
              <p className="text-xs text-gray-500">Chưa có thiết bị nào được duyệt</p>
            </div>
          ) : (
            <div className="space-y-2">
              {userDevices.map((device: UserDevice) => (
                <div
                  key={device.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    {getDeviceIcon(device.deviceType, 16)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {device.deviceName}
                      </p>
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          device.isOnline ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        title={device.isOnline ? 'Đang online' : 'Offline'}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{device.deviceMacAddress}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {device.deviceType && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded">
                          {device.deviceType}
                        </span>
                      )}
                      {device.manufacturer && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded">
                          {device.manufacturer}
                        </span>
                      )}
                      {device.operatingSystem && (
                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded">
                          {device.operatingSystem}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
                        device.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : device.status === 'BLOCKED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {device.status === 'ACTIVE' ? 'Hoạt động' : device.status === 'BLOCKED' ? 'Khóa' : 'Không hoạt động'}
                    </span>
                    {device.lastIpAddress && (
                      <span className="text-[10px] text-gray-400">{device.lastIpAddress}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut size={12} className="mr-1.5" />
              Đăng xuất tất cả thiết bị
            </Button>
          </div>
        </Card>
      </AppLayout>

      <Dialog
        open={passwordModalOpen}
        onOpenChange={(open) => {
          setPasswordModalOpen(open);
          if (!open) resetPasswordForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key size={18} />
              Đổi mật khẩu
            </DialogTitle>
            <DialogDescription>
              Nhập mật khẩu hiện tại và mật khẩu mới
            </DialogDescription>
          </DialogHeader>

          {changePasswordSuccess ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-600" />
              </div>
              <p className="text-lg font-medium text-gray-900">Đổi mật khẩu thành công!</p>
              <p className="text-sm text-gray-500 mt-1">
                Mật khẩu của bạn đã được cập nhật
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {(passwordError || changePasswordError) && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600">
                  <AlertCircle size={16} />
                  <span className="text-sm">{changePasswordError || passwordError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="current-password" className="text-sm">
                  Mật khẩu hiện tại
                </Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu hiện tại"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pr-10 h-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-sm">
                  Mật khẩu mới
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10 h-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className="text-sm">
                  Xác nhận mật khẩu mới
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10 h-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <DialogFooter className="pt-4 gap-2">
                <Button variant="outline" onClick={() => setPasswordModalOpen(false)}>
                  Hủy
                </Button>
                <Button
                  onClick={handleChangePassword}
                  disabled={changePasswordLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {changePasswordLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang xử lý...
                    </div>
                  ) : (
                    "Đổi mật khẩu"
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
