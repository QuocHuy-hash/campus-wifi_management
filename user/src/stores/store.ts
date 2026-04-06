import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/slices/authSlice";
import userProfileReducer from "@/features/user/slices/userProfileSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    userProfile: userProfileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
