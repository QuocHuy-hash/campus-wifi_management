import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUserDevices } from '@/features/devices/api/devicesApi';
import type { UserDevice } from '@/features/auth/types';
import { extractErrorMessage } from '@/features/auth/slices/authSlice';

interface DevicesState {
  devices: UserDevice[];
  loading: boolean;
  error: string | null;
}

const initialState: DevicesState = {
  devices: [],
  loading: false,
  error: null,
};

export const getUserDevices = createAsyncThunk(
  'devices/getUserDevices',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchUserDevices();
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const devicesSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUserDevices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserDevices.fulfilled, (state, action) => {
        state.loading = false;
        state.devices = action.payload;
      })
      .addCase(getUserDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default devicesSlice.reducer;
