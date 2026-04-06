import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { AuthPolicy, WifiPolicy } from '@/data/mockData';

interface ApiResponse<T> {
  statusCode?: number;
  code?: number;
  data: T;
  message: string;
}

const unwrapData = <T>(payload: ApiResponse<T> | T): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
    return (payload as ApiResponse<T>).data;
  }

  return payload as T;
};

const toUiPolicyType = (type?: string): WifiPolicy['type'] => {
  const value = (type || 'bandwidth').toLowerCase();

  switch (value) {
    case 'bandwidth':
    case 'auth':
    case 'session':
    case 'audit':
    case 'security':
    case 'authorization':
      return value;
    default:
      return 'bandwidth';
  }
};

const toApiPolicyType = (type?: WifiPolicy['type']): string => {
  return (type || 'bandwidth').toUpperCase();
};

const ROLE_TO_UI_MAP: Record<string, string> = {
  user: 'Sinh viên',
  student: 'Sinh viên',
  staff: 'Cán bộ',
  teacher: 'Cán bộ',
  admin: 'Cán bộ',
  guest: 'Khách',
};

const ROLE_TO_API_MAP: Record<string, string> = {
  'Sinh viên': 'user',
  'Cán bộ': 'employee',
  'Khách': 'guest',
};

const normalizeRole = (role: string): string => {
  const key = role.trim().toLowerCase();
  return ROLE_TO_UI_MAP[key] || role;
};

const denormalizeRole = (role: string): string => {
  return ROLE_TO_API_MAP[role] || role;
};

const normalizeUnit = (value: string | undefined, fallback: string): string => {
  const normalized = (value || fallback).toLowerCase();

  if (normalized === 'minutes') return 'minute';
  if (normalized === 'hours') return 'hour';
  if (normalized === 'seconds') return 'second';
  if (normalized === 'days') return 'day';
  if (normalized === 'months') return 'month';
  if (normalized === 'years') return 'year';

  return normalized;
};

const denormalizeUnit = (value: string | undefined): string | undefined => {
  if (!value) return value;

  if (value === 'minute') return 'minutes';
  if (value === 'hour') return 'hours';
  if (value === 'second') return 'seconds';
  if (value === 'day') return 'days';
  if (value === 'month') return 'months';
  if (value === 'year') return 'years';

  return value;
};

const normalizeWifiPolicy = (policy: WifiPolicy): WifiPolicy => {
  const { detail: nestedDetail, ...policyWithoutDetail } = (policy as WifiPolicy & { detail?: Partial<WifiPolicy> });
  const detail = nestedDetail && typeof nestedDetail === 'object' ? nestedDetail : {};

  return {
    ...policyWithoutDetail,
    ...(detail as Partial<WifiPolicy>),
    type: toUiPolicyType((policyWithoutDetail as unknown as { type?: string }).type),
    applyToRoles: Array.isArray(policyWithoutDetail.applyToRoles)
      ? policyWithoutDetail.applyToRoles.map(normalizeRole)
      : [],
    auditMaxSessionTimeUnit: normalizeUnit(
      (detail as Partial<WifiPolicy>).auditMaxSessionTimeUnit ?? policyWithoutDetail.auditMaxSessionTimeUnit,
      'hour'
    ) as 'minute' | 'hour',
    accountingIntervalUnit: normalizeUnit(
      (detail as Partial<WifiPolicy>).accountingIntervalUnit ?? policyWithoutDetail.accountingIntervalUnit,
      'second'
    ) as 'second' | 'minute',
    logRetentionUnit: normalizeUnit(
      (detail as Partial<WifiPolicy>).logRetentionUnit ?? policyWithoutDetail.logRetentionUnit,
      'month'
    ) as 'month' | 'year',
    macCacheTimeUnit: normalizeUnit(
      (detail as Partial<WifiPolicy>).macCacheTimeUnit ?? policyWithoutDetail.macCacheTimeUnit,
      'hour'
    ) as 'hour' | 'day',
    reAuthIntervalUnit: normalizeUnit(
      (detail as Partial<WifiPolicy>).reAuthIntervalUnit ?? policyWithoutDetail.reAuthIntervalUnit,
      'day'
    ) as 'hour' | 'day',
    auditMaxDataUsageUnit: (
      (detail as Partial<WifiPolicy>).auditMaxDataUsageUnit || policyWithoutDetail.auditMaxDataUsageUnit || 'MB'
    ).toUpperCase() as 'MB' | 'GB',
  };
};

const serializeWifiPolicy = (policy: Omit<WifiPolicy, 'id'>): Record<string, unknown> => {
  const detail: Record<string, unknown> = {};

  if (typeof policy.downloadLimit === 'number') detail.downloadLimit = policy.downloadLimit;
  if (typeof policy.uploadLimit === 'number') detail.uploadLimit = policy.uploadLimit;
  if (typeof policy.maxSessionTime === 'number') detail.maxSessionTime = policy.maxSessionTime;
  if (typeof policy.maxSessionData === 'number') detail.maxSessionData = policy.maxSessionData;
  if (typeof policy.vlanId === 'number') detail.vlanId = policy.vlanId;
  if (typeof policy.maxDailyData === 'number') detail.maxDailyData = policy.maxDailyData;
  if (typeof policy.idleTimeout === 'number') detail.idleTimeout = policy.idleTimeout;
  if (typeof policy.autoReLogin === 'boolean') detail.autoReLogin = policy.autoReLogin;
  if (typeof policy.bindMacAddress === 'boolean') detail.bindMacAddress = policy.bindMacAddress;
  if (typeof policy.isActive === 'boolean') detail.isActive = policy.isActive;

  if (typeof policy.auditMaxSessionTime === 'number') detail.auditMaxSessionTime = policy.auditMaxSessionTime;
  if (policy.auditMaxSessionTimeUnit) detail.auditMaxSessionTimeUnit = denormalizeUnit(policy.auditMaxSessionTimeUnit);
  if (typeof policy.auditMaxDataUsage === 'number') detail.auditMaxDataUsage = policy.auditMaxDataUsage;
  if (policy.auditMaxDataUsageUnit) detail.auditMaxDataUsageUnit = policy.auditMaxDataUsageUnit;
  if (typeof policy.accountingInterval === 'number') detail.accountingInterval = policy.accountingInterval;
  if (policy.accountingIntervalUnit) detail.accountingIntervalUnit = denormalizeUnit(policy.accountingIntervalUnit);
  if (typeof policy.logRetentionPeriod === 'number') detail.logRetentionPeriod = policy.logRetentionPeriod;
  if (policy.logRetentionUnit) detail.logRetentionUnit = denormalizeUnit(policy.logRetentionUnit);
  if (policy.disconnectAction) detail.disconnectAction = policy.disconnectAction;

  if (typeof policy.maxConcurrentDevices === 'number') detail.maxConcurrentDevices = policy.maxConcurrentDevices;
  if (typeof policy.macCachingEnabled === 'boolean') detail.macCachingEnabled = policy.macCachingEnabled;
  if (typeof policy.macCacheTime === 'number') detail.macCacheTime = policy.macCacheTime;
  if (policy.macCacheTimeUnit) detail.macCacheTimeUnit = denormalizeUnit(policy.macCacheTimeUnit);
  if (typeof policy.reAuthInterval === 'number') detail.reAuthInterval = policy.reAuthInterval;
  if (policy.reAuthIntervalUnit) detail.reAuthIntervalUnit = denormalizeUnit(policy.reAuthIntervalUnit);
  if (typeof policy.allowUserMacManagement === 'boolean') detail.allowUserMacManagement = policy.allowUserMacManagement;
  if (typeof policy.retryLimit === 'number') detail.retryLimit = policy.retryLimit;

  return {
    type: toApiPolicyType(policy.type),
    name: policy.name,
    description: policy.description,
    isActive: policy.isActive,
    applyToRoles: (policy.applyToRoles ?? []).map(denormalizeRole),
    applyToArea: policy.applyToArea,
    applyByTime: policy.applyByTime,
    detail,
    auditMaxSessionTimeUnit: denormalizeUnit(policy.auditMaxSessionTimeUnit),
    accountingIntervalUnit: denormalizeUnit(policy.accountingIntervalUnit),
    logRetentionUnit: denormalizeUnit(policy.logRetentionUnit),
    macCacheTimeUnit: denormalizeUnit(policy.macCacheTimeUnit),
    reAuthIntervalUnit: denormalizeUnit(policy.reAuthIntervalUnit),
  };
};

const normalizeAuthPolicy = (policy: AuthPolicy): AuthPolicy => {
  return {
    ...policy,
    authMethod: (policy.authMethod || 'local_db').toLowerCase() as AuthPolicy['authMethod'],
    userType: (policy.userType || 'student').toLowerCase() as AuthPolicy['userType'],
    appliedAreas: Array.isArray(policy.appliedAreas) ? policy.appliedAreas : [],
  };
};

export const policiesApi = {
  getWifiPolicies: async (type?: 'bandwidth' | 'audit'): Promise<WifiPolicy[]> => {
    const response = await axios.get<ApiResponse<WifiPolicy[]> | WifiPolicy[]>(`${API_BASE_URL}/wifi-policies`, {
      params: type ? { type } : undefined,
    });
    return unwrapData<WifiPolicy[]>(response.data).map(normalizeWifiPolicy);
  },

  createWifiPolicy: async (data: Omit<WifiPolicy, 'id'>): Promise<WifiPolicy> => {
    const response = await axios.post<ApiResponse<WifiPolicy> | WifiPolicy>(
      `${API_BASE_URL}/wifi-policies`,
      serializeWifiPolicy(data)
    );
    return normalizeWifiPolicy(unwrapData<WifiPolicy>(response.data));
  },

  updateWifiPolicy: async (id: number, data: Omit<WifiPolicy, 'id'>): Promise<WifiPolicy> => {
    const response = await axios.put<ApiResponse<WifiPolicy> | WifiPolicy>(
      `${API_BASE_URL}/wifi-policies/${id}`,
      serializeWifiPolicy(data)
    );
    return normalizeWifiPolicy(unwrapData<WifiPolicy>(response.data));
  },

  deleteWifiPolicy: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/wifi-policies/${id}`);
  },

  getAuthPolicies: async (): Promise<AuthPolicy[]> => {
    const response = await axios.get<ApiResponse<AuthPolicy[]> | AuthPolicy[]>(`${API_BASE_URL}/auth-policies`);
    return unwrapData<AuthPolicy[]>(response.data).map(normalizeAuthPolicy);
  },

  createAuthPolicy: async (data: Omit<AuthPolicy, 'id'>): Promise<AuthPolicy> => {
    const response = await axios.post<ApiResponse<AuthPolicy> | AuthPolicy>(`${API_BASE_URL}/auth-policies`, data);
    return normalizeAuthPolicy(unwrapData<AuthPolicy>(response.data));
  },

  updateAuthPolicy: async (id: number, data: Omit<AuthPolicy, 'id'>): Promise<AuthPolicy> => {
    const response = await axios.put<ApiResponse<AuthPolicy> | AuthPolicy>(`${API_BASE_URL}/auth-policies/${id}`, data);
    return normalizeAuthPolicy(unwrapData<AuthPolicy>(response.data));
  },

  deleteAuthPolicy: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/auth-policies/${id}`);
  },
};
