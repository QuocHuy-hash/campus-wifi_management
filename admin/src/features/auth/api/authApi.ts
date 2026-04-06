import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

const AUTH_ENDPOINT = `${API_BASE_URL}/auth`;

export interface LoginRequest {
  identifier: string;
  password?: string;
}

export interface LoginResponse {
  code: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string | null;
    roles: string[];
  };
}

export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(`${AUTH_ENDPOINT}/login`, data);
  if (response.data.code && response.data.code !== 200) {
    throw new Error(response.data.message || 'Đăng nhập thất bại');
  }
  return response.data;
};

export const logoutApi = async (): Promise<void> => {
  await axios.post(`${AUTH_ENDPOINT}/logout`);
};
