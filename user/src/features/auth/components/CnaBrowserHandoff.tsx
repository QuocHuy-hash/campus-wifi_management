"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ExternalLink, LoaderCircle, ShieldCheck, Wifi } from "lucide-react";
import type { CaptivePortalContext, PortalSessionCreated } from "@/features/auth/types";
import { createPortalSession, getPortalSessionStatus } from "@/features/auth/api/authApi";
import { buildAuthorizeDevicePayload, savePortalSessionCode } from "@/lib/captivePortal";

interface CnaBrowserHandoffProps {
  context: CaptivePortalContext;
}

export default function CnaBrowserHandoff({ context }: CnaBrowserHandoffProps) {
  const [session, setSession] = useState<PortalSessionCreated | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState("");
  const popupRef = useRef<Window | null>(null);

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
        setError("Phiên mở trình duyệt đã hết hạn. Vui lòng thử lại.");
      }
    }, 2000);
    return () => window.clearInterval(timer);
  }, [session]);

  const openBrowser = async () => {
    setIsOpening(true);
    setError("");

    // Huy- Mở cửa sổ ngay trong thao tác click để giảm nguy cơ popup bị chặn;
    // website không tự đóng CNA vì cửa sổ này do hệ điều hành quản lý.
    popupRef.current = window.open("about:blank", "_blank");
    try {
      const payload = buildAuthorizeDevicePayload(context);
      const created = await createPortalSession({ ...payload, siteId: context.siteId });
      setSession(created);
      savePortalSessionCode(created.sessionCode);

      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.location.replace(created.loginUrl);
      } else {
        // Huy- Fallback khi CNA/OS chặn popup: giữ link để người dùng copy hoặc bấm lại.
        setError("Thiết bị chưa mở được trình duyệt tự động. Hãy dùng liên kết bên dưới.");
      }
    } catch (requestError) {
      popupRef.current?.close();
      setError("Không thể tạo phiên đăng nhập. Vui lòng kiểm tra kết nối và thử lại.");
      console.error("[PortalSession] create failed", requestError);
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
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
        <div className="space-y-3 text-sm text-slate-600">
          <Step icon={<Wifi size={17} />} text={`Giữ kết nối WiFi ${context.ssid}`} />
          <Step icon={<ShieldCheck size={17} />} text="Nhấn nút bên dưới để tạo phiên bảo mật 5 phút" />
          <Step icon={<CheckCircle2 size={17} />} text="Đăng nhập xong, thiết bị sẽ tự được cấp mạng" />
        </div>

        {error ? <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">{error}</p> : null}

        <button
          type="button"
          disabled={isOpening}
          onClick={() => void openBrowser()}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
        >
          {isOpening ? <LoaderCircle className="animate-spin" size={19} /> : <ExternalLink size={19} />}
          {isOpening ? "Đang tạo phiên..." : "Mở trình duyệt"}
        </button>
      </div>
    </section>
  );
}

function Step({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="flex items-center gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">{icon}</span><span>{text}</span></div>;
}
