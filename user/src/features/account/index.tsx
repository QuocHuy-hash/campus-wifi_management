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
import { formatBytes } from "@/data/mockData";
import { fetchUserDailyUsage } from "@/features/session/api/sessionApi";
import type { UserDailyUsage } from "@/features/auth/types";
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
import { validatePassword } from "@/lib/passwordValidation";
import PasswordStrengthChecklist from "@/components/PasswordStrengthChecklist";

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
  const [dailyUsage, setDailyUsage] = useState<UserDailyUsage | null>(null);

  useEffect(() => {
    setIsMounted(true);
    setFallbackUser(safeParsePortalUser());
    dispatch(getUserProfile());
    dispatch(getUserDevices());
    fetchUserDailyUsage()
      .then(setDailyUsage)
      .catch(() => setDailyUsage(null));
  }, [dispatch]);
  const user = profile || fallbackUser;

  const primaryRole =
    user?.roles?.[0] || user?.groups?.[0]?.roleName || "Unknown";
  const primaryPolicy =
    user?.policies?.find((p: UserPolicy) => p.isActive) || user?.policies?.[0] || null;
  const displayName =
    user?.fullName || user?.fullname || user?.username || "Guest";
  const displayRole = primaryRole !== "Unknown" ? primaryRole : user?.role || "Student";

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
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setPasswordError(passwordError);
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
              <p className="text-sm font-medium text-card-foreground">
                {isMounted ? displayName : '\u00A0'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isMounted ? displayRole : '\u00A0'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground"
            >
              <LogOut size={14} />
            </Button>
          </div>
        }
      >
        {loading && !user && (
          <Card className="p-8 text-center border-border">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Đang tải thông tin tài khoản...</p>
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

          <Card className="mb-4 overflow-hidden border-border">
          <div className="bg-card text-card-foreground p-5 border-b border-border">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-2xl font-bold text-card-foreground">
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
                <p className="text-sm text-muted-foreground">@{user?.username || "guest"}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                    {primaryRole}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      user?.status === "ACTIVE"
                        ? "bg-green-500/20 text-green-600 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
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
              <p className="text-xs font-medium text-card-foreground mb-2 flex items-center gap-1.5">
                <User size={12} /> Thông tin cá nhân
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <User size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">ID</p>
                    <p className="text-sm font-mono text-card-foreground">#{user?.id || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Mail size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Email</p>
                    <p className="text-sm truncate text-card-foreground">
                      {user?.email || "N/A"}
                      {user?.emailVerified && (
                        <CheckCircle size={12} className="inline text-green-500 ml-1" />
                      )}
                    </p>
                  </div>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Shield size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Phone</p>
                      <p className="text-sm text-card-foreground">{user.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Shield size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Vai trò</p>
                    <p className="text-sm text-card-foreground">{primaryRole}</p>
                  </div>
                </div>
                {user?.groups && user.groups.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg sm:col-span-2">
                    <Building size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Nhóm</p>
                      <p className="text-sm text-card-foreground">
                        {user.groups.map((g: any) => g.name).join(", ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
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

            <div className="pt-4 border-t border-border">
              <p className="text-xs font-medium text-card-foreground mb-2 flex items-center gap-1.5">
                <Globe size={12} /> Tài khoản liên kết (OAuth)
              </p>
              <div className="space-y-2">
                {user?.linkedProviders && user.linkedProviders.length > 0 ? (
                  user.linkedProviders.map((provider: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg"
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
                        <p className="text-xs font-semibold text-card-foreground capitalize">{provider.provider}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {provider.providerEmail || "N/A"}
                        </p>
                        {provider.lastUsedAt && (
                          <p className="text-[10px] text-muted-foreground">
                            Sử dụng lần cuối:{" "}
                            {new Date(provider.lastUsedAt).toLocaleDateString("vi-VN")}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded-full ${
                          provider.isActive
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {provider.isActive ? "Đang hoạt động" : "Không hoạt động"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-muted/50 rounded-lg border border-dashed border-border text-center">
                    <p className="text-xs text-muted-foreground italic mb-3">
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

        <Card className="mb-4 p-4 border-border">
          <p className="text-xs font-medium text-card-foreground mb-3 flex items-center gap-1.5">
            <Gauge size={12} /> Chính sách: {primaryPolicy?.name || primaryRole}
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900">
              <Gauge size={18} className="mx-auto text-blue-500 mb-1" />
              <p className="text-[10px] text-muted-foreground">Băng thông</p>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {getPolicyBandwidthText(primaryPolicy)}
              </p>
            </div>
            <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900">
              <Clock size={18} className="mx-auto text-indigo-500 mb-1" />
              <p className="text-[10px] text-muted-foreground">Phiên tối đa</p>
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {getPolicySessionHoursText(primaryPolicy)}
              </p>
            </div>
            <div className="text-center p-3 bg-teal-50 dark:bg-teal-950/30 rounded-lg border border-teal-100 dark:border-teal-900">
              <HardDrive size={18} className="mx-auto text-teal-500 mb-1" />
              <p className="text-[10px] text-muted-foreground">Giới hạn phiên</p>
              <p className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                {getPolicyDeviceLimitText(primaryPolicy)}
              </p>
            </div>
          </div>
          {getPolicyAuthType(primaryPolicy) && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-[10px] text-muted-foreground mb-1">Loại xác thực</p>
              <p className="text-sm font-medium text-card-foreground">{getPolicyAuthType(primaryPolicy)}</p>
            </div>
          )}
        </Card>

        <Card className="mb-4 p-4 border-border">
          <p className="text-xs font-medium text-card-foreground mb-3 flex items-center gap-1.5">
            <Package size={12} /> Thống kê sử dụng
          </p>
          <div className="mb-4">
            <p className="text-[10px] text-muted-foreground mb-2">Hôm nay</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-100 dark:border-blue-900 text-center">
                <Download size={14} className="mx-auto text-blue-500 mb-0.5" />
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {dailyUsage ? formatBytes(dailyUsage.totalDownloadBytes) : 'Đang tải...'}
                </p>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded border border-green-100 dark:border-green-900 text-center">
                <Upload size={14} className="mx-auto text-green-500 mb-0.5" />
                <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                  {dailyUsage ? formatBytes(dailyUsage.totalUploadBytes) : 'Đang tải...'}
                </p>
              </div>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded border border-indigo-100 dark:border-indigo-900 text-center">
                <Activity size={14} className="mx-auto text-indigo-500 mb-0.5" />
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {dailyUsage ? formatBytes(dailyUsage.totalBytes) : 'Đang tải...'}
                </p>
              </div>
            </div>
          </div>
          {/* <div className="pt-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground mb-2">Thông tin tài khoản</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <History size={14} className="text-muted-foreground" />
                Tạo: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "N/A"}
              </span>
              {user?.lastLoginAt && (
                <span className="flex items-center gap-1.5 text-primary">
                  <Clock size={14} />
                  Đăng nhập cuối:{" "}
                  {new Date(user.lastLoginAt).toLocaleDateString("vi-VN")}
                </span>
              )}
            </div>
          </div> */}
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-card-foreground flex items-center gap-1.5">
              <Laptop size={12} /> Thiết bị đã duyệt
            </p>
            <span className="text-[10px] text-muted-foreground">
              {primaryPolicy
                ? `Tối đa: ${getPolicyDeviceLimitText(primaryPolicy)}`
                : "Không giới hạn thiết bị"}
            </span>
          </div>
          {devicesLoading ? (
            <div className="text-center py-6">
              <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Đang tải danh sách thiết bị...</p>
            </div>
          ) : userDevices.length === 0 ? (
            <div className="text-center py-6">
              <Wifi size={24} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Chưa có thiết bị nào được duyệt</p>
            </div>
          ) : (
            <div className="space-y-2">
              {userDevices.map((device: UserDevice) => (
                <div
                  key={device.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border"
                >
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    {getDeviceIcon(device.deviceType, 16)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {device.deviceName}
                      </p>
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          device.isOnline ? 'bg-green-500' : 'bg-muted-foreground'
                        }`}
                        title={device.isOnline ? 'Đang online' : 'Offline'}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{device.deviceMacAddress}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {device.deviceType && (
                        <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] rounded">
                          {device.deviceType}
                        </span>
                      )}
                      {device.manufacturer && (
                        <span className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[10px] rounded">
                          {device.manufacturer}
                        </span>
                      )}
                      {device.operatingSystem && (
                        <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[10px] rounded">
                          {device.operatingSystem}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
                        device.status === 'ACTIVE'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : device.status === 'BLOCKED'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {device.status === 'ACTIVE' ? 'Hoạt động' : device.status === 'BLOCKED' ? 'Khóa' : 'Không hoạt động'}
                    </span>
                    {device.lastIpAddress && (
                      <span className="text-[10px] text-muted-foreground">{device.lastIpAddress}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
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
          </DialogHeader>

          {changePasswordSuccess ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-teal-600" />
              </div>
              <p className="text-lg font-medium text-card-foreground">Đổi mật khẩu thành công!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Mật khẩu của bạn đã được cập nhật
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {(passwordError || changePasswordError) && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-lg flex items-center gap-2 text-red-600">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <PasswordStrengthChecklist password={newPassword} />

              <DialogFooter className="pt-4 gap-2">
                <Button variant="outline" onClick={() => setPasswordModalOpen(false)}>
                  Hủy
                </Button>
                <Button
                  onClick={handleChangePassword}
                  disabled={changePasswordLoading}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary/90"
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
