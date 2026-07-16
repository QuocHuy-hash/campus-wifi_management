import apiClient from "@/config/axios";
import { API_BASE_URL } from "@/config/api";
import {
  type ApiEnvelope,
  type ChangePasswordPayload,
  type MeResponse,
} from "@/features/auth/types";

const AUTH_ENDPOINT = `/auth`;

export interface UserProfileData extends MeResponse {}

export type UpdateUserProfilePayload = Pick<UserProfileData, "fullName" | "phone">;

export async function fetchUserProfile(): Promise<UserProfileData> {
  const response = await apiClient.get<ApiEnvelope<UserProfileData>>(
    `${AUTH_ENDPOINT}/me`
  );
  return response.data.data;
}

export async function updateUserProfile(
  payload: UpdateUserProfilePayload
): Promise<UserProfileData> {
  const response = await apiClient.put<ApiEnvelope<UserProfileData>>(
    `${AUTH_ENDPOINT}/me`,
    payload
  );
  return response.data.data;
}

export function clearUserProfile(): void {
  localStorage.removeItem('portalUser');
  localStorage.removeItem('portalLoggedIn');
}

export async function changeUserPassword(payload: ChangePasswordPayload): Promise<void> {
  await apiClient.post(`${AUTH_ENDPOINT}/change-password`, payload);
}
