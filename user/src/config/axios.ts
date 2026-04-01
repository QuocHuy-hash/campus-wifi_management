import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import { HTTP_CONFIG, STORAGE_KEYS } from "@/constants/appKeys";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: HTTP_CONFIG.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
