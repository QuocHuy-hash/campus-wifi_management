"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  LoaderCircle,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import type { CaptivePortalContext, PortalSessionCreated } from "@/features/auth/types";
import {
  createPortalSession,
  getPortalSessionStatus,
} from "@/features/auth/api/authApi";
import { buildAuthorizeDevicePayload, savePortalSessionCode } from "@/lib/captivePortal";

interface CnaBrowserHandoffProps {
  context: CaptivePortalContext;
}

type BrowserPlatform = "android" | "ios" | "windows" | "other";

// Huy- CNA không cho JavaScript ép mở ứng dụng bên ngoài. Chỉ Android hỗ trợ
// Intent URI để ưu tiên Chrome; các nền tảng còn lại dùng HTTPS chuẩn để hệ điều hành tự quyết định browser.
function getBrowserPlatform(): BrowserPlatform {
  if (typeof navigator === "undefined") return "other";

  const userAgent = navigator.userAgent;
  if (/android/i.test(userAgent)) return "android";
  if (/iPad|iPhone|iPod/i.test(userAgent)) return "ios";
  if (/Windows/i.test(userAgent)) return "windows";
  return "other";
}

// Huy- Chrome Android đọc Intent URI và dùng browser_fallback_url khi Chrome không thể được mở.
function buildAndroidChromeIntent(loginUrl: string): string {
  const url = new URL(loginUrl);
  const pathWithQuery = `${url.host}${url.pathname}${url.search}${url.hash}`;
  return `intent://${pathWithQuery}#Intent;scheme=${url.protocol.replace(":", "")};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(loginUrl)};end`;
}

function getBrowserButtonLabel(platform: BrowserPlatform): string {
  if (platform === "android") return "Mở bằng Chrome";
  if (platform === "windows") return "Mở bằng trình duyệt mặc định";
  return "Mở trình duyệt";
}

function getBrowserHint(platform: BrowserPlatform): string {
  if (platform === "android") {
    return "Nếu Chrome không mở, hãy sao chép liên kết và dán vào trình duyệt.";
  }
  if (platform === "ios") {
    return "Nếu không tự chuyển, hãy mở Safari rồi dán liên kết đăng nhập.";
  }
  if (platform === "windows") {
    return "Nếu không tự chuyển, hãy sao chép liên kết và mở bằng trình duyệt bạn đang dùng.";
  }
  return "Nếu không tự chuyển, hãy sao chép liên kết và mở bằng trình duyệt đầy đủ.";
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
      aria-label="Sao chép"
    >
      {copied
        ? <CheckCircle2 size={16} className="text-emerald-500" />
        : <Copy size={16} />
      }
    </button>
  );
}

export default function CnaBrowserHandoff({ context }: CnaBrowserHandoffProps) {
  const [session, setSession] = useState<PortalSessionCreated | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [platform, setPlatform] = useState<BrowserPlatform>("other");

  const calledRef = useRef(false);

  // Huy- Chỉ đọc user-agent sau khi component mount để không lệch HTML giữa server và thiết bị thật.
  useEffect(() => {
    setPlatform(getBrowserPlatform());
  }, []);

  // Gọi API ngay khi popup mount — useRef guard tránh gọi 2 lần trong React StrictMode
  useEffect(() => {
    // Guard: context phải có đủ thông tin captive portal mới gọi API
    if (!context.id || !context.ap || !context.ssid) {
      setError("Thiếu thông tin kết nối. Vui lòng truy cập lại từ WiFi HCMUS.");
      setIsLoading(false);
      return;
    }

    if (calledRef.current) return;
    calledRef.current = true;

    const init = async () => {
      setIsLoading(true);
      setError("");
      try {
        const payload = buildAuthorizeDevicePayload(context);
        const created = await createPortalSession({ ...payload, siteId: context.siteId });
        setSession(created);
        savePortalSessionCode(created.sessionCode);
      } catch (err) {
        setError("Không thể tạo phiên đăng nhập. Vui lòng kiểm tra kết nối và thử lại.");
        console.error("[PortalSession] create failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    void init();
  }, [context]);

  // Polling trạng thái phiên sau khi đã có session
  useEffect(() => {
    if (!session || session.status === "AUTHORIZED") return;

    const timer = window.setInterval(async () => {
      try {
        const current = await getPortalSessionStatus(session.sessionCode);
        if (current.status === "AUTHORIZED") {
          window.clearInterval(timer);
          window.location.replace("/network-success?source=cna");
        }
      } catch {
        window.clearInterval(timer);
        setError("Phiên đã hết hạn. Vui lòng đóng popup và thử lại.");
      }
    }, 2000);

    return () => window.clearInterval(timer);
  }, [session]);

  const browserHref = session?.loginUrl
    ? (platform === "android" ? buildAndroidChromeIntent(session.loginUrl) : session.loginUrl)
    : "#";

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
      <div className="space-y-5 p-6">
        {/* Các bước hướng dẫn */}
        <div className="space-y-3 text-sm text-slate-600">
          <Step icon={<Wifi size={17} />} text={`Giữ kết nối WiFi ${context.ssid}`} />
          <Step icon={<ShieldCheck size={17} />} text="Mở liên kết bên dưới trên trình duyệt đầy đủ" />
          <Step icon={<CheckCircle2 size={17} />} text="Đăng nhập xong, thiết bị sẽ tự được cấp mạng" />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-4 text-sm text-slate-500">
            <LoaderCircle className="animate-spin" size={18} />
            Đang tạo phiên đăng nhập...
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
            {error}
          </p>
        )}

        {/* Session info */}
        {session && !isLoading && (
          <div className="space-y-3">
            {/* Session code */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs font-medium text-slate-500">Mã phiên</p>
              <div className="flex items-center gap-2">
                <span className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm font-semibold tracking-widest text-slate-800">
                  {session.sessionCode}
                </span>
                <CopyButton text={session.sessionCode} />
              </div>
            </div>

            {/* Login URL */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs font-medium text-slate-500">Liên kết đăng nhập</p>
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-blue-700">
                  {session.loginUrl}
                </span>
                <CopyButton text={session.loginUrl} />
              </div>
            </div>

            {/* Huy- Dùng thẻ a thay vì window.open để CNA/OS có thể xử lý handoff ra browser mặc định. */}
            <a
              href={browserHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.99]"
            >
              <ExternalLink size={19} />
              {getBrowserButtonLabel(platform)}
            </a>
            <p className="text-center text-xs leading-5 text-slate-500">
              {getBrowserHint(platform)}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function Step({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">
        {icon}
      </span>
      <span>{text}</span>
    </div>
  );
}
