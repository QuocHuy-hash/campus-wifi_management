"use client";

import { Provider } from "react-redux";
import { store } from "@/stores/store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { initializeAxios } from "@/config/axios";
import { useEffect } from "react";
import {
  clearCaptiveFlow,
  extractCaptivePortalContext,
  saveCaptivePortalContext,
} from "@/lib/captivePortal";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeAxios();
  }, []);

  useEffect(() => {
    const captiveContext = extractCaptivePortalContext(window.location.search);
    if (captiveContext) {
      saveCaptivePortalContext(captiveContext);
      return;
    }

    if (window.location.pathname === "/login") {
      const params = new URLSearchParams(window.location.search);
      const returnUrl = params.get("returnUrl");

      if (returnUrl) {
        const queryStart = returnUrl.indexOf("?");
        if (queryStart >= 0) {
          const returnContext = extractCaptivePortalContext(returnUrl.substring(queryStart));
          if (returnContext) {
            saveCaptivePortalContext(returnContext);
            return;
          }
        }
      }

      clearCaptiveFlow();
    }
  }, []);

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
