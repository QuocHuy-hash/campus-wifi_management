"use client";

import { Provider } from "react-redux";
import { store } from "@/stores/store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { initializeAxios, setAxiosAuthToken } from "@/config/axios";
import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AUTH_COOKIE_KEY, STORAGE_KEYS } from "@/constants/appKeys";
import {
  buildAuthorizeDevicePayload,
  extractCaptivePortalContext,
  saveCaptivePortalContext,
} from "@/lib/captivePortal";
import { authorizeDevice } from "@/features/auth/api/authApi";
import { logger } from "@/lib/logger";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const processedCaptiveRedirectRef = useRef<string | null>(null);

  useEffect(() => {
    initializeAxios();
  }, []);

  useEffect(() => {
    const search = searchParams.toString();
    const captiveContext = extractCaptivePortalContext(search);

    // Only authorize requests that actually carry all required captive params.
    if (!captiveContext) return;

    saveCaptivePortalContext(captiveContext);

    const hasAuthCookie = document.cookie.split(";").some((cookie) => {
      const [name] = cookie.trim().split("=");
      return name === AUTH_COOKIE_KEY;
    });
    const token =
      localStorage.getItem(STORAGE_KEYS.accessToken) ||
      localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    if (!hasAuthCookie || !token) return;

    const redirectKey = JSON.stringify(captiveContext);
    if (processedCaptiveRedirectRef.current === redirectKey) return;
    processedCaptiveRedirectRef.current = redirectKey;

    let cancelled = false;

    const authorizeCaptiveDevice = async () => {
      setAxiosAuthToken(token);

      try {
        await authorizeDevice(buildAuthorizeDevicePayload(captiveContext));
      } catch (error) {
        logger.error("Failed to authorize device from captive redirect:", error);
      } finally {
        localStorage.removeItem(STORAGE_KEYS.portalCaptiveContext);
        if (!cancelled) {
          router.replace("/network-connecting");
        }
      }
    };

    void authorizeCaptiveDevice();

    return () => {
      cancelled = true;
    };
  }, [pathname, router, searchParams]);

  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <Toaster />
          {children}
        </TooltipProvider>
      </ThemeProvider>
    </Provider>
  );
}
