import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { policiesApi } from '@/features/policies/api/policiesApi';

import {
  User,
  UserPolicy,
  UsersApiEnvelope,
  WifiPolicy,
  LinkedAccount,
  MeResponse,
  ChangePasswordRequest,
  LinkProviderRequest,
} from '../types';

// ─── Endpoints ───────────────────────────────────────────────────────────────
// V4: /api/v1/users?role= replaces /api/v1/users/wifi-users and /api/v1/users/by-roles
const USERS_ENDPOINT = `${API_BASE_URL}/users`;
const AUTH_ENDPOINT = `${API_BASE_URL}/auth`;

// ─── Internal raw shape returned by GET /api/v1/users ───────────────────────────
interface RawProvider {
  provider?: string;
  providerEmail?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  lastUsedAt?: string | null;
  linkedAt?: string | null;
  isActive?: boolean;
}

interface RawUserPolicy {
  id: number;
  name: string;
  type: string;
  isActive: boolean;
  detail: Record<string, unknown>;
}

interface UserApiModel {
  id: number;
  email: string;
  name?: string;
  fullName?: string;
  unit?: string | null;
  created?: string;
  createdAt?: string;
  role: string;
  status: string;
  macAddress?: string | null;
  /** V4 API: structured policy array */
  policies?: RawUserPolicy[];
  /** V4 API: OAuth providers */
  linkedProviders?: RawProvider[];
  /** Legacy compat */
  linkedAccounts?: RawProvider[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const unwrapData = <T>(payload: UsersApiEnvelope<T> | T): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
    return (payload as UsersApiEnvelope<T>).data;
  }
  return payload as T;
};

const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as { message?: string; error?: string } | undefined;
    return payload?.message || payload?.error || error.message;
  }
  return error instanceof Error ? error.message : 'Unknown error';
};

const normalizeProvider = (p: RawProvider): LinkedAccount => ({
  provider: p?.provider || 'unknown',
  providerEmail: p?.providerEmail ?? null,
  displayName: p?.displayName ?? null,
  avatarUrl: p?.avatarUrl ?? null,
  lastUsedAt: p?.lastUsedAt ?? null,
  linkedAt: p?.linkedAt ?? null,
  isActive: p?.isActive ?? false,
});

const normalizePolicy = (p: RawUserPolicy): UserPolicy => ({
  id: p.id,
  name: p.name,
  type: p.type as UserPolicy['type'],
  isActive: p.isActive,
  detail: p.detail as unknown as UserPolicy['detail'],
});

const normalizeUser = (user: UserApiModel): User => {
  // Support both linkedProviders (V4) and linkedAccounts (legacy)
  const rawProviders = user.linkedProviders ?? user.linkedAccounts ?? [];
  return {
    id: user.id,
    email: user.email,
    name: user.name || user.fullName || '',
    unit: user.unit ?? '',
    created: user.created || user.createdAt || '',
    role: user.role,
    status: user.status,
    macAddress: user.macAddress ?? null,
    policies: Array.isArray(user.policies) ? user.policies.map(normalizePolicy) : [],
    linkedProviders: rawProviders.map(normalizeProvider),
  };
};

const serializeUser = (user: Partial<User>) => ({
  email: user.email,
  name: user.name,
  unit: user.unit,
  role: user.role,
  status: user.status,
  macAddress: user.macAddress,
  // Send policy IDs if available
  policyIds: user.policies?.map(p => p.id),
});

// ─── User CRUD ───────────────────────────────────────────────────────────────

/**
 * GET /api/v1/users?role=
 * V4: unified endpoint — role param is optional; omit to get all users.
 */
export const fetchUsers = async (role?: string | null): Promise<User[]> => {
  try {
    const response = await axios.get<UsersApiEnvelope<UserApiModel[]> | UserApiModel[]>(
      USERS_ENDPOINT,
      { params: role ? { role } : undefined },
    );
    return unwrapData<UserApiModel[]>(response.data).map(normalizeUser);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const fetchPolicies = async (): Promise<WifiPolicy[]> => {
  try {
    return await policiesApi.getWifiPolicies();
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const addUser = async (
  user: Omit<User, 'id' | 'created' | 'linkedAccounts'>,
): Promise<User> => {
  try {
    const response = await axios.post<UsersApiEnvelope<UserApiModel> | UserApiModel>(
      USERS_ENDPOINT,
      serializeUser(user),
    );
    return normalizeUser(unwrapData<UserApiModel>(response.data));
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const updateUser = async (user: User): Promise<User> => {
  try {
    const response = await axios.put<UsersApiEnvelope<UserApiModel> | UserApiModel>(
      `${USERS_ENDPOINT}/${user.id}`,
      serializeUser(user),
    );
    return normalizeUser(unwrapData<UserApiModel>(response.data));
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const deleteUser = async (userId: number): Promise<void> => {
  try {
    await axios.delete(`${USERS_ENDPOINT}/${userId}`);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const assignPolicy = async (userId: number, policyData: Partial<User>): Promise<User> => {
  try {
    const response = await axios.put<UsersApiEnvelope<UserApiModel> | UserApiModel>(
      `${USERS_ENDPOINT}/${userId}`,
      serializeUser(policyData),
    );
    return normalizeUser(unwrapData<UserApiModel>(response.data));
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// ─── Auth/Me — V4 new ────────────────────────────────────────────────────────

/**
 * GET /api/v1/auth/me
 * Returns the currently-logged-in user profile including linked OAuth providers.
 */
export const fetchMe = async (): Promise<MeResponse> => {
  try {
    const response = await axios.get<UsersApiEnvelope<MeResponse>>(`${AUTH_ENDPOINT}/me`);
    return unwrapData<MeResponse>(response.data);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// ─── Auth/ChangePassword — V4 new ────────────────────────────────────────────

/**
 * POST /api/v1/auth/change-password
 * Only available for users with a local password (not social-only accounts).
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
  try {
    const response = await axios.post<UsersApiEnvelope<null>>(
      `${AUTH_ENDPOINT}/change-password`,
      data,
    );
    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Đổi mật khẩu thất bại');
    }
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// ─── Auth/LinkProvider — V4 new ──────────────────────────────────────────────

/**
 * POST /api/v1/auth/link-provider
 * Links an OAuth2 provider (Google / Azure) to the current account.
 * FE must obtain providerUserId from the provider SDK before calling this.
 */
export const linkProvider = async (data: LinkProviderRequest): Promise<void> => {
  try {
    const response = await axios.post<UsersApiEnvelope<null>>(
      `${AUTH_ENDPOINT}/link-provider`,
      data,
    );
    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Liên kết provider thất bại');
    }
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
