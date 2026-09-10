"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import { getPortalSessionContext } from "@/features/auth/api/authApi";
import { saveCaptivePortalContext, savePortalSessionCode } from "@/lib/captivePortal";

export default function OpenPortalSessionPage() {
  const params = useParams<{ sessionCode: string }>();
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionCode = params?.sessionCode;
    if (!sessionCode) return;

    const restore = async () => {
      try {
        const session = await getPortalSessionContext(sessionCode);
        if (session.status === "AUTHORIZED") {
          window.location.replace("/network-success?source=browser");
          return;
        }

        // Huy- Full browser khôi phục MAC/AP/SSID từ backend, không phụ thuộc
        // localStorage của CNA và không dùng IP 4G để xác định thiết bị.
        savePortalSessionCode(session.sessionCode);
        saveCaptivePortalContext({
          id: session.deviceMac,
          ap: session.apId,
          ssid: session.ssid,
          siteId: session.siteId,
          url: `${window.location.origin}/session`,
        });
        window.location.replace("/login?full_browser=1");
      } catch (requestError) {
        console.error("[PortalSession] restore failed", requestError);
        setError("Phiên đăng nhập đã hết hạn. Vui lòng quay lại WiFi và tạo phiên mới.");
      }
    };
    void restore();
  }, [params?.sessionCode]);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12">
      <div className="mx-auto flex min-h-[70vh] max-w-sm items-center justify-center">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          {error ? <AlertCircle className="mx-auto text-red-500" size={38} /> : <LoaderCircle className="mx-auto animate-spin text-blue-700" size={38} />}
          <h1 className="mt-4 text-lg font-semibold text-slate-900">{error ? "Không thể mở phiên" : "Đang mở phiên đăng nhập"}</h1>
          <p className={`mt-2 text-sm leading-6 ${error ? "text-red-600" : "text-slate-500"}`}>{error || "Vui lòng giữ nguyên trang trong giây lát..."}</p>
          {!error ? <CheckCircle2 className="sr-only" /> : null}
        </div>
      </div>
    </main>
  );
}
