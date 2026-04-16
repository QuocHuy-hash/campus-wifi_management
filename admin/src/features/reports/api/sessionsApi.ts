import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { PageResponse } from '@/types/pagination';
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

const parseTrafficToBytes = (value?: string | null): number => {
  if (!value) return 0;
  const normalized = value.trim().replace(',', '.');
  const match = normalized.match(/^([\d.]+)\s*(B|KB|MB|GB|TB)$/i);
  if (!match) return 0;

  const amount = Number.parseFloat(match[1]);
  if (Number.isNaN(amount)) return 0;

  const unit = match[2].toUpperCase();
  const factors: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
    TB: 1024 * 1024 * 1024 * 1024,
  };
  return Math.round(amount * (factors[unit] ?? 1));
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
  if (normalized.includes('laptop') || normalized.includes('notebook')) return 'Laptop';
  if (normalized.includes('smartphone') || normalized.includes('phone') || normalized.includes('mobile')) return 'Smartphone';
  if (normalized.includes('tablet') || normalized.includes('ipad')) return 'Tablet';
  if (normalized.includes('monitor') || normalized.includes('desktop') || normalized.includes('pc')) return 'Monitor';
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
): UserSession => {
  const fallbackDownloadBytes = parseTrafficToBytes(dto.deviceUserInfo?.trafficIn);
  const fallbackUploadBytes = parseTrafficToBytes(dto.deviceUserInfo?.trafficOut);
  const downloadBytes = dto.downloadBytes > 0 ? dto.downloadBytes : fallbackDownloadBytes;
  const uploadBytes = dto.uploadBytes > 0 ? dto.uploadBytes : fallbackUploadBytes;

  return {
    sessionId: dto.sessionId,
    username: dto.deviceUserInfo?.userName ?? '',
    fullName: dto.deviceUserInfo?.userName ?? '',
    deviceType: mapDeviceType(dto.deviceUserInfo?.deviceType ?? ''),
    deviceName: dto.deviceUserInfo?.deviceName ?? '',
    mac: dto.deviceUserInfo?.macAddress ?? '',
    ip: dto.ipAddress ?? '',
    userId: dto.deviceUserInfo?.userId ?? dto.userId ?? 0,
    ssid: dto.ssid ?? '-',
    vlan: dto.vlan ?? '-',
    ap: dto.apMac ?? '-',
    site: '',
    campus: dto.campusId ? String(dto.campusId) : undefined,
    building: dto.buildingId ? String(dto.buildingId) : undefined,
    identity: dto.deviceUserInfo?.userGroup ?? '',
    startTime: dto.startTime,
    stopTime: dto.endTime ?? '-',
    duration: calculateDuration(dto.startTime, dto.endTime),
    download: formatBytes(downloadBytes),
    upload: formatBytes(uploadBytes),
    total: formatBytes(downloadBytes + uploadBytes),
    terminateCause: mapTerminateCause(dto.terminateCause),
    status: dto.status === 'ACTIVE' ? 'active' : 'completed',
    tags: [],
    trafficIn: dto.deviceUserInfo?.trafficIn,
    trafficOut: dto.deviceUserInfo?.trafficOut,
    isOnline: dto.deviceUserInfo?.isOnline ?? dto.status === 'ACTIVE',
    userAgent: dto.userAgent,
    createdAt: dto.createdAt,
  };
};

// ─── API Calls ────────────────────────────────────────────────────────────────

export const sessionsApi = {
  getAllSessions: async (): Promise<UserSession[]> => {
    const response = await axios.get<ApiResponse<PageResponse<UserSessionResponse> | UserSessionResponse[]>>(
      `${API_BASE_URL}/user-sessions`,
    );
    const pageData = response.data.data;
    // Support both raw array and paginated { records: [] } format from backend
    const items: UserSessionResponse[] = Array.isArray(pageData)
      ? pageData
      : (pageData.records ?? []);
    return items.map(mapSessionResponseToUserSession);
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
