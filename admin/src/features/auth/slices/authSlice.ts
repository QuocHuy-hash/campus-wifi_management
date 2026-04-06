import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/constants/appKeys';
import { loginApi, LoginRequest } from '../api/authApi';
import { setAxiosAuthToken } from '@/config/axios';
import axios from 'axios';

interface User {
  username: string;
  roles: string[];
  name: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await loginApi(credentials);
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.message || 'Đăng nhập thất bại');
    }
  }
);

const getInitialState = (): AuthState => {
  const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) : null;
  const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  
  if (token) {
    setAxiosAuthToken(token);
  }

  return {
    user: user ? JSON.parse(user) : null,
    isLoggedIn: !!token,
    isLoading: false,
    error: null,
  };
};

export const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.error = null;
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      setAxiosAuthToken(null);
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        
        // Setup simple user object based on roles until fetchMe is called completely
        const userData = {
          username: 'admin',
          roles: action.payload.roles,
          name: 'Quản trị viên'
        };
        
        state.user = userData;
        state.error = null;
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, action.payload.accessToken);
        
        setAxiosAuthToken(action.payload.accessToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Đăng nhập thất bại';
      });
  }
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;
