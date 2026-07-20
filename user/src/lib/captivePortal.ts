import { STORAGE_KEYS } from "@/constants/appKeys";
import type { CaptivePortalContext, CaptiveEntryMode, AuthorizeDevicePayload } from "@/features/auth/types";

// Các endpoint probe của hệ điều hành/trình duyệt — nếu url đích là một trong số này
// thì request đến từ CNA (mini-browser captive của OS), không phải browser thật.
const OS_PROBE_PATTERNS = [
  "captive.apple.com",
  "hotspot-detect.html",
  "connectivitycheck.gstatic.com",
  "connectivitycheck.android.com",
  "clients3.google.com",
  "generate_204",
  "msftconnecttest.com",
  "msftncsi.com",
  "nmcheck.gnome.org",
  "detectportal.firefox.com",
];

export function detectEntryMode(url: string): CaptiveEntryMode {
  const normalized = url.toLowerCase();
  return OS_PROBE_PATTERNS.some((pattern) => normalized.includes(pattern))
    ? "cna"
    : "browser";
}

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
    entryMode: detectEntryMode(url),
  };
}

export function saveCaptivePortalContext(context: CaptivePortalContext): void {
  try {
    localStorage.setItem(STORAGE_KEYS.portalCaptiveContext, JSON.stringify(context));
  } catch {
    // localStorage may be unavailable (private browsing, quota)
  }
}

// Bàn giao entryMode + URL đích sang /network-connecting TRƯỚC khi xoá captive context,
// để việc dọn context sau khi register-device thành công không làm mất thông tin điều hướng.
export function persistNetworkConnectingHandoff(context: CaptivePortalContext): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.captiveEntryMode, context.entryMode);
    sessionStorage.setItem(STORAGE_KEYS.captiveOriginalUrl, context.url);
  } catch {
    // sessionStorage may be unavailable (strict privacy mode)
  }
}

export function clearCaptivePortalContext(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.portalCaptiveContext);
  } catch {
    // best-effort cleanup
  }
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
      entryMode: parsed.entryMode || detectEntryMode(parsed.url), // Context cũ chưa có entryMode thì suy lại từ url
    };
  } catch {
    return null;
  }
}

export function getCaptivePortalContext(search: string): CaptivePortalContext | null {
  // Ưu tiên params trên URL (mới nhất từ controller) trước context đã lưu,
  // tránh context cũ đè lên tham số của lần redirect mới.
  return extractCaptivePortalContext(search) || getStoredCaptivePortalContext();
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
