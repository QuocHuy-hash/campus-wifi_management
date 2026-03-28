import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BandwidthData } from '../types';
import { reportsApi } from '../api/reportsApi';

export const fetchBandwidthData = createAsyncThunk('reportsBandwidth/fetchBandwidth', async () => {
  return await reportsApi.fetchBandwidthData();
});

export interface BandwidthReportState {
  data: BandwidthData[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: BandwidthReportState = {
  data: [],
  status: 'idle',
};

const bandwidthReportSlice = createSlice({
  name: 'reportsBandwidth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchBandwidthData.fulfilled, (state, action) => {
      state.data = action.payload;
      state.status = 'succeeded';
    });
  }
});

export default bandwidthReportSlice.reducer;
