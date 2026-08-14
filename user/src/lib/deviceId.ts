import { STORAGE_KEYS } from "@/constants/appKeys";
import { getStoredCaptivePortalContext } from "@/lib/captivePortal";

function createDeviceId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Trả về mã thiết bị ổn định cho cặp request init-session/login.
 * Ưu tiên địa chỉ MAC từ captive portal vì đây là thiết bị sẽ được UniFi cấp
 * quyền sau khi đăng nhập. Nếu không có captive portal, UUID của trình duyệt
 * được lưu lại và tái sử dụng cho những lần đăng nhập tiếp theo.
 */
export function getOrCreateAuthDeviceId(): string {
  if (typeof window === "undefined") {
    throw new Error("Không thể khởi tạo deviceId ngoài trình duyệt");
  }

  const captiveDeviceId = getStoredCaptivePortalContext()?.id;
  if (captiveDeviceId) {
    localStorage.setItem(STORAGE_KEYS.currentDeviceMac, captiveDeviceId);
    return captiveDeviceId;
  }

  const currentDeviceMac = localStorage.getItem(STORAGE_KEYS.currentDeviceMac);
  if (currentDeviceMac) {
    return currentDeviceMac;
  }

  const storedDeviceId = localStorage.getItem(STORAGE_KEYS.authDeviceId);
  if (storedDeviceId) {
    return storedDeviceId;
  }

  const deviceId = createDeviceId();
  localStorage.setItem(STORAGE_KEYS.authDeviceId, deviceId);
  return deviceId;
}

export function getCurrentDeviceMac(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    getStoredCaptivePortalContext()?.id ??
    localStorage.getItem(STORAGE_KEYS.currentDeviceMac)
  );
}
