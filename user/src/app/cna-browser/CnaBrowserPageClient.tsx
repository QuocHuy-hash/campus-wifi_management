"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import AuthPageLayout from "@/features/auth/components/AuthPageLayout";
import CnaBrowserHandoff, { CnaBrowserReloadScreen } from "@/features/auth/components/CnaBrowserHandoff";
import { getCaptivePortalContext, saveCaptivePortalContext } from "@/lib/captivePortal";
import type { CaptivePortalContext } from "@/features/auth/types";

interface CnaBrowserPageClientProps {
  initialContext: CaptivePortalContext | null;
  initialSessionCode: string;
  initialLoginUrl: string;
  initialReloadAttempt: number;
}

export default function CnaBrowserPageClient({
  initialContext,
  initialSessionCode,
  initialLoginUrl,
  initialReloadAttempt,
}: CnaBrowserPageClientProps) {
  const [context, setContext] = useState<CaptivePortalContext | null>(initialContext);
  const [contextLoaded, setContextLoaded] = useState(Boolean(initialContext));

  useEffect(() => {
    if (initialContext) {
      saveCaptivePortalContext(initialContext);
      return;
    }

    // Huy- Chỉ dùng localStorage làm fallback khi URL thực sự thiếu captive params.
    setContext(getCaptivePortalContext(""));
    setContextLoaded(true);
  }, [initialContext]);

  return (
    <AuthPageLayout>
      {!contextLoaded ? (
        <CnaBrowserReloadScreen />
      ) : context ? (
        <CnaBrowserHandoff
          context={context}
          initialSessionCode={initialSessionCode}
          initialLoginUrl={initialLoginUrl}
          initialReloadAttempt={initialReloadAttempt}
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
