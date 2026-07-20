"use client";

import { useCallback } from "react";
import NetworkConnectingScreen from "@/components/NetworkConnectingScreen";
import { STORAGE_KEYS } from "@/constants/appKeys";
import type { CaptiveEntryMode } from "@/lib/detectEntryMode";
import { logRedirect } from "@/lib/redirectLog";
import { readHandoff } from "@/hooks/useCaptivePortal";

export default function NetworkConnectingPage() {
  const entryMode = readHandoff<CaptiveEntryMode>(
    STORAGE_KEYS.captiveEntryMode,
    "browser"
  );

  const onComplete = useCallback(() => {
    const destinationUrl = readHandoff<string | null>(
      STORAGE_KEYS.captiveOriginalUrl,
      null
    );

    try {
      sessionStorage.removeItem(STORAGE_KEYS.captiveEntryMode);
      sessionStorage.removeItem(STORAGE_KEYS.captiveOriginalUrl);
    } catch {}

    const isNoContentProbe =
      !!destinationUrl && /generate_204|gen_204|generate204/i.test(destinationUrl);

    if (destinationUrl && !isNoContentProbe) {
      logRedirect(
        destinationUrl,
        `network-connecting: probe OK → URL đích (entryMode=${entryMode})`
      );
      window.location.href = destinationUrl;
    } else if (entryMode === "cna" && destinationUrl) {
      logRedirect(
        destinationUrl,
        `network-connecting: CNA probe 204 — redirect vẫn để OS reprobe`
      );
      window.location.href = destinationUrl;
    } else {
      logRedirect(
        "/session",
        isNoContentProbe
          ? `network-connecting: URL đích là probe 204 (${destinationUrl}) — về /session`
          : `network-connecting: không có destinationUrl (entryMode=${entryMode}) — về /session`
      );
      window.location.href = "/session";
    }
  }, [entryMode]);

  return <NetworkConnectingScreen mode={entryMode} onComplete={onComplete} />;
}
