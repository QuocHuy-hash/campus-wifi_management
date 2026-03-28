import { combineReducers } from '@reduxjs/toolkit';
import adminReducer from './adminSlice';
import securityReducer from './securitySlice';
import areasReducer from './areasSlice';
import devicesReducer from './devicesSlice';
import integrationsReducer from './integrationsSlice';
import logsReducer from './logsSlice';

export const settingsReducer = combineReducers({
  admin: adminReducer,
  security: securityReducer,
  areas: areasReducer,
  devices: devicesReducer,
  integrations: integrationsReducer,
  logs: logsReducer,
});

export type SettingsState = ReturnType<typeof settingsReducer>;
