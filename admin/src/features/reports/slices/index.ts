import { combineReducers } from '@reduxjs/toolkit';
import filtersReducer from './filtersSlice';
import usersReportReducer from './usersReportSlice';
import bandwidthReportReducer from './bandwidthReportSlice';
import infrastructureReportReducer from './infrastructureReportSlice';
import violationsReportReducer from './violationsReportSlice';
import sessionsReportReducer from './sessionsReportSlice';
import incidentsReportReducer from './incidentsReportSlice';
import logsReportReducer from './logsReportSlice';

export const reportsReducer = combineReducers({
  filters: filtersReducer,
  users: usersReportReducer,
  bandwidth: bandwidthReportReducer,
  infrastructure: infrastructureReportReducer,
  violations: violationsReportReducer,
  sessions: sessionsReportReducer,
  incidents: incidentsReportReducer,
  logs: logsReportReducer,
});
