import apiClient, { initializeAxios } from "@/config/axios";
import {
  type ApiEnvelope,
  type UserSessionPageResponse,
  type UserSessionQueryParams,
} from "@/features/auth/types";

const SESSION_ENDPOINT = `/user-sessions`;

/**
 * Lấy danh sách phiên đăng nhập của user hiện tại, có phân trang + lọc.
 * Dùng cho cả màn hình Session (page=1, size=1) và History.
 */
export async function fetchUserSessions(
  params: UserSessionQueryParams = {}
): Promise<UserSessionPageResponse> {
  // Đảm bảo axios đã được cấu hình baseURL trước khi gọi API
  initializeAxios();

  const response = await apiClient.get<ApiEnvelope<UserSessionPageResponse>>(
    `${SESSION_ENDPOINT}/me`,
    { params }
  );
console.log("API Response:", response.data); // Log the entire response for debugging
  return response.data.data;
}
