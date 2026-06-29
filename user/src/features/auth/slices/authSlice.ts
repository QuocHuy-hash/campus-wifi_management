import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchActiveProviders,
  registerUser,
  resendOtp,
  verifyUserEmail,
} from "@/features/auth/api/authApi";
import type {
  ProviderConfig,
  RegisterPayload,
  RegisterResult,
  VerifyOtpPayload,
  VerifyOtpResult,
} from "@/features/auth/types";

interface AuthState {
  providers: ProviderConfig[];
  providersLoading: boolean;
  otpIdentifier: string;
  registerLoading: boolean;
  verifyLoading: boolean;
  resendLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  providers: [],
  providersLoading: false,
  otpIdentifier: "",
  registerLoading: false,
  verifyLoading: false,
  resendLoading: false,
  error: null,
};

export function extractErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const maybeAxios = error as {
      response?: { status?: number; data?: { message?: string } };
      message?: string;
    };

    const status = maybeAxios.response?.status;

    if (status === 404) {
      return "Không tìm thấy servidor. Vui lòng thử lại sau.";
    }

    if (status === 500) {
      return "Lỗi servidor nội bộ. Vui lòng thử lại sau.";
    }

    if (status === 502 || status === 503) {
      return "Servidor đang bảo trì. Vui lòng thử lại sau.";
    }

    return (
      maybeAxios.response?.data?.message || maybeAxios.message || "Đã xảy ra lỗi hệ thống"
    );
  }

  return "Đã xảy ra lỗi hệ thống";
}

export const getActiveProviders = createAsyncThunk(
  "auth/getActiveProviders",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchActiveProviders();
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const registerWithOtp = createAsyncThunk<RegisterResult, RegisterPayload>(
  "auth/registerWithOtp",
  async (payload, { rejectWithValue }) => {
    try {
      return await registerUser(payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const verifyEmailOtp = createAsyncThunk<VerifyOtpResult, VerifyOtpPayload>(
  "auth/verifyEmailOtp",
  async (payload, { rejectWithValue }) => {
    try {
      return await verifyUserEmail(payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const resendEmailOtp = createAsyncThunk<void, { identifier: string }>(
  "auth/resendEmailOtp",
  async (payload, { rejectWithValue }) => {
    try {
      await resendOtp(payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    setOtpEmail: (state, action: { payload: string }) => {
      state.otpIdentifier = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getActiveProviders.pending, (state) => {
        state.providersLoading = true;
      })
      .addCase(getActiveProviders.fulfilled, (state, action) => {
        state.providersLoading = false;
        state.providers = action.payload;
      })
      .addCase(getActiveProviders.rejected, (state, action) => {
        state.providersLoading = false;
        state.error = String(action.payload || "Không thể tải danh sách provider");
      })
      .addCase(registerWithOtp.pending, (state) => {
        state.registerLoading = true;
        state.error = null;
      })
      .addCase(registerWithOtp.fulfilled, (state, action) => {
        state.registerLoading = false;
        state.otpIdentifier = action.payload.email || "";
      })
      .addCase(registerWithOtp.rejected, (state, action) => {
        state.registerLoading = false;
        state.error = String(action.payload || "Đăng ký thất bại");
      })
      .addCase(verifyEmailOtp.pending, (state) => {
        state.verifyLoading = true;
        state.error = null;
      })
      .addCase(verifyEmailOtp.fulfilled, (state) => {
        state.verifyLoading = false;
      })
      .addCase(verifyEmailOtp.rejected, (state, action) => {
        state.verifyLoading = false;
        state.error = String(action.payload || "Xác thực OTP thất bại");
      })
      .addCase(resendEmailOtp.pending, (state) => {
        state.resendLoading = true;
      })
      .addCase(resendEmailOtp.fulfilled, (state) => {
        state.resendLoading = false;
      })
      .addCase(resendEmailOtp.rejected, (state, action) => {
        state.resendLoading = false;
        state.error = String(action.payload || "Gửi lại OTP thất bại");
      });
  },
});

export const { clearAuthError, setOtpEmail } = authSlice.actions;
export default authSlice.reducer;
