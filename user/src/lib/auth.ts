/**
 * Auth helper functions
 */

import { AUTH_COOKIE_KEY } from "@/constants/appKeys";

/**
 * Xóa cookie access_token từ client-side
 * Sử dụng khi cần force logout hoặc clear session
 */
export function clearAuthCookie(): void {
  if (typeof document === 'undefined') return;
  
  // CRITICAL: Must match the cookie key used throughout the app
  // Xóa cookie bằng cách set expired
  document.cookie = `${AUTH_COOKIE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
  console.log('🗑️ Auth cookie cleared');
}

/**
 * Kiểm tra xem có cookie access_token hay không
 */
export function hasAuthCookie(): boolean {
  if (typeof document === 'undefined') return false;
  
  const cookies = document.cookie.split(';');
  return cookies.some(cookie => {
    const [name] = cookie.trim().split('=');
    return name === AUTH_COOKIE_KEY;
  });
}

/**
 * Logout hoàn toàn: xóa localStorage + cookie + redirect
 */
export async function performLogout(redirectTo: string = '/login'): Promise<void> {
  try {
    // Gọi API logout để xóa httpOnly cookie
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout API failed:', error);
  }
  
  // Xóa localStorage
  localStorage.removeItem('portalLoggedIn');
  localStorage.removeItem('portalUser');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('AUTH_TOKEN');
  localStorage.removeItem('refreshToken');
  
  // Xóa cookie từ client-side (backup)
  clearAuthCookie();
  
  console.log('✅ Logout complete');
  
  // Redirect
  window.location.href = redirectTo;
}
