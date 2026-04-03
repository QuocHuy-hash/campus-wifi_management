import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { initialPolicies } from '@/data/mockData';
import {
  User,
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

// ─── Internal raw shape returned by GET /api/v1/users ───────────────────────
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
  bandwidthPolicy?: string | null;
  sessionPolicy?: string | null;
  auditPolicy?: string | null;
  securityPolicy?: string | null;
  linkedAccounts?: Array<{
    provider?: string;
    providerEmail?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
    lastUsedAt?: string | null;
    isActive?: boolean;
  }>;
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

type RawLinkedAccount = NonNullable<UserApiModel['linkedAccounts']>[number];

const normalizeLinkedAccount = (account: RawLinkedAccount): LinkedAccount => ({
  provider: account?.provider || 'unknown',
  providerEmail: account?.providerEmail ?? null,
  displayName: account?.displayName ?? null,
  avatarUrl: account?.avatarUrl ?? null,
  lastUsedAt: account?.lastUsedAt ?? null,
  isActive: account?.isActive ?? false,
});

const normalizeUser = (user: UserApiModel): User => ({
  id: user.id,
  email: user.email,
  name: user.name || user.fullName || '',
  unit: user.unit ?? '',
  created: user.created || user.createdAt || '',
  role: user.role,
  status: user.status,
  macAddress: user.macAddress ?? null,
  bandwidthPolicy: user.bandwidthPolicy ?? null,
  sessionPolicy: user.sessionPolicy ?? null,
  auditPolicy: user.auditPolicy ?? null,
  securityPolicy: user.securityPolicy ?? null,
  linkedAccounts: Array.isArray(user.linkedAccounts)
    ? user.linkedAccounts.map(normalizeLinkedAccount)
    : [],
});

const serializeUser = (user: Partial<User>) => ({
  email: user.email,
  name: user.name,
  unit: user.unit,
  role: user.role,
  status: user.status,
  macAddress: user.macAddress,
  bandwidthPolicy: user.bandwidthPolicy,
  sessionPolicy: user.sessionPolicy,
  auditPolicy: user.auditPolicy,
  securityPolicy: user.securityPolicy,
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

export const fetchPolicies = async (): Promise<WifiPolicy[]> => [...initialPolicies];

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
