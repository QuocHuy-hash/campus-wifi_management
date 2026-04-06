import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthPolicy } from '@/data/mockData';
import { AuthPoliciesState } from '../types';
import { policiesApi } from '../api/policiesApi';

export const loadAuthPolicies = createAsyncThunk('authPolicies/loadAuthPolicies', async () => {
  return await policiesApi.getAuthPolicies();
});

export const createAuthPolicyAsync = createAsyncThunk(
  'authPolicies/createAuthPolicy',
  async (policy: Omit<AuthPolicy, 'id'>) => {
    return await policiesApi.createAuthPolicy(policy);
  }
);

export const updateAuthPolicyAsync = createAsyncThunk('authPolicies/updateAuthPolicy', async (policy: AuthPolicy) => {
  const { id, ...payload } = policy;
  return await policiesApi.updateAuthPolicy(id, payload);
});

export const deleteAuthPolicyAsync = createAsyncThunk('authPolicies/deleteAuthPolicy', async (policyId: number) => {
  await policiesApi.deleteAuthPolicy(policyId);
  return policyId;
});

const initialState: AuthPoliciesState = {
  data: [],
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
    },
    updateAuthPolicy: (state, action: PayloadAction<AuthPolicy>) => {
      const index = state.data.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.data[index] = action.payload;
      }
    },
    deleteAuthPolicy: (state, action: PayloadAction<number>) => {
      state.data = state.data.filter(p => p.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAuthPolicies.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadAuthPolicies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(loadAuthPolicies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load auth policies';
      })
      .addCase(createAuthPolicyAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createAuthPolicyAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data.push(action.payload);
        state.addAuthPolicyDialogOpen = false;
        state.authPolicyForm = {};
        state.validationError = null;
      })
      .addCase(createAuthPolicyAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to create auth policy';
      })
      .addCase(updateAuthPolicyAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateAuthPolicyAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.data.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
        state.editAuthPolicyDialogOpen = false;
        state.selectedAuthPolicy = null;
        state.authPolicyForm = {};
        state.validationError = null;
      })
      .addCase(updateAuthPolicyAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update auth policy';
      })
      .addCase(deleteAuthPolicyAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteAuthPolicyAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = state.data.filter(p => p.id !== action.payload);
        state.deleteAuthPolicyDialogOpen = false;
        state.selectedAuthPolicy = null;
      })
      .addCase(deleteAuthPolicyAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to delete auth policy';
      });
  },
});

export const {
  setAddAuthPolicyDialogOpen, setEditAuthPolicyDialogOpen, setDeleteAuthPolicyDialogOpen,
  setSelectedAuthPolicy, setAuthPolicyForm, setValidationError,
  addAuthPolicy, updateAuthPolicy, deleteAuthPolicy
} = authPoliciesSlice.actions;

export default authPoliciesSlice.reducer;
