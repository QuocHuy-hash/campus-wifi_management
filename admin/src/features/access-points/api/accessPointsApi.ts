import axios from 'axios';
import { AP, Controller } from '../types';
import { API_BASE_URL } from '@/config/api';

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
}

export const fetchAPs = async (): Promise<AP[]> => {
  const response = await axios.get<ApiResponse<AP[]>>(`${API_BASE_URL}/access-points`);
  return response.data.data;
};

export const fetchControllers = async (): Promise<Controller[]> => {
  const response = await axios.get<ApiResponse<Controller[]>>(`${API_BASE_URL}/wifi-controllers`);
  return response.data.data;
};
