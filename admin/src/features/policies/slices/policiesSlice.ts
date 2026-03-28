import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialPolicies, WifiPolicy } from '@/data/mockData';
import { PoliciesState } from '../types';

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
    
    // CRUD Operations
    addPolicy: (state, action: PayloadAction<WifiPolicy>) => {
      state.data.push(action.payload);
      state.addPolicyDialogOpen = false;
      state.policyForm = {};
    },
    updatePolicy: (state, action: PayloadAction<WifiPolicy>) => {
      const index = state.data.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.data[index] = action.payload;
      }
      state.editPolicyDialogOpen = false;
      state.selectedPolicy = null;
      state.policyForm = {};
    },
    deletePolicy: (state, action: PayloadAction<number>) => {
      state.data = state.data.filter(p => p.id !== action.payload);
      state.deletePolicyDialogOpen = false;
      state.selectedPolicy = null;
    },
  },
});

export const {
  setFilterRole, setFilterArea, setFilterTime, setFilterController, setFilterSearch, resetFilters,
  setAddPolicyDialogOpen, setEditPolicyDialogOpen, setDeletePolicyDialogOpen,
  setSelectedPolicy, setPolicyForm,
  addPolicy, updatePolicy, deletePolicy
} = policiesSlice.actions;

export default policiesSlice.reducer;
