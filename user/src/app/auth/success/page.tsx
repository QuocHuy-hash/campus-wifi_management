"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authorizeDevice, getMeProfile } from "@/features/auth/api/authApi";
import { STORAGE_KEYS } from "@/constants/appKeys";
import {
  buildAuthorizeDevicePayload,
  continueToNetworkConnecting,
  getCaptivePortalContext,
} from "@/lib/captivePortal";

export default function OAuthSuccess() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(true);

  const completeOAuthFlow = useCallback(async () => {
    setIsProcessing(true);
    setError("");

    const accessToken = searchParams?.get("access_token");
    let hasAuthenticatedSession = Boolean(accessToken || localStorage.getItem(STORAGE_KEYS.accessToken));

    if (accessToken) {
      localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
      // Set httpOnly cookie via API route
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });
    }

    try {
      const profile = await getMeProfile();
      hasAuthenticatedSession = true;
      localStorage.setItem(STORAGE_KEYS.portalLoggedIn, "true");
      localStorage.setItem(
        STORAGE_KEYS.portalUser,
        JSON.stringify({
          id: profile.id,
          username: profile.username || profile.email || "oauth2-user",
          fullname: profile.fullName || profile.username || "OAuth2 User",
          email: profile.email || profile.username || "oauth2-user",
          role: profile.roles?.[0] || "CLIENT",
          status: profile.status,
          avatarUrl: profile.avatarUrl,
          loginTime: profile.lastLoginAt || new Date().toISOString(),
        }),
      );
    } catch {
      if (!hasAuthenticatedSession) {
        setIsProcessing(false);
        setError("Không thể xác nhận phiên đăng nhập từ backend.");
        window.location.href = "/login";
        return;
      }
      localStorage.setItem(STORAGE_KEYS.portalLoggedIn, "true");
    }

    const captiveContext = getCaptivePortalContext(window.location.search);

    if (captiveContext) {
      try {
        const payload = buildAuthorizeDevicePayload(captiveContext);
        await authorizeDevice(payload);

        sessionStorage.removeItem(STORAGE_KEYS.oauthProvider);
        continueToNetworkConnecting(captiveContext);
        return;
      } catch {
        setError("Đăng ký thiết bị thất bại. Vui lòng thử lại.");
        setIsProcessing(false);
        return;
      }
    }

    const redirectPath = sessionStorage.getItem("oauth2_redirect_back") || "/session";
    sessionStorage.removeItem("oauth2_redirect_back");
    sessionStorage.removeItem(STORAGE_KEYS.oauthProvider);
    window.location.href = redirectPath;
  }, [searchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void completeOAuthFlow();
    }, 0);
    return () => window.clearTimeout(timer);
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
              onClick={() => void completeOAuthFlow()}
            >
              Thử lại đăng ký thiết bị
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
