import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SessionData } from '../types';
import { reportsApi } from '../api/reportsApi';

export const fetchSessionData = createAsyncThunk('reportsSessions/fetchSessionData', async () => {
  return await reportsApi.fetchSessionData();
});

export interface SessionsReportState {
  data: SessionData[];
  sessionCurrentPage: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: SessionsReportState = {
  data: [],
  sessionCurrentPage: 1,
  status: 'idle',
};

const sessionsReportSlice = createSlice({
  name: 'reportsSessions',
  initialState,
  reducers: {
    setSessionCurrentPage: (state, action: PayloadAction<number>) => {
      state.sessionCurrentPage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSessionData.fulfilled, (state, action) => {
      state.data = action.payload;
      state.status = 'succeeded';
    });
  }
});

export const { setSessionCurrentPage } = sessionsReportSlice.actions;
export default sessionsReportSlice.reducer;
