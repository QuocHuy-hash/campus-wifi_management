"use client";

import NetworkConnectingScreen from "@/components/NetworkConnectingScreen";
import { getRedirectUrl, clearRedirectUrl, navigateOrFallback } from "@/lib/captivePortal";

export default function NetworkConnectingPage() {
  const handleComplete = () => {
    const redirectUrl = getRedirectUrl();
    console.log('[NetworkConnecting] Redirect URL:', redirectUrl || '(none, fallback /session)');
    clearRedirectUrl();
    navigateOrFallback(redirectUrl);
  };

  return <NetworkConnectingScreen onComplete={handleComplete} />;
}
