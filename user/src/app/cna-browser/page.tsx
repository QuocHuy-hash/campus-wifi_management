"use client";

import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import AuthPageLayout from "@/features/auth/components/AuthPageLayout";
import CnaBrowserHandoff from "@/features/auth/components/CnaBrowserHandoff";
import {
  extractCaptivePortalContext,
  getCaptivePortalContext,
  saveCaptivePortalContext,
} from "@/lib/captivePortal";
import type { CaptivePortalContext } from "@/features/auth/types";

export default function CnaBrowserPage() {
  const [context, setContext] = useState<CaptivePortalContext | null>(null);
  const [contextLoaded, setContextLoaded] = useState(false);

  useEffect(() => {
    // Huy- Ưu tiên context trong URL vừa được CNA chuyển trang, sau đó mới dùng
    // localStorage. CNA có thể tách storage theo webview nên không dựa vào storage đơn lẻ.
    const fromUrl = extractCaptivePortalContext(window.location.search);
    if (fromUrl) saveCaptivePortalContext(fromUrl);
    setContext(fromUrl || getCaptivePortalContext(""));
    setContextLoaded(true);
  }, []);

  return (
    <AuthPageLayout>
      {!contextLoaded ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl shadow-slate-200/60">
          <LoaderCircle className="mx-auto animate-spin text-blue-700" size={34} />
          <p className="mt-3 text-sm text-slate-500">Đang chuẩn bị phiên đăng nhập...</p>
        </section>
      ) : context ? (
        <CnaBrowserHandoff
          context={context}
          // Huy- REGISTER_TEMP chỉ gọi một lần ở /cna-portal. Route này chỉ
          // kiểm tra Internet thật trước khi bật nút mở trình duyệt.
          temporaryAccessStatus="ready"
          temporaryAccessError=""
        />
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl shadow-slate-200/60">
          <AlertCircle className="mx-auto text-amber-500" size={34} />
          <h1 className="mt-3 text-base font-semibold text-slate-900">Không tìm thấy phiên kết nối</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Vui lòng quay lại trang WiFi để bắt đầu đăng nhập.
          </p>
        </section>
      )}
    </AuthPageLayout>
  );
}
