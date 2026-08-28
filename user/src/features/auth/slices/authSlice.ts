import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchActiveProviders,
  forgotPassword,
  registerUser,
  resendOtp,
  resetPassword,
  verifyResetOtp,
  verifyUserEmail,
} from "@/features/auth/api/authApi";
import i18n from "@/i18n";
import type {
  ForgotPasswordPayload,
  ProviderConfig,
  RegisterPayload,
  RegisterResult,
  ResetPasswordPayload,
  VerifyOtpPayload,
  VerifyResetOtpPayload,
  VerifyResetOtpResult,
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
  forgotLoading: boolean;
  forgotToken: string | null;
}

const initialState: AuthState = {
  providers: [],
  providersLoading: false,
  otpIdentifier: "",
  registerLoading: false,
  verifyLoading: false,
  resendLoading: false,
  error: null,
  forgotLoading: false,
  forgotToken: null,
};

/**
 * Chuyển đổi error message từ API sang tiếng Việt
 */
function translateErrorMessage(message: string): string {
  if (message.includes("OTP_RESEND_RATE_LIMITED")) {
    return i18n.t("errors.otpRateLimited");
  }
  if (message.includes("OTP_INVALID_OR_EXPIRED") || message.includes("OTP is invalid or expired")) {
    return i18n.t("errors.otpInvalid");
  }
  if (message.includes("TOKEN_INVALID") || message.includes("token is invalid")) {
    return i18n.t("errors.resetTokenInvalid");
  }
  if (message.includes("USER_NOT_FOUND") || message.includes("not found")) {
    return i18n.t("errors.accountNotFound");
  }
  if (message.includes("rate limit") || message.includes("too many")) {
    return i18n.t("errors.tooManyRequests");
  }
  return message;
}

export function extractErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const maybeAxios = error as {
      response?: {
        status?: number;
        data?: {
          code?: number;
          message?: string;
          error?: string;
        };
      };
      message?: string;
    };

    const status = maybeAxios.response?.status;
    const data = maybeAxios.response?.data;
    const rawMessage = data?.message || data?.error || maybeAxios.message;

    // Xử lý lỗi HTTP
    if (status === 404) {
      return i18n.t("errors.serverNotFound");
    }
    if (status === 429) {
      return translateErrorMessage(rawMessage || "");
    }
    if (status === 500) {
      return i18n.t("errors.serverInternal");
    }
    if (status === 502 || status === 503) {
      return i18n.t("errors.serverMaintenance");
    }

    // Xử lý lỗi theo business code
    if (data?.code === 6009) {
      return i18n.t("errors.otpInvalid");
    }
    if (data?.code === 6004) {
      return i18n.t("errors.currentPasswordWrong");
    }

    // Dịch message từ API nếu có
    if (rawMessage) {
      return translateErrorMessage(rawMessage);
    }

    return i18n.t("errors.system");
  }

  return i18n.t("errors.system");
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

export const sendForgotOtp = createAsyncThunk<void, ForgotPasswordPayload>(
  "auth/sendForgotOtp",
  async (payload, { rejectWithValue }) => {
    try {
      await forgotPassword(payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const verifyForgotOtp = createAsyncThunk<
  VerifyResetOtpResult,
  VerifyResetOtpPayload
>(
  "auth/verifyForgotOtp",
  async (payload, { rejectWithValue }) => {
    try {
      return await verifyResetOtp(payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const submitResetPassword = createAsyncThunk<void, ResetPasswordPayload>(
  "auth/submitResetPassword",
  async (payload, { rejectWithValue }) => {
    try {
      await resetPassword(payload);
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
    clearForgotToken: (state) => {
      state.forgotToken = null;
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
        state.error = String(action.payload || i18n.t("errors.providerLoadFailed"));
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
        state.error = String(action.payload || i18n.t("errors.registerFailed"));
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
        state.error = String(action.payload || i18n.t("errors.verifyOtpFailed"));
      })
      .addCase(resendEmailOtp.pending, (state) => {
        state.resendLoading = true;
      })
      .addCase(resendEmailOtp.fulfilled, (state) => {
        state.resendLoading = false;
      })
      .addCase(resendEmailOtp.rejected, (state, action) => {
        state.resendLoading = false;
        state.error = String(action.payload || i18n.t("errors.resendOtpFailed"));
      })
      .addCase(sendForgotOtp.pending, (state) => {
        state.forgotLoading = true;
        state.error = null;
      })
      .addCase(sendForgotOtp.fulfilled, (state) => {
        state.forgotLoading = false;
      })
      .addCase(sendForgotOtp.rejected, (state, action) => {
        state.forgotLoading = false;
        state.error = String(action.payload || i18n.t("errors.sendOtpFailed"));
      })
      .addCase(verifyForgotOtp.pending, (state) => {
        state.forgotLoading = true;
        state.error = null;
      })
      .addCase(verifyForgotOtp.fulfilled, (state, action) => {
        state.forgotLoading = false;
        state.forgotToken = action.payload;
      })
      .addCase(verifyForgotOtp.rejected, (state, action) => {
        state.forgotLoading = false;
        state.error = String(action.payload || i18n.t("errors.verifyOtpFailed"));
      })
      .addCase(submitResetPassword.pending, (state) => {
        state.forgotLoading = true;
        state.error = null;
      })
      .addCase(submitResetPassword.fulfilled, (state) => {
        state.forgotLoading = false;
        state.forgotToken = null;
      })
      .addCase(submitResetPassword.rejected, (state, action) => {
        state.forgotLoading = false;
        state.error = String(action.payload || i18n.t("errors.resetPasswordFailed"));
      });
  },
});

export const { clearAuthError, clearForgotToken, setOtpEmail } = authSlice.actions;
export default authSlice.reducer;
