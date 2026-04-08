import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import {
  UserSessionResponse,
  UserSession,
  RegisterDeviceRequest,
} from '../types';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// ─── Mapper: Backend DTO → UI Model ──────────────────────────────────────────

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
};

const calculateDuration = (startTime: string, endTime: string | null): string => {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : Date.now();
  const diffMs = end - start;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

const mapDeviceType = (
  raw: string,
): UserSession['deviceType'] => {
  const normalized = raw.toLowerCase();
  if (normalized === 'laptop') return 'Laptop';
  if (normalized === 'smartphone') return 'Smartphone';
  if (normalized === 'tablet') return 'Tablet';
  if (normalized === 'monitor') return 'Monitor';
  return 'Unknown';
};

const mapTerminateCause = (
  raw: string | null,
): UserSession['terminateCause'] => {
  if (!raw) return '-';
  const map: Record<string, UserSession['terminateCause']> = {
    USER_LOGOUT: 'user-request',
    IDLE_TIMEOUT: 'idle-timeout',
    HARD_TIMEOUT: 'hard-timeout',
    QUOTA_EXCEEDED: 'quota-exceeded',
    NORMAL: 'normal',
  };
  return map[raw.toUpperCase()] ?? '-';
};

export const mapSessionResponseToUserSession = (
  dto: UserSessionResponse,
): UserSession => ({
  sessionId: dto.sessionId,
  username: dto.deviceUserInfo?.userName ?? '',
  fullName: dto.deviceUserInfo?.userName ?? '',
  deviceType: mapDeviceType(dto.deviceUserInfo?.deviceType ?? ''),
  deviceName: dto.deviceUserInfo?.deviceName ?? '',
  mac: dto.deviceUserInfo?.macAddress ?? '',
  ip: dto.ipAddress,
  userId: dto.deviceUserInfo?.userId ?? 0,
  ssid: dto.ssid,
  vlan: dto.vlan,
  ap: dto.apMac,
  site: '',
  campus: dto.campusId ? String(dto.campusId) : undefined,
  building: dto.buildingId ? String(dto.buildingId) : undefined,
  identity: dto.deviceUserInfo?.userGroup ?? '',
  startTime: dto.startTime,
  stopTime: dto.endTime ?? '-',
  duration: calculateDuration(dto.startTime, dto.endTime),
  download: formatBytes(dto.downloadBytes),
  upload: formatBytes(dto.uploadBytes),
  total: formatBytes(dto.downloadBytes + dto.uploadBytes),
  terminateCause: mapTerminateCause(dto.terminateCause),
  status: dto.status === 'ACTIVE' ? 'active' : 'completed',
  tags: [],
});

// ─── API Calls ────────────────────────────────────────────────────────────────

export const sessionsApi = {
  getAllSessions: async (): Promise<UserSession[]> => {
    const response = await axios.get<ApiResponse<UserSessionResponse[]>>(
      `${API_BASE_URL}/user-sessions`,
    );
    return response.data.data.map(mapSessionResponseToUserSession);
  },

  registerDevice: async (
    userId: number,
    payload: RegisterDeviceRequest,
  ): Promise<void> => {
    await axios.put(
      `${API_BASE_URL}/users/${userId}/register-device`,
      payload,
    );
  },
};
