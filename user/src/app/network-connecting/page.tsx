"use client";

import { useCallback, useRef } from "react";
import NetworkConnectingScreen from "@/components/NetworkConnectingScreen";
import { useRouter } from "next/navigation";

export default function NetworkConnectingPage() {
  const router = useRouter();
  const isApple = useRef(
    typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent)
  );

  const onComplete = useCallback(() => {
    let originalUrl: string | null = null;
    try {
      originalUrl = sessionStorage.getItem('captiveOriginalUrl');
    } catch {
      // sessionStorage unavailable — proceed to fallback
    }
    try {
      sessionStorage.removeItem('captiveOriginalUrl');
    } catch {
      // best-effort cleanup
    }

    if (originalUrl) {
      window.location.href = originalUrl;
    } else if (isApple.current) {
      window.location.href = 'http://captive.apple.com/hotspot-detect.html';
    } else {
      router.replace("/session");
    }
  }, [router]);

  return <NetworkConnectingScreen onComplete={onComplete} />;
}
