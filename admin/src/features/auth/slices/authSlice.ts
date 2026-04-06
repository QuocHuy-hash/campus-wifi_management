import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/constants/appKeys';
import {
  adminLoginApi,
  adminLogoutApi,
  getAdminMeApi,
  AdminLoginRequest,
  AdminMeResponse,
} from '../api/authApi';
import { setAxiosAuthToken } from '@/config/axios';
import axios from 'axios';

// ─── State Types ──────────────────────────────────────────────────────────────

export type AdminUser = Pick<AdminMeResponse, 'userId' | 'userName' | 'fullName' | 'email' | 'phone' | 'roleId' | 'departmentId'>;

interface AuthState {
  user: AdminUser | null;
  roles: string[];
  isLoggedIn: boolean;
  isLoading: boolean;
  isFetchingMe: boolean;
  error: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const persistUser = (user: AdminUser) => {
  localStorage.setItem('user', JSON.stringify(user));
};

const clearPersisted = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('roles');
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

const getInitialState = (): AuthState => {
  const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) : null;
  const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const rolesRaw = typeof window !== 'undefined' ? localStorage.getItem('roles') : null;

  if (token) {
    setAxiosAuthToken(token);
  }

  return {
    user: userRaw ? JSON.parse(userRaw) : null,
    roles: rolesRaw ? JSON.parse(rolesRaw) : [],
    isLoggedIn: !!token,
    isLoading: false,
    isFetchingMe: false,
    error: null,
  };
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: AdminLoginRequest, { dispatch, rejectWithValue }) => {
    try {
      const data = await adminLoginApi(credentials);

      // Immediately fetch full admin profile after login
      dispatch(fetchMe());

      return data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.message || 'Đăng nhập thất bại');
    }
  },
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      return await getAdminMeApi();
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.message || 'Không thể lấy thông tin tài khoản');
    }
  },
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await adminLogoutApi();
    } catch {
      // Ignore API error — always clear local state
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

export const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    logout: (state) => {
      state.user = null;
      state.roles = [];
      state.isLoggedIn = false;
      state.error = null;
      clearPersisted();
      setAxiosAuthToken(null);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── login ──
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        state.roles = action.payload.roles;
        state.error = null;

        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, action.payload.accessToken);
        localStorage.setItem('roles', JSON.stringify(action.payload.roles));
        setAxiosAuthToken(action.payload.accessToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Đăng nhập thất bại';
      });

    // ── fetchMe ──
    builder
      .addCase(fetchMe.pending, (state) => {
        state.isFetchingMe = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.isFetchingMe = false;
        const { menuTree: _, ...userWithoutMenu } = action.payload as any;
        state.user = userWithoutMenu as AdminUser;
        persistUser(state.user!);
      })
      .addCase(fetchMe.rejected, (state) => {
        state.isFetchingMe = false;
        // Non-critical — keep session alive even if /me fails
      });

    // ── logoutThunk ──
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null;
      state.roles = [];
      state.isLoggedIn = false;
      state.error = null;
      clearPersisted();
      setAxiosAuthToken(null);
    });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;
