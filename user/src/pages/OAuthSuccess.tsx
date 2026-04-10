import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { authorizeDevice } from '@/features/auth/api/authApi';
import type { CaptivePortalContext } from '@/features/auth/types';
import { STORAGE_KEYS } from '@/constants/appKeys';

export default function OAuthSuccess() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);

  const getStoredCaptiveContext = (): CaptivePortalContext | null => {
    const rawContext = sessionStorage.getItem(STORAGE_KEYS.portalCaptiveContext);

    if (!rawContext) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawContext) as Partial<CaptivePortalContext>;

      if (!parsed.id || !parsed.ap || !parsed.ssid || !parsed.url) {
        return null;
      }

      return {
        id: parsed.id,
        ap: parsed.ap,
        ssid: parsed.ssid,
        url: parsed.url,
      };
    } catch {
      return null;
    }
  };

  const completeOAuthFlow = useCallback(async () => {
    setIsProcessing(true);
    setError('');

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');

    if (!accessToken && !localStorage.getItem(STORAGE_KEYS.accessToken)) {
      setIsProcessing(false);
      setLocation('/login');
      return;
    }

    // HttpOnly cookie must be set by backend response headers, not JavaScript.
    // Frontend only persists a minimal app session flag and removes token from URL.
    localStorage.setItem(STORAGE_KEYS.portalLoggedIn, 'true');
    if (accessToken) {
      localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
    }

    const provider = sessionStorage.getItem(STORAGE_KEYS.oauthProvider) || 'google';
    const captiveContext = getStoredCaptiveContext();

    if (captiveContext) {
      try {
        await authorizeDevice({
          ...captiveContext,
          provider,
          deviceType: '',
          deviceName: '',
        });

        sessionStorage.removeItem(STORAGE_KEYS.portalCaptiveContext);
        sessionStorage.removeItem(STORAGE_KEYS.oauthProvider);
        window.location.assign(captiveContext.url);
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
  );
}
