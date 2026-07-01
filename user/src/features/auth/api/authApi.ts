import apiClient from "@/config/axios";
import { API_BASE_URL } from "@/config/api";
import {
  type AuthorizeDevicePayload,
  type ApiEnvelope,
  type ForgotPasswordPayload,
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

// Endpoints
// const PROVIDERS_ENDPOINT = `/providers-config`;
const AUTH_ENDPOINT = `/auth`;
const OAUTH2_ENDPOINT = `/oauth2/authorize`;
const AUTHORIZE_DEVICE_ENDPOINT = `/users/authorize-device`;

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

export async function loginWithPassword(payload: LoginPayload): Promise<LoginResult> {
  const response = await apiClient.post<ApiEnvelope<LoginResult>>(
    `${AUTH_ENDPOINT}/login`,
    {
      identifier: payload.identifier,
      password: payload.password,
    },
  );

  return response.data.data;
}

export async function getMeProfile(): Promise<MeResponse> {
  const response = await apiClient.get<ApiEnvelope<MeResponse>>(`${AUTH_ENDPOINT}/me`);
  return response.data.data;
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
