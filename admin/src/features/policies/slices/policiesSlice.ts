import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialPolicies, WifiPolicy } from '@/data/mockData';
import { PoliciesState } from '../types';
import { policiesApi } from '../api/policiesApi';

export const loadWifiPolicies = createAsyncThunk(
  'policies/loadWifiPolicies',
  async (type?: 'bandwidth' | 'audit') => {
    return await policiesApi.getWifiPolicies(type);
  }
);

export const createWifiPolicyAsync = createAsyncThunk(
  'policies/createWifiPolicy',
  async (policy: Omit<WifiPolicy, 'id'>) => {
    return await policiesApi.createWifiPolicy(policy);
  }
);

export const updateWifiPolicyAsync = createAsyncThunk('policies/updateWifiPolicy', async (policy: WifiPolicy) => {
  const { id, ...payload } = policy;
  return await policiesApi.updateWifiPolicy(id, payload);
});

export const deleteWifiPolicyAsync = createAsyncThunk('policies/deleteWifiPolicy', async (policyId: number) => {
  await policiesApi.deleteWifiPolicy(policyId);
  return policyId;
});

const initialState: PoliciesState = {
  data: initialPolicies,
  status: 'idle',
  error: null,
  
  filterRole: 'all',
  filterArea: 'all',
  filterTime: 'all',
  filterController: 'all',
  filterSearch: '',
  
  addPolicyDialogOpen: false,
  editPolicyDialogOpen: false,
  deletePolicyDialogOpen: false,
  selectedPolicy: null,
  policyForm: {},
};

const policiesSlice = createSlice({
  name: 'policies',
  initialState,
  reducers: {
    // Filters
    setFilterRole: (state, action: PayloadAction<string>) => { state.filterRole = action.payload; },
    setFilterArea: (state, action: PayloadAction<string>) => { state.filterArea = action.payload; },
    setFilterTime: (state, action: PayloadAction<string>) => { state.filterTime = action.payload; },
    setFilterController: (state, action: PayloadAction<string>) => { state.filterController = action.payload; },
    setFilterSearch: (state, action: PayloadAction<string>) => { state.filterSearch = action.payload; },
    resetFilters: (state) => {
      state.filterRole = 'all';
      state.filterArea = 'all';
      state.filterTime = 'all';
      state.filterController = 'all';
      state.filterSearch = '';
    },
    
    // Dialog Triggers
    setAddPolicyDialogOpen: (state, action: PayloadAction<boolean>) => { state.addPolicyDialogOpen = action.payload; },
    setEditPolicyDialogOpen: (state, action: PayloadAction<boolean>) => { state.editPolicyDialogOpen = action.payload; },
    setDeletePolicyDialogOpen: (state, action: PayloadAction<boolean>) => { state.deletePolicyDialogOpen = action.payload; },
    
    // Form Selection
    setSelectedPolicy: (state, action: PayloadAction<WifiPolicy | null>) => { state.selectedPolicy = action.payload; },
    setPolicyForm: (state, action: PayloadAction<Partial<WifiPolicy>>) => { state.policyForm = action.payload; },
    
    // Local-only updates (kept for compatibility)
    addPolicy: (state, action: PayloadAction<WifiPolicy>) => {
      state.data.push(action.payload);
    },
    updatePolicy: (state, action: PayloadAction<WifiPolicy>) => {
      const index = state.data.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.data[index] = action.payload;
      }
    },
    deletePolicy: (state, action: PayloadAction<number>) => {
      state.data = state.data.filter(p => p.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadWifiPolicies.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadWifiPolicies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(loadWifiPolicies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load wifi policies';
      })
      .addCase(createWifiPolicyAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createWifiPolicyAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data.push(action.payload);
        state.addPolicyDialogOpen = false;
        state.policyForm = {};
      })
      .addCase(createWifiPolicyAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to create wifi policy';
      })
      .addCase(updateWifiPolicyAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateWifiPolicyAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.data.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
        state.editPolicyDialogOpen = false;
        state.selectedPolicy = null;
        state.policyForm = {};
      })
      .addCase(updateWifiPolicyAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update wifi policy';
      })
      .addCase(deleteWifiPolicyAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteWifiPolicyAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = state.data.filter(p => p.id !== action.payload);
        state.deletePolicyDialogOpen = false;
        state.selectedPolicy = null;
      })
      .addCase(deleteWifiPolicyAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to delete wifi policy';
      });
  },
});

export const {
  setFilterRole, setFilterArea, setFilterTime, setFilterController, setFilterSearch, resetFilters,
  setAddPolicyDialogOpen, setEditPolicyDialogOpen, setDeletePolicyDialogOpen,
  setSelectedPolicy, setPolicyForm,
  addPolicy, updatePolicy, deletePolicy
} = policiesSlice.actions;

export default policiesSlice.reducer;
