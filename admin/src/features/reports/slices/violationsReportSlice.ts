import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ViolationData } from '../types';
import { reportsApi } from '../api/reportsApi';

export const fetchViolations = createAsyncThunk('reportsViolations/fetchViolations', async () => {
  return await reportsApi.fetchViolations();
});

export interface ViolationsReportState {
  data: ViolationData[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: ViolationsReportState = {
  data: [],
  status: 'idle',
};

const violationsReportSlice = createSlice({
  name: 'reportsViolations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchViolations.fulfilled, (state, action) => {
      state.data = action.payload;
      state.status = 'succeeded';
    });
  }
});

export default violationsReportSlice.reducer;
