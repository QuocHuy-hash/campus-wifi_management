import apiClient from "@/config/axios";
import { API_BASE_URL } from "@/config/api";
import {
  type ApiEnvelope,
  type MeResponse,
} from "@/features/auth/types";

const AUTH_ENDPOINT = `/auth`;

export interface UserProfileData extends MeResponse {}

export async function fetchUserProfile(): Promise<UserProfileData> {
  const response = await apiClient.get<ApiEnvelope<UserProfileData>>(
    `${AUTH_ENDPOINT}/me`
  );
  return response.data.data;
}

export async function updateUserProfile(
  payload: Partial<Pick<UserProfileData, 'fullName' | 'phone' | 'avatarUrl'>>
): Promise<UserProfileData> {
  const response = await apiClient.put<ApiEnvelope<UserProfileData>>(
    `${AUTH_ENDPOINT}/me`,
    payload
  );
  return response.data.data;
}

export function clearUserProfile(): void {
  // Helper to clear cached user data if needed
  localStorage.removeItem('portalUser');
  localStorage.removeItem('portalLoggedIn');
}
