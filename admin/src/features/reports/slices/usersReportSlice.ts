import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WifiUser, UserSession } from '../types';
import { reportsApi } from '../api/reportsApi';

export const fetchUsersReport = createAsyncThunk('reportsUsers/fetchUsers', async () => {
  return await reportsApi.fetchWifiUsers();
});

export const fetchSessionsReport = createAsyncThunk('reportsUsers/fetchSessions', async () => {
  return await reportsApi.fetchUserSessions();
});

export interface UsersReportState {
  users: WifiUser[];
  sessions: UserSession[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  
  // Trạng thái các filter (Chuyên biệt cho tab WiFi Users)
  userSearchTerm: string;
  userGroupFilter: string;
  userRoleFilter: string;
  userCurrentPage: number;

  // Trạng thái cho tab Sessions
  sessionTimeRange: string;
  sessionUsernameFilter: string;
  sessionIpFilter: string;
  sessionMacFilter: string;
  sessionSsidFilter: string;
  sessionStatusFilter: string;
  sessionTerminateFilter: string;
  sessionCampusFilter: string;
  sessionBuildingFilter: string;
  sessionIdentityFilter: string;
  sessionCurrentPage: number;
  
  selectedUserForSessions: string | null;
}

const initialState: UsersReportState = {
  users: [],
  sessions: [],
  status: 'idle',
  
  userSearchTerm: '',
  userGroupFilter: 'all',
  userRoleFilter: 'all',
  userCurrentPage: 1,

  sessionTimeRange: 'today',
  sessionUsernameFilter: '',
  sessionIpFilter: '',
  sessionMacFilter: '',
  sessionSsidFilter: 'all',
  sessionStatusFilter: 'all',
  sessionTerminateFilter: 'all',
  sessionCampusFilter: 'all',
  sessionBuildingFilter: 'all',
  sessionIdentityFilter: '',
  sessionCurrentPage: 1,
  
  selectedUserForSessions: null,
};

const usersReportSlice = createSlice({
  name: 'reportsUsers',
  initialState,
  reducers: {
    // Actions cho WiFi Users filter
    setUserSearchTerm: (state, action: PayloadAction<string>) => { state.userSearchTerm = action.payload; state.userCurrentPage = 1; },
    setUserGroupFilter: (state, action: PayloadAction<string>) => { state.userGroupFilter = action.payload; state.userCurrentPage = 1; },
    setUserRoleFilter: (state, action: PayloadAction<string>) => { state.userRoleFilter = action.payload; state.userCurrentPage = 1; },
    toggleWifiUserStatus: (state, action: PayloadAction<number>) => {
      const targetUser = state.users.find((user) => user.id === action.payload);
      if (!targetUser) return;
      targetUser.status = targetUser.status === 'active' ? 'blocked' : 'active';
    },
    setUserCurrentPage: (state, action: PayloadAction<number>) => { state.userCurrentPage = action.payload; },
    resetUserFilters: (state) => {
      state.userSearchTerm = '';
      state.userGroupFilter = 'all';
      state.userRoleFilter = 'all';
      state.userCurrentPage = 1;
    },

    // Actions cho Sessions filter
    setSessionTimeRange: (state, action: PayloadAction<string>) => { state.sessionTimeRange = action.payload; state.sessionCurrentPage = 1; },
    setSessionUsernameFilter: (state, action: PayloadAction<string>) => { state.sessionUsernameFilter = action.payload; state.sessionCurrentPage = 1; },
    setSessionIpFilter: (state, action: PayloadAction<string>) => { state.sessionIpFilter = action.payload; state.sessionCurrentPage = 1; },
    setSessionMacFilter: (state, action: PayloadAction<string>) => { state.sessionMacFilter = action.payload; state.sessionCurrentPage = 1; },
    setSessionSsidFilter: (state, action: PayloadAction<string>) => { state.sessionSsidFilter = action.payload; state.sessionCurrentPage = 1; },
    setSessionStatusFilter: (state, action: PayloadAction<string>) => { state.sessionStatusFilter = action.payload; state.sessionCurrentPage = 1; },
    setSessionTerminateFilter: (state, action: PayloadAction<string>) => { state.sessionTerminateFilter = action.payload; state.sessionCurrentPage = 1; },
    setSessionCampusFilter: (state, action: PayloadAction<string>) => { state.sessionCampusFilter = action.payload; state.sessionBuildingFilter = 'all'; state.sessionCurrentPage = 1; },
    setSessionBuildingFilter: (state, action: PayloadAction<string>) => { state.sessionBuildingFilter = action.payload; state.sessionCurrentPage = 1; },
    setSessionIdentityFilter: (state, action: PayloadAction<string>) => { state.sessionIdentityFilter = action.payload; state.sessionCurrentPage = 1; },
    setSessionCurrentPage: (state, action: PayloadAction<number>) => { state.sessionCurrentPage = action.payload; },
    setSelectedUserForSessions: (state, action: PayloadAction<string | null>) => { state.selectedUserForSessions = action.payload; },
    resetSessionFilters: (state) => {
      state.sessionUsernameFilter = '';
      state.sessionIpFilter = '';
      state.sessionMacFilter = '';
      state.sessionSsidFilter = 'all';
      state.sessionStatusFilter = 'all';
      state.sessionTerminateFilter = 'all';
      state.selectedUserForSessions = null;
      state.sessionCurrentPage = 1;
    },
    resetSidebarSessionFilters: (state) => {
      state.sessionCampusFilter = 'all';
      state.sessionBuildingFilter = 'all';
      state.sessionIdentityFilter = '';
      state.sessionCurrentPage = 1;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUsersReport.fulfilled, (state, action) => {
      state.users = action.payload;
      state.status = 'succeeded';
    });
    builder.addCase(fetchSessionsReport.fulfilled, (state, action) => {
      state.sessions = action.payload;
    });
  }
});

export const { 
  setUserSearchTerm, setUserGroupFilter, setUserRoleFilter, toggleWifiUserStatus, setUserCurrentPage, resetUserFilters,
  setSessionTimeRange, setSessionUsernameFilter, setSessionIpFilter, setSessionMacFilter, 
  setSessionSsidFilter, setSessionStatusFilter, setSessionTerminateFilter, setSessionCurrentPage,
  setSelectedUserForSessions, resetSessionFilters,
  setSessionCampusFilter, setSessionBuildingFilter, setSessionIdentityFilter, resetSidebarSessionFilters
} = usersReportSlice.actions;

export default usersReportSlice.reducer;
