"use client";

import { useCallback, useState } from 'react';
import {
  getCaptivePortalContext,
  buildAuthorizeDevicePayload,
  saveCaptivePortalContext,
  persistNetworkConnectingHandoff,
  clearCaptivePortalContext,
} from '@/lib/captivePortal';
import { authorizeDevice } from '@/features/auth/api/authApi';

interface AuthorizeResult {
  ok: boolean;
  hadCaptiveContext: boolean;
}

interface UseCaptiveAuthorizationResult {
  isAuthorizing: boolean;
  authorized: boolean;
  error: string | null;
  authorize: () => Promise<AuthorizeResult>;
}

export function useCaptiveAuthorization(): UseCaptiveAuthorizationResult {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authorize = useCallback(async (): Promise<AuthorizeResult> => {
    // Đọc context từ cả URL (xử lý ca middleware redirect /login?params → /session?params)
    // lẫn localStorage (context đã lưu từ lần trước).
    const captiveContext = getCaptivePortalContext(
      typeof window !== 'undefined' ? window.location.search : ''
    );

    if (!captiveContext) {
      setAuthorized(true);
      return { ok: true, hadCaptiveContext: false };
    }

    // Context đến từ URL → lưu ngay trước khi gọi API (phòng trường hợp API lỗi).
    if (typeof window !== 'undefined' && window.location.search) {
      const fromUrl = getCaptivePortalContext(window.location.search);
      if (fromUrl) {
        saveCaptivePortalContext(fromUrl);
      }
    }

    setIsAuthorizing(true);
    setError(null);
    try {
      const payload = buildAuthorizeDevicePayload(captiveContext);
      await authorizeDevice(payload);

      // Handoff entryMode + URL đích sang /network-connecting trước khi xoá context.
      persistNetworkConnectingHandoff(captiveContext);
      clearCaptivePortalContext();

      setAuthorized(true);
      return { ok: true, hadCaptiveContext: true };
    } catch (err) {
      const message = 'Xác thực thiết bị thất bại';
      setError(message);
      // Giữ context trong localStorage để caller có thể retry.
      return { ok: false, hadCaptiveContext: true };
    } finally {
      setIsAuthorizing(false);
    }
  }, []);

  return { isAuthorizing, authorized, error, authorize };
}
