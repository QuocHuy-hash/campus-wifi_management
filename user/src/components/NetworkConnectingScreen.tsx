import { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import type { CaptiveEntryMode } from "@/features/auth/types";
import { APPLE_CAPTIVE_URL } from "@/lib/captivePortal";
import { logger } from "@/lib/logger";

interface NetworkConnectingScreenProps {
  entryMode: CaptiveEntryMode;
  onComplete: () => void;
}

const BROWSER_PROBE_URL = "https://www.google.com/favicon.ico";
const PROBE_INTERVAL_MS = 2000;
const PROBE_TIMEOUT_MS = 5000;

function checkImageResource(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;

    const finish = (result: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      img.onload = null;
      img.onerror = null;
      resolve(result);
    };

    const timeout = window.setTimeout(() => finish(false), PROBE_TIMEOUT_MS);
    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    img.src = `${url}?rand=${Date.now()}-${Math.random()}`;
  });
}

async function checkAppleCaptiveEndpoint(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  try {
    await fetch(`${APPLE_CAPTIVE_URL}?rand=${Date.now()}`, {
      cache: "no-store",
      mode: "no-cors",
      redirect: "follow",
      signal: controller.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

function checkActualInternet(entryMode: CaptiveEntryMode): Promise<boolean> {
  return entryMode === "cna"
    ? checkAppleCaptiveEndpoint()
    : checkImageResource(BROWSER_PROBE_URL);
}

export default function NetworkConnectingScreen({
  entryMode,
  onComplete,
}: NetworkConnectingScreenProps) {
  const [isConnecting, setIsConnecting] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let completed = false;
    let pollingTimeout: ReturnType<typeof setTimeout> | undefined;
    let completeTimeout: ReturnType<typeof setTimeout> | undefined;

    const timeInterval = window.setInterval(() => {
      setElapsedTime((previous) => previous + 1);
    }, 1000);

    const poll = async () => {
      logger.debug("Đang kiểm tra kết nối internet...", { entryMode });
      const hasInternet = await checkActualInternet(entryMode);

      if (cancelled) return;

      if (!hasInternet) {
        pollingTimeout = setTimeout(() => {
          void poll();
        }, PROBE_INTERVAL_MS);
        return;
      }

      if (completed) return;
      completed = true;
      window.clearInterval(timeInterval);
      setIsConnecting(false);

      completeTimeout = setTimeout(() => {
        if (!cancelled) {
          onComplete();
        }
      }, 1000);
    };

    void poll();

    return () => {
      cancelled = true;
      window.clearInterval(timeInterval);
      if (pollingTimeout) clearTimeout(pollingTimeout);
      if (completeTimeout) clearTimeout(completeTimeout);
    };
  }, [entryMode, onComplete]);

  const successMessage =
    entryMode === "cna"
      ? 'Kết nối thành công. Vui lòng bấm "Done" để đóng cửa sổ WiFi.'
      : "Kết nối thành công. Đang chuyển tới trang bạn muốn truy cập.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="space-y-6 text-center">
        <div className="flex justify-center transition-all duration-500">
          {isConnecting ? (
            <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
          ) : (
            <CheckCircle className="h-16 w-16 animate-[pulse_1s_ease-in-out] text-green-500" />
          )}
        </div>

        <div className="space-y-2">
          <h1
            className={`text-2xl font-bold transition-colors duration-500 ${
              isConnecting ? "text-blue-600" : "text-green-600"
            }`}
          >
            {isConnecting ? "Xác thực thành công!" : "Kết nối mạng thành công!"}
          </h1>

          <p className="mx-auto max-w-md px-4 text-sm leading-relaxed text-gray-500">
            {isConnecting
              ? "Đang thiết lập kết nối Internet, vui lòng giữ nguyên màn hình."
              : successMessage}
          </p>
        </div>

        {isConnecting ? (
          <div className="mx-auto mt-6 w-64">
            <div className="h-1 w-full overflow-hidden rounded-full bg-blue-100">
              <div className="h-full w-1/2 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full bg-blue-500" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-400">
              Đã chờ {elapsedTime}s...
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
