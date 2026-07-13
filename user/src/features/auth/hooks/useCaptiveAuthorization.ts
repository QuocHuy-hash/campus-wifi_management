"use client";

import { useCallback, useState } from 'react';
import { getCaptivePortalContext, buildAuthorizeDevicePayload } from '@/lib/captivePortal';
import { authorizeDevice } from '@/features/auth/api/authApi';
import { STORAGE_KEYS } from '@/constants/appKeys';

interface UseCaptiveAuthorizationResult {
  isAuthorizing: boolean;
  authorized: boolean;
  error: string | null;
  authorize: () => Promise<boolean>;
}

export function useCaptiveAuthorization(): UseCaptiveAuthorizationResult {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authorize = useCallback(async (): Promise<boolean> => {
    const captiveContext = getCaptivePortalContext('');
    if (!captiveContext) {
      setAuthorized(true);
      return true;
    }

    setIsAuthorizing(true);
    setError(null);
    try {
      const payload = buildAuthorizeDevicePayload(captiveContext);
      await authorizeDevice(payload);
      localStorage.removeItem(STORAGE_KEYS.portalCaptiveContext);
      setAuthorized(true);
      return true;
    } catch (err) {
      const message = 'Xác thực thiết bị thất bại';
      setError(message);
      return false;
    } finally {
      setIsAuthorizing(false);
    }
  }, []);

  return { isAuthorizing, authorized, error, authorize };
}
