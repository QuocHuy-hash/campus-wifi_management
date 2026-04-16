import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { areasApi } from '../api/areasApi';
import { Campus, Building, Location } from '../types';
import { PageResponse } from '@/types/pagination';

interface AreasState {
  campuses: Campus[];
  buildings: Building[];
  locations: Location[];
  campusesPagination: {
    current: number;
    size: number;
    total: number;
    pages: number;
  } | null;
  buildingsPagination: {
    current: number;
    size: number;
    total: number;
    pages: number;
  } | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;

  // Fillter State
  selectedCampusFilter: number | 'all';
  selectedBuildingFilter: number | 'all';

  // Dialog Open States
  addCampusDialogOpen: boolean;
  editCampusDialogOpen: boolean;
  deleteCampusDialogOpen: boolean;
  selectedCampus: Campus | null;

  addBuildingDialogOpen: boolean;
  editBuildingDialogOpen: boolean;
  deleteBuildingDialogOpen: boolean;
  selectedBuilding: Building | null;

  addLocationDialogOpen: boolean;
  editLocationDialogOpen: boolean;
  deleteLocationDialogOpen: boolean;
  selectedLocation: Location | null;
}

const initialState: AreasState = {
  campuses: [],
  buildings: [],
  locations: [],
  campusesPagination: null,
  buildingsPagination: null,
  status: 'idle',
  error: null,

  selectedCampusFilter: 'all',
  selectedBuildingFilter: 'all',

  addCampusDialogOpen: false,
  editCampusDialogOpen: false,
  deleteCampusDialogOpen: false,
  selectedCampus: null,

  addBuildingDialogOpen: false,
  editBuildingDialogOpen: false,
  deleteBuildingDialogOpen: false,
  selectedBuilding: null,

  addLocationDialogOpen: false,
  editLocationDialogOpen: false,
  deleteLocationDialogOpen: false,
  selectedLocation: null,
};

// Retrieve Thunk
export const fetchAreas = createAsyncThunk('settingsAreas/fetchAreas', async (params?: { page?: number; size?: number }) => {
  const [campuses, buildings, locations] = await Promise.all([
    areasApi.getCampuses(params),
    areasApi.getBuildings(params),
    areasApi.getLocations()
  ]);
  return { campuses, buildings, locations };
});

// Campus Thunks
export const createCampusThunk = createAsyncThunk('settingsAreas/createCampus', async (data: Omit<Campus, 'id'>) => await areasApi.createCampus(data));
export const updateCampusThunk = createAsyncThunk('settingsAreas/updateCampus', async ({ id, data }: { id: number, data: Omit<Campus, 'id'> }) => await areasApi.updateCampus(id, data));
export const deleteCampusThunk = createAsyncThunk('settingsAreas/deleteCampus', async (id: number) => { await areasApi.deleteCampus(id); return id; });

// Building Thunks
export const createBuildingThunk = createAsyncThunk('settingsAreas/createBuilding', async (data: Omit<Building, 'id'>) => await areasApi.createBuilding(data));
export const updateBuildingThunk = createAsyncThunk('settingsAreas/updateBuilding', async ({ id, data }: { id: number, data: Omit<Building, 'id'> }) => await areasApi.updateBuilding(id, data));
export const deleteBuildingThunk = createAsyncThunk('settingsAreas/deleteBuilding', async (id: number) => { await areasApi.deleteBuilding(id); return id; });

// Location Thunks
export const createLocationThunk = createAsyncThunk('settingsAreas/createLocation', async (data: Omit<Location, 'id'>) => await areasApi.createLocation(data));
export const updateLocationThunk = createAsyncThunk('settingsAreas/updateLocation', async ({ id, data }: { id: number, data: Omit<Location, 'id'> }) => await areasApi.updateLocation(id, data));
export const deleteLocationThunk = createAsyncThunk('settingsAreas/deleteLocation', async (id: number) => { await areasApi.deleteLocation(id); return id; });

const areasSlice = createSlice({
  name: 'settingsAreas',
  initialState,
  reducers: {
    // Filters
    setCampusFilter(state, action: PayloadAction<number | 'all'>) { state.selectedCampusFilter = action.payload; },
    setBuildingFilter(state, action: PayloadAction<number | 'all'>) { state.selectedBuildingFilter = action.payload; },
    
    // Campus UI
    setAddCampusDialogOpen(state, action: PayloadAction<boolean>) { state.addCampusDialogOpen = action.payload; },
    setEditCampusDialogOpen(state, action: PayloadAction<boolean>) { state.editCampusDialogOpen = action.payload; },
    setDeleteCampusDialogOpen(state, action: PayloadAction<boolean>) { state.deleteCampusDialogOpen = action.payload; },
    setSelectedCampus(state, action: PayloadAction<Campus | null>) { state.selectedCampus = action.payload; },
    
    // Building UI
    setAddBuildingDialogOpen(state, action: PayloadAction<boolean>) { state.addBuildingDialogOpen = action.payload; },
    setEditBuildingDialogOpen(state, action: PayloadAction<boolean>) { state.editBuildingDialogOpen = action.payload; },
    setDeleteBuildingDialogOpen(state, action: PayloadAction<boolean>) { state.deleteBuildingDialogOpen = action.payload; },
    setSelectedBuilding(state, action: PayloadAction<Building | null>) { state.selectedBuilding = action.payload; },
    
    // Location UI
    setAddLocationDialogOpen(state, action: PayloadAction<boolean>) { state.addLocationDialogOpen = action.payload; },
    setEditLocationDialogOpen(state, action: PayloadAction<boolean>) { state.editLocationDialogOpen = action.payload; },
    setDeleteLocationDialogOpen(state, action: PayloadAction<boolean>) { state.deleteLocationDialogOpen = action.payload; },
    setSelectedLocation(state, action: PayloadAction<Location | null>) { state.selectedLocation = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAreas.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchAreas.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.campuses = action.payload.campuses.records || [];
        state.campusesPagination = {
          current: action.payload.campuses.current,
          size: action.payload.campuses.size,
          total: action.payload.campuses.total,
          pages: action.payload.campuses.pages,
        };
        state.buildings = action.payload.buildings.records || [];
        state.buildingsPagination = {
          current: action.payload.buildings.current,
          size: action.payload.buildings.size,
          total: action.payload.buildings.total,
          pages: action.payload.buildings.pages,
        };
        state.locations = action.payload.locations;
      })
      .addCase(fetchAreas.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed';
      })
      
      // Campus CRUD Handlers
      .addCase(createCampusThunk.fulfilled, (state, action) => { state.campuses.push(action.payload); })
      .addCase(updateCampusThunk.fulfilled, (state, action) => {
        const idx = state.campuses.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) state.campuses[idx] = action.payload;
      })
      .addCase(deleteCampusThunk.fulfilled, (state, action) => {
        state.campuses = state.campuses.filter(c => c.id !== action.payload);
      })
      
      // Building CRUD Handlers
      .addCase(createBuildingThunk.fulfilled, (state, action) => { state.buildings.push(action.payload); })
      .addCase(updateBuildingThunk.fulfilled, (state, action) => {
        const idx = state.buildings.findIndex(b => b.id === action.payload.id);
        if (idx !== -1) state.buildings[idx] = action.payload;
      })
      .addCase(deleteBuildingThunk.fulfilled, (state, action) => {
        state.buildings = state.buildings.filter(b => b.id !== action.payload);
      })
      
      // Location CRUD Handlers
      .addCase(createLocationThunk.fulfilled, (state, action) => { state.locations.push(action.payload); })
      .addCase(updateLocationThunk.fulfilled, (state, action) => {
        const idx = state.locations.findIndex(l => l.id === action.payload.id);
        if (idx !== -1) state.locations[idx] = action.payload;
      })
      .addCase(deleteLocationThunk.fulfilled, (state, action) => {
        state.locations = state.locations.filter(l => l.id !== action.payload);
      });
  }
});

export const {
  setCampusFilter, setBuildingFilter,
  setAddCampusDialogOpen, setEditCampusDialogOpen, setDeleteCampusDialogOpen, setSelectedCampus,
  setAddBuildingDialogOpen, setEditBuildingDialogOpen, setDeleteBuildingDialogOpen, setSelectedBuilding,
  setAddLocationDialogOpen, setEditLocationDialogOpen, setDeleteLocationDialogOpen, setSelectedLocation
} = areasSlice.actions;

export default areasSlice.reducer;
