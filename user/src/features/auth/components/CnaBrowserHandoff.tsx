"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  LoaderCircle,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import type { CaptivePortalContext, PortalSessionCreated } from "@/features/auth/types";
import { createPortalSession, getPortalSessionStatus } from "@/features/auth/api/authApi";
import { buildAuthorizeDevicePayload, savePortalSessionCode } from "@/lib/captivePortal";

interface CnaBrowserHandoffProps {
  context: CaptivePortalContext;
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

  // Gọi API ngay khi popup mount
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setIsLoading(true);
      setError("");
      try {
        const payload = buildAuthorizeDevicePayload(context);
        const created = await createPortalSession({ ...payload, siteId: context.siteId });
        if (cancelled) return;
        setSession(created);
        savePortalSessionCode(created.sessionCode);
      } catch (err) {
        if (cancelled) return;
        setError("Không thể tạo phiên đăng nhập. Vui lòng kiểm tra kết nối và thử lại.");
        console.error("[PortalSession] create failed", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void init();
    return () => { cancelled = true; };
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

  const openBrowser = () => {
    if (!session?.loginUrl) return;
    window.open(session.loginUrl, "_blank");
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 px-6 py-8 text-white">
        <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25">
          <ExternalLink size={28} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Tiếp tục trong trình duyệt</h1>
        <p className="mt-2 text-sm leading-6 text-blue-50">
          Google và Microsoft cần Safari hoặc Chrome đầy đủ để đăng nhập an toàn.
        </p>
      </div>

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

            {/* Nút mở trình duyệt */}
            <button
              type="button"
              onClick={openBrowser}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.99]"
            >
              <ExternalLink size={19} />
              Mở trình duyệt
            </button>
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
