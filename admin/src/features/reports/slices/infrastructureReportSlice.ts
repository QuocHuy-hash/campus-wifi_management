import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ControllerReportData, APAccessData } from '../types';
import { reportsApi } from '../api/reportsApi';

export const fetchControllers = createAsyncThunk('reportsInfrastructure/fetchControllers', async () => {
  return await reportsApi.fetchControllers();
});

export const fetchApAccess = createAsyncThunk('reportsInfrastructure/fetchApAccess', async () => {
  return await reportsApi.fetchApAccess();
});

export interface InfrastructureReportState {
  controllers: ControllerReportData[];
  apAccessList: APAccessData[];
  selectedController: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: InfrastructureReportState = {
  controllers: [],
  apAccessList: [],
  selectedController: null,
  status: 'idle',
};

const infrastructureReportSlice = createSlice({
  name: 'reportsInfrastructure',
  initialState,
  reducers: {
    setSelectedController: (state, action: PayloadAction<string | null>) => {
      state.selectedController = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchControllers.fulfilled, (state, action) => {
      state.controllers = action.payload;
      state.status = 'succeeded';
    });
    builder.addCase(fetchApAccess.fulfilled, (state, action) => {
      state.apAccessList = action.payload;
    });
  }
});

export const { setSelectedController } = infrastructureReportSlice.actions;
export default infrastructureReportSlice.reducer;
