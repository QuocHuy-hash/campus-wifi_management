"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { authorizeDevice, getMeProfile } from "@/features/auth/api/authApi";
import { STORAGE_KEYS } from "@/constants/appKeys";
import { getCaptivePortalContext, buildAuthorizeDevicePayload } from "@/lib/captivePortal";
import NetworkConnectingScreen from "@/components/NetworkConnectingScreen";
import { getRedirectUrl, clearRedirectUrl, navigateOrFallback } from "@/lib/captivePortal";
import { clearStoredAuthSession, establishSessionCookie } from "@/lib/session";

export default function OAuthSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(true);
  const [showNetworkConnecting, setShowNetworkConnecting] = useState(false);

  const completeOAuthFlow = useCallback(async () => {
    setIsProcessing(true);
    setError("");

    const accessToken = searchParams?.get("access_token");
    let hasAuthenticatedSession = Boolean(accessToken || localStorage.getItem(STORAGE_KEYS.accessToken));

    if (accessToken) {
      localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
      try {
        await establishSessionCookie(accessToken);
      } catch {
        clearStoredAuthSession();
        setIsProcessing(false);
        setError(t("common.sessionSetupFailed"));
        return;
      }
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
        setError(t("common.sessionConfirmFailed"));
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

        localStorage.removeItem(STORAGE_KEYS.portalCaptiveContext);
        sessionStorage.removeItem(STORAGE_KEYS.oauthProvider);

        setShowNetworkConnecting(true);
        return;
      } catch {
        setError(t("common.deviceAuthFailedRetry"));
        setIsProcessing(false);
        return;
      }
    }

    const redirectPath = sessionStorage.getItem("oauth2_redirect_back") || "/session";
    sessionStorage.removeItem("oauth2_redirect_back");
    sessionStorage.removeItem(STORAGE_KEYS.oauthProvider);
    window.location.href = redirectPath;
  }, [router, searchParams, t]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void completeOAuthFlow();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [completeOAuthFlow]);

  return (
    <>
      {showNetworkConnecting ? (
        <NetworkConnectingScreen onComplete={() => {
          const redirectUrl = getRedirectUrl();
          clearRedirectUrl();
          navigateOrFallback(redirectUrl);
        }} />
      ) : (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-sm text-center text-sm text-gray-600 space-y-4">
            {isProcessing ? <p>{t("redirect.completingLogin")}</p> : null}
            {!isProcessing && error ? (
              <>
                <p className="text-red-600">{error}</p>
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => void completeOAuthFlow()}
                >
                  {t("common.retry")}
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
