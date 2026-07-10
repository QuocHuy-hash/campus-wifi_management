import apiClient, { initializeAxios } from "@/config/axios";
import {
  type ApiEnvelope,
  type UserSessionPageResponse,
  type UserSessionQueryParams,
  type UserDailyUsage,
  type UserDailyUsageQueryParams,
} from "@/features/auth/types";

const SESSION_ENDPOINT = `/user-sessions`;

/**
 * Lấy danh sách phiên đăng nhập của user hiện tại, có phân trang + lọc.
 * Dùng cho cả màn hình Session (page=1, size=1) và History.
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
 * Lấy tổng dung lượng sử dụng của user hiện tại trong ngày.
 */
export async function fetchUserDailyUsage(
  params: UserDailyUsageQueryParams = {}
): Promise<UserDailyUsage> {
  initializeAxios();

  const response = await apiClient.get<ApiEnvelope<UserDailyUsage>>(
    `${SESSION_ENDPOINT}/me/usage`,
    { params }
  );
  return response.data.data;
}
