import axios from "axios";
import apiClient from "@/config/axios";
import { API_BASE_URL } from "@/config/api";
import { API_HEADERS, HTTP_CONFIG } from "@/constants/appKeys";
import { getOrCreateAuthDeviceId } from "@/lib/deviceId";
import {
  type AuthorizeDevicePayload,
  type AuthorizeDeviceApiPayload,
  type ApiEnvelope,
  type ForgotPasswordPayload,
  type InitSessionPayload,
  type InitSessionResult,
  type LoginCredentials,
  type LoginPayload,
  type LoginResult,
  type MeResponse,
  type OAuth2InitializePayload,
  type OAuth2InitializeResponse,
  type ProviderConfig,
  type RegisterPayload,
  type RegisterResult,
  type ResetPasswordPayload,
  type ResendOtpPayload,
  type VerifyOtpPayload,
  type VerifyResetOtpPayload,
  type VerifyResetOtpResult,
  type VerifyOtpResult,
} from "@/features/auth/types";

// Các endpoint xác thực.
// const PROVIDERS_ENDPOINT = `/providers-config`;
const AUTH_ENDPOINT = `/auth`;
const OAUTH2_INIT_ENDPOINT = `/oauth2/initialize`;
const OAUTH2_EXCHANGE_ENDPOINT = `${AUTH_ENDPOINT}/oauth2/exchange`;
const AUTHORIZE_DEVICE_ENDPOINT = `/users/authorize-device`;

// init-session và login sử dụng login token ngắn hạn, không dùng dynamic token
// hiện tại của ứng dụng. Tách riêng hai yêu cầu này khỏi interceptor xác thực chung.
const preAuthClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: HTTP_CONFIG.DEFAULT_TIMEOUT_MS,
  headers: HTTP_CONFIG.DEFAULT_HEADERS,
});

preAuthClient.interceptors.request.use((config) => {
  if (config.url?.includes(`${AUTH_ENDPOINT}/init-session`)) {
    // Huy- Cập nhật ngày 2026-09-08: init-session là bước trước login, không được gửi Dynamic Token cũ.
    delete config.headers[API_HEADERS.AUTHORIZATION];
  }
  return config;
});

export async function fetchActiveProviders(): Promise<ProviderConfig[]> {
  // const response = await apiClient.get<ApiEnvelope<ProviderConfig[]>>(
  //   `${PROVIDERS_ENDPOINT}?isActive=true`,
  // );

  // return response.data.data || [];
  return  [];
}

export async function registerUser(payload: RegisterPayload): Promise<RegisterResult> {
  const response = await apiClient.post<ApiEnvelope<RegisterResult>>(
    `${AUTH_ENDPOINT}/register`,
    payload,
  );

  return response.data.data;
}

export async function verifyUserEmail(
  payload: VerifyOtpPayload,
): Promise<VerifyOtpResult> {
  const response = await apiClient.post<ApiEnvelope<VerifyOtpResult>>(
    `${AUTH_ENDPOINT}/verify-otp`,
    payload,
  );

  return response.data.data;
}

export async function resendOtp(payload: ResendOtpPayload): Promise<void> {
  await apiClient.post(`${AUTH_ENDPOINT}/resend-otp`, payload);
}

export async function initSession(
  payload: InitSessionPayload,
): Promise<InitSessionResult> {
  const response = await preAuthClient.post<ApiEnvelope<unknown>>(
    `${AUTH_ENDPOINT}/init-session`,
    // Gửi cả trường trong tài liệu và tên thay thế dạng snake_case của backend đang triển khai
    // cho tới khi hai contract được đồng bộ.
    { deviceId: payload.deviceId, device_id: payload.deviceId },
  );
  const result = response.data.data as {
    loginToken?: string;
    expiresIn?: number;
    token?: string;
    expires_in?: number;
    data?: {
      loginToken?: string;
      expiresIn?: number;
      expires_in?: number;
      token?: string;
    };
  };
  // Sửa ngày 2026-09-07: wifi-user đang bọc nguyên response ads-core vào `data`,
  // nên login token thực tế nằm ở `data.data.token`; vẫn hỗ trợ response phẳng để
  // tương thích khi backend chuẩn hóa lại contract sau này.
  const tokenData = result?.data ?? result;
  const loginToken = tokenData?.loginToken ?? tokenData?.token;
  const expiresIn = tokenData?.expiresIn ?? tokenData?.expires_in ?? 0;

  if (!loginToken) {
    throw new Error("API init-session không trả về login_token");
  }

  return {
    login_token: loginToken,
    expires_in: expiresIn,
  };
}

async function submitPasswordLogin(
  payload: LoginPayload,
  loginToken: string,
): Promise<LoginResult> {
  const response = await preAuthClient.post<ApiEnvelope<unknown>>(
    `${AUTH_ENDPOINT}/login`,
    payload,
    {
      headers: {
        [API_HEADERS.AUTHORIZATION]: `Bearer ${loginToken}`,
      },
    },
  );

  const data = response.data.data as unknown as {
    token?: string;
    accessToken?: string;
    role?: string;
    roles?: string[];
  };
  const accessToken = data.accessToken ?? data.token;

  if (!accessToken) {
    throw new Error("API login không trả về dynamic token");
  }

  return {
    accessToken,
    refreshToken: null,
    roles: Array.isArray(data.roles)
      ? data.roles
      : data.role
        ? [data.role]
        : [],
  };
}

export async function loginWithPassword(
  credentials: LoginCredentials,
): Promise<LoginResult> {
  const deviceId = getOrCreateAuthDeviceId();
  const { login_token: loginToken } = await initSession({ deviceId });

  return submitPasswordLogin(
    {
      ...credentials,
      deviceId,
      // Giữ tương thích với DTO snake_case của backend đang triển khai.
      device_id: deviceId,
    },
    loginToken,
  );
}

/**
 * Huy- Cập nhật ngày 2026-09-08: Quick Access vẫn khởi tạo login_token ngắn hạn
 * để Core chỉ cấp token cho deviceId đã được init-session xác nhận.
 */
export async function quickAccess(): Promise<LoginResult> {
  const deviceId = getOrCreateAuthDeviceId();
  const { login_token: loginToken } = await initSession({ deviceId });
  const response = await preAuthClient.post<ApiEnvelope<unknown>>(
    `${AUTH_ENDPOINT}/quick-access`,
    { deviceId, device_id: deviceId },
    { headers: { [API_HEADERS.AUTHORIZATION]: `Bearer ${loginToken}` } },
  );
  const data = response.data.data as { token?: string; accessToken?: string; role?: string; roles?: string[] };
  const accessToken = data.accessToken ?? data.token;
  if (!accessToken) {
    throw new Error('API Truy cập nhanh không trả về dynamic token');
  }
  return {
    accessToken,
    refreshToken: null,
    roles: Array.isArray(data.roles) ? data.roles : data.role ? [data.role] : [],
  };
}

export async function getMeProfile(): Promise<MeResponse> {
  const response = await apiClient.get<ApiEnvelope<MeResponse>>(`${AUTH_ENDPOINT}/me`);
  return response.data.data;
}

/**
 * Sửa ngày 2026-09-08: callback ads-core chỉ gửi oauth_code ngắn hạn.
 * FE đổi mã qua wifi-user để tránh access token xuất hiện trong browser URL/history.
 */
export async function exchangeOAuth2Code(code: string): Promise<LoginResult> {
  const response = await preAuthClient.post<ApiEnvelope<unknown>>(
    OAUTH2_EXCHANGE_ENDPOINT,
    { code },
  );
  const data = response.data.data as { token?: string; accessToken?: string; role?: string; roles?: string[] };
  const accessToken = data.accessToken ?? data.token;
  if (!accessToken) {
    throw new Error("API OAuth2 exchange không trả về dynamic token");
  }
  return {
    accessToken,
    refreshToken: null,
    roles: Array.isArray(data.roles) ? data.roles : data.role ? [data.role] : [],
  };
}

export async function logoutUser(deviceMac?: string | null): Promise<void> {
  await apiClient.post(
    `${AUTH_ENDPOINT}/logout`,
    deviceMac ? { device_mac: deviceMac } : undefined,
  );
}

export async function authorizeDevice(payload: AuthorizeDevicePayload): Promise<void> {
  const apiPayload: AuthorizeDeviceApiPayload = {
    device_mac: payload.deviceMac,
    ap_mac: payload.apMac,
    device_client_id: payload.deviceClientId,
    ssid: payload.ssid,
    device_type: payload.deviceType,
    device_name: payload.deviceName,
    operating_system: payload.operatingSystem,
    manufacturer: payload.manufacturer,
    user_agent: payload.userAgent,
    // Sửa ngày 2026-09-07: không gửi user_ip_address và duration. IP do UniFi
    // xác định; thời lượng do policy backend quyết định khi authorize-device.
  };

  await apiClient.put(`${AUTHORIZE_DEVICE_ENDPOINT}`, apiPayload);
}

async function initializeOAuth2(
  provider: string,
  payload: OAuth2InitializePayload,
): Promise<OAuth2InitializeResponse> {
  // Dùng apiClient để response interceptor tự chuyển snake_case → camelCase.
  const response = await apiClient.post<ApiEnvelope<OAuth2InitializeResponse>>(
    `${OAUTH2_INIT_ENDPOINT}/${encodeURIComponent(provider)}`,
    payload,
  );

  const data = response.data.data;
  if (!data?.authorizeUrl) {
    throw new Error("API OAuth2 initialize không trả về authorizeUrl");
  }

  return data;
}

export async function startOAuth2Login(provider: string): Promise<void> {
  // Sửa ngày 2026-09-08: chỉ gửi device_id như luồng email/mật khẩu.
  // MAC/AP/SSID vẫn nằm trong captive portal context để dùng riêng cho authorize-device sau login.
  const payload: OAuth2InitializePayload = {
    device_id: getOrCreateAuthDeviceId(),
  };

  const { authorizeUrl } = await initializeOAuth2(provider, payload);

  // Sửa ngày 2026-09-08: ads-core trả URL tuyệt đối vì browser phải đi thẳng đến
  // core để core giữ OAuth state/callback. Vẫn hỗ trợ path tương đối khi tương thích bản cũ.
  window.location.href = /^https?:\/\//i.test(authorizeUrl)
    ? authorizeUrl
    : `${API_BASE_URL}${authorizeUrl}`;
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
  await apiClient.post(`${AUTH_ENDPOINT}/forgot-password`, payload);
}

export async function verifyResetOtp(
  payload: VerifyResetOtpPayload,
): Promise<VerifyResetOtpResult> {
  const response = await apiClient.post<ApiEnvelope<VerifyResetOtpResult>>(
    `${AUTH_ENDPOINT}/verify-reset-otp`,
    payload,
  );

  return response.data.data;
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  await apiClient.post(`${AUTH_ENDPOINT}/reset-password`, {
    token: payload.token,
    new_password: payload.newPassword,
  });
}
