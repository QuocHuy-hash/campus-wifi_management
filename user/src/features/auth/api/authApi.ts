import apiClient from "@/config/axios";
import { API_BASE_URL } from "@/config/api";
import {
  type AuthorizeDevicePayload,
  type ApiEnvelope,
  type LoginPayload,
  type LoginResult,
  type MeResponse,
  type ProviderConfig,
  type RegisterPayload,
  type RegisterResult,
  type ResendOtpPayload,
  type VerifyOtpPayload,
  type VerifyOtpResult,
} from "@/features/auth/types";

// Endpoints
const PROVIDERS_ENDPOINT = `/providers-config`;
const AUTH_ENDPOINT = `/auth`;
const OAUTH2_ENDPOINT = `/oauth2`;
const AUTHORIZE_DEVICE_ENDPOINT = `/authorize-device`;

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
  // Keep both `identifier` and `email` for backward compatibility while backend migrates.
  const response = await apiClient.post<ApiEnvelope<LoginResult>>(
    `${AUTH_ENDPOINT}/login`,
    {
      identifier: payload.identifier,
      email: payload.identifier,
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
  await apiClient.post(`${AUTHORIZE_DEVICE_ENDPOINT}`, payload);
}

export function startOAuth2Login(provider: string): void {
  window.location.href = `${API_BASE_URL}${OAUTH2_ENDPOINT}/${provider}`;
}
