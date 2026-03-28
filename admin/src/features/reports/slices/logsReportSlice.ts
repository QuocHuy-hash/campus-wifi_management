import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportsApi } from '../api/reportsApi';

export const fetchSystemLogs = createAsyncThunk('reportsLogs/fetchSystemLogs', async () => {
  return await reportsApi.fetchSystemLogs();
});

export interface LogEntry {
  time: string;
  level: string; // INFO, WARNING, ERROR
  message: string;
}

export interface LogsReportState {
  data: LogEntry[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: LogsReportState = {
  data: [],
  status: 'idle',
};

const logsReportSlice = createSlice({
  name: 'reportsLogs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSystemLogs.fulfilled, (state, action) => {
      state.data = action.payload;
      state.status = 'succeeded';
    });
  }
});

export default logsReportSlice.reducer;
