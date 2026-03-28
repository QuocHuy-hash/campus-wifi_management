import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { adminApi } from '../api/adminApi';
import { AdminUser } from '../types';

interface AdminState {
  admins: AdminUser[];
  roles: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  
  // UI State
  searchQuery: string;
  addDialogOpen: boolean;
  editDialogOpen: boolean;
  deleteDialogOpen: boolean;
  selectedAdmin: AdminUser | null;
}

const initialState: AdminState = {
  admins: [],
  roles: [],
  status: 'idle',
  error: null,
  searchQuery: '',
  addDialogOpen: false,
  editDialogOpen: false,
  deleteDialogOpen: false,
  selectedAdmin: null,
};

export const fetchAdmins = createAsyncThunk('settingsAdmin/fetchAdmins', async () => {
  return await adminApi.getAdmins();
});

export const fetchRoles = createAsyncThunk('settingsAdmin/fetchRoles', async () => {
  return await adminApi.getRoles();
});

const adminSlice = createSlice({
  name: 'settingsAdmin',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setAddDialogOpen(state, action: PayloadAction<boolean>) {
      state.addDialogOpen = action.payload;
    },
    setEditDialogOpen(state, action: PayloadAction<boolean>) {
      state.editDialogOpen = action.payload;
    },
    setDeleteDialogOpen(state, action: PayloadAction<boolean>) {
      state.deleteDialogOpen = action.payload;
    },
    setSelectedAdmin(state, action: PayloadAction<AdminUser | null>) {
      state.selectedAdmin = action.payload;
    },
    addAdmin(state, action: PayloadAction<AdminUser>) {
      state.admins.push(action.payload);
    },
    updateAdmin(state, action: PayloadAction<AdminUser>) {
      const index = state.admins.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.admins[index] = action.payload;
      }
    },
    removeAdmin(state, action: PayloadAction<number>) {
      state.admins = state.admins.filter(a => a.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdmins.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.admins = action.payload;
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed';
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.roles = action.payload;
      });
  }
});

export const {
  setSearchQuery,
  setAddDialogOpen,
  setEditDialogOpen,
  setDeleteDialogOpen,
  setSelectedAdmin,
  addAdmin,
  updateAdmin,
  removeAdmin
} = adminSlice.actions;

export default adminSlice.reducer;
