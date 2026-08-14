import axios from "axios";
import apiClient from "@/config/axios";
import { API_BASE_URL } from "@/config/api";
import { API_HEADERS, HTTP_CONFIG } from "@/constants/appKeys";
import { getOrCreateAuthDeviceId } from "@/lib/deviceId";
import {
  type AuthorizeDevicePayload,
  type ApiEnvelope,
  type ForgotPasswordPayload,
  type InitSessionPayload,
  type InitSessionResult,
  type LoginCredentials,
  type LoginPayload,
  type LoginResult,
  type MeResponse,
  type ProviderConfig,
  type RegisterPayload,
  type RegisterResult,
  type ResetPasswordPayload,
  type ResendOtpPayload,
  type VerifyOtpPayload,
  type VerifyResetOtpPayload,
  type VerifyResetOtpResult,
  type VerifyOtpResult,
} from "@/features/auth/types";

// Các endpoint xác thực.
// const PROVIDERS_ENDPOINT = `/providers-config`;
const AUTH_ENDPOINT = `/auth`;
const OAUTH2_ENDPOINT = `/oauth2/authorize`;
const AUTHORIZE_DEVICE_ENDPOINT = `/users/authorize-device`;

// init-session và login sử dụng login token ngắn hạn, không dùng dynamic token
// hiện tại của ứng dụng. Tách riêng hai yêu cầu này khỏi interceptor xác thực chung.
const preAuthClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: HTTP_CONFIG.DEFAULT_TIMEOUT_MS,
  headers: HTTP_CONFIG.DEFAULT_HEADERS,
});

export async function fetchActiveProviders(): Promise<ProviderConfig[]> {
  // const response = await apiClient.get<ApiEnvelope<ProviderConfig[]>>(
  //   `${PROVIDERS_ENDPOINT}?isActive=true`,
  // );

  // return response.data.data || [];
  return  [];
}

export async function registerUser(payload: RegisterPayload): Promise<RegisterResult> {
  const response = await apiClient.post<ApiEnvelope<RegisterResult>>(
    `${AUTH_ENDPOINT}/register`,
    payload,
  );

  return response.data.data;
}

export async function verifyUserEmail(
  payload: VerifyOtpPayload,
): Promise<VerifyOtpResult> {
  const response = await apiClient.post<ApiEnvelope<VerifyOtpResult>>(
    `${AUTH_ENDPOINT}/verify-otp`,
    payload,
  );

  return response.data.data;
}

export async function resendOtp(payload: ResendOtpPayload): Promise<void> {
  await apiClient.post(`${AUTH_ENDPOINT}/resend-otp`, payload);
}

export async function initSession(
  payload: InitSessionPayload,
): Promise<InitSessionResult> {
  const response = await preAuthClient.post<ApiEnvelope<unknown>>(
    `${AUTH_ENDPOINT}/init-session`,
    // Gửi cả trường trong tài liệu và tên thay thế dạng snake_case của backend đang triển khai
    // cho tới khi hai contract được đồng bộ.
    { deviceId: payload.deviceId, device_id: payload.deviceId },
  );
  const result = response.data.data as {
    login_token?: string;
    expires_in?: number;
    token?: string;
    data?: {
      token?: string;
      expires_in?: number;
    };
  };
  const loginToken =
    result?.login_token ?? result?.token ?? result?.data?.token;
  const expiresIn = result?.expires_in ?? result?.data?.expires_in ?? 0;

  if (!loginToken) {
    throw new Error("API init-session không trả về login_token");
  }

  return {
    login_token: loginToken,
    expires_in: expiresIn,
  };
}

async function submitPasswordLogin(
  payload: LoginPayload,
  loginToken: string,
): Promise<LoginResult> {
  const response = await preAuthClient.post<ApiEnvelope<unknown>>(
    `${AUTH_ENDPOINT}/login`,
    payload,
    {
      headers: {
        [API_HEADERS.AUTHORIZATION]: `Bearer ${loginToken}`,
      },
    },
  );

  const data = response.data.data as unknown as {
    token?: string;
    accessToken?: string;
    access_token?: string;
    "access-token"?: string;
    role?: string;
    roles?: string[];
  };
  const accessToken =
    data.accessToken ?? data.access_token ?? data["access-token"] ?? data.token;

  if (!accessToken) {
    throw new Error("API login không trả về dynamic token");
  }

  return {
    accessToken,
    refreshToken: null,
    roles: Array.isArray(data.roles)
      ? data.roles
      : data.role
        ? [data.role]
        : [],
  };
}

export async function loginWithPassword(
  credentials: LoginCredentials,
): Promise<LoginResult> {
  const deviceId = getOrCreateAuthDeviceId();
  const { login_token: loginToken } = await initSession({ deviceId });

  return submitPasswordLogin(
    {
      ...credentials,
      deviceId,
      // Giữ tương thích với DTO snake_case của backend đang triển khai.
      device_id: deviceId,
    },
    loginToken,
  );
}

export async function getMeProfile(): Promise<MeResponse> {
  const response = await apiClient.get<ApiEnvelope<MeResponse>>(`${AUTH_ENDPOINT}/me`);
  return response.data.data;
}

export async function logoutUser(deviceMac?: string | null): Promise<void> {
  await apiClient.post(
    `${AUTH_ENDPOINT}/logout`,
    deviceMac ? { device_mac: deviceMac } : undefined,
  );
}

export async function authorizeDevice(payload: AuthorizeDevicePayload): Promise<void> {
  await apiClient.put(`${AUTHORIZE_DEVICE_ENDPOINT}`, payload);
}

export function startOAuth2Login(provider: string): void {
  window.location.href = `${API_BASE_URL}${OAUTH2_ENDPOINT}/${provider}`;
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
  await apiClient.post(`${AUTH_ENDPOINT}/forgot-password`, payload);
}

export async function verifyResetOtp(
  payload: VerifyResetOtpPayload,
): Promise<VerifyResetOtpResult> {
  const response = await apiClient.post<ApiEnvelope<VerifyResetOtpResult>>(
    `${AUTH_ENDPOINT}/verify-reset-otp`,
    payload,
  );

  return response.data.data;
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  await apiClient.post(`${AUTH_ENDPOINT}/reset-password`, payload);
}
