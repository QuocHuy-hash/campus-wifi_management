import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { authorizeDevice, getMeProfile } from '@/features/auth/api/authApi';
import { STORAGE_KEYS } from '@/constants/appKeys';
import { getCaptivePortalContext, buildAuthorizeDevicePayload } from '@/lib/captivePortal';
import NetworkConnectingScreen from '@/components/NetworkConnectingScreen';

export default function OAuthSuccess() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);
  const [showNetworkConnecting, setShowNetworkConnecting] = useState(false);

  const completeOAuthFlow = useCallback(async () => {
    setIsProcessing(true);
    setError('');

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    let hasAuthenticatedSession = Boolean(accessToken || localStorage.getItem(STORAGE_KEYS.accessToken));

    if (accessToken) {
      localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
    }

    try {
      const profile = await getMeProfile();
      hasAuthenticatedSession = true;
      localStorage.setItem(STORAGE_KEYS.portalLoggedIn, 'true');
      localStorage.setItem(
        STORAGE_KEYS.portalUser,
        JSON.stringify({
          id: profile.id,
          username: profile.username || profile.email || 'oauth2-user',
          fullname: profile.fullName || profile.username || 'OAuth2 User',
          email: profile.email || profile.username || 'oauth2-user',
          role: profile.roles?.[0] || 'CLIENT',
          status: profile.status,
          avatarUrl: profile.avatarUrl,
          loginTime: profile.lastLoginAt || new Date().toISOString(),
        }),
      );
    } catch (apiError) {
      if (!hasAuthenticatedSession) {
        setIsProcessing(false);
        setError(
          typeof apiError === 'object' &&
            apiError !== null &&
            'message' in apiError &&
            typeof apiError.message === 'string'
            ? apiError.message
            : 'Không thể xác nhận phiên đăng nhập từ backend.',
        );
        setLocation('/login');
        return;
      }

      localStorage.setItem(STORAGE_KEYS.portalLoggedIn, 'true');
    }

    const captiveContext = getCaptivePortalContext(window.location.search);

    if (captiveContext) {
      try {
        const payload = buildAuthorizeDevicePayload(captiveContext);
        await authorizeDevice(payload);

        localStorage.removeItem(STORAGE_KEYS.portalCaptiveContext);
        sessionStorage.removeItem(STORAGE_KEYS.oauthProvider);
        
        // Show network connecting screen before redirecting
        setShowNetworkConnecting(true);
        return;
      } catch (apiError) {
        const message =
          typeof apiError === 'object' &&
          apiError !== null &&
          'message' in apiError &&
          typeof apiError.message === 'string'
            ? apiError.message
            : 'Xác thực thiết bị thất bại. Vui lòng thử lại.';
        setError(message);
        setIsProcessing(false);
        return;
      }
    }

    // if (!localStorage.getItem(STORAGE_KEYS.portalUser)) {
    //   localStorage.setItem(
    //     STORAGE_KEYS.portalUser,
    //     JSON.stringify({
    //       username: 'oauth2-user',
    //       fullname: 'OAuth2 User',
    //       email: 'oauth2-user@hcmus.local',
    //       role: 'Guest',
    //       department: 'OAuth2',
    //       status: 'Active',
    //       loginTime: new Date().toISOString(),
    //       provider: 'google',
    //     }),
    //   );
    // }

    window.history.replaceState({}, document.title, '/auth/success');
    const redirectPath = sessionStorage.getItem('oauth2_redirect_back') || '/session';
    sessionStorage.removeItem('oauth2_redirect_back');
    sessionStorage.removeItem(STORAGE_KEYS.oauthProvider);
    setLocation(redirectPath);
  }, [setLocation]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void completeOAuthFlow();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [completeOAuthFlow]);

  return (
    <>
      {showNetworkConnecting ? (
        <NetworkConnectingScreen onComplete={() => window.location.assign('/session')} />
      ) : (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-sm text-center text-sm text-gray-600 space-y-4">
            {isProcessing ? <p>Đang hoàn tất đăng nhập...</p> : null}
            {!isProcessing && error ? (
              <>
                <p className="text-red-600">{error}</p>
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => {
                    void completeOAuthFlow();
                  }}
                >
                  Thử lại xác thực thiết bị
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
