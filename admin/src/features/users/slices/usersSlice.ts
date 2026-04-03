import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, WifiPolicy, MeResponse, ChangePasswordRequest, LinkProviderRequest } from '../types';
import * as api from '../api/usersApi';

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const getUsers = createAsyncThunk(
  'users/fetchUsers',
  async (role?: string | null) => api.fetchUsers(role),
);

export const getPolicies = createAsyncThunk(
  'users/fetchPolicies',
  async () => api.fetchPolicies(),
);

export const addNewUser = createAsyncThunk(
  'users/addUser',
  async (user: Omit<User, 'id' | 'created' | 'linkedAccounts'>) => api.addUser(user),
);

export const editUser = createAsyncThunk(
  'users/editUser',
  async (user: User) => api.updateUser(user),
);

export const removeUser = createAsyncThunk(
  'users/removeUser',
  async (userId: number) => {
    await api.deleteUser(userId);
    return userId;
  },
);

export const applyPolicyToUser = createAsyncThunk(
  'users/applyPolicy',
  async ({ userId, policyData }: { userId: number; policyData: Partial<User> }) =>
    api.assignPolicy(userId, policyData),
);

// ─── V4 Auth thunks ──────────────────────────────────────────────────────────

/** GET /api/v1/auth/me — profile + linked OAuth providers */
export const getMe = createAsyncThunk('users/getMe', async () => api.fetchMe());

/** POST /api/v1/auth/change-password */
export const updatePassword = createAsyncThunk(
  'users/changePassword',
  async (data: ChangePasswordRequest) => api.changePassword(data),
);

/** POST /api/v1/auth/link-provider */
export const addLinkedProvider = createAsyncThunk(
  'users/linkProvider',
  async (data: LinkProviderRequest) => api.linkProvider(data),
);

// ─── State ───────────────────────────────────────────────────────────────────

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

  // V4: current admin profile
  me: MeResponse | null;
  meLoading: boolean;
  meError: string | null;

  // V4: change-password / link-provider action status
  authActionLoading: boolean;
  authActionError: string | null;
  authActionSuccess: boolean;
}

const createInitialDialogs = (): DialogState => ({
  viewOpen: false,
  editOpen: false,
  deleteOpen: false,
  policyOpen: false,
  addOpen: false,
});

const initialState: UsersState = {
  users: [],
  policies: [],
  loading: false,
  error: null,
  searchTerm: '',
  selectedRole: null,
  dialogs: createInitialDialogs(),
  selectedUser: null,

  me: null,
  meLoading: false,
  meError: null,

  authActionLoading: false,
  authActionError: null,
  authActionSuccess: false,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSelectedRole: (state, action: PayloadAction<string | null>) => {
      state.selectedRole = action.payload;
    },
    openDialog: (state, action: PayloadAction<{ dialog: keyof DialogState; user?: User }>) => {
      state.dialogs = createInitialDialogs();
      state.dialogs[action.payload.dialog] = true;
      if (action.payload.user) {
        state.selectedUser = action.payload.user;
      } else if (action.payload.dialog !== 'addOpen') {
        state.selectedUser = null;
      }
    },
    closeDialog: (state, action: PayloadAction<keyof DialogState>) => {
      state.dialogs[action.payload] = false;
      if (action.payload !== 'addOpen') state.selectedUser = null;
    },
    closeAllDialogs: (state) => {
      state.dialogs = createInitialDialogs();
      state.selectedUser = null;
    },
    /** Reset trạng thái sau khi hiển thị kết quả change-password / link-provider */
    resetAuthAction: (state) => {
      state.authActionLoading = false;
      state.authActionError = null;
      state.authActionSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch Users ──────────────────────────────────────────────────────
      .addCase(getUsers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getUsers.fulfilled, (state, action) => { state.loading = false; state.users = action.payload; })
      .addCase(getUsers.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? null; })

      // ── Fetch Policies ───────────────────────────────────────────────────
      .addCase(getPolicies.fulfilled, (state, action) => { state.policies = action.payload; })

      // ── Add User ─────────────────────────────────────────────────────────
      .addCase(addNewUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
        state.dialogs.addOpen = false;
      })

      // ── Edit User ─────────────────────────────────────────────────────────
      .addCase(editUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex(u => u.id === action.payload.id);
        if (idx !== -1) state.users[idx] = action.payload;
        state.dialogs.editOpen = false;
        state.selectedUser = null;
      })

      // ── Remove User ───────────────────────────────────────────────────────
      .addCase(removeUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload);
        state.dialogs.deleteOpen = false;
        state.selectedUser = null;
      })

      // ── Apply Policy ─────────────────────────────────────────────────────
      .addCase(applyPolicyToUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex(u => u.id === action.payload.id);
        if (idx !== -1) state.users[idx] = action.payload;
        state.dialogs.policyOpen = false;
        state.selectedUser = null;
      })

      // ── V4: getMe ────────────────────────────────────────────────────────
      .addCase(getMe.pending, (state) => { state.meLoading = true; state.meError = null; })
      .addCase(getMe.fulfilled, (state, action) => { state.meLoading = false; state.me = action.payload; })
      .addCase(getMe.rejected, (state, action) => { state.meLoading = false; state.meError = action.error.message ?? null; })

      // ── V4: updatePassword ───────────────────────────────────────────────
      .addCase(updatePassword.pending, (state) => { state.authActionLoading = true; state.authActionError = null; state.authActionSuccess = false; })
      .addCase(updatePassword.fulfilled, (state) => { state.authActionLoading = false; state.authActionSuccess = true; })
      .addCase(updatePassword.rejected, (state, action) => { state.authActionLoading = false; state.authActionError = action.error.message ?? null; })

      // ── V4: addLinkedProvider ────────────────────────────────────────────
      .addCase(addLinkedProvider.pending, (state) => { state.authActionLoading = true; state.authActionError = null; state.authActionSuccess = false; })
      .addCase(addLinkedProvider.fulfilled, (state) => { state.authActionLoading = false; state.authActionSuccess = true; })
      .addCase(addLinkedProvider.rejected, (state, action) => { state.authActionLoading = false; state.authActionError = action.error.message ?? null; });
  },
});

export const {
  setSearchTerm,
  setSelectedRole,
  openDialog,
  closeDialog,
  closeAllDialogs,
  resetAuthAction,
} = usersSlice.actions;

export default usersSlice.reducer;
