"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { authorizeDevice, exchangeOAuth2Code, getMeProfile } from "@/features/auth/api/authApi";
import { STORAGE_KEYS } from "@/constants/appKeys";
import { getCaptivePortalContext, buildAuthorizeDevicePayload } from "@/lib/captivePortal";
import NetworkConnectingScreen from "@/components/NetworkConnectingScreen";
import { clearStoredAuthSession, establishSessionCookie } from "@/lib/session";
import { initializeAxios, setAxiosAuthToken } from "@/config/axios";
import { logger } from "@/lib/logger";

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

    // Khởi tạo axios trước khi gọi các API được bảo vệ.
    // Điều này rất quan trọng vì trang này được load lại sau redirect từ OAuth2 provider.
    initializeAxios();

    // Sửa ngày 2026-09-08: callback mới nhận oauth_code một lần, không còn JWT trong URL.
    const oauthCode = searchParams?.get("oauth_code");
    const accessToken = searchParams?.get("access_token"); // Tương thích callback wifi-user cũ khi rollout.
    const oauthError = searchParams?.get("oauth_error");
    if (oauthError) {
      setIsProcessing(false);
      setError(t("common.sessionConfirmFailed"));
      return;
    }
    let hasAuthenticatedSession = Boolean(accessToken || localStorage.getItem(STORAGE_KEYS.accessToken));

    if (oauthCode || accessToken) {
      try {
        const loginResult = oauthCode
          ? await exchangeOAuth2Code(oauthCode)
          : { accessToken: accessToken as string };
        localStorage.setItem(STORAGE_KEYS.accessToken, loginResult.accessToken);
        setAxiosAuthToken(loginResult.accessToken);
        hasAuthenticatedSession = true;
        await establishSessionCookie(loginResult.accessToken);
      } catch {
        clearStoredAuthSession();
        setAxiosAuthToken(null);
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
    } catch (profileError) {
      logger.error("Lấy thông tin user sau OAuth2 thất bại:", profileError);
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
      } catch (authError) {
        logger.error("Cấp quyền thiết bị sau OAuth2 thất bại:", authError);
        setError(t("common.deviceAuthFailedRetry"));
        setIsProcessing(false);
        return;
      }
    }

    const redirectPath = sessionStorage.getItem("oauth2_redirect_back") || "/session";
    sessionStorage.removeItem("oauth2_redirect_back");
    sessionStorage.removeItem(STORAGE_KEYS.oauthProvider);
    // Huy- Cập nhật ngày 2026-09-08: OAuth không có Captive Portal vào Home như đăng nhập thông thường.
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
        <NetworkConnectingScreen onComplete={() => { window.location.href = "/network-success"; }} />
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
