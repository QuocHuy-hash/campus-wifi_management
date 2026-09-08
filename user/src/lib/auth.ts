/**
 * Các hàm hỗ trợ xác thực.
 */

import { AUTH_COOKIE_KEY } from "@/constants/appKeys";
import { setAxiosAuthToken } from "@/config/axios";
import { logoutUser } from "@/features/auth/api/authApi";
import { getCurrentDeviceMac } from "@/lib/deviceId";
import {
  clearSessionCookie,
  clearStoredAuthSession,
} from "@/lib/session";
import { logger } from "./logger";
// Dọn cookie do các bản cũ tạo ra trước khi access_token được chuyển sang HttpOnly.
function clearLegacyAuthCookie(): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${AUTH_COOKIE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
}

/**
 * Logout hoàn toàn: xóa localStorage + cookie + redirect
 */
export async function performLogout(redirectTo: string = '/login'): Promise<void> {
  try {
    // Thu hồi, đưa dynamic token vào blacklist và hủy cấp quyền thiết bị ở backend trước.
    await logoutUser(getCurrentDeviceMac());
  } catch (error) {
    // Vẫn phải hoàn tất đăng xuất cục bộ nếu backend tạm thời không phản hồi.
    logger.error('Backend logout failed:', error);
  }

  try {
    await clearSessionCookie();
  } catch (error) {
    logger.error('Session cookie cleanup failed:', error);
    // Chỉ có tác dụng với cookie legacy không phải HttpOnly.
    clearLegacyAuthCookie();
  }

  clearStoredAuthSession();
  setAxiosAuthToken(null);

  window.location.href = redirectTo;
}
