import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { logsApi } from '../api/logsApi';
import { LogEntry } from '../types';

interface LogsState {
  logs: LogEntry[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  
  logFilter: string;
  logDetailDialogOpen: boolean;
  selectedLog: LogEntry | null;
}

const initialState: LogsState = {
  logs: [],
  status: 'idle',
  error: null,
  
  logFilter: 'all',
  logDetailDialogOpen: false,
  selectedLog: null,
};

export const fetchLogs = createAsyncThunk('settingsLogs/fetchLogs', async () => {
  return await logsApi.getLogs();
});

const logsSlice = createSlice({
  name: 'settingsLogs',
  initialState,
  reducers: {
    setLogFilter(state, action: PayloadAction<string>) {
      state.logFilter = action.payload;
    },
    setLogDetailDialogOpen(state, action: PayloadAction<boolean>) {
      state.logDetailDialogOpen = action.payload;
    },
    setSelectedLog(state, action: PayloadAction<LogEntry | null>) {
      state.selectedLog = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogs.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.logs = action.payload;
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed';
      });
  }
});

export const {
  setLogFilter,
  setLogDetailDialogOpen,
  setSelectedLog
} = logsSlice.actions;

export default logsSlice.reducer;
