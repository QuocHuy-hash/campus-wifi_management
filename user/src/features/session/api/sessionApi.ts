import apiClient, { initializeAxios } from "@/config/axios";
import {
  type ApiEnvelope,
  type UserSession,
  type UserSessionPageResponse,
  type UserSessionQueryParams,
  type UserDailyUsage,
  type UserDailyUsageQueryParams,
} from "@/features/auth/types";

const SESSION_ENDPOINT = `/user-sessions`;

/**
 * Lấy danh sách phiên đăng nhập của user hiện tại, có phân trang + lọc.
 * Dùng cho màn hình History.
 */
export async function fetchUserSessions(
  params: UserSessionQueryParams = {}
): Promise<UserSessionPageResponse> {
  initializeAxios();

  const response = await apiClient.get<ApiEnvelope<UserSessionPageResponse>>(
    `${SESSION_ENDPOINT}/me`,
    { params }
  );
  return response.data.data;
}

/**
 * Lấy phiên ACTIVE hiện tại của user.
 * Hỗ trợ cả data là object đơn hoặc mảng (do backend có thể trả về mảng).
 * Nếu không có phiên active, trả về null (không throw error).
 * Dùng cho màn hình Session.
 */
export async function fetchCurrentSession(
  xForwardedFor?: string
): Promise<UserSession | null> {
  initializeAxios();

  const headers: Record<string, string> = {};
  if (xForwardedFor) {
    headers['X-Forwarded-For'] = xForwardedFor;
  }

  try {
    const response = await apiClient.get<
      ApiEnvelope<UserSession | UserSession[]>
    >(`${SESSION_ENDPOINT}/me/current`, { headers });
    const data = response.data.data;
    if (Array.isArray(data)) {
      return data.length > 0 ? data[0] : null;
    }
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Lấy tất cả phiên ACTIVE của user (dạng mảng).
 * Dùng cho màn hình Session hiển thị multi-session.
 */
export async function fetchActiveSessions(): Promise<UserSession[]> {
  initializeAxios();

  try {
    const response = await apiClient.get<
      ApiEnvelope<UserSession | UserSession[]>
    >(`${SESSION_ENDPOINT}/me/current`);
    const data = response.data.data;
    if (Array.isArray(data)) {
      return data;
    }
    return data ? [data] : [];
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

/**
 * Đăng xuất một phiên cụ thể theo sessionId.
 */
export async function logoutSession(sessionId: string): Promise<void> {
  initializeAxios();
  await apiClient.post(`${SESSION_ENDPOINT}/me/logout`, { sessionId });
}

/**
 * Đăng xuất tất cả phiên đang hoạt động.
 */
export async function logoutAllSessions(): Promise<void> {
  initializeAxios();
  await apiClient.post(`${SESSION_ENDPOINT}/me/logout-all`);
}

/**
 * Lấy tổng dung lượng sử dụng của user hiện tại trong ngày.
 * Nếu backend chưa có endpoint này (404), trả về null thay vì throw để
 * UI vẫn hiển thị được danh sách phiên đang hoạt động.
 */
export async function fetchUserDailyUsage(
  params: UserDailyUsageQueryParams = {}
): Promise<UserDailyUsage | null> {
  initializeAxios();

  try {
    const response = await apiClient.get<ApiEnvelope<UserDailyUsage>>(
      `${SESSION_ENDPOINT}/me/usage`,
      { params }
    );
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}
