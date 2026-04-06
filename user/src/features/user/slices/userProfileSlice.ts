import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchUserProfile } from '@/features/user/api/userApi';
import type { MeResponse } from '@/features/auth/types';
import { extractErrorMessage } from '@/features/auth/slices/authSlice';

interface UserProfileState {
  profile: MeResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserProfileState = {
  profile: null,
  loading: false,
  error: null,
};

export const getUserProfile = createAsyncThunk(
  'user/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchUserProfile();
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
      state.loading = false;
    },
    updateProfileLocally: (state, action: PayloadAction<Partial<MeResponse>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
        
        // Also persist to localStorage for backward compatibility
        localStorage.setItem('portalUser', JSON.stringify(action.payload));
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfile, updateProfileLocally } = userProfileSlice.actions;
export default userProfileSlice.reducer;
