"use client";

import { useCallback, useState } from 'react';
import { getCaptivePortalContext, buildAuthorizeDevicePayload } from '@/lib/captivePortal';
import { authorizeDevice } from '@/features/auth/api/authApi';
import { STORAGE_KEYS } from '@/constants/appKeys';
import { initializeAxios } from '@/config/axios';
import { logger } from '@/lib/logger';

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

    // Đảm bảo axios đã được khởi tạo trước khi gọi API cấp quyền thiết bị.
    initializeAxios();

    setIsAuthorizing(true);
    setError(null);
    try {
      const payload = buildAuthorizeDevicePayload(captiveContext);
      await authorizeDevice(payload);
      localStorage.removeItem(STORAGE_KEYS.portalCaptiveContext);
      setAuthorized(true);
      return true;
    } catch (err) {
      logger.error('[CaptiveAuthorization] Authorize device failed; continuing current flow:', err);
      // Không retry vô hạn ở các trang session/account/history. Lỗi chi tiết
      // đã được backend/Core ghi lại và không được chặn trải nghiệm trên FE.
      localStorage.removeItem(STORAGE_KEYS.portalCaptiveContext);
      setError(null);
      return true;
    } finally {
      setIsAuthorizing(false);
    }
  }, []);

  return { isAuthorizing, authorized, error, authorize };
}
