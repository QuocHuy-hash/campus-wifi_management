"use client";

import NetworkConnectingScreen from "@/components/NetworkConnectingScreen";
import { getRedirectUrl, clearRedirectUrl } from "@/lib/captivePortal";

export default function NetworkConnectingPage() {
  const handleComplete = () => {
    const redirectUrl = getRedirectUrl();
    console.log('[NetworkConnecting] Redirect URL từ context:', redirectUrl || '(không có, fallback /session)');
    clearRedirectUrl();
    window.location.replace(redirectUrl || "/session");
  };

  return <NetworkConnectingScreen onComplete={handleComplete} />;
}
