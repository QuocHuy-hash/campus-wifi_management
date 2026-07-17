"use client";

import { useCallback, useEffect, useState } from "react";
import NetworkConnectingScreen from "@/components/NetworkConnectingScreen";
import type { CaptiveCompletionContext } from "@/features/auth/types";
import {
  clearCaptiveCompletionContext,
  getCaptiveCompletionContext,
  getCompletionTarget,
} from "@/lib/captivePortal";

export default function NetworkConnectingPage() {
  const [completionContext] = useState<CaptiveCompletionContext | null>(() =>
    getCaptiveCompletionContext(),
  );

  useEffect(() => {
    if (!completionContext) {
      window.location.replace("/session");
    }
  }, [completionContext]);

  const onComplete = useCallback(() => {
    if (!completionContext) return;

    const target = getCompletionTarget(completionContext);
    clearCaptiveCompletionContext();
    window.location.replace(target);
  }, [completionContext]);

  if (!completionContext) {
    return null;
  }

  return (
    <NetworkConnectingScreen
      entryMode={completionContext.entryMode}
      onComplete={onComplete}
    />
  );
}
