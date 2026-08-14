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
    console.log(
      '[CaptivePortal] extractCaptivePortalContext - THIẾU tham số (không phải captive redirect)',
      { search, id: id || '(missing)', ap: ap || '(missing)', ssid: ssid || '(missing)', url: url || '(missing)', t: t || '(none)' }
    );
    return null;
  }

  console.log(
    '[CaptivePortal] extractCaptivePortalContext - ĐỦ tham số captive:',
    { id, ap, ssid, url, t: t || '(none)' }
  );

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
  localStorage.setItem(STORAGE_KEYS.currentDeviceMac, context.id);
  sessionStorage.setItem(STORAGE_KEYS.portalRedirectUrl, context.url);
}

const PROBE_HOSTS = [
  "connectivitycheck.gstatic.com",
  "captive.apple.com",
  "www.msftconnecttest.com",
  "www.msftncsi.com",
  "clients3.google.com",
  "www.gstatic.com",
  "connectivitycheck.android.com",
  "nmcheck.gnome.org",
  "detectportal.firefox.com",
];

export function isProbeUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return PROBE_HOSTS.some((probe) => host === probe || host.endsWith("." + probe));
  } catch {
    return false;
  }
}

export function getRedirectUrl(): string | null {
  return sessionStorage.getItem(STORAGE_KEYS.portalRedirectUrl);
}

export function clearRedirectUrl(): void {
  sessionStorage.removeItem(STORAGE_KEYS.portalRedirectUrl);
}

const FALLBACK_DELAY_MS = 3000;

export function navigateOrFallback(url: string | null, fallbackUrl = "/session"): void {
  const target = url || fallbackUrl;

  if (!url || target === fallbackUrl) {
    window.location.href = fallbackUrl;
    return;
  }

  const navTimeout = setTimeout(() => {
    window.location.href = fallbackUrl;
  }, FALLBACK_DELAY_MS);

  window.location.href = target;
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
  if (macMatch) return `macOS ${macMatch[1].replace(/_/g, '.')}`;
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
