"use client";

import { Provider } from "react-redux";
import { store } from "@/stores/store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import LanguageProvider from "@/components/LanguageProvider";
import { initializeAxios, setAxiosAuthToken } from "@/config/axios";
import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { STORAGE_KEYS } from "@/constants/appKeys";
import {
  buildAuthorizeDevicePayload,
  extractCaptivePortalContext,
  saveCaptivePortalContext,
  clearRedirectUrl,
} from "@/lib/captivePortal";
import { authorizeDevice } from "@/features/auth/api/authApi";
import { logger } from "@/lib/logger";

// function DebugOverlay({ params }: { params: Record<string, string> }) {
//   const [visible, setVisible] = useState(true);
//   if (!visible) return null;

//   return (
//     <div
//       style={{
//         position: "fixed", top: 0, left: 0, right: 0, zIndex: 99999,
//         background: "#1e1e2e", color: "#a6e3a1", fontFamily: "monospace",
//         fontSize: "12px", padding: "12px 16px", boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
//         borderBottom: "2px solid #f38ba8",
//         maxHeight: "50vh", overflowY: "auto",
//       }}
//     >
//       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
//         <strong style={{ color: "#f38ba8" }}>🔍 CAPTIVE PORTAL DEBUG</strong>
//         <button
//           onClick={() => setVisible(false)}
//           style={{ background: "#45475a", color: "#cdd6f4", border: "none", borderRadius: 4, padding: "2px 10px", cursor: "pointer", fontSize: 11 }}
//         >
//           Đóng
//         </button>
//       </div>
//       <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "3px 12px" }}>
//         {Object.entries(params).map(([k, v]) => (
//           <>
//             <span style={{ color: "#89b4fa", fontWeight: "bold", whiteSpace: "nowrap" }}>{k}</span>
//             <span style={{ color: v ? "#a6e3a1" : "#fab387", wordBreak: "break-all" }}>
//               {v || <span style={{ color: "#f38ba8" }}>(MISSING)</span>}
//             </span>
//           </>
//         ))}
//       </div>
//     </div>
//   );
// }

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const processedCaptiveRedirectRef = useRef<string | null>(null);

  useEffect(() => {
    initializeAxios();
  }, []);

  useEffect(() => {
    const search = searchParams.toString();

    const captiveContext = extractCaptivePortalContext(search);

    // Chỉ cấp quyền khi yêu cầu có đầy đủ tham số captive portal bắt buộc.
    if (!captiveContext) return;

    saveCaptivePortalContext(captiveContext);

    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    // Cookie access_token là HttpOnly nên phía client dùng token trong localStorage
    // làm tín hiệu; middleware sẽ kiểm tra cookie độc lập khi chuyển trang.
    if (!token) return;

    const redirectKey = JSON.stringify(captiveContext);
    if (processedCaptiveRedirectRef.current === redirectKey) return;
    processedCaptiveRedirectRef.current = redirectKey;

    let cancelled = false;

    const authorizeCaptiveDevice = async () => {
      setAxiosAuthToken(token);

      try {
        await authorizeDevice(buildAuthorizeDevicePayload(captiveContext));
        localStorage.removeItem(STORAGE_KEYS.portalCaptiveContext);
        if (!cancelled) {
          router.replace("/network-connecting");
        }
      } catch (error) {
        logger.error("Failed to authorize device from captive redirect:", error);
        clearRedirectUrl();
        if (!cancelled) {
          toast.error("Xác thực thiết bị thất bại", {
            description: "Vui lòng thử lại bằng cách truy cập lại trang WiFi.",
          });
        }
      }
    };

    void authorizeCaptiveDevice();

    return () => {
      cancelled = true;
    };
  }, [pathname, router, searchParams]);

  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            {children}
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Provider>
  );
}
