import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { areasApi } from '../api/areasApi';
import { Campus, Building, Location } from '../types';

interface AreasState {
  campuses: Campus[];
  buildings: Building[];
  locations: Location[];
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

export const fetchAreas = createAsyncThunk('settingsAreas/fetchAreas', async () => {
  const [campuses, buildings, locations] = await Promise.all([
    areasApi.getCampuses(),
    areasApi.getBuildings(),
    areasApi.getLocations()
  ]);
  return { campuses, buildings, locations };
});

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
    
    // Campus Data
    addCampus(state, action: PayloadAction<Campus>) { state.campuses.push(action.payload); },
    updateCampus(state, action: PayloadAction<Campus>) {
      const idx = state.campuses.findIndex(c => c.id === action.payload.id);
      if (idx !== -1) state.campuses[idx] = action.payload;
    },
    removeCampus(state, action: PayloadAction<number>) { state.campuses = state.campuses.filter(c => c.id !== action.payload); },
    
    // Building UI
    setAddBuildingDialogOpen(state, action: PayloadAction<boolean>) { state.addBuildingDialogOpen = action.payload; },
    setEditBuildingDialogOpen(state, action: PayloadAction<boolean>) { state.editBuildingDialogOpen = action.payload; },
    setDeleteBuildingDialogOpen(state, action: PayloadAction<boolean>) { state.deleteBuildingDialogOpen = action.payload; },
    setSelectedBuilding(state, action: PayloadAction<Building | null>) { state.selectedBuilding = action.payload; },
    
    // Building Data
    addBuilding(state, action: PayloadAction<Building>) { state.buildings.push(action.payload); },
    updateBuilding(state, action: PayloadAction<Building>) {
      const idx = state.buildings.findIndex(b => b.id === action.payload.id);
      if (idx !== -1) state.buildings[idx] = action.payload;
    },
    removeBuilding(state, action: PayloadAction<number>) { state.buildings = state.buildings.filter(b => b.id !== action.payload); },
    
    // Location UI
    setAddLocationDialogOpen(state, action: PayloadAction<boolean>) { state.addLocationDialogOpen = action.payload; },
    setEditLocationDialogOpen(state, action: PayloadAction<boolean>) { state.editLocationDialogOpen = action.payload; },
    setDeleteLocationDialogOpen(state, action: PayloadAction<boolean>) { state.deleteLocationDialogOpen = action.payload; },
    setSelectedLocation(state, action: PayloadAction<Location | null>) { state.selectedLocation = action.payload; },
    
    // Location Data
    addLocation(state, action: PayloadAction<Location>) { state.locations.push(action.payload); },
    updateLocation(state, action: PayloadAction<Location>) {
      const idx = state.locations.findIndex(l => l.id === action.payload.id);
      if (idx !== -1) state.locations[idx] = action.payload;
    },
    removeLocation(state, action: PayloadAction<number>) { state.locations = state.locations.filter(l => l.id !== action.payload); },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAreas.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchAreas.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.campuses = action.payload.campuses;
        state.buildings = action.payload.buildings;
        state.locations = action.payload.locations;
      })
      .addCase(fetchAreas.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed';
      });
  }
});

export const {
  setCampusFilter, setBuildingFilter,
  setAddCampusDialogOpen, setEditCampusDialogOpen, setDeleteCampusDialogOpen, setSelectedCampus,
  addCampus, updateCampus, removeCampus,
  setAddBuildingDialogOpen, setEditBuildingDialogOpen, setDeleteBuildingDialogOpen, setSelectedBuilding,
  addBuilding, updateBuilding, removeBuilding,
  setAddLocationDialogOpen, setEditLocationDialogOpen, setDeleteLocationDialogOpen, setSelectedLocation,
  addLocation, updateLocation, removeLocation
} = areasSlice.actions;

export default areasSlice.reducer;
