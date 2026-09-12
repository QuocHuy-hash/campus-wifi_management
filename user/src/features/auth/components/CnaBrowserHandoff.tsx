"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import type { CaptivePortalContext, PortalSessionCreated } from "@/features/auth/types";
import { createPortalSession } from "@/features/auth/api/authApi";
import { buildAuthorizeDevicePayload, savePortalSessionCode } from "@/lib/captivePortal";

const CNA_RELOAD_INTERVAL_MS = 2_000;
const CNA_FIRST_RELOAD_DELAY_MS = 2_500;
// Huy- Cập nhật ngày 2026-09-12: reload khoảng 2 phút, đồng bộ với thời gian Core chờ UniFi nhận diện client.
const CNA_RELOAD_MAX_ATTEMPTS = 60;

interface CnaBrowserHandoffProps {
  context: CaptivePortalContext;
  initialSessionCode?: string;
  initialLoginUrl?: string;
  initialReloadAttempt?: number;
  initialPlatform?: BrowserPlatform;
  temporaryAccessStatus: "checking" | "ready" | "failed";
  temporaryAccessError: string;
}

export type BrowserPlatform = "android" | "ios" | "windows" | "other";

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

// Huy- Dùng đúng một giao diện tĩnh cho cả lúc route vừa mount và trong toàn bộ
// chu kỳ reload. Nhờ vậy React không đổi qua lại giữa loading, mã phiên và link.
export function CnaBrowserReloadScreen() {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
      <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-700">
          <Wifi size={28} />
        </span>
        <p className="mt-4 text-sm font-semibold text-slate-800">Đang kiểm tra kết nối WiFi...</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">Vui lòng giữ nguyên màn hình trong giây lát.</p>
      </div>
    </section>
  );
}

export default function CnaBrowserHandoff({
  context,
  initialSessionCode = "",
  initialLoginUrl = "",
  initialReloadAttempt = 0,
  initialPlatform = "other",
}: CnaBrowserHandoffProps) {
  const [session, setSession] = useState<PortalSessionCreated | null>(() => initialSessionCode
    ? {
        sessionCode: initialSessionCode,
        loginUrl: initialLoginUrl || `/s/${encodeURIComponent(initialSessionCode)}`,
        status: "PENDING",
        expiresAt: "",
      }
    : null);
  const [isLoading, setIsLoading] = useState(!initialSessionCode);
  const [error, setError] = useState("");
  const [platform, setPlatform] = useState<BrowserPlatform>(initialPlatform);
  const [reloadAttempt, setReloadAttempt] = useState(initialReloadAttempt);

  const calledRef = useRef(false);

  // Huy- Route /cna-browser đã xác định platform từ request header để HTML đầu
  // tiên không đổi câu hướng dẫn khi hydrate. Dialog cũ vẫn dùng fallback client.
  useEffect(() => {
    if (initialPlatform === "other") setPlatform(getBrowserPlatform());
  }, [initialPlatform]);

  // Huy- Khi URL đã có sessionCode, CNA chỉ dựng lại phiên và tiếp tục reload.
  // Không gọi status và không gọi lại API tạo portal session trong chu kỳ này.
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
      if (!initialSessionCode) setIsLoading(true);
      setError("");
      try {
        const currentUrl = new URL(window.location.href);
        const sessionCode = currentUrl.searchParams.get("session_code")?.trim();
        const parsedAttempt = Number.parseInt(currentUrl.searchParams.get("cna_reload") || "0", 10);
        setReloadAttempt(Number.isFinite(parsedAttempt) && parsedAttempt >= 0 ? parsedAttempt : 0);

        if (sessionCode) {
          setSession({
            sessionCode,
            loginUrl: initialLoginUrl || `${window.location.origin}/s/${encodeURIComponent(sessionCode)}`,
            status: "PENDING",
            expiresAt: "",
          });
          savePortalSessionCode(sessionCode);
          return;
        }

        const payload = buildAuthorizeDevicePayload(context);
        const created = await createPortalSession({ ...payload, siteId: context.siteId });
        setSession(created);
        savePortalSessionCode(created.sessionCode);

        // Huy- Gắn mã vào URL mà không reload ngay để các lần tải tiếp theo dùng
        // lại mã hiện tại, kể cả localStorage của CNA không ổn định.
        currentUrl.searchParams.set("session_code", created.sessionCode);
        currentUrl.searchParams.set("cna_reload", "0");
        window.history.replaceState(null, "", `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
      } catch (err) {
        setError("Không thể tạo phiên đăng nhập. Vui lòng kiểm tra kết nối và thử lại.");
        console.error("[PortalSession] initialize failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    void init();
  }, [context, initialLoginUrl, initialSessionCode]);

  // Huy- Bắt đầu reload ngay tại /cna-browser, không phụ thuộc trạng thái gọi
  // REGISTER_TEMP. Top-level reload giúp CNA yêu cầu hệ điều hành đánh giá lại mạng.
  useEffect(() => {
    if (!session || isLoading || reloadAttempt >= CNA_RELOAD_MAX_ATTEMPTS) return;

    // Huy- Sau khi portal-sessions trả thành công, chờ 2 giây mới reload lần đầu.
    // Từ lần reload thứ hai trở đi giữ khoảng cách 1.5 giây như luồng CNA yêu cầu.
    const reloadDelay = reloadAttempt === 0
      ? CNA_FIRST_RELOAD_DELAY_MS
      : CNA_RELOAD_INTERVAL_MS;
    const timer = window.setTimeout(() => {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("session_code", session.sessionCode);
      nextUrl.searchParams.set("cna_reload", String(reloadAttempt + 1));
      window.location.replace(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
    }, reloadDelay);

    return () => window.clearTimeout(timer);
  }, [isLoading, reloadAttempt, session]);

  const browserHref = session?.loginUrl
    ? (platform === "android" ? buildAndroidChromeIntent(session.loginUrl) : session.loginUrl)
    : "#";
  // Huy- Có sessionCode/loginUrl là bật nút ngay. Reload chỉ phục vụ CNA đánh giá
  // lại kết nối, không được dùng làm điều kiện chặn người dùng mở trình duyệt.
  const canOpenBrowser = Boolean(session);
  if (isLoading) {
    return <CnaBrowserReloadScreen />;
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
      <div className="space-y-5 p-6">
        {/* Các bước hướng dẫn */}
        <div className="space-y-3 text-sm text-slate-600">
          <Step icon={<Wifi size={17} />} text={`Giữ kết nối WiFi ${context.ssid}`} />
          <Step icon={<ShieldCheck size={17} />} text="Mở liên kết bên dưới trên trình duyệt đầy đủ" />
          <Step icon={<CheckCircle2 size={17} />} text="Đăng nhập xong, thiết bị sẽ tự được cấp mạng" />
        </div>

        {/* Error */}
        {error && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
            {error}
          </p>
        )}

        {/* Session info */}
        {session && (
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
              href={canOpenBrowser ? browserHref : undefined}
              target={canOpenBrowser ? "_blank" : undefined}
              rel={canOpenBrowser ? "noopener noreferrer" : undefined}
              aria-disabled={!canOpenBrowser}
              onClick={(event) => {
                if (!canOpenBrowser) event.preventDefault();
              }}
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-sm transition ${
                canOpenBrowser
                  ? "bg-blue-700 hover:bg-blue-800 active:scale-[0.99]"
                  : "cursor-not-allowed bg-slate-300"
              }`}
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
