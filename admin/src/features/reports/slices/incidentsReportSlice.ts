import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { IncidentData } from '../types';
import { reportsApi } from '../api/reportsApi';

export const fetchIncidents = createAsyncThunk('reportsIncidents/fetchIncidents', async () => {
  return await reportsApi.fetchIncidents();
});

export interface IncidentsReportState {
  data: IncidentData[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: IncidentsReportState = {
  data: [],
  status: 'idle',
};

const incidentsReportSlice = createSlice({
  name: 'reportsIncidents',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchIncidents.fulfilled, (state, action) => {
      state.data = action.payload;
      state.status = 'succeeded';
    });
  }
});

export default incidentsReportSlice.reducer;
