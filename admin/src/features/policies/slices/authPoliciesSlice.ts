import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialAuthPolicies, AuthPolicy } from '@/data/mockData';
import { AuthPoliciesState } from '../types';

const initialState: AuthPoliciesState = {
  data: initialAuthPolicies,
  status: 'idle',
  error: null,

  addAuthPolicyDialogOpen: false,
  editAuthPolicyDialogOpen: false,
  deleteAuthPolicyDialogOpen: false,
  selectedAuthPolicy: null,
  authPolicyForm: {},
  validationError: null,
};

const authPoliciesSlice = createSlice({
  name: 'authPolicies',
  initialState,
  reducers: {
    setAddAuthPolicyDialogOpen: (state, action: PayloadAction<boolean>) => { state.addAuthPolicyDialogOpen = action.payload; },
    setEditAuthPolicyDialogOpen: (state, action: PayloadAction<boolean>) => { state.editAuthPolicyDialogOpen = action.payload; },
    setDeleteAuthPolicyDialogOpen: (state, action: PayloadAction<boolean>) => { state.deleteAuthPolicyDialogOpen = action.payload; },
    
    setSelectedAuthPolicy: (state, action: PayloadAction<AuthPolicy | null>) => { state.selectedAuthPolicy = action.payload; },
    setAuthPolicyForm: (state, action: PayloadAction<Partial<AuthPolicy>>) => { state.authPolicyForm = action.payload; },
    setValidationError: (state, action: PayloadAction<string | null>) => { state.validationError = action.payload; },
    
    addAuthPolicy: (state, action: PayloadAction<AuthPolicy>) => {
      state.data.push(action.payload);
      state.addAuthPolicyDialogOpen = false;
      state.authPolicyForm = {};
      state.validationError = null;
    },
    updateAuthPolicy: (state, action: PayloadAction<AuthPolicy>) => {
      const index = state.data.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.data[index] = action.payload;
      }
      state.editAuthPolicyDialogOpen = false;
      state.selectedAuthPolicy = null;
      state.authPolicyForm = {};
      state.validationError = null;
    },
    deleteAuthPolicy: (state, action: PayloadAction<number>) => {
      state.data = state.data.filter(p => p.id !== action.payload);
      state.deleteAuthPolicyDialogOpen = false;
      state.selectedAuthPolicy = null;
    },
  },
});

export const {
  setAddAuthPolicyDialogOpen, setEditAuthPolicyDialogOpen, setDeleteAuthPolicyDialogOpen,
  setSelectedAuthPolicy, setAuthPolicyForm, setValidationError,
  addAuthPolicy, updateAuthPolicy, deleteAuthPolicy
} = authPoliciesSlice.actions;

export default authPoliciesSlice.reducer;
