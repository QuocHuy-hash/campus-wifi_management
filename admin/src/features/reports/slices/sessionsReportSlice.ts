import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserSession } from '../types';
import { sessionsApi } from '../api/sessionsApi';

export const fetchSessionData = createAsyncThunk('reportsSessions/fetchSessionData', async () => {
  return await sessionsApi.getAllSessions();
});

export interface SessionsReportState {
  data: UserSession[];
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
    builder.addCase(fetchSessionData.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(fetchSessionData.fulfilled, (state, action) => {
      state.data = action.payload;
      state.status = 'succeeded';
    });
    builder.addCase(fetchSessionData.rejected, (state) => {
      state.status = 'failed';
    });
  }
});

export const { setSessionCurrentPage } = sessionsReportSlice.actions;
export default sessionsReportSlice.reducer;
