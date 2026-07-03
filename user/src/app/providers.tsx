"use client";

import { Provider } from "react-redux";
import { store } from "@/stores/store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { initializeAxios } from "@/config/axios";
import { useEffect } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeAxios();
  }, []);

  return (
    <Provider store={store}>
      <TooltipProvider>
        <Toaster />
        {children}
      </TooltipProvider>
    </Provider>
  );
}
