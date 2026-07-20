import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { currentUser } from '@/data/mockData';
import { authorizeDevice, getMeProfile, loginWithPassword, startOAuth2Login } from '@/features/auth/api/authApi';
import {
  clearForgotToken,
  getActiveProviders,
  registerWithOtp,
  resendEmailOtp,
  sendForgotOtp,
  verifyEmailOtp,
  verifyForgotOtp,
  submitResetPassword,
} from '@/features/auth/slices/authSlice';
import type { LoginResult, ProviderConfig } from '@/features/auth/types';
import { useAppDispatch } from '@/stores/hooks';
import type { RootState } from '@/stores/store';
import AuthLoginCard, { type AuthTab } from '@/features/auth/components/AuthLoginCard';
import AuthPageLayout from '@/features/auth/components/AuthPageLayout';
import AuthTermsDialog from '@/features/auth/components/dialogs/AuthTermsDialog';
import GuestRegistrationDialog from '@/features/auth/components/dialogs/GuestRegistrationDialog';
import ForgotPasswordDialog from '@/features/auth/components/dialogs/ForgotPasswordDialog';
import { STORAGE_KEYS, AUTH_COOKIE_KEY } from '@/constants/appKeys';
import {
  extractCaptivePortalContext,
  getCaptivePortalContext,
  saveCaptivePortalContext,
  buildAuthorizeDevicePayload,
  persistNetworkConnectingHandoff,
  clearCaptivePortalContext,
} from '@/lib/captivePortal';
import { setAxiosAuthToken, initializeAxios } from '@/config/axios';
import { validatePassword } from '@/lib/passwordValidation';

async function setSessionCookie(accessToken: string): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken }),
    });
    // Cookie phía client là phương án dự phòng để middleware vẫn nhận diện phiên.
    document.cookie = `${AUTH_COOKIE_KEY}=${accessToken};path=/;max-age=3600;SameSite=Lax`;
    return res.ok;
  } catch {
    // API lỗi vẫn không được làm gián đoạn luồng chuyển hướng sau đăng nhập.
    document.cookie = `${AUTH_COOKIE_KEY}=${accessToken};path=/;max-age=3600;SameSite=Lax`;
    return true;
  }
}

const LEGACY_SAVED_GUEST_LOGIN_CREDENTIALS_KEY = 'savedGuestLoginCredentials';

function getSavedGuestLoginUsername(): string {
  if (typeof window === 'undefined') return '';

  try {
    const savedUsername = localStorage.getItem(STORAGE_KEYS.savedGuestLoginUsername);
    const legacyCredentials = localStorage.getItem(LEGACY_SAVED_GUEST_LOGIN_CREDENTIALS_KEY);

    if (savedUsername) {
      if (legacyCredentials) {
        localStorage.removeItem(LEGACY_SAVED_GUEST_LOGIN_CREDENTIALS_KEY);
      }
      return savedUsername;
    }

    if (!legacyCredentials) return '';

    const parsedCredentials = JSON.parse(legacyCredentials) as { username?: unknown };
    localStorage.removeItem(LEGACY_SAVED_GUEST_LOGIN_CREDENTIALS_KEY);

    if (typeof parsedCredentials.username === 'string') {
      localStorage.setItem(STORAGE_KEYS.savedGuestLoginUsername, parsedCredentials.username);
      return parsedCredentials.username;
    }
  } catch {
    localStorage.removeItem(LEGACY_SAVED_GUEST_LOGIN_CREDENTIALS_KEY);
  }

  return '';
}

function saveGuestLoginUsername(username: string): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(LEGACY_SAVED_GUEST_LOGIN_CREDENTIALS_KEY);
  localStorage.setItem(STORAGE_KEYS.savedGuestLoginUsername, username);
}

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<AuthTab>('guest');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [guestForm, setGuestForm] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [guestAuthMethod, setGuestAuthMethod] = useState<'email' | 'phone'>('email');
  const [guestStep, setGuestStep] = useState<'form' | 'otp' | 'newpass' | 'success'>('form');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isSendingOtp] = useState(false);
  const [isVerifyingOtp] = useState(false);
  const [guestNewPassword, setGuestNewPassword] = useState('');
  const [guestConfirmPassword, setGuestConfirmPassword] = useState('');
  const [showGuestPassword, setShowGuestPassword] = useState(false);
  const [isSettingGuestPassword, setIsSettingGuestPassword] = useState(false);

  // Lỗi khi gọi register-device — hiển thị cùng nút "Thử lại", KHÔNG xoá captive context.
  const [deviceAuthError, setDeviceAuthError] = useState('');
  const [isRetryingDeviceAuth, setIsRetryingDeviceAuth] = useState(false);

  // Thông tin đăng nhập của khách đã từng tạo tài khoản.
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Trạng thái riêng cho luồng quên mật khẩu.
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotMethod, setForgotMethod] = useState<'email' | 'phone'>('email');
  const [forgotContact, setForgotContact] = useState('');
  const [forgotStep, setForgotStep] = useState<'form' | 'otp' | 'newpass' | 'success'>('form');
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '', '', '']);
  const [forgotOtpError, setForgotOtpError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSendingForgotOtp, setIsSendingForgotOtp] = useState(false);
  const [isVerifyingForgotOtp, setIsVerifyingForgotOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [forgotResendCooldown, setForgotResendCooldown] = useState(0); // Đếm ngược gửi lại OTP (giây)
  const [guestResendCooldown, setGuestResendCooldown] = useState(0); // Đếm ngược gửi lại OTP đăng ký (giây)

  const authState = useSelector((state: RootState) => state.auth) as {
    providers: ProviderConfig[];
    registerLoading: boolean;
    verifyLoading: boolean;
    resendLoading: boolean;
    forgotLoading: boolean;
    forgotToken: string | null;
  };

  const { providers, registerLoading, verifyLoading, resendLoading, forgotLoading, forgotToken } = authState;

  const activeProviderCodes = useMemo(
    () => providers.filter((provider) => provider.isActive).map((provider) => provider.provider),
    [providers],
  );

  useEffect(() => {
    const savedUsername = getSavedGuestLoginUsername();
    if (!savedUsername) return;

    setLoginUsername(savedUsername);
  }, []);

  useEffect(() => {
    dispatch(getActiveProviders());
  }, [dispatch]);

  // Khởi tạo interceptor một lần trước khi thực hiện các request xác thực.
  useEffect(() => {
    initializeAxios();
  }, []);

  // Đếm ngược thời gian chờ gửi lại OTP (120 giây)
  useEffect(() => {
    if (forgotResendCooldown <= 0) return;

    const timer = setInterval(() => {
      setForgotResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [forgotResendCooldown]);

  // Đếm ngược thời gian chờ gửi lại OTP đăng ký (60 giây)
  useEffect(() => {
    if (guestResendCooldown <= 0) return;

    const timer = setInterval(() => {
      setGuestResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [guestResendCooldown]);

  // Lưu ngay captive context khi phát hiện tham số trên URL — không chặn luồng,
  // tránh mất params nếu người dùng đóng CNA giữa chừng.
  useEffect(() => {
    const currentSearch = window.location.search;

    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 Search params:', currentSearch);

    if (currentSearch) {
      const context = extractCaptivePortalContext(currentSearch);
      console.log('🔍 Extracted context:', context);

      if (context) {
        saveCaptivePortalContext(context);
        console.log('✅ Captive context saved to localStorage (entryMode:', context.entryMode, ')');
      } else {
        console.warn('⚠️ Failed to extract captive context from URL');
      }
    } else {
      const stored = getCaptivePortalContext('');
      if (stored) {
        console.log('✅ Using stored captive context:', stored);
      } else {
        console.warn('⚠️ No captive context in URL or localStorage');
      }
    }
  }, []);

  // Khôi phục phiên hợp lệ và tiếp tục luồng cấp quyền cho thiết bị nếu cần.
  useEffect(() => {
    const handleRedirectWithSession = async () => {
      if (typeof window === 'undefined') return;

      // Chỉ tin token localStorage khi cookie phiên vẫn tồn tại để tránh vòng lặp redirect.
      const hasAuthCookie = document.cookie.split(';').some(cookie => {
        const [name] = cookie.trim().split('=');
        return name === AUTH_COOKIE_KEY;
      });

      const isLoggedIn = localStorage.getItem(STORAGE_KEYS.portalLoggedIn) === 'true';
      const hasToken = !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || !!localStorage.getItem(STORAGE_KEYS.accessToken);
      const captiveContext = getCaptivePortalContext(window.location.search);

      console.log('🔄 Checking redirect with session...');
      console.log('🔄 Has auth cookie:', hasAuthCookie);
      console.log('🔄 Is logged in:', isLoggedIn);
      console.log('🔄 Has token:', hasToken);
      console.log('🔄 Captive context:', captiveContext);

      // Token không còn cookie đi kèm được xem là phiên cũ và phải dọn sạch.
      if (hasToken && !hasAuthCookie) {
        console.warn('⚠️ Token exists in localStorage but no cookie found - clearing stale session');
        localStorage.removeItem(STORAGE_KEYS.accessToken);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.refreshToken);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.portalLoggedIn);
        localStorage.removeItem(STORAGE_KEYS.portalUser);
        return;
      }

      // Đồng bộ lại cookie qua API trước khi chuyển sang trang được bảo vệ.
      if (hasToken && hasAuthCookie) {
        const token = localStorage.getItem(STORAGE_KEYS.accessToken) || localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          const cookieOk = await setSessionCookie(token);
          if (!cookieOk) {
            console.warn('⚠️ Failed to set session cookie, clearing stale token');
            localStorage.removeItem(STORAGE_KEYS.accessToken);
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.portalLoggedIn);
            return;
          }
        }
      }

      // Không còn captive context thì middleware tiếp quản việc điều hướng phiên.
      if (hasToken && hasAuthCookie && !captiveContext) {
        console.log('🚀 User has valid session - letting middleware handle redirect...');
        router.push('/session');
        return;
      }

      // Phiên cũ quay lại từ captive portal cần được cấp quyền thiết bị tự động.
      if (isLoggedIn && hasToken && hasAuthCookie && captiveContext) {
        console.log('🚀 User already logged in with captive context - auto authorizing device...');

        const token = localStorage.getItem(STORAGE_KEYS.accessToken) || localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          setAxiosAuthToken(token);
        }

        await registerDeviceAndRedirect();
      }
    };

    const timer = setTimeout(handleRedirectWithSession, 100);
    return () => clearTimeout(timer);
  }, []);

  const getLoginErrorMessage = (apiError: unknown): string => {
    if (typeof apiError === 'object' && apiError !== null) {
      const maybeAxios = apiError as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };

      const status = maybeAxios.response?.status;

      if (status === 401) {
        return 'Tài khoản hoặc mật khẩu không đúng';
      }

      if (status === 404) {
        return 'Không tìm thấy servidor. Vui lòng thử lại sau.';
      }

      if (status === 500) {
        return 'Lỗi servidor nội bộ. Vui lòng thử lại sau.';
      }

      if (status === 502 || status === 503) {
        return 'Servidor đang bảo trì. Vui lòng thử lại sau.';
      }

      if (maybeAxios.response?.data?.message) {
        return maybeAxios.response.data.message;
      }

      if (maybeAxios.message) {
        if (maybeAxios.message.includes('Network Error') || maybeAxios.message.includes('ECONNREFUSED')) {
          return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.';
        }
        if (maybeAxios.message.includes('timeout')) {
          return 'Hết thời gian kết nối. Vui lòng thử lại.';
        }
        return 'Đăng nhập thất bại. Vui lòng thử lại.';
      }
    }

    return 'Đăng nhập thất bại. Vui lòng thử lại.';
  };

  const getGuestIdentifier = () =>
    guestAuthMethod === 'email' ? guestForm.email.trim() : guestForm.phone.trim();

  // Gọi API register-device + điều hướng đến /network-connecting nếu thành công.
  // Nếu lỗi → set deviceAuthError để hiển thị nút "Thử lại", KHÔNG xoá captive context.
  const registerDeviceAndRedirect = async (): Promise<void> => {
    try {
      const captiveContext = getCaptivePortalContext(window.location.search);

      console.log('🔐 Authorizing device...');
      console.log('🔐 Captive context:', captiveContext);

      if (!captiveContext) {
        console.log('⚠️ No captive context — redirecting to /session');
        window.location.href = '/session';
        return;
      }

      const payload = buildAuthorizeDevicePayload(captiveContext);
      await authorizeDevice(payload);

      console.log('✅ Device authorized successfully');

      // Handoff entryMode + URL đích sang /network-connecting trước khi xoá context.
      persistNetworkConnectingHandoff(captiveContext);
      clearCaptivePortalContext();

      window.location.href = '/network-connecting';
    } catch (error) {
      console.error('❌ Failed to authorize device:', error);
      setDeviceAuthError(
        'Không thể xác thực thiết bị. Vui lòng thử lại hoặc liên hệ quản trị viên.'
      );
      setIsLoading(false);
      setIsRetryingDeviceAuth(false);
    }
  };

  const handleRetryDeviceAuth = async () => {
    setDeviceAuthError('');
    setIsRetryingDeviceAuth(true);
    await registerDeviceAndRedirect();
  };

  const persistSession = async (identifier: string, fallbackRole?: string) => {
    try {
      console.log('🔍 Calling getMeProfile...');
      const profile = await getMeProfile();
      console.log('✅ getMeProfile success:', profile);

      localStorage.setItem(STORAGE_KEYS.portalLoggedIn, 'true');
      localStorage.setItem(
        STORAGE_KEYS.portalUser,
        JSON.stringify({
          id: profile.id,
          username: profile.username || identifier,
          fullname: profile.fullName || identifier,
          email: profile.email || identifier,
          role: fallbackRole || 'CLIENT',
          status: profile.status,
          avatarUrl: profile.avatarUrl,
          loginTime: profile.lastLoginAt || new Date().toISOString(),
        }),
      );
    } catch (error) {
      console.error('❌ getMeProfile failed:', error);
      // Vẫn lưu phiên tối thiểu để giao diện hoạt động khi API hồ sơ tạm lỗi.
      localStorage.setItem(STORAGE_KEYS.portalLoggedIn, 'true');
      localStorage.setItem(
        STORAGE_KEYS.portalUser,
        JSON.stringify({
          id: 'unknown',
          username: identifier,
          fullname: identifier,
          email: identifier,
          role: fallbackRole || 'CLIENT',
          status: 'ACTIVE',
          avatarUrl: null,
          loginTime: new Date().toISOString(),
        }),
      );
    }
  };

  const establishPasswordSession = async (
    result: LoginResult,
    identifier: string,
  ): Promise<boolean> => {
    localStorage.setItem(STORAGE_KEYS.accessToken, result.accessToken);
    if (result.refreshToken) {
      localStorage.setItem(STORAGE_KEYS.refreshToken, result.refreshToken);
    }

    setAxiosAuthToken(result.accessToken);
    const cookieOk = await setSessionCookie(result.accessToken);
    if (!cookieOk) {
      localStorage.removeItem(STORAGE_KEYS.accessToken);
      localStorage.removeItem(STORAGE_KEYS.refreshToken);
      setError('Không thể thiết lập phiên đăng nhập. Vui lòng thử lại.');
      setIsLoading(false);
      return false;
    }

    await persistSession(identifier, result.roles?.[0]);
    saveGuestLoginUsername(identifier);
    return true;
  };

  const handleSSOLogin = async (provider: string) => {
    if (!agreeTerms) {
      setError('Vui lòng đồng ý với Điều khoản sử dụng WiFi');
      return;
    }
    setError('');

    if (provider === 'google' || provider === 'azure') {
      if (activeProviderCodes.length > 0 && !activeProviderCodes.includes(provider)) {
        setError('Provider này hiện chưa được kích hoạt trên hệ thống');
        return;
      }

      sessionStorage.setItem(STORAGE_KEYS.oauthProvider, provider);
      sessionStorage.setItem('oauth2_redirect_back', '/session');
      startOAuth2Login(provider);
      return;
    }

    // Provider chưa được backend hỗ trợ dùng luồng mô phỏng hiện có của hệ thống.
    setIsLoading(true);
    setTimeout(async () => {
      const linkedAccount = {
        type: provider,
        email: `${provider}.user@gmail.com`,
        name: `User ${provider}`
      };

      localStorage.setItem('portalLoggedIn', 'true');
      localStorage.setItem('portalUser', JSON.stringify({
        ...currentUser,
        id: Date.now(),
        username: linkedAccount.email,
        fullname: `Người dùng ${provider}`,
        loginTime: new Date().toISOString(),
        linkedAccounts: [linkedAccount]
      }));

      await registerDeviceAndRedirect();
    }, 1200);
  };

  const handleSendOtp = async () => {
    const contact = getGuestIdentifier();
    if (!contact || !guestForm.password) return;

    const passwordError = validatePassword(guestForm.password);
    if (passwordError) {
      setOtpError(passwordError);
      return;
    }
    if (guestForm.password !== guestForm.confirmPassword) {
      setOtpError('Xác nhận mật khẩu không khớp');
      return;
    }

    setOtpError('');

    try {
      await dispatch(
        registerWithOtp({
          identifier: contact,
          password: guestForm.password,
        }),
      ).unwrap();
      setGuestStep('otp');
      setGuestResendCooldown(60); // Bắt đầu đếm ngược 60s mới được gửi lại
    } catch (apiError) {
      setOtpError(String(apiError));
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    
    // Chuyển nhanh sang ô OTP tiếp theo khi người dùng vừa nhập xong một số.
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otp = otpCode.join('');
    if (otp.length !== 6) {
      setOtpError('Vui lòng nhập đủ 6 số');
      return;
    }

    setOtpError('');

    try {
      await dispatch(
        verifyEmailOtp({
          identifier: getGuestIdentifier(),
          otp,
        }),
      ).unwrap();
      setGuestStep('success');
    } catch (apiError) {
      setOtpError(String(apiError));
    }
  };

  const handleSetGuestPassword = () => {
    const error = validatePassword(guestNewPassword);
    if (error) {
      setOtpError(error);
      return;
    }
    if (guestNewPassword !== guestConfirmPassword) {
      setOtpError('Xác nhận mật khẩu không khớp');
      return;
    }

    setIsSettingGuestPassword(true);
    setOtpError('');
    
    setTimeout(() => {
      setIsSettingGuestPassword(false);
      setGuestStep('success');
    }, 1500);
  };

  const handleResendOtp = async () => {
    setOtpCode(['', '', '', '', '', '']);
    setOtpError('');

    try {
      await dispatch(resendEmailOtp({ identifier: getGuestIdentifier() })).unwrap();
      setGuestResendCooldown(60); // Reset đếm ngược sau khi gửi lại thành công
    } catch (apiError) {
      setOtpError(String(apiError));
    }
  };

  const resetGuestForm = () => {
    setGuestForm({ email: '', phone: '', password: '', confirmPassword: '' });
    setGuestAuthMethod('email');
    setGuestStep('form');
    setOtpCode(['', '', '', '', '', '']);
    setOtpError('');
    setGuestResendCooldown(0); // Reset đếm ngược khi đóng dialog
  };

  const handleUseGuestCredentials = async () => {
    if (!agreeTerms) {
      setError('Vui lòng đồng ý với Điều khoản sử dụng WiFi');
      setIsLoading(false);
      return;
    }

    const guestIdentifier = getGuestIdentifier();
    setGuestModalOpen(false);
    setIsLoading(true);
    setError('');

    try {
      const result = await loginWithPassword({
        identifier: guestIdentifier,
        password: guestForm.password,
      });

      const sessionReady = await establishPasswordSession(
        result,
        guestIdentifier,
      );
      if (!sessionReady) return;

      resetGuestForm();
      await registerDeviceAndRedirect();
    } catch (apiError) {
      setError(getLoginErrorMessage(apiError));
      setIsLoading(false);
    }
  };

  const handleStandardLogin = async () => {
    if (!agreeTerms) {
      setError('Vui lòng đồng ý với Điều khoản sử dụng WiFi');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    if (!loginUsername || !loginPassword) {
      setIsLoading(false);
      setError('Vui lòng nhập tài khoản và mật khẩu');
      return;
    }

    try {
      const result = await loginWithPassword({
        identifier: loginUsername,
        password: loginPassword,
      });

      const sessionReady = await establishPasswordSession(
        result,
        loginUsername,
      );
      if (!sessionReady) return;

      await registerDeviceAndRedirect();
    } catch (apiError) {
      setError(getLoginErrorMessage(apiError));
      setIsLoading(false);
    }
  };

  // Gửi OTP đặt lại mật khẩu
  const handleSendForgotOtp = async () => {
    if (!forgotContact) return;
    setIsSendingForgotOtp(true);
    setForgotOtpError('');
    try {
      await dispatch(sendForgotOtp({ identifier: forgotContact })).unwrap();
      setForgotStep('otp');
      setForgotResendCooldown(120); // Bắt đầu đếm ngược 120s mới được gửi lại
    } catch (apiError) {
      setForgotOtpError(String(apiError));
    } finally {
      setIsSendingForgotOtp(false);
    }
  };

  const handleForgotOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...forgotOtp];
    newOtp[index] = value;
    setForgotOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`forgot-otp-${index + 1}`)?.focus();
    }
  };

  const handleForgotOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !forgotOtp[index] && index > 0) {
      document.getElementById(`forgot-otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyForgotOtp = async () => {
    const otp = forgotOtp.join('');
    if (otp.length !== 6) {
      setForgotOtpError('Vui lòng nhập đủ 6 số');
      return;
    }
    setIsVerifyingForgotOtp(true);
    setForgotOtpError('');
    try {
      await dispatch(verifyForgotOtp({ identifier: forgotContact, otp })).unwrap();
      setForgotStep('newpass');
    } catch (apiError) {
      setForgotOtpError(String(apiError));
    } finally {
      setIsVerifyingForgotOtp(false);
    }
  };

  // Gửi lại OTP (gọi lại API forgot-password) và reset đếm ngược
  const handleResendForgotOtp = async () => {
    setForgotOtp(['', '', '', '', '', '']);
    setForgotOtpError('');
    setIsSendingForgotOtp(true);
    try {
      await dispatch(sendForgotOtp({ identifier: forgotContact })).unwrap();
      setForgotResendCooldown(120); // Reset đếm ngược sau khi gửi lại thành công
    } catch (apiError) {
      setForgotOtpError(String(apiError));
    } finally {
      setIsSendingForgotOtp(false);
    }
  };

  const handleResetPassword = async () => {
    const error = validatePassword(newPassword);
    if (error) {
      setForgotOtpError(error);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotOtpError('Xác nhận mật khẩu không khớp');
      return;
    }
    if (!forgotToken) {
      setForgotOtpError('Phiên đặt lại mật khẩu đã hết hạn. Vui lòng thử lại.');
      return;
    }
    setIsResettingPassword(true);
    setForgotOtpError('');
    try {
      await dispatch(
        submitResetPassword({ token: forgotToken, newPassword }),
      ).unwrap();
      setForgotStep('success');
    } catch (apiError) {
      setForgotOtpError(String(apiError));
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Reset toàn bộ form quên mật khẩu về trạng thái ban đầu
  const resetForgotForm = () => {
    setForgotContact('');
    setForgotMethod('email');
    setForgotStep('form');
    setForgotOtp(['', '', '', '', '', '']);
    setForgotOtpError('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowNewPassword(false);
    setForgotResendCooldown(0);
    dispatch(clearForgotToken());
  };

  const handleUseForgotCredentials = () => {
    setForgotModalOpen(false);
    resetForgotForm();
  };

  return (
    <>
      <AuthPageLayout>
        {deviceAuthError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 mb-3">{deviceAuthError}</p>
            <button
              type="button"
              onClick={handleRetryDeviceAuth}
              disabled={isRetryingDeviceAuth}
              className="w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRetryingDeviceAuth ? 'Đang thử lại...' : 'Thử lại xác thực thiết bị'}
            </button>
          </div>
        )}

        <AuthLoginCard
          activeTab={activeTab}
          agreeTerms={agreeTerms}
          isLoading={isLoading}
          loginUsername={loginUsername}
          loginPassword={loginPassword}
          showLoginPassword={showLoginPassword}
          loginError={activeTab === 'guest' ? error : ''}
          onTabChange={setActiveTab}
          onAgreeTermsChange={setAgreeTerms}
          onSSOLogin={handleSSOLogin}
          onOpenGuestModal={() => setGuestModalOpen(true)}
          onUsernameChange={setLoginUsername}
          onPasswordChange={setLoginPassword}
          onTogglePassword={() => setShowLoginPassword((visible) => !visible)}
          onLogin={handleStandardLogin}
          onOpenForgotModal={() => setForgotModalOpen(true)}
          onOpenTermsModal={() => setTermsModalOpen(true)}
        />
      </AuthPageLayout>

      <AuthTermsDialog
        open={termsModalOpen}
        onOpenChange={setTermsModalOpen}
        onAccept={() => {
          setTermsModalOpen(false);
          setAgreeTerms(true);
        }}
      />

      <GuestRegistrationDialog
        open={guestModalOpen}
        guestStep={guestStep}
        guestAuthMethod={guestAuthMethod}
        guestForm={guestForm}
        otpCode={otpCode}
        otpError={otpError}
        guestNewPassword={guestNewPassword}
        guestConfirmPassword={guestConfirmPassword}
        showGuestPassword={showGuestPassword}
        isSendingOtp={isSendingOtp}
        isVerifyingOtp={isVerifyingOtp}
        isSettingGuestPassword={isSettingGuestPassword}
        registerLoading={registerLoading}
        verifyLoading={verifyLoading}
        resendLoading={resendLoading}
        resendCooldown={guestResendCooldown}
        onOpenChange={(open) => {
          setGuestModalOpen(open);
          if (!open) resetGuestForm();
        }}
        onBackStep={() => setGuestStep(guestStep === 'newpass' ? 'otp' : 'form')}
        onSetGuestAuthMethod={setGuestAuthMethod}
        onSetGuestForm={setGuestForm}
        onSetShowGuestPassword={setShowGuestPassword}
        onSendOtp={handleSendOtp}
        onOtpChange={handleOtpChange}
        onOtpKeyDown={handleOtpKeyDown}
        onVerifyOtp={handleVerifyOtp}
        onResendOtp={handleResendOtp}
        onSetGuestNewPassword={setGuestNewPassword}
        onSetGuestConfirmPassword={setGuestConfirmPassword}
        onSetGuestPassword={handleSetGuestPassword}
        onUseGuestCredentials={handleUseGuestCredentials}
      />

      <ForgotPasswordDialog
        open={forgotModalOpen}
        method={forgotMethod}
        contact={forgotContact}
        step={forgotStep}
        otp={forgotOtp}
        otpError={forgotOtpError}
        newPassword={newPassword}
        confirmNewPassword={confirmNewPassword}
        showNewPassword={showNewPassword}
        isSendingOtp={isSendingForgotOtp}
        isVerifyingOtp={isVerifyingForgotOtp}
        isResettingPassword={isResettingPassword}
        resendCooldown={forgotResendCooldown}
        onOpenChange={(open) => {
          setForgotModalOpen(open);
          if (!open) resetForgotForm();
        }}
        onBackStep={() => setForgotStep(forgotStep === 'newpass' ? 'otp' : 'form')}
        onSetMethod={setForgotMethod}
        onSetContact={setForgotContact}
        onSendOtp={handleSendForgotOtp}
        onOtpChange={handleForgotOtpChange}
        onOtpKeyDown={handleForgotOtpKeyDown}
        onVerifyOtp={handleVerifyForgotOtp}
        onResendOtp={handleResendForgotOtp}
        onSetNewPassword={setNewPassword}
        onSetConfirmNewPassword={setConfirmNewPassword}
        onSetShowNewPassword={setShowNewPassword}
        onResetPassword={handleResetPassword}
        onUseForgotCredentials={handleUseForgotCredentials}
      />
    </>
  );
}
