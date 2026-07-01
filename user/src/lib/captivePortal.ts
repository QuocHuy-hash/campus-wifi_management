import { STORAGE_KEYS } from "@/constants/appKeys";
import type { CaptivePortalContext, AuthorizeDevicePayload } from "@/features/auth/types";

export function extractCaptivePortalContext(search: string): CaptivePortalContext | null {
  const params = new URLSearchParams(search);
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
      id: parsed.id, //Địa chỉ MAC của thiết bị
      ap: parsed.ap, //Địa chỉ MAC của Access Point
      ssid: parsed.ssid, //Tên WiFi
      url: parsed.url, //URL gốc người dùng muốn truy cập
      t: parsed.t, //Timestamp (optional)
    };
  } catch {
    return null;
  }
}

export function getCaptivePortalContext(search: string): CaptivePortalContext | null {
  return getStoredCaptivePortalContext() || extractCaptivePortalContext(search);
}

export function buildAuthorizeDevicePayload(
  context: CaptivePortalContext,
  options?: {
    deviceType?: string;
    deviceName?: string;
    duration?: number;
  }
): AuthorizeDevicePayload {
  return {
    deviceMac: context.id,
    apMac: context.ap,
    ssid: context.ssid,
    deviceType: options?.deviceType || detectDeviceType(),
    deviceName: options?.deviceName || detectDeviceName(),
    userIpAddress: extractClientIp(),
    userAgent: navigator.userAgent,
    duration: options?.duration ?? 480,
  };
}

function detectDeviceType(): string {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Macintosh/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Unknown";
}

function detectDeviceName(): string {
  const ua = navigator.userAgent;
  const androidMatch = ua.match(/Android[^;]*;\s*([^)]*)/);
  if (androidMatch) {
    const model = androidMatch[1].trim();
    if (model && model !== "Linux") return model;
  }
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua)) return "iPad";
  if (/Macintosh/i.test(ua)) return "Mac";
  return "Unknown Device";
}

function extractClientIp(): string {
  return "0.0.0.0";
}
