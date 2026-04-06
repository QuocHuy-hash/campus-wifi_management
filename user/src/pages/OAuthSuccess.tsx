import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { STORAGE_KEYS } from '@/constants/appKeys';

export default function OAuthSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');

    if (!accessToken) {
      setLocation('/login');
      return;
    }

    // HttpOnly cookie must be set by backend response headers, not JavaScript.
    // Frontend only persists a minimal app session flag and removes token from URL.
    localStorage.setItem(STORAGE_KEYS.portalLoggedIn, 'true');
 localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
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
    setLocation(redirectPath);
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
      Đang hoàn tất đăng nhập...
    </div>
  );
}
