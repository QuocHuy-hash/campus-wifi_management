"use client";

import { useRef } from "react";
import NetworkConnectingScreen from "@/components/NetworkConnectingScreen";
import { useRouter } from "next/navigation";

export default function NetworkConnectingPage() {
  const router = useRouter();
  const isApple = useRef(
    typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent)
  );
  const originalUrl = typeof window !== 'undefined'
    ? sessionStorage.getItem('captiveOriginalUrl')
    : null;

  return <NetworkConnectingScreen onComplete={() => {
    sessionStorage.removeItem('captiveOriginalUrl');

    if (originalUrl) {
      window.location.href = originalUrl;
    } else if (isApple.current) {
      window.location.href = 'http://captive.apple.com/hotspot-detect.html';
    } else {
      router.replace("/session");
    }
  }} />;
}
