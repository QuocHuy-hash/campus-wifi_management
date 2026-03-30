import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { AuthPolicy, WifiPolicy } from '@/data/mockData';

interface ApiResponse<T> {
  statusCode: number;
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
  return {
    ...policy,
    type: toUiPolicyType((policy as unknown as { type?: string }).type),
    applyToRoles: Array.isArray(policy.applyToRoles) ? policy.applyToRoles : [],
    auditMaxSessionTimeUnit: normalizeUnit(policy.auditMaxSessionTimeUnit, 'hour') as 'minute' | 'hour',
    accountingIntervalUnit: normalizeUnit(policy.accountingIntervalUnit, 'second') as 'second' | 'minute',
    logRetentionUnit: normalizeUnit(policy.logRetentionUnit, 'month') as 'month' | 'year',
    macCacheTimeUnit: normalizeUnit(policy.macCacheTimeUnit, 'hour') as 'hour' | 'day',
    reAuthIntervalUnit: normalizeUnit(policy.reAuthIntervalUnit, 'day') as 'hour' | 'day',
    auditMaxDataUsageUnit: (policy.auditMaxDataUsageUnit || 'MB').toUpperCase() as 'MB' | 'GB',
  };
};

const serializeWifiPolicy = (policy: Omit<WifiPolicy, 'id'>): Record<string, unknown> => {
  return {
    ...policy,
    type: toApiPolicyType(policy.type),
    applyToRoles: policy.applyToRoles ?? [],
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
  getWifiPolicies: async (): Promise<WifiPolicy[]> => {
    const response = await axios.get<ApiResponse<WifiPolicy[]> | WifiPolicy[]>(`${API_BASE_URL}/wifi-policies`);
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
