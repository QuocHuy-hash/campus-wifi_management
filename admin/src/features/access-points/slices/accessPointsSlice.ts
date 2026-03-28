import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AP, Controller } from '../types';
import { fetchAPs, fetchControllers } from '../api/accessPointsApi';

export const getAPs = createAsyncThunk('accessPoints/fetchAPs', async () => {
  return await fetchAPs();
});

export const getControllers = createAsyncThunk('accessPoints/fetchControllers', async () => {
  return await fetchControllers();
});

interface AccessPointsState {
  aps: AP[];
  controllers: Controller[];
  apsLoading: boolean;
  controllersLoading: boolean;
  error: string | null;
  // Filters
  searchTerm: string;
  selectedBuilding: string;
  selectedCampus: string;
  selectedArea: string;
  selectedControllerFilter: string | null;
  showControllerSection: boolean;
}

const initialState: AccessPointsState = {
  aps: [],
  controllers: [],
  apsLoading: false,
  controllersLoading: false,
  error: null,
  searchTerm: '',
  selectedBuilding: 'All',
  selectedCampus: 'Dĩ An',
  selectedArea: 'Nhà A',
  selectedControllerFilter: null,
  showControllerSection: false,
};

const accessPointsSlice = createSlice({
  name: 'accessPoints',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSelectedBuilding: (state, action: PayloadAction<string>) => {
      state.selectedBuilding = action.payload;
    },
    setSelectedCampus: (state, action: PayloadAction<string>) => {
      state.selectedCampus = action.payload;
    },
    setSelectedArea: (state, action: PayloadAction<string>) => {
      state.selectedArea = action.payload;
    },
    setSelectedControllerFilter: (state, action: PayloadAction<string | null>) => {
      state.selectedControllerFilter = action.payload;
    },
    toggleControllerSection: (state) => {
      state.showControllerSection = !state.showControllerSection;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAPs.pending, (state) => {
        state.apsLoading = true;
        state.error = null;
      })
      .addCase(getAPs.fulfilled, (state, action) => {
        state.apsLoading = false;
        state.aps = action.payload;
      })
      .addCase(getAPs.rejected, (state, action) => {
        state.apsLoading = false;
        state.error = action.error.message || 'Failed to fetch APs';
      })
      .addCase(getControllers.pending, (state) => {
        state.controllersLoading = true;
        state.error = null;
      })
      .addCase(getControllers.fulfilled, (state, action) => {
        state.controllersLoading = false;
        state.controllers = action.payload;
      })
      .addCase(getControllers.rejected, (state, action) => {
        state.controllersLoading = false;
        state.error = action.error.message || 'Failed to fetch Controllers';
      });
  },
});

export const {
  setSearchTerm,
  setSelectedBuilding,
  setSelectedCampus,
  setSelectedArea,
  setSelectedControllerFilter,
  toggleControllerSection,
} = accessPointsSlice.actions;

export default accessPointsSlice.reducer;
