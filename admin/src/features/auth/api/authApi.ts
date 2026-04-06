import axios from 'axios';
import { ADMIN_API_BASE_URL } from '@/config/api';

const ADMIN_AUTH_ENDPOINT = `${ADMIN_API_BASE_URL}/auth`;

// ─── Request Types ────────────────────────────────────────────────────────────

export interface AdminLoginRequest {
  identifier: string; // username
  password: string;
}

// ─── Response Types ───────────────────────────────────────────────────────────

export interface AdminLoginResponse {
  accessToken: string;
  refreshToken: null;
  roles: string[];
}

export interface AdminMeResponse {
  userId: number;
  userName: string;
  fullName: string;
  email: string;
  phone: string | null;
  roleId: number;
  departmentId: number;
  // menuTree omitted intentionally — will be implemented later
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * POST /api/admin/auth/login
 * Cookie set: admin_refresh_token (HttpOnly)
 */
export const adminLoginApi = async (data: AdminLoginRequest): Promise<AdminLoginResponse> => {
  const response = await axios.post<{ code: number; message: string; data: AdminLoginResponse }>(
    `${ADMIN_AUTH_ENDPOINT}/login`,
    data,
  );

  if (response.data.code && response.data.code !== 200) {
    throw new Error(response.data.message || 'Đăng nhập thất bại');
  }

  return response.data.data;
};

/**
 * POST /api/admin/auth/logout
 * Clears admin_refresh_token cookie server-side
 */
export const adminLogoutApi = async (): Promise<void> => {
  await axios.post(`${ADMIN_AUTH_ENDPOINT}/logout`, undefined, { withCredentials: true });
};

/**
 * POST /api/admin/auth/refresh-token
 * Reads admin_refresh_token cookie automatically (withCredentials is set globally)
 */
export const adminRefreshTokenApi = async (): Promise<AdminLoginResponse> => {
  const response = await axios.post<{ code: number; message: string; data: AdminLoginResponse }>(
    `${ADMIN_AUTH_ENDPOINT}/refresh-token`,
    undefined,
    { withCredentials: true }, // send admin_refresh_token cookie
  );

  return response.data.data;
};

/**
 * GET /api/admin/auth/me
 * Requires Authorization: Bearer {accessToken}
 */
export const getAdminMeApi = async (): Promise<AdminMeResponse> => {
  const response = await axios.get<{ code: number; message: string; data: AdminMeResponse }>(
    `${ADMIN_AUTH_ENDPOINT}/me`,
  );

  return response.data.data;
};
