import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { integrationsApi } from '../api/integrationsApi';
import { IamConnection, RadiusConfig, CaptivePortalConfig } from '../types';

interface IntegrationsState {
  iamConnections: IamConnection[];
  radiusConfigs: RadiusConfig[];
  captivePortals: CaptivePortalConfig[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  
  // IAM UI
  addIamDialogOpen: boolean;
  editIamDialogOpen: boolean;
  deleteIamDialogOpen: boolean;
  selectedIam: IamConnection | null;
  
  // RADIUS UI
  addRadiusDialogOpen: boolean;
  editRadiusDialogOpen: boolean;
  deleteRadiusDialogOpen: boolean;
  selectedRadius: RadiusConfig | null;
  
  // Portal UI
  addPortalDialogOpen: boolean;
  editPortalDialogOpen: boolean;
  deletePortalDialogOpen: boolean;
  selectedPortal: CaptivePortalConfig | null;
}

const initialState: IntegrationsState = {
  iamConnections: [],
  radiusConfigs: [],
  captivePortals: [],
  status: 'idle',
  error: null,
  
  addIamDialogOpen: false,
  editIamDialogOpen: false,
  deleteIamDialogOpen: false,
  selectedIam: null,
  
  addRadiusDialogOpen: false,
  editRadiusDialogOpen: false,
  deleteRadiusDialogOpen: false,
  selectedRadius: null,
  
  addPortalDialogOpen: false,
  editPortalDialogOpen: false,
  deletePortalDialogOpen: false,
  selectedPortal: null,
};

export const fetchIntegrations = createAsyncThunk('settingsIntegrations/fetchIntegrations', async () => {
  const [iam, radius, portals] = await Promise.all([
    integrationsApi.getIamConnections(),
    integrationsApi.getRadiusConfigs(),
    integrationsApi.getCaptivePortals()
  ]);
  return { iam, radius, portals };
});

const integrationsSlice = createSlice({
  name: 'settingsIntegrations',
  initialState,
  reducers: {
    // IAM
    setAddIamDialogOpen(state, action: PayloadAction<boolean>) { state.addIamDialogOpen = action.payload; },
    setEditIamDialogOpen(state, action: PayloadAction<boolean>) { state.editIamDialogOpen = action.payload; },
    setDeleteIamDialogOpen(state, action: PayloadAction<boolean>) { state.deleteIamDialogOpen = action.payload; },
    setSelectedIam(state, action: PayloadAction<IamConnection | null>) { state.selectedIam = action.payload; },
    addIam(state, action: PayloadAction<IamConnection>) { state.iamConnections.push(action.payload); },
    updateIam(state, action: PayloadAction<IamConnection>) {
      const idx = state.iamConnections.findIndex(i => i.id === action.payload.id);
      if (idx !== -1) state.iamConnections[idx] = action.payload;
    },
    removeIam(state, action: PayloadAction<number>) { state.iamConnections = state.iamConnections.filter(i => i.id !== action.payload); },

    // RADIUS
    setAddRadiusDialogOpen(state, action: PayloadAction<boolean>) { state.addRadiusDialogOpen = action.payload; },
    setEditRadiusDialogOpen(state, action: PayloadAction<boolean>) { state.editRadiusDialogOpen = action.payload; },
    setDeleteRadiusDialogOpen(state, action: PayloadAction<boolean>) { state.deleteRadiusDialogOpen = action.payload; },
    setSelectedRadius(state, action: PayloadAction<RadiusConfig | null>) { state.selectedRadius = action.payload; },
    addRadius(state, action: PayloadAction<RadiusConfig>) { state.radiusConfigs.push(action.payload); },
    updateRadius(state, action: PayloadAction<RadiusConfig>) {
      const idx = state.radiusConfigs.findIndex(r => r.id === action.payload.id);
      if (idx !== -1) state.radiusConfigs[idx] = action.payload;
    },
    removeRadius(state, action: PayloadAction<number>) { state.radiusConfigs = state.radiusConfigs.filter(r => r.id !== action.payload); },

    // Captive Portal
    setAddPortalDialogOpen(state, action: PayloadAction<boolean>) { state.addPortalDialogOpen = action.payload; },
    setEditPortalDialogOpen(state, action: PayloadAction<boolean>) { state.editPortalDialogOpen = action.payload; },
    setDeletePortalDialogOpen(state, action: PayloadAction<boolean>) { state.deletePortalDialogOpen = action.payload; },
    setSelectedPortal(state, action: PayloadAction<CaptivePortalConfig | null>) { state.selectedPortal = action.payload; },
    addPortal(state, action: PayloadAction<CaptivePortalConfig>) { state.captivePortals.push(action.payload); },
    updatePortal(state, action: PayloadAction<CaptivePortalConfig>) {
      const idx = state.captivePortals.findIndex(p => p.id === action.payload.id);
      if (idx !== -1) state.captivePortals[idx] = action.payload;
    },
    removePortal(state, action: PayloadAction<number>) { state.captivePortals = state.captivePortals.filter(p => p.id !== action.payload); },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIntegrations.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchIntegrations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.iamConnections = action.payload.iam;
        state.radiusConfigs = action.payload.radius;
        state.captivePortals = action.payload.portals;
      });
  }
});

export const {
  setAddIamDialogOpen, setEditIamDialogOpen, setDeleteIamDialogOpen, setSelectedIam, addIam, updateIam, removeIam,
  setAddRadiusDialogOpen, setEditRadiusDialogOpen, setDeleteRadiusDialogOpen, setSelectedRadius, addRadius, updateRadius, removeRadius,
  setAddPortalDialogOpen, setEditPortalDialogOpen, setDeletePortalDialogOpen, setSelectedPortal, addPortal, updatePortal, removePortal
} = integrationsSlice.actions;

export default integrationsSlice.reducer;
