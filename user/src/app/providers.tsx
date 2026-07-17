"use client";

import { Provider } from "react-redux";
import { store } from "@/stores/store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { initializeAxios } from "@/config/axios";
import { useEffect } from "react";
import { extractCaptivePortalContext, saveCaptivePortalContext } from "@/lib/captivePortal";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeAxios();
  }, []);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search).toString();
    const captiveContext = extractCaptivePortalContext(search);
    if (captiveContext) {
      saveCaptivePortalContext(captiveContext);
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
