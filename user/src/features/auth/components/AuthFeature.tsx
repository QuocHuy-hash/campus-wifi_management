import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';
import { currentUser, qosPolicies, formatBytes } from '@/data/mockData';
import InternalLoginTab from '@/components/InternalLoginTab';
import GuestLoginTab from '@/components/GuestLoginTab';
import { authorizeDevice, getMeProfile, loginWithPassword, startOAuth2Login } from '@/features/auth/api/authApi';
import { getActiveProviders, registerWithOtp, resendEmailOtp, verifyEmailOtp } from '@/features/auth/slices/authSlice';
import type {  ProviderConfig } from '@/features/auth/types';
import { useAppDispatch } from '@/stores/hooks';
import type { RootState } from '@/stores/store';
import TermsDialog from '@/features/auth/components/dialogs/TermsDialog';
import GuestRegistrationDialog from '@/features/auth/components/dialogs/GuestRegistrationDialog';
import ForgotPasswordDialog from '@/features/auth/components/dialogs/ForgotPasswordDialog';
import { STORAGE_KEYS } from '@/constants/appKeys';
import { extractCaptivePortalContext, getCaptivePortalContext, saveCaptivePortalContext, buildAuthorizeDevicePayload } from '@/lib/captivePortal';
import { setAxiosAuthToken, initializeAxios } from '@/config/axios';
const hcmusLogo = "/logo_hcmus.png";

export default function Login() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'internal' | 'guest'>('guest');
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

  // Standard Login states for returned guests
  const [loginUsername, setLoginUsername] = useState('minhnam1810@gmail.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Forgot password states
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

  const authState = useSelector((state: RootState) => state.auth) as {
    providers: ProviderConfig[];
    registerLoading: boolean;
    verifyLoading: boolean;
    resendLoading: boolean;
  };

  const { providers, registerLoading, verifyLoading, resendLoading } = authState;

  const studentPolicy = qosPolicies.Student;

  const activeProviderCodes = useMemo(
    () => providers.filter((provider) => provider.isActive).map((provider) => provider.provider),
    [providers],
  );

  useEffect(() => {
    dispatch(getActiveProviders());
  }, [dispatch]);

  // Initialize axios on component mount
  useEffect(() => {
    initializeAxios();
  }, []);

  // FIX: Lưu captive context ngay khi component mount
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

  // Handle redirect with existing session and captive portal context
  useEffect(() => {
    const handleRedirectWithSession = async () => {
      // Check if user is already logged in
      const isLoggedIn = localStorage.getItem(STORAGE_KEYS.portalLoggedIn) === 'true';
      const hasToken = !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || !!localStorage.getItem(STORAGE_KEYS.accessToken);
      const captiveContext = getCaptivePortalContext('');

      console.log('🔄 Checking redirect with session...');
      console.log('🔄 Is logged in:', isLoggedIn);
      console.log('🔄 Has token:', hasToken);
      console.log('🔄 Captive context:', captiveContext);

      // If user is logged in and has captive context, auto authorize device
      if (isLoggedIn && hasToken && captiveContext) {
        console.log('🚀 User already logged in with captive context - auto authorizing device...');
        
        // Set axios auth token if available
        const token = localStorage.getItem(STORAGE_KEYS.accessToken) || localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          setAxiosAuthToken(token);
        }

        try {
          // Call authorize device API
          const payload = buildAuthorizeDevicePayload(captiveContext);
          await authorizeDevice(payload);
          console.log('✅ Device authorized successfully via redirect');

          // Clear captive context after successful authorization
          localStorage.removeItem(STORAGE_KEYS.portalCaptiveContext);

          // Redirect to network connecting screen
          router.push('/network-connecting');
        } catch (error) {
          console.error('❌ Failed to authorize device via redirect:', error);
          // Even if authorization fails, we can still show the connecting screen
          // The captive portal will handle the actual device authorization on the controller
          localStorage.removeItem(STORAGE_KEYS.portalCaptiveContext);
          router.push('/network-connecting');
        }
      }
    };

    // Run after a small delay to ensure initialization is complete
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
          return 'Không thể kết nối đến servidor. Vui lòng kiểm tra mạng và thử lại.';
        }
        if (maybeAxios.message.includes('timeout')) {
          return 'Hết thời gian kết nối. Vui lòng thử lại.';
        }
        return 'Đăng nhập thất bại. Vui lòng thử lại.';
      }
    }

    return 'Đăng nhập thất bại. Vui lòng thử lại.';
  };

  // const getAuthorizeErrorMessage = (apiError: unknown): string => {
  //   if (typeof apiError === 'object' && apiError !== null) {
  //     const maybeAxios = apiError as {
  //       response?: { data?: { message?: string } };
  //       message?: string;
  //     };

  //     if (maybeAxios.response?.data?.message) {
  //       return maybeAxios.response.data.message;
  //     }

  //     if (maybeAxios.message) {
  //       return maybeAxios.message;
  //     }
  //   }

  //   return 'Xác thực thiết bị thất bại. Vui lòng thử lại.';
  // };

  const getGuestIdentifier = () =>
    guestAuthMethod === 'email' ? guestForm.email.trim() : guestForm.phone.trim();

  // FIX: Sửa lại hàm này để chạy ngầm - KHÔNG redirect ở đây
  const authorizeDeviceInBackground = async (): Promise<void> => {
    try {
      const captiveContext = getCaptivePortalContext('');

      console.log('🔐 Authorizing device...');
      console.log('🔐 Captive context:', captiveContext);

      if (!captiveContext) {
        console.warn('⚠️ No captive context found, skipping device authorization');
        return;
      }

      const payload = buildAuthorizeDevicePayload(captiveContext);
      await authorizeDevice(payload);

      console.log('✅ Device authorized successfully');

      // Xóa context sau khi authorize thành công
      localStorage.removeItem(STORAGE_KEYS.portalCaptiveContext);
    } catch (error) {
      console.error('❌ Failed to authorize device (non-blocking):', error);
    }
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
      // Fallback: vẫn lưu session nhưng với data cơ bản
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

    // Temporary fallback for providers not available in backend OAuth2 yet.
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

      // FIX: Lưu flag TRƯỚC khi authorize (vì authorize sẽ xóa context)
      const hasCaptiveContext = getCaptivePortalContext('');
      
      // Gọi authorize device ngầm
      await authorizeDeviceInBackground();

      // Kiểm tra flag đã lưu để quyết định redirect
      if (hasCaptiveContext) {
        router.push('/network-connecting');
      } else {
        router.push('/session');
      }
      setIsLoading(false);
    }, 1200);
  };

  const handleSendOtp = async () => {
    const contact = getGuestIdentifier();
    if (!contact || !guestForm.password) return;
    
    // Validate passwords
    if (guestForm.password.length < 8) {
      setOtpError('Mật khẩu phải có ít nhất 8 ký tự');
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
    } catch (apiError) {
      setOtpError(String(apiError));
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    
    // Auto focus next input
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
    // Validate password policy
    if (!guestNewPassword || guestNewPassword.length < 8) {
      setOtpError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    if (!/[A-Z]/.test(guestNewPassword)) {
      setOtpError('Mật khẩu phải có ít nhất 1 chữ hoa (A-Z)');
      return;
    }
    if (!/[a-z]/.test(guestNewPassword)) {
      setOtpError('Mật khẩu phải có ít nhất 1 chữ thường (a-z)');
      return;
    }
    if (!/[0-9]/.test(guestNewPassword)) {
      setOtpError('Mật khẩu phải có ít nhất 1 số (0-9)');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(guestNewPassword)) {
      setOtpError('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
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
  };

  const handleUseGuestCredentials = async () => {
    const guestIdentifier = getGuestIdentifier();
    setGuestModalOpen(false);
    setIsLoading(true);
    setError('');

    try {
      const result = await loginWithPassword({
        identifier: guestIdentifier,
        password: guestForm.password,
      });

      localStorage.setItem(STORAGE_KEYS.accessToken, result.accessToken);
      localStorage.setItem(STORAGE_KEYS.refreshToken, result.refreshToken);
      setAxiosAuthToken(result.accessToken);
      await persistSession(guestIdentifier, result.roles?.[0]);

      // FIX: Lưu flag TRƯỚC khi authorize (vì authorize sẽ xóa context)
      const hasCaptiveContext = getCaptivePortalContext('');
      
      // Gọi authorize device ngầm
      await authorizeDeviceInBackground();

      resetGuestForm();

      // Kiểm tra flag đã lưu để quyết định redirect
      if (hasCaptiveContext) {
        router.push('/network-connecting');
      } else {
        router.push('/session');
      }
    } catch (apiError) {
      setError(getLoginErrorMessage(apiError));
      setIsLoading(false);
    }
  };

  const handleStandardLogin = async () => {
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

      localStorage.setItem(STORAGE_KEYS.accessToken, result.accessToken);
      localStorage.setItem(STORAGE_KEYS.refreshToken, result.refreshToken);
      setAxiosAuthToken(result.accessToken);
      await persistSession(loginUsername, result.roles?.[0]);

      // FIX: Lưu flag TRƯỚC khi authorize (vì authorize sẽ xóa context)
      const hasCaptiveContext = getCaptivePortalContext('');
      
      // Gọi authorize device ngầm
      await authorizeDeviceInBackground();

      // Kiểm tra flag đã lưu để quyết định redirect
      if (hasCaptiveContext) {
        router.push('/network-connecting');
      } else {
        router.push('/session');
      }
    } catch (apiError) {
      setError(getLoginErrorMessage(apiError));
      setIsLoading(false);
    }
  };

  // Forgot password handlers
  const handleSendForgotOtp = () => {
    if (!forgotContact) return;
    setIsSendingForgotOtp(true);
    setForgotOtpError('');
    setTimeout(() => {
      setIsSendingForgotOtp(false);
      setForgotStep('otp');
    }, 1500);
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

  const handleVerifyForgotOtp = () => {
    const otp = forgotOtp.join('');
    if (otp.length !== 6) {
      setForgotOtpError('Vui lòng nhập đủ 6 số');
      return;
    }
    setIsVerifyingForgotOtp(true);
    setForgotOtpError('');
    setTimeout(() => {
      setIsVerifyingForgotOtp(false);
      setForgotStep('newpass');
    }, 1500);
  };

  const handleResendForgotOtp = () => {
    setForgotOtp(['', '', '', '', '', '']);
    setIsSendingForgotOtp(true);
    setTimeout(() => setIsSendingForgotOtp(false), 1500);
  };

  const handleResetPassword = () => {
    // Validate password policy
    if (!newPassword || newPassword.length < 8) {
      setForgotOtpError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setForgotOtpError('Mật khẩu phải có ít nhất 1 chữ hoa (A-Z)');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setForgotOtpError('Mật khẩu phải có ít nhất 1 chữ thường (a-z)');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setForgotOtpError('Mật khẩu phải có ít nhất 1 số (0-9)');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setForgotOtpError('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotOtpError('Xác nhận mật khẩu không khớp');
      return;
    }
    setIsResettingPassword(true);
    setForgotOtpError('');
    setTimeout(() => {
      setIsResettingPassword(false);
      setForgotStep('success');
    }, 1500);
  };

  const resetForgotForm = () => {
    setForgotContact('');
    setForgotMethod('email');
    setForgotStep('form');
    setForgotOtp(['', '', '', '', '', '']);
    setForgotOtpError('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowNewPassword(false);
  };

  const handleUseForgotCredentials = () => {
    setForgotModalOpen(false);
    setIsLoading(true);
    
    // FIX: Lưu flag TRƯỚC khi setTimeout
    const hasCaptiveContext = getCaptivePortalContext('');
    
    setTimeout(() => {
      localStorage.setItem('portalLoggedIn', 'true');
      localStorage.setItem('portalUser', JSON.stringify({
        ...currentUser,
        username: forgotContact,
        loginTime: new Date().toISOString()
      }));
      resetForgotForm();
      
      // Kiểm tra flag đã lưu để quyết định redirect
      if (hasCaptiveContext) {
        router.push('/network-connecting');
      } else {
        router.push('/session');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src={hcmusLogo} alt="HCMUS Logo" className="w-14 h-14 object-contain" />
            <p className="text-gray-600 font-sans">Trường Đại học KHTN - ĐHQG HCM</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Segmented Control */}
            <div className="flex p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setActiveTab('internal')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === 'internal'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Cán bộ / Sinh viên
              </button>
              <button
                onClick={() => setActiveTab('guest')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === 'guest'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Khách
              </button>
            </div>

            {activeTab === 'internal' ? (
              <InternalLoginTab 
                isLoading={isLoading} 
                onSSOLogin={handleSSOLogin} 
              />
            ) : (
              <GuestLoginTab 
                isLoading={isLoading}
                onSSOLogin={handleSSOLogin}
                onOpenGuestModal={() => setGuestModalOpen(true)}
                username={loginUsername}
                onUsernameChange={setLoginUsername}
                password={loginPassword}
                onPasswordChange={setLoginPassword}
                showPassword={showLoginPassword}
                onTogglePassword={() => setShowLoginPassword(!showLoginPassword)}
                onLogin={handleStandardLogin}
                onOpenForgotModal={() => setForgotModalOpen(true)}
                loginError={activeTab === 'guest' ? error : ''}
              />
            )}

            {/* Terms Checkbox */}
            <div className="flex items-start space-x-3 pt-4 border-t border-gray-100 mt-2">
              <Checkbox 
                id="terms" 
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                className="mt-0.5 rounded"
              />
              <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                Tôi đồng ý với{' '}
                <button 
                  type="button"
                  onClick={() => setTermsModalOpen(true)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Điều khoản sử dụng WiFi
                </button>
              </Label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          © 2026 HCMUS - Trường Đại học Khoa học Tự nhiên
        </p>
      </div>

      <TermsDialog
        open={termsModalOpen}
        sessionTimeoutHours={studentPolicy.session_timeout / 3600}
        bandwidthRange={`${qosPolicies.Student.bandwidth_limit}-${qosPolicies.Teacher.bandwidth_limit}`}
        dailyQuota={formatBytes(studentPolicy.quota_daily)}
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
    </div>
  );
}