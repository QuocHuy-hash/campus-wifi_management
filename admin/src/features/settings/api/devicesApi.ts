import axios from 'axios';
import { Controller, AP } from '../types';
import { API_BASE_URL } from '@/config/api';

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
}

export const devicesApi = {
  // Controllers
  getControllers: async (): Promise<Controller[]> => {
    const response = await axios.get<ApiResponse<Controller[]>>(`${API_BASE_URL}/wifi-controllers`);
    console.log("Controllers API Response:", response.data);
    return response.data.data;
  },
  createController: async (data: Omit<Controller, 'id'>): Promise<Controller> => {
    const response = await axios.post<ApiResponse<Controller>>(`${API_BASE_URL}/wifi-controllers`, data);
    return response.data.data;
  },
  updateController: async (id: number, data: Omit<Controller, 'id'>): Promise<Controller> => {
    const response = await axios.put<ApiResponse<Controller>>(`${API_BASE_URL}/wifi-controllers/${id}`, data);
    return response.data.data;
  },
  deleteController: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/wifi-controllers/${id}`);
  },

  // Access Points
  getAPs: async (): Promise<AP[]> => {
    const response = await axios.get<ApiResponse<AP[]>>(`${API_BASE_URL}/access-points`);

    return response.data.data;
  },
  createAP: async (data: Omit<AP, 'id'>): Promise<AP> => {
    const response = await axios.post<ApiResponse<AP>>(`${API_BASE_URL}/access-points`, data);
    return response.data.data;
  },
  updateAP: async (id: number, data: Omit<AP, 'id'>): Promise<AP> => {
    const response = await axios.put<ApiResponse<AP>>(`${API_BASE_URL}/access-points/${id}`, data);
    return response.data.data;
  },
  deleteAP: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/access-points/${id}`);
  }
};
