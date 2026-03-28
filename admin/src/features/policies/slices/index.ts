import { combineReducers } from '@reduxjs/toolkit';
import policiesReducer from './policiesSlice';
import authPoliciesReducer from './authPoliciesSlice';

export const rootPoliciesReducer = combineReducers({
  policies: policiesReducer,
  authPolicies: authPoliciesReducer,
});

export default rootPoliciesReducer;
