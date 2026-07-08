import apiClient, { initializeAxios } from "@/config/axios";
import type { ApiEnvelope, UserDevice } from "@/features/auth/types";

const DEVICES_ENDPOINT = `/users/devices`;

export async function fetchUserDevices(): Promise<UserDevice[]> {
  initializeAxios();

  const response = await apiClient.get<ApiEnvelope<UserDevice[]>>(
    DEVICES_ENDPOINT
  );
  return response.data.data;
}
