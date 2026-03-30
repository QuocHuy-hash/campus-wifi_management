import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AP, Controller } from '../types';
import { fetchAPs, fetchControllers } from '../api/accessPointsApi';
import { Campus, Building } from '@/features/settings/types';

export const getAPs = createAsyncThunk('accessPoints/fetchAPs', async () => {
  return await fetchAPs();
});

export const getControllers = createAsyncThunk('accessPoints/fetchControllers', async () => {
  return await fetchControllers();
});

export const getCampuses = createAsyncThunk('accessPoints/fetchCampuses', async () => {
  const { areasApi } = await import('@/features/settings/api/areasApi');
  return await areasApi.getCampuses();
});

export const getBuildings = createAsyncThunk('accessPoints/fetchBuildings', async () => {
  const { areasApi } = await import('@/features/settings/api/areasApi');
  return await areasApi.getBuildings();
});

interface AccessPointsState {
  aps: AP[];
  controllers: Controller[];
  campuses: Campus[];
  buildings: Building[];
  apsLoading: boolean;
  controllersLoading: boolean;
  locationsLoading: boolean;
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
  campuses: [],
  buildings: [],
  apsLoading: false,
  controllersLoading: false,
  locationsLoading: false,
  error: null,
  searchTerm: '',
  selectedBuilding: 'all',
  selectedCampus: 'all',
  selectedArea: 'all',
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
      })
      .addCase(getCampuses.pending, (state) => {
        state.locationsLoading = true;
        state.error = null;
      })
      .addCase(getCampuses.fulfilled, (state, action) => {
        state.locationsLoading = false;
        state.campuses = action.payload;
      })
      .addCase(getCampuses.rejected, (state, action) => {
        state.locationsLoading = false;
        state.error = action.error.message || 'Failed to fetch Campuses';
      })
      .addCase(getBuildings.pending, (state) => {
        state.locationsLoading = true;
        state.error = null;
      })
      .addCase(getBuildings.fulfilled, (state, action) => {
        state.locationsLoading = false;
        state.buildings = action.payload;
      })
      .addCase(getBuildings.rejected, (state, action) => {
        state.locationsLoading = false;
        state.error = action.error.message || 'Failed to fetch Buildings';
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
