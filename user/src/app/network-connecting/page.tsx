"use client";

import { useCallback } from "react";
import NetworkConnectingScreen from "@/components/NetworkConnectingScreen";
import { useRouter } from "next/navigation";
import { STORAGE_KEYS } from "@/constants/appKeys";
import type { CaptiveEntryMode } from "@/features/auth/types";
import { logRedirect } from "@/lib/redirectLog";

export default function NetworkConnectingPage() {
  const router = useRouter();

  // Đọc handoff từ sessionStorage — entryMode + URL đích đã được persist
  // bởi registerDeviceAndRedirect TRƯỚC KHI xoá captive context.
  const entryMode: CaptiveEntryMode =
    (typeof sessionStorage !== 'undefined' &&
      (sessionStorage.getItem(STORAGE_KEYS.captiveEntryMode) as CaptiveEntryMode)) ||
    'browser';

  const onComplete = useCallback(() => {
    let destinationUrl: string | null = null;
    try {
      destinationUrl = sessionStorage.getItem(STORAGE_KEYS.captiveOriginalUrl);
    } catch {
      // sessionStorage unavailable — proceed to fallback
    }

    // Cleanup handoff keys
    try {
      sessionStorage.removeItem(STORAGE_KEYS.captiveEntryMode);
      sessionStorage.removeItem(STORAGE_KEYS.captiveOriginalUrl);
    } catch {
      // best-effort cleanup
    }

    if (destinationUrl) {
      logRedirect(
        destinationUrl,
        `network-connecting: probe OK → về URL đích (entryMode=${entryMode})`
      );
      window.location.href = destinationUrl;
    } else {
      logRedirect(
        '/session',
        `network-connecting: không có destinationUrl trong handoff (entryMode=${entryMode})`
      );
      router.replace("/session");
    }
  }, [router, entryMode]);

  return <NetworkConnectingScreen mode={entryMode} onComplete={onComplete} />;
}
