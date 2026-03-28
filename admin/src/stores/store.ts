import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/slices/authSlice';
import dashboardReducer from '../features/dashboard/slices/dashboardSlice';
import usersReducer from '../features/users/slices/usersSlice';
import accessPointsReducer from '../features/access-points/slices/accessPointsSlice';
import { settingsReducer } from '../features/settings/slices';
import { reportsReducer } from '../features/reports/slices';
import policiesReducer from '../features/policies/slices';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    accessPoints: accessPointsReducer,
    settings: settingsReducer,
    reports: reportsReducer,
    policies: policiesReducer,
    auth: authReducer,
    dashboard: dashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
