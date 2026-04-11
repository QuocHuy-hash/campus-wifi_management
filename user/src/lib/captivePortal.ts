import { STORAGE_KEYS } from "@/constants/appKeys";
import type { CaptivePortalContext } from "@/features/auth/types";

export function extractCaptivePortalContext(search: string): CaptivePortalContext | null {
  const params = new URLSearchParams(search);
console.log("params:::", Array.from(params.entries()));
  const id = params.get("id")?.trim() || "";
  const ap = params.get("ap")?.trim() || "";
  const ssid = params.get("ssid")?.trim() || "";
  const url = params.get("url")?.trim() || "";
  const t = params.get("t")?.trim() || "";

  if (!id || !ap || !ssid || !url) {
    return null;
  }

  return {
    id,
    ap,
    ssid,
    url,
    t: t || undefined,
  };
}

export function saveCaptivePortalContext(context: CaptivePortalContext): void {
  localStorage.setItem(STORAGE_KEYS.portalCaptiveContext, JSON.stringify(context));
}

export function getStoredCaptivePortalContext(): CaptivePortalContext | null {
  const rawContext = localStorage.getItem(STORAGE_KEYS.portalCaptiveContext);

  if (!rawContext) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawContext) as Partial<CaptivePortalContext>;

    if (!parsed.id || !parsed.ap || !parsed.ssid || !parsed.url) {
      return null;
    }

    return {
      id: parsed.id,
      ap: parsed.ap,
      ssid: parsed.ssid,
      url: parsed.url,
      t: parsed.t,
    };
  } catch {
    return null;
  }
}

export function getCaptivePortalContext(search: string): CaptivePortalContext | null {
  return getStoredCaptivePortalContext() || extractCaptivePortalContext(search);
}
