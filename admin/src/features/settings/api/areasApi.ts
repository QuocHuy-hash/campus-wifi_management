import axios from 'axios';
import { Campus, Building, Location } from '../types';
import { API_BASE_URL } from '@/config/api';

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
}

export const areasApi = {
  // Campuses
  getCampuses: async (): Promise<Campus[]> => {
    const response = await axios.get<ApiResponse<Campus[]>>(`${API_BASE_URL}/campus`);
    return response.data.data;
  },
  createCampus: async (data: Omit<Campus, 'id'>): Promise<Campus> => {
    const response = await axios.post<ApiResponse<Campus>>(`${API_BASE_URL}/campus`, data);
    return response.data.data;
  },
  updateCampus: async (id: number, data: Omit<Campus, 'id'>): Promise<Campus> => {
    const response = await axios.put<ApiResponse<Campus>>(`${API_BASE_URL}/campus/${id}`, data);
    return response.data.data;
  },
  deleteCampus: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/campus/${id}`);
  },

  // Buildings
  getBuildings: async (): Promise<Building[]> => {
    const response = await axios.get<ApiResponse<Building[]>>(`${API_BASE_URL}/buildings`);
    return response.data.data;
  },
  createBuilding: async (data: Omit<Building, 'id'>): Promise<Building> => {
    const response = await axios.post<ApiResponse<Building>>(`${API_BASE_URL}/buildings`, data);
    return response.data.data;
  },
  updateBuilding: async (id: number, data: Omit<Building, 'id'>): Promise<Building> => {
    const response = await axios.put<ApiResponse<Building>>(`${API_BASE_URL}/buildings/${id}`, data);
    return response.data.data;
  },
  deleteBuilding: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/buildings/${id}`);
  },

  // Locations
  getLocations: async (): Promise<Location[]> => {
    const response = await axios.get<ApiResponse<Location[]>>(`${API_BASE_URL}/locations`);
    return response.data.data;
  },
  createLocation: async (data: Omit<Location, 'id'>): Promise<Location> => {
    const response = await axios.post<ApiResponse<Location>>(`${API_BASE_URL}/locations`, data);
    return response.data.data;
  },
  updateLocation: async (id: number, data: Omit<Location, 'id'>): Promise<Location> => {
    const response = await axios.put<ApiResponse<Location>>(`${API_BASE_URL}/locations/${id}`, data);
    return response.data.data;
  },
  deleteLocation: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/locations/${id}`);
  }
};
