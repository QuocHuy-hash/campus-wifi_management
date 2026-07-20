"use client";

import NetworkConnectingScreen from "@/components/NetworkConnectingScreen";
import { getRedirectUrl, clearRedirectUrl } from "@/lib/captivePortal";

export default function NetworkConnectingPage() {
  const handleComplete = () => {
    const redirectUrl = getRedirectUrl();
    clearRedirectUrl();
    window.location.replace(redirectUrl || "/session");
  };

  return <NetworkConnectingScreen onComplete={handleComplete} />;
}
