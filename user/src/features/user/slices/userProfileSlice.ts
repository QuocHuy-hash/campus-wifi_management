import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { changeUserPassword, fetchUserProfile } from '@/features/user/api/userApi';
import type { ChangePasswordPayload, MeResponse } from '@/features/auth/types';
import { extractErrorMessage } from '@/features/auth/slices/authSlice';

interface UserProfileState {
  profile: MeResponse | null;
  loading: boolean;
  error: string | null;
  changePasswordLoading: boolean;
  changePasswordError: string | null;
  changePasswordSuccess: boolean;
}

const initialState: UserProfileState = {
  profile: null,
  loading: false,
  error: null,
  changePasswordLoading: false,
  changePasswordError: null,
  changePasswordSuccess: false,
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

export const changePassword = createAsyncThunk<void, ChangePasswordPayload>(
  'user/changePassword',
  async (payload, { rejectWithValue }) => {
    try {
      await changeUserPassword(payload);
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
    clearChangePasswordStatus: (state) => {
      state.changePasswordLoading = false;
      state.changePasswordError = null;
      state.changePasswordSuccess = false;
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

        localStorage.setItem('portalUser', JSON.stringify(action.payload));
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(changePassword.pending, (state) => {
        state.changePasswordLoading = true;
        state.changePasswordError = null;
        state.changePasswordSuccess = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.changePasswordLoading = false;
        state.changePasswordError = null;
        state.changePasswordSuccess = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changePasswordLoading = false;
        state.changePasswordError = action.payload as string;
        state.changePasswordSuccess = false;
      });
  },
});

export const { clearProfile, updateProfileLocally, clearChangePasswordStatus } = userProfileSlice.actions;
export default userProfileSlice.reducer;
