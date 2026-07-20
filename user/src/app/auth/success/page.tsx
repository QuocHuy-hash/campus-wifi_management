"use client";

import { useCallback, useEffect, useState } from "react";
import { getMeProfile } from "@/features/auth/api/authApi";
import { STORAGE_KEYS } from "@/constants/appKeys";
import { logRedirect } from "@/lib/redirectLog";
import { useAuthorizeDevice } from "@/hooks/useAuthorizeDevice";
import { useCaptivePortal } from "@/hooks/useCaptivePortal";

export default function OAuthSuccess() {
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(true);
  const { isReady: isContextReady, context: captiveContext } = useCaptivePortal();
  const { execute: doAuthorize, isLoading: isAuthorizing } = useAuthorizeDevice();

  const completeOAuthFlow = useCallback(async () => {
    setIsProcessing(true);
    setError("");

    const searchParams =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    const accessToken = searchParams?.get("access_token");
    let hasAuthenticatedSession = Boolean(
      accessToken || localStorage.getItem(STORAGE_KEYS.accessToken)
    );

    if (accessToken) {
      localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
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
        })
      );
    } catch {
      if (!hasAuthenticatedSession) {
        setIsProcessing(false);
        setError("Không thể xác nhận phiên đăng nhập từ backend.");
        logRedirect("/login", "oauth-success: không xác nhận được phiên từ backend");
        window.location.href = "/login";
        return;
      }
      localStorage.setItem(STORAGE_KEYS.portalLoggedIn, "true");
    }

    const ctx =
      captiveContext ||
      (() => {
        const raw = localStorage.getItem(STORAGE_KEYS.portalCaptiveContext);
        if (!raw) return null;
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      })();

    if (ctx) {
      const authorized = await doAuthorize(ctx);
      if (authorized) return;
      setError("Xác thực thiết bị thất bại. Vui lòng thử lại.");
      setIsProcessing(false);
      return;
    }

    const redirectPath =
      (typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem("oauth2_redirect_back")
        : null) || "/session";
    try {
      sessionStorage.removeItem("oauth2_redirect_back");
      sessionStorage.removeItem(STORAGE_KEYS.oauthProvider);
    } catch {}
    logRedirect(redirectPath, "oauth-success: không có captive context");
    window.location.href = redirectPath;
  }, [captiveContext, doAuthorize]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void completeOAuthFlow();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [completeOAuthFlow]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm text-center text-sm text-gray-600 space-y-4">
        {isProcessing || isAuthorizing ? (
          <p>Đang hoàn tất đăng nhập...</p>
        ) : null}
        {!isProcessing && !isAuthorizing && error ? (
          <>
            <p className="text-red-600">{error}</p>
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => void completeOAuthFlow()}
            >
              Thử lại xác thực thiết bị
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
