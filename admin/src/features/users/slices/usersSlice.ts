import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, WifiPolicy } from '../types';
import * as api from '../api/usersApi';

export const getUsers = createAsyncThunk('users/fetchUsers', async () => await api.fetchUsers());
export const getPolicies = createAsyncThunk('users/fetchPolicies', async () => await api.fetchPolicies());

export const addNewUser = createAsyncThunk('users/addUser', async (user: Omit<User, 'id'>) => {
  return await api.addUser(user);
});

export const editUser = createAsyncThunk('users/editUser', async (user: User) => {
  return await api.updateUser(user);
});

export const removeUser = createAsyncThunk('users/removeUser', async (userId: number) => {
  await api.deleteUser(userId);
  return userId;
});

export const applyPolicyToUser = createAsyncThunk('users/applyPolicy', async ({ userId, policyData }: { userId: number, policyData: Partial<User> }) => {
  return await api.assignPolicy(userId, policyData);
});

interface DialogState {
  viewOpen: boolean;
  editOpen: boolean;
  deleteOpen: boolean;
  policyOpen: boolean;
  addOpen: boolean;
}

interface UsersState {
  users: User[];
  policies: WifiPolicy[];
  loading: boolean;
  error: string | null;
  
  searchTerm: string;
  selectedRole: string | null;

  dialogs: DialogState;
  selectedUser: User | null;
}

const initialState: UsersState = {
  users: [],
  policies: [],
  loading: false,
  error: null,
  searchTerm: '',
  selectedRole: null,
  dialogs: {
    viewOpen: false,
    editOpen: false,
    deleteOpen: false,
    policyOpen: false,
    addOpen: false,
  },
  selectedUser: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => { state.searchTerm = action.payload; },
    setSelectedRole: (state, action: PayloadAction<string | null>) => { state.selectedRole = action.payload; },
    openDialog: (state, action: PayloadAction<{ dialog: keyof DialogState; user?: User }>) => {
      // close all dialogs first
      state.dialogs = initialState.dialogs;
      state.dialogs[action.payload.dialog] = true;
      if (action.payload.user) {
        state.selectedUser = action.payload.user;
      } else if (action.payload.dialog !== 'addOpen') {
        state.selectedUser = null;
      }
    },
    closeDialog: (state, action: PayloadAction<keyof DialogState>) => {
      state.dialogs[action.payload] = false;
      if (action.payload !== 'addOpen') {
        state.selectedUser = null;
      }
    },
    closeAllDialogs: (state) => {
      state.dialogs = initialState.dialogs;
      state.selectedUser = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(getUsers.pending, (state) => { state.loading = true; })
      .addCase(getUsers.fulfilled, (state, action) => { state.loading = false; state.users = action.payload; })
      .addCase(getUsers.rejected, (state, action) => { state.loading = false; state.error = action.error.message || null; })
      // Fetch Policies
      .addCase(getPolicies.fulfilled, (state, action) => { state.policies = action.payload; })
      // Add User
      .addCase(addNewUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
        state.dialogs.addOpen = false;
      })
      // Edit User
      .addCase(editUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) state.users[index] = action.payload;
        state.dialogs.editOpen = false;
        state.selectedUser = null;
      })
      // Remove User
      .addCase(removeUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload);
        state.dialogs.deleteOpen = false;
        state.selectedUser = null;
      })
      // Apply Policy
      .addCase(applyPolicyToUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) state.users[index] = action.payload;
        state.dialogs.policyOpen = false;
        state.selectedUser = null;
      });
  }
});

export const { setSearchTerm, setSelectedRole, openDialog, closeDialog, closeAllDialogs } = usersSlice.actions;
export default usersSlice.reducer;
