import { STORAGE_KEYS } from "@/constants/appKeys";
import type {
  AuthorizeDevicePayload,
  CaptiveCompletionContext,
  CaptiveEntryMode,
  CaptivePortalContext,
} from "@/features/auth/types";

export const APPLE_CAPTIVE_URL = "https://captive.apple.com/hotspot-detect.html";

const CAPTIVE_CONTEXT_TTL_MS = 15 * 60 * 1000;
const CAPTIVE_PARAM_KEYS = ["id", "ap", "ssid", "url", "t", "entry"] as const;

function createFlowId(id: string, ap: string, timestamp: string): string {
  if (timestamp) {
    return `${id}:${ap}:${timestamp}`;
  }

  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${id}:${ap}:${Date.now()}`;
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isAppleProbeUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    if (parsed.hostname.toLowerCase() !== "captive.apple.com") {
      return false;
    }

    return (
      parsed.pathname === "/hotspot-detect.html" ||
      parsed.pathname === "/generate_204"
    );
  } catch {
    return false;
  }
}

function resolveEntryMode(entry: string, destinationUrl: string): CaptiveEntryMode {
  const normalizedEntry = entry.trim().toLowerCase();
  if (normalizedEntry === "cna" || normalizedEntry === "browser") {
    return normalizedEntry;
  }

  return isAppleProbeUrl(destinationUrl) ? "cna" : "browser";
}

function isUnexpired(expiresAt: unknown): expiresAt is number {
  return typeof expiresAt === "number" && expiresAt > Date.now();
}

export function extractCaptivePortalContext(search: string): CaptivePortalContext | null {
  const params = new URLSearchParams(search);
  const id = params.get("id")?.trim() || "";
  const ap = params.get("ap")?.trim() || "";
  const ssid = params.get("ssid")?.trim() || "";
  const url = params.get("url")?.trim() || "";
  const t = params.get("t")?.trim() || "";
  const entry = params.get("entry")?.trim() || "";

  if (!id || !ap || !ssid || !url || !isHttpUrl(url)) {
    return null;
  }

  const createdAt = Date.now();

  return {
    version: 1,
    flowId: createFlowId(id, ap, t),
    entryMode: resolveEntryMode(entry, url),
    id,
    ap,
    ssid,
    url,
    t: t || undefined,
    createdAt,
    expiresAt: createdAt + CAPTIVE_CONTEXT_TTL_MS,
  };
}

export function saveCaptivePortalContext(context: CaptivePortalContext): void {
  try {
    localStorage.setItem(STORAGE_KEYS.portalCaptiveContext, JSON.stringify(context));
  } catch {
    // Storage may be unavailable in strict privacy modes.
  }
}

export function clearCaptivePortalContext(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.portalCaptiveContext);
  } catch {
    // Best-effort cleanup.
  }

  try {
    sessionStorage.removeItem("captiveOriginalUrl");
  } catch {
    // Remove the legacy destination key when possible.
  }
}

export function getStoredCaptivePortalContext(): CaptivePortalContext | null {
  let rawContext: string | null = null;
  try {
    rawContext = localStorage.getItem(STORAGE_KEYS.portalCaptiveContext);
  } catch {
    return null;
  }

  if (!rawContext) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawContext) as Partial<CaptivePortalContext>;

    if (
      parsed.version !== 1 ||
      !parsed.flowId ||
      (parsed.entryMode !== "cna" && parsed.entryMode !== "browser") ||
      !parsed.id ||
      !parsed.ap ||
      !parsed.ssid ||
      !parsed.url ||
      !isHttpUrl(parsed.url) ||
      !isUnexpired(parsed.expiresAt)
    ) {
      clearCaptivePortalContext();
      return null;
    }

    return parsed as CaptivePortalContext;
  } catch {
    clearCaptivePortalContext();
    return null;
  }
}

export function getCaptivePortalContext(search: string): CaptivePortalContext | null {
  const contextFromUrl = extractCaptivePortalContext(search);
  if (contextFromUrl) {
    saveCaptivePortalContext(contextFromUrl);
    return contextFromUrl;
  }

  return getStoredCaptivePortalContext();
}

export function createCaptiveCompletionContext(
  context: CaptivePortalContext,
): CaptiveCompletionContext {
  const createdAt = Date.now();
  const completionContext: CaptiveCompletionContext = {
    version: 1,
    flowId: context.flowId,
    entryMode: context.entryMode,
    destinationUrl: context.entryMode === "browser" ? context.url : null,
    createdAt,
    expiresAt: createdAt + CAPTIVE_CONTEXT_TTL_MS,
  };

  localStorage.setItem(
    STORAGE_KEYS.captiveCompletionContext,
    JSON.stringify(completionContext),
  );
  localStorage.setItem(STORAGE_KEYS.currentDeviceMac, context.id);
  clearCaptivePortalContext();

  return completionContext;
}

export function getCaptiveCompletionContext(): CaptiveCompletionContext | null {
  let rawContext: string | null = null;
  try {
    rawContext = localStorage.getItem(STORAGE_KEYS.captiveCompletionContext);
  } catch {
    return null;
  }

  if (!rawContext) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawContext) as Partial<CaptiveCompletionContext>;
    const hasValidDestination =
      parsed.entryMode === "cna" ||
      (typeof parsed.destinationUrl === "string" && isHttpUrl(parsed.destinationUrl));

    if (
      parsed.version !== 1 ||
      !parsed.flowId ||
      (parsed.entryMode !== "cna" && parsed.entryMode !== "browser") ||
      !hasValidDestination ||
      !isUnexpired(parsed.expiresAt)
    ) {
      clearCaptiveCompletionContext();
      return null;
    }

    return parsed as CaptiveCompletionContext;
  } catch {
    clearCaptiveCompletionContext();
    return null;
  }
}

export function clearCaptiveCompletionContext(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.captiveCompletionContext);
  } catch {
    // Best-effort cleanup.
  }
}

export function clearCaptiveFlow(): void {
  clearCaptivePortalContext();
  clearCaptiveCompletionContext();
}

export function removeCaptiveParamsFromCurrentUrl(): void {
  if (typeof window === "undefined") {
    return;
  }

  const currentUrl = new URL(window.location.href);
  CAPTIVE_PARAM_KEYS.forEach((key) => currentUrl.searchParams.delete(key));
  window.history.replaceState(
    window.history.state,
    "",
    `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`,
  );
}

export function continueToNetworkConnecting(context: CaptivePortalContext): void {
  createCaptiveCompletionContext(context);
  removeCaptiveParamsFromCurrentUrl();
  window.location.replace("/network-connecting");
}

export function getCompletionTarget(context: CaptiveCompletionContext): string {
  if (context.entryMode === "cna") {
    return APPLE_CAPTIVE_URL;
  }

  return context.destinationUrl || "/session";
}

export function buildAuthorizeDevicePayload(
  context: CaptivePortalContext,
  options?: {
    deviceType?: string;
    deviceName?: string;
    duration?: number;
  },
): AuthorizeDevicePayload {
  return {
    deviceMac: context.id,
    apMac: context.ap,
    ssid: context.ssid,
    deviceType: options?.deviceType || detectDeviceCategory(),
    deviceName: options?.deviceName || detectDeviceName(),
    userIpAddress: extractClientIp(),
    userAgent: navigator.userAgent,
    duration: options?.duration ?? 480,
    manufacturer: detectManufacturer(),
    operatingSystem: detectOS(),
  };
}

function detectDeviceCategory(): string {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "MOBILE";
  if (/iPhone/i.test(ua)) return "MOBILE";
  if (/iPad/i.test(ua)) return "TABLET";
  if (/Windows/i.test(ua)) return "LAPTOP";
  if (/Macintosh/i.test(ua)) return "LAPTOP";
  if (/Linux/i.test(ua)) return "OTHER";
  return "OTHER";
}

function detectManufacturer(): string {
  const ua = navigator.userAgent;
  const appleDevices = /(iPhone|iPad|iPod|Macintosh)/i;
  if (appleDevices.test(ua)) return "Apple";
  const samsung = /Samsung/i;
  if (samsung.test(ua)) return "Samsung";
  const xiaomi = /Xiaomi|Mi\s/i;
  if (xiaomi.test(ua)) return "Xiaomi";
  const google = /Pixel|Google/i;
  if (google.test(ua)) return "Google";
  const huawei = /Huawei|Honor/i;
  if (huawei.test(ua)) return "Huawei";
  const oppo = /Oppo/i;
  if (oppo.test(ua)) return "Oppo";
  const vivo = /Vivo/i;
  if (vivo.test(ua)) return "Vivo";
  const oneplus = /OnePlus/i;
  if (oneplus.test(ua)) return "OnePlus";
  const dell = /Dell/i;
  if (dell.test(ua)) return "Dell";
  const hp = /HP|Hewlett-Packard/i;
  if (hp.test(ua)) return "HP";
  const lenovo = /Lenovo/i;
  if (lenovo.test(ua)) return "Lenovo";
  const asus = /ASUS/i;
  if (asus.test(ua)) return "ASUS";
  const acer = /Acer/i;
  if (acer.test(ua)) return "Acer";
  return "Unknown";
}

function detectOS(): string {
  const ua = navigator.userAgent;
  const winMatch = ua.match(/Windows NT\s*(\d+)/);
  if (winMatch) {
    const v = parseInt(winMatch[1]);
    if (v >= 10) return "Windows 10/11";
    if (v === 6.3) return "Windows 8.1";
    if (v === 6.2) return "Windows 8";
    if (v === 6.1) return "Windows 7";
    return `Windows NT ${winMatch[1]}`;
  }
  const macMatch = ua.match(/Mac OS X\s*([\d_]+)/);
  if (macMatch) return `macOS ${macMatch[1].replace(/_/g, ".")}`;
  const androidMatch = ua.match(/Android\s*([\d.]+)/);
  if (androidMatch) return `Android ${androidMatch[1]}`;
  if (/iPhone|iPad|iPod/i.test(ua)) {
    const iosMatch = ua.match(/OS\s*(\d+)_(\d+)/);
    if (iosMatch) return `iOS ${iosMatch[1]}.${iosMatch[2]}`;
    return "iOS";
  }
  const linuxMatch = ua.match(/Linux\s*([^)]*)/);
  if (linuxMatch) return `Linux ${linuxMatch[1].trim()}`;
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
