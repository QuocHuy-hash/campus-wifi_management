import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { devicesApi } from '../api/devicesApi';
import { Controller, AP } from '../types';

interface DevicesState {
  controllers: Controller[];
  aps: AP[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  
  // Filters
  selectedControllerFilter: string | null;
  controllerCampusFilter: string;
  
  // UI States
  addControllerDialogOpen: boolean;
  editControllerDialogOpen: boolean;
  deleteControllerDialogOpen: boolean;
  selectedController: Controller | null;
  
  addAPDialogOpen: boolean;
  editAPDialogOpen: boolean;
  deleteAPDialogOpen: boolean;
  selectedAP: AP | null;
}

const initialState: DevicesState = {
  controllers: [],
  aps: [],
  status: 'idle',
  error: null,
  
  selectedControllerFilter: null,
  controllerCampusFilter: 'all',
  
  addControllerDialogOpen: false,
  editControllerDialogOpen: false,
  deleteControllerDialogOpen: false,
  selectedController: null,
  
  addAPDialogOpen: false,
  editAPDialogOpen: false,
  deleteAPDialogOpen: false,
  selectedAP: null,
};

export const fetchDevices = createAsyncThunk('settingsDevices/fetchDevices', async () => {
  const [controllers, aps] = await Promise.all([
    devicesApi.getControllers(),
    devicesApi.getAPs()
  ]);
  return { controllers, aps };
});

const devicesSlice = createSlice({
  name: 'settingsDevices',
  initialState,
  reducers: {
    // Filters
    setSelectedControllerFilter(state, action: PayloadAction<string | null>) { state.selectedControllerFilter = action.payload; },
    setControllerCampusFilter(state, action: PayloadAction<string>) { state.controllerCampusFilter = action.payload; },
    
    // Controller UI
    setAddControllerDialogOpen(state, action: PayloadAction<boolean>) { state.addControllerDialogOpen = action.payload; },
    setEditControllerDialogOpen(state, action: PayloadAction<boolean>) { state.editControllerDialogOpen = action.payload; },
    setDeleteControllerDialogOpen(state, action: PayloadAction<boolean>) { state.deleteControllerDialogOpen = action.payload; },
    setSelectedController(state, action: PayloadAction<Controller | null>) { state.selectedController = action.payload; },
    
    // Controller Data
    addController(state, action: PayloadAction<Controller>) { state.controllers.push(action.payload); },
    updateController(state, action: PayloadAction<Controller>) {
      const idx = state.controllers.findIndex(c => c.id === action.payload.id);
      if (idx !== -1) state.controllers[idx] = action.payload;
    },
    removeController(state, action: PayloadAction<number>) { state.controllers = state.controllers.filter(c => c.id !== action.payload); },
    
    // AP UI
    setAddAPDialogOpen(state, action: PayloadAction<boolean>) { state.addAPDialogOpen = action.payload; },
    setEditAPDialogOpen(state, action: PayloadAction<boolean>) { state.editAPDialogOpen = action.payload; },
    setDeleteAPDialogOpen(state, action: PayloadAction<boolean>) { state.deleteAPDialogOpen = action.payload; },
    setSelectedAP(state, action: PayloadAction<AP | null>) { state.selectedAP = action.payload; },
    
    // AP Data
    addAP(state, action: PayloadAction<AP>) { state.aps.push(action.payload); },
    updateAP(state, action: PayloadAction<AP>) {
      const idx = state.aps.findIndex(a => a.id === action.payload.id);
      if (idx !== -1) state.aps[idx] = action.payload;
    },
    removeAP(state, action: PayloadAction<number>) { state.aps = state.aps.filter(a => a.id !== action.payload); },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDevices.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.controllers = action.payload.controllers;
        state.aps = action.payload.aps;
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed';
      });
  }
});

export const {
  setSelectedControllerFilter, setControllerCampusFilter,
  setAddControllerDialogOpen, setEditControllerDialogOpen, setDeleteControllerDialogOpen, setSelectedController,
  addController, updateController, removeController,
  setAddAPDialogOpen, setEditAPDialogOpen, setDeleteAPDialogOpen, setSelectedAP,
  addAP, updateAP, removeAP
} = devicesSlice.actions;

export default devicesSlice.reducer;
