import apiClient from "@/config/axios";
import { API_BASE_URL } from "@/config/api";
import {
  type ApiEnvelope,
  type LoginPayload,
  type LoginResult,
  type ProviderConfig,
  type RegisterPayload,
  type RegisterResult,
  type ResendOtpPayload,
  type VerifyEmailPayload,
  type VerifyEmailResult,
} from "@/features/auth/types";

export async function fetchActiveProviders(): Promise<ProviderConfig[]> {
  const response = await apiClient.get<ApiEnvelope<ProviderConfig[]>>(
    "/api/v1/providers-config?isActive=true",
  );

  return response.data.data || [];
}

export async function registerUser(payload: RegisterPayload): Promise<RegisterResult> {
  const response = await apiClient.post<ApiEnvelope<RegisterResult>>(
    "/api/v1/auth/register",
    payload,
  );

  return response.data.data;
}

export async function verifyUserEmail(
  payload: VerifyEmailPayload,
): Promise<VerifyEmailResult> {
  const response = await apiClient.post<ApiEnvelope<VerifyEmailResult>>(
    "/api/v1/auth/verify-email",
    payload,
  );

  return response.data.data;
}

export async function resendOtp(payload: ResendOtpPayload): Promise<void> {
  await apiClient.post("/api/v1/auth/resend-otp", payload);
}

export async function loginWithPassword(payload: LoginPayload): Promise<LoginResult> {
  const response = await apiClient.post<ApiEnvelope<LoginResult>>(
    "/api/v1/auth/login",
    payload,
  );

  return response.data.data;
}

export function startOAuth2Login(provider: string): void {
  window.location.href = `${API_BASE_URL}/api/v1/oauth2/${provider}`;
}
