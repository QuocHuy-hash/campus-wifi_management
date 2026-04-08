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
    ) as 'minute' | 'hour' | 'day',
    accountingIntervalUnit: normalizeUnit(
      (detail as Partial<WifiPolicy>).accountingIntervalUnit ?? policyWithoutDetail.accountingIntervalUnit,
      'second'
    ) as 'second' | 'minute',
    logRetentionUnit: normalizeUnit(
      (detail as Partial<WifiPolicy>).logRetentionUnit ?? policyWithoutDetail.logRetentionUnit,
      'month'
    ) as 'day' | 'month' | 'year',
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
  const result: Record<string, unknown> = {
    name: policy.name,
    description: policy.description,
    isActive: policy.isActive,
    applyToRoles: (policy.applyToRoles ?? []).map(denormalizeRole),
    applyToArea: policy.applyToArea,
    applyByTime: policy.applyByTime,
  };

  if (typeof policy.downloadLimit === 'number') result.downloadLimit = policy.downloadLimit;
  if (typeof policy.uploadLimit === 'number') result.uploadLimit = policy.uploadLimit;
  if (typeof policy.maxSessionTime === 'number') result.maxSessionTime = policy.maxSessionTime;
  if (typeof policy.maxSessionData === 'number') result.maxSessionData = policy.maxSessionData;
  if (typeof policy.vlanId === 'number') result.vlanId = policy.vlanId;
  if (typeof policy.maxDailyData === 'number') result.maxDailyData = policy.maxDailyData;
  if (typeof policy.idleTimeout === 'number') result.idleTimeout = policy.idleTimeout;
  if (typeof policy.autoReLogin === 'boolean') result.autoReLogin = policy.autoReLogin;
  if (typeof policy.bindMacAddress === 'boolean') result.bindMacAddress = policy.bindMacAddress;

  if (typeof policy.auditMaxSessionTime === 'number') result.auditMaxSessionTime = policy.auditMaxSessionTime;
  if (policy.auditMaxSessionTimeUnit) result.auditMaxSessionTimeUnit = denormalizeUnit(policy.auditMaxSessionTimeUnit);
  if (typeof policy.auditMaxDataUsage === 'number') result.auditMaxDataUsage = policy.auditMaxDataUsage;
  if (policy.auditMaxDataUsageUnit) result.auditMaxDataUsageUnit = policy.auditMaxDataUsageUnit;
  if (typeof policy.accountingInterval === 'number') result.accountingInterval = policy.accountingInterval;
  if (policy.accountingIntervalUnit) result.accountingIntervalUnit = denormalizeUnit(policy.accountingIntervalUnit);
  if (typeof policy.logRetentionPeriod === 'number') result.logRetentionPeriod = policy.logRetentionPeriod;
  if (policy.logRetentionUnit) result.logRetentionUnit = denormalizeUnit(policy.logRetentionUnit);
  if (policy.disconnectAction) result.disconnectAction = policy.disconnectAction;

  if (typeof policy.maxConcurrentDevices === 'number') result.maxConcurrentDevices = policy.maxConcurrentDevices;
  if (typeof policy.macCachingEnabled === 'boolean') result.macCachingEnabled = policy.macCachingEnabled;
  if (typeof policy.macCacheTime === 'number') result.macCacheTime = policy.macCacheTime;
  if (policy.macCacheTimeUnit) result.macCacheTimeUnit = denormalizeUnit(policy.macCacheTimeUnit);
  if (typeof policy.reAuthInterval === 'number') result.reAuthInterval = policy.reAuthInterval;
  if (policy.reAuthIntervalUnit) result.reAuthIntervalUnit = denormalizeUnit(policy.reAuthIntervalUnit);
  if (typeof policy.allowUserMacManagement === 'boolean') result.allowUserMacManagement = policy.allowUserMacManagement;
  if (typeof policy.retryLimit === 'number') result.retryLimit = policy.retryLimit;

  return result;
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
  getWifiPolicies: async (type?: string): Promise<WifiPolicy[]> => {
    const response = await axios.get<ApiResponse<WifiPolicy[]> | WifiPolicy[]>(`${API_BASE_URL}/wifi-policies`, {
      params: type ? { type } : undefined,
    });
    return unwrapData<WifiPolicy[]>(response.data).map(normalizeWifiPolicy);
  },

  getWifiPolicyById: async (id: number): Promise<WifiPolicy> => {
    const response = await axios.get<ApiResponse<WifiPolicy> | WifiPolicy>(
      `${API_BASE_URL}/wifi-policies/${id}`,
    );
    return normalizeWifiPolicy(unwrapData<WifiPolicy>(response.data));
  },

  createWifiPolicy: async (data: Omit<WifiPolicy, 'id'>): Promise<WifiPolicy> => {
    const typeUri = (data.type || 'bandwidth').toLowerCase();
    const response = await axios.post<ApiResponse<WifiPolicy> | WifiPolicy>(
      `${API_BASE_URL}/wifi-policies/${typeUri}`,
      serializeWifiPolicy(data)
    );
    return normalizeWifiPolicy(unwrapData<WifiPolicy>(response.data));
  },

  updateWifiPolicy: async (id: number, data: Omit<WifiPolicy, 'id'>): Promise<WifiPolicy> => {
    const typeUri = (data.type || 'bandwidth').toLowerCase();
    const response = await axios.put<ApiResponse<WifiPolicy> | WifiPolicy>(
      `${API_BASE_URL}/wifi-policies/${typeUri}/${id}`,
      serializeWifiPolicy(data)
    );
    
    const returnedData = unwrapData<WifiPolicy>(response.data);
    // Many PUT endpoints return only { code: 200, message: 'Updated successfully' }
    // As a fallback, reconstruct the policy object to keep local Redux state synchronized
    const hasFullData = returnedData && typeof returnedData === 'object' && 'id' in returnedData;
    
    return normalizeWifiPolicy(hasFullData ? returnedData : ({ ...data, id } as WifiPolicy));
  },

  deleteWifiPolicy: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/wifi-policies/${id}`);
  },

  getAuthPolicies: async (): Promise<AuthPolicy[]> => {
    const response = await axios.get<ApiResponse<AuthPolicy[]> | AuthPolicy[]>(`${API_BASE_URL}/auth-policies`);
    return unwrapData<AuthPolicy[]>(response.data).map(normalizeAuthPolicy);
  },

  getAuthPolicyById: async (id: number): Promise<AuthPolicy> => {
    const response = await axios.get<ApiResponse<AuthPolicy> | AuthPolicy>(`${API_BASE_URL}/auth-policies/${id}`);
    return normalizeAuthPolicy(unwrapData<AuthPolicy>(response.data));
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
