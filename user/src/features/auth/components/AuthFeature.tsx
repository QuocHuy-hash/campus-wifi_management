import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { currentUser } from '@/data/mockData';
import { authorizeDevice, loginWithPassword, startOAuth2Login } from '@/features/auth/api/authApi';
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
import { STORAGE_KEYS } from '@/constants/appKeys';
import { extractCaptivePortalContext, getCaptivePortalContext, saveCaptivePortalContext, buildAuthorizeDevicePayload, clearRedirectUrl } from '@/lib/captivePortal';
import { setAxiosAuthToken, initializeAxios } from '@/config/axios';
import { validatePassword } from '@/lib/passwordValidation';
import { clearStoredAuthSession, establishSessionCookie } from '@/lib/session';

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
  const { t } = useTranslation();
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

  // Khởi tạo interceptor một lần trước khi thực hiện các yêu cầu xác thực.
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

  // Giữ lại thông tin captive portal trước khi URL bị thay đổi bởi luồng đăng nhập.
  useEffect(() => {
    const currentSearch = window.location.search;

    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 Search params:', currentSearch);

    if (currentSearch) {
      const captiveContext = extractCaptivePortalContext(currentSearch);
      console.log('🔍 Extracted context:', captiveContext);

      if (captiveContext) {
        saveCaptivePortalContext(captiveContext);
        console.log('✅ Captive context saved to localStorage');
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

      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const captiveContext = getCaptivePortalContext('');

      console.log('🔄 Checking redirect with session...');
      console.log('🔄 Has token:', Boolean(token));
      console.log('🔄 Captive context:', captiveContext);

      if (!token) {
        return;
      }

      // Cookie phiên là HttpOnly nên client không thể kiểm tra bằng document.cookie.
      // Đồng bộ qua API route và tin vào kết quả HTTP của route đó.
      try {
        await establishSessionCookie(token);
      } catch {
        console.warn('⚠️ Failed to restore session cookie, clearing stale token');
        clearStoredAuthSession();
        setAxiosAuthToken(null);
        return;
      }

      // Không còn captive context thì middleware tiếp quản việc điều hướng phiên.
      if (!captiveContext) {
        console.log('🚀 User has valid session - letting middleware handle redirect...');
        router.push('/session');
        return;
      }

      // Phiên cũ quay lại từ captive portal cần được cấp quyền thiết bị tự động.
      if (captiveContext) {
        console.log('🚀 User already logged in with captive context - auto authorizing device...');

        setAxiosAuthToken(token);

        try {
          const payload = buildAuthorizeDevicePayload(captiveContext);
          await authorizeDevice(payload);
          console.log('✅ Device authorized successfully via redirect');

          localStorage.removeItem(STORAGE_KEYS.portalCaptiveContext);
          router.push('/network-connecting');
        } catch (error) {
          console.error('❌ Failed to authorize device via redirect:', error);
          clearRedirectUrl();
          localStorage.removeItem(STORAGE_KEYS.portalCaptiveContext);
          setError(t('common.deviceAuthFailedRetry'));
        }
      }
    };

    // Chờ axios và localStorage khởi tạo xong trước khi kiểm tra phiên.
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
        return t('common.invalidCredentials');
      }

      if (status === 404) {
        return t('common.serverNotFound');
      }

      if (status === 500) {
        return t('common.serverInternalError');
      }

      if (status === 502 || status === 503) {
        return t('common.serverMaintenance');
      }

      if (maybeAxios.response?.data?.message) {
        return maybeAxios.response.data.message;
      }

      if (maybeAxios.message) {
        if (maybeAxios.message.includes('Network Error') || maybeAxios.message.includes('ECONNREFUSED')) {
          return t('common.networkUnreachable');
        }
        if (maybeAxios.message.includes('timeout')) {
          return t('common.connectionTimeout');
        }
        return t('common.loginFailed');
      }
    }

    return t('common.loginFailed');
  };

  const getGuestIdentifier = () =>
    guestAuthMethod === 'email' ? guestForm.email.trim() : guestForm.phone.trim();

  // Cấp quyền thiết bị; trả về true nếu thành công, false nếu thất bại.
  const authorizeDeviceInBackground = async (): Promise<boolean> => {
    try {
      const captiveContext = getCaptivePortalContext('');

      console.log('🔐 Authorizing device...');
      console.log('🔐 Captive context:', captiveContext);

      if (!captiveContext) {
        console.warn('⚠️ No captive context found, skipping device authorization');
        return true;
      }

      const payload = buildAuthorizeDevicePayload(captiveContext);
      await authorizeDevice(payload);

      console.log('✅ Device authorized successfully');

      localStorage.removeItem(STORAGE_KEYS.portalCaptiveContext);
      return true;
    } catch (error) {
      console.error('❌ Failed to authorize device:', error);
      clearRedirectUrl();
      return false;
    }
  };

  // Lưu phiên tối thiểu sau khi login thành công.
  // Trang /session và /account sẽ tự gọi /auth/me để lấy hồ sơ thật (fullName, avatar, roles...) khi khởi tạo,
  // tránh gọi API xác thực ngay trên trang login gây lỗi 401 -> interceptor xóa cookie -> bị đá về login.
  const persistSession = (identifier: string, fallbackRole?: string) => {
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
  };

  const establishPasswordSession = async (
    result: LoginResult,
    identifier: string,
  ): Promise<boolean> => {
    localStorage.setItem(STORAGE_KEYS.accessToken, result.accessToken);

    setAxiosAuthToken(result.accessToken);
    try {
      await establishSessionCookie(result.accessToken);
    } catch {
      clearStoredAuthSession();
      setAxiosAuthToken(null);
      setError(t('common.sessionSetupFailed'));
      setIsLoading(false);
      return false;
    }

    persistSession(identifier, result.roles?.[0]);
    saveGuestLoginUsername(identifier);
    return true;
  };

  const redirectAfterDeviceAuthorization = async (): Promise<void> => {
    // Captive context phải được đọc trước vì quá trình cấp quyền sẽ xóa dữ liệu này.
    const hasCaptiveContext = Boolean(getCaptivePortalContext(''));

    if (hasCaptiveContext) {
      const authorized = await authorizeDeviceInBackground();
      if (!authorized) {
        setError(t('common.deviceAuthFailedRetry'));
        setIsLoading(false);
        return;
      }
    } else {
      await authorizeDeviceInBackground();
    }

    // Tải lại toàn trang để cookie phiên được gửi ngay ở yêu cầu kế tiếp.
    window.location.href = hasCaptiveContext
      ? '/network-connecting'
      : '/session';
  };

  const handleSSOLogin = async (provider: string) => {
    if (!agreeTerms) {
      setError(t('common.agreeTermsRequired'));
      return;
    }
    setError('');

    if (provider === 'google' || provider === 'azure') {
      if (activeProviderCodes.length > 0 && !activeProviderCodes.includes(provider)) {
        setError(t('common.providerNotActive', { provider }));
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
        fullname: t('common.renamedUser', { provider }),
        loginTime: new Date().toISOString(),
        linkedAccounts: [linkedAccount]
      }));

      await redirectAfterDeviceAuthorization();
      setIsLoading(false);
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
      setOtpError(t('common.confirmPasswordNotMatch'));
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
      setOtpError(t('common.enterFullOtp'));
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
      setOtpError(t('common.confirmPasswordNotMatch'));
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
      setGuestResendCooldown(60); // Đặt lại thời gian đếm ngược sau khi gửi lại thành công
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
    setGuestResendCooldown(0); // Đặt lại thời gian đếm ngược khi đóng hộp thoại
  };

  const handleUseGuestCredentials = async () => {
    if (!agreeTerms) {
      setError(t('common.agreeTermsRequired'));
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
      await redirectAfterDeviceAuthorization();
    } catch (apiError) {
      setError(getLoginErrorMessage(apiError));
      setIsLoading(false);
    }
  };

  const handleStandardLogin = async () => {
    if (!agreeTerms) {
      setError(t('common.agreeTermsRequired'));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    if (!loginUsername || !loginPassword) {
      setIsLoading(false);
      setError(t('common.enterCredentials'));
      return;
    }

    try {
      const result = await loginWithPassword({
        identifier: loginUsername,
        password: loginPassword,
      });
console.log("result::::", result);
      const sessionReady = await establishPasswordSession(
        result,
        loginUsername,
      );
      if (!sessionReady) return;

      await redirectAfterDeviceAuthorization();
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
      setForgotOtpError(t('common.enterFullOtp'));
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
      setForgotResendCooldown(120); // Đặt lại thời gian đếm ngược sau khi gửi lại thành công
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
      setForgotOtpError(t('common.confirmPasswordNotMatch'));
      return;
    }
    if (!forgotToken) {
      setForgotOtpError(t('common.forgotSessionExpired'));
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

  // Đặt lại toàn bộ biểu mẫu quên mật khẩu về trạng thái ban đầu
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
