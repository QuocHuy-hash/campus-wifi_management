import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { adminApi } from '../api/adminApi';
import { UserGroup, Permission } from '../types';

interface SecurityState {
  groups: UserGroup[];
  resources: string[];
  allowedIps: string[];
  
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  
  // Group UI
  addGroupDialogOpen: boolean;
  editGroupDialogOpen: boolean;
  deleteGroupDialogOpen: boolean;
  selectedGroup: UserGroup | null;
  
  // Resource UI
  managePermissionsOpen: boolean;
  deleteResourceDialogOpen: boolean;
  selectedResource: string | null;
}

const initialState: SecurityState = {
  groups: [],
  resources: [],
  allowedIps: ['192.168.1.10', '192.168.1.15', '10.0.0.50/24'], // Extracted from Settings.tsx
  status: 'idle',
  error: null,
  
  addGroupDialogOpen: false,
  editGroupDialogOpen: false,
  deleteGroupDialogOpen: false,
  selectedGroup: null,
  
  managePermissionsOpen: false,
  deleteResourceDialogOpen: false,
  selectedResource: null,
};

export const fetchGroups = createAsyncThunk('settingsSecurity/fetchGroups', async () => {
  return await adminApi.getGroups();
});

export const fetchResources = createAsyncThunk('settingsSecurity/fetchResources', async () => {
  return await adminApi.getResources();
});

const securitySlice = createSlice({
  name: 'settingsSecurity',
  initialState,
  reducers: {
    // IPs
    addAllowedIp(state, action: PayloadAction<string>) {
      if (!state.allowedIps.includes(action.payload)) {
        state.allowedIps.push(action.payload);
      }
    },
    removeAllowedIp(state, action: PayloadAction<string>) {
      state.allowedIps = state.allowedIps.filter(ip => ip !== action.payload);
    },
    
    // Group UI
    setAddGroupDialogOpen(state, action: PayloadAction<boolean>) { state.addGroupDialogOpen = action.payload; },
    setEditGroupDialogOpen(state, action: PayloadAction<boolean>) { state.editGroupDialogOpen = action.payload; },
    setDeleteGroupDialogOpen(state, action: PayloadAction<boolean>) { state.deleteGroupDialogOpen = action.payload; },
    setSelectedGroup(state, action: PayloadAction<UserGroup | null>) { state.selectedGroup = action.payload; },
    
    // Group Data
    addGroup(state, action: PayloadAction<UserGroup>) { state.groups.push(action.payload); },
    updateGroup(state, action: PayloadAction<UserGroup>) {
      const idx = state.groups.findIndex(g => g.id === action.payload.id);
      if (idx !== -1) state.groups[idx] = action.payload;
    },
    removeGroup(state, action: PayloadAction<number>) {
      state.groups = state.groups.filter(g => g.id !== action.payload);
    },
    
    // Resource UI
    setManagePermissionsOpen(state, action: PayloadAction<boolean>) { state.managePermissionsOpen = action.payload; },
    setDeleteResourceDialogOpen(state, action: PayloadAction<boolean>) { state.deleteResourceDialogOpen = action.payload; },
    setSelectedResource(state, action: PayloadAction<string | null>) { state.selectedResource = action.payload; },
    
    // Resource Data
    addResource(state, action: PayloadAction<string>) {
      if (!state.resources.includes(action.payload)) {
        state.resources.push(action.payload);
        // Add to existing groups
        state.groups.forEach(g => {
          g.permissions.push({ resource: action.payload, canView: false, canEdit: false });
        });
      }
    },
    updateResource(state, action: PayloadAction<{ oldName: string; newName: string }>) {
      const idx = state.resources.indexOf(action.payload.oldName);
      if (idx !== -1 && !state.resources.includes(action.payload.newName)) {
        state.resources[idx] = action.payload.newName;
        state.groups.forEach(g => {
          const pIdx = g.permissions.findIndex(p => p.resource === action.payload.oldName);
          if (pIdx !== -1) g.permissions[pIdx].resource = action.payload.newName;
        });
      }
    },
    removeResource(state, action: PayloadAction<string>) {
      state.resources = state.resources.filter(r => r !== action.payload);
      state.groups.forEach(g => {
        g.permissions = g.permissions.filter(p => p.resource !== action.payload);
      });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroups.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.groups = action.payload;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.resources = action.payload;
      });
  }
});

export const {
  addAllowedIp, removeAllowedIp,
  setAddGroupDialogOpen, setEditGroupDialogOpen, setDeleteGroupDialogOpen, setSelectedGroup,
  addGroup, updateGroup, removeGroup,
  setManagePermissionsOpen, setDeleteResourceDialogOpen, setSelectedResource,
  addResource, updateResource, removeResource
} = securitySlice.actions;

export default securitySlice.reducer;
