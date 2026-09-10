"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, ArrowRight, LogIn, Ticket, Zap } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import CnaBrowserHandoff from "@/features/auth/components/CnaBrowserHandoff";
import AuthPageLayout from "@/features/auth/components/AuthPageLayout";
import type { CaptivePortalContext, LoginResult } from "@/features/auth/types";
import {
  extractCaptivePortalContext,
  getCaptivePortalContext,
  saveCaptivePortalContext,
  buildAuthorizeDevicePayload,
  clearPortalSessionCode,
  clearRedirectUrl,
  getStoredPortalSessionCode,
} from "@/lib/captivePortal";
import { authorizeDevice, quickAccess } from "@/features/auth/api/authApi";
import { setAxiosAuthToken, initializeAxios } from "@/config/axios";
import { establishSessionCookie, clearStoredAuthSession } from "@/lib/session";
import { STORAGE_KEYS } from "@/constants/appKeys";

// ─── Màn hình hội nghị ────────────────────────────────────────────────────────

function ConferenceScreen({ onBack }: { onBack: () => void }) {
  const [code, setCode] = useState<string[]>(Array(8).fill(""));
  const [message, setMessage] = useState("");
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const update = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    if (!digits) {
      const next = [...code];
      next[index] = "";
      setCode(next);
      return;
    }
    const next = [...code];
    digits.split("").forEach((d, offset) => {
      if (index + offset < next.length) next[index + offset] = d;
    });
    setCode(next);
    refs.current[Math.min(index + digits.length, next.length - 1)]?.focus();
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>, i: number) => {
    e.preventDefault();
    update(i, e.clipboardData.getData("text"));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === "Backspace" && !code[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const isComplete = code.every(Boolean);

  return (
    <div className="animate-in fade-in slide-in-from-right-2 duration-200">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        ← Quay lại
      </button>
      <h2 className="text-lg font-semibold tracking-tight text-slate-900">Nhập mã sự kiện</h2>
      <p className="mt-1 text-sm leading-5 text-slate-500">
        Mã gồm 8 chữ số do ban tổ chức cung cấp cho khách mời hội nghị.
      </p>
      <form
        className="mt-5"
        onSubmit={(e) => {
          e.preventDefault();
          setMessage("Chức năng xác thực mã hội nghị đang chờ API từ backend.");
        }}
      >
        <div className="flex items-center justify-between gap-1.5">
          {code.map((val, i) => (
            <span key={i} className="contents">
              {i === 4 && <span aria-hidden className="mx-0.5 h-px w-2 bg-slate-300" />}
              <input
                ref={(el) => { refs.current[i] = el; }}
                value={val}
                onChange={(e) => update(i, e.target.value)}
                onPaste={(e) => onPaste(e, i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                inputMode="numeric"
                maxLength={8}
                aria-label={`Chữ số ${i + 1} của mã sự kiện`}
                className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-100 text-center text-lg font-semibold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-blue-700 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </span>
          ))}
        </div>
        <button
          type="submit"
          disabled={!isComplete}
          className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-blue-700 text-sm font-semibold text-white transition hover:bg-blue-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Xác nhận
        </button>
        {message && <p className="mt-3 text-center text-sm text-slate-500">{message}</p>}
      </form>
      <p className="mt-5 text-center text-xs text-slate-500">
        Không có mã sự kiện?{" "}
        <button type="button" className="font-semibold text-blue-700 hover:underline">
          Liên hệ ban tổ chức
        </button>
      </p>
    </div>
  );
}

// ─── Item menu ────────────────────────────────────────────────────────────────

function MenuEntry({
  icon,
  iconClass,
  title,
  description,
  onClick,
  disabled = false,
}: {
  icon: ReactNode;
  iconClass: string;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-55 focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-700"
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${iconClass}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-800">{title}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
      </span>
      <ArrowRight size={17} className="shrink-0 text-slate-400" />
    </button>
  );
}

// ─── Feature chính ────────────────────────────────────────────────────────────

type Screen = "menu" | "conference";

export default function CnaPortalFeature() {
  const { t } = useTranslation();
  const [screen, setScreen] = useState<Screen>("menu");
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [context, setContext] = useState<CaptivePortalContext | null>(null);
  const [ready, setReady] = useState(false);
  const [quickLoading, setQuickLoading] = useState(false);
  const [error, setError] = useState("");

  // Đọc captive portal context từ URL hoặc localStorage (giống AuthFeature)
  useEffect(() => {
    initializeAxios();
    const search = window.location.search;
    let ctx: CaptivePortalContext | null = null;
    if (search) {
      ctx = extractCaptivePortalContext(search);
      if (ctx) saveCaptivePortalContext(ctx);
    }
    if (!ctx) ctx = getCaptivePortalContext("");
    setContext(ctx);
    setReady(true);
  }, []);

  // Lưu phiên tối thiểu sau khi login thành công
  const persistSession = (identifier: string) => {
    localStorage.setItem(STORAGE_KEYS.portalLoggedIn, "true");
    localStorage.setItem(
      STORAGE_KEYS.portalUser,
      JSON.stringify({
        id: "unknown",
        username: identifier,
        fullname: identifier,
        email: identifier,
        role: "CLIENT",
        status: "ACTIVE",
        avatarUrl: null,
        loginTime: new Date().toISOString(),
      })
    );
  };

  // Authorize thiết bị sau khi đăng nhập thành công
  const authorizeDeviceInBackground = async (): Promise<boolean> => {
    if (!context) return true;
    try {
      const payload = buildAuthorizeDevicePayload(context);
      await authorizeDevice(payload);
      localStorage.removeItem(STORAGE_KEYS.portalCaptiveContext);
      clearPortalSessionCode();
      return true;
    } catch {
      if (!getStoredPortalSessionCode()) {
        clearRedirectUrl();
        localStorage.removeItem(STORAGE_KEYS.portalCaptiveContext);
      }
      return false;
    }
  };

  const handleQuickAccess = async () => {
    if (!context) {
      setError("Không có quyền truy cập nhanh. Vui lòng kết nối vào WiFi có Captive Portal UniFi.");
      return;
    }
    setQuickLoading(true);
    setError("");
    try {
      const result: LoginResult = await quickAccess();
      localStorage.setItem(STORAGE_KEYS.accessToken, result.accessToken);
      setAxiosAuthToken(result.accessToken);
      try {
        await establishSessionCookie(result.accessToken);
      } catch {
        clearStoredAuthSession();
        setAxiosAuthToken(null);
        setError("Không thể thiết lập phiên. Vui lòng thử lại.");
        setQuickLoading(false);
        return;
      }
      persistSession("Khách truy cập nhanh");
      const authorized = await authorizeDeviceInBackground();
      if (authorized) {
        window.location.href = "/network-connecting?flow=anonymous";
      } else {
        window.location.href = "/network-connecting?flow=anonymous&authorized=false";
      }
    } catch {
      setError("Truy cập nhanh thất bại. Vui lòng thử lại.");
      setQuickLoading(false);
    }
  };

  if (!ready) {
    return (
      <AuthPageLayout>
        <div className="h-48 animate-pulse rounded-2xl bg-white shadow-sm" />
      </AuthPageLayout>
    );
  }

  return (
    <>
      <AuthPageLayout>
        <section className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6">
            {screen === "conference" ? (
              <ConferenceScreen onBack={() => setScreen("menu")} />
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                <p className="mb-3 text-sm text-slate-500">
                  {t("guestLogin.chooseConnection", "Chọn một cách để kết nối WiFi khách.")}
                </p>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white divide-y divide-slate-200">
                  {/* Item 1: Đăng nhập bằng tài khoản → mở popup handoff */}
                  <MenuEntry
                    icon={<LogIn size={19} />}
                    iconClass="bg-blue-50 text-blue-700"
                    title="Đăng nhập bằng tài khoản"
                    description="Dùng email hoặc Zalo đã đăng ký"
                    onClick={() => setHandoffOpen(true)}
                  />
                  {/* Item 2: Truy cập nhanh — gọi API ngay trong CNA */}
                  <MenuEntry
                    icon={<Zap size={19} />}
                    iconClass="bg-amber-50 text-amber-600"
                    title="Truy cập nhanh"
                    description="Không cần tài khoản hay mật khẩu"
                    onClick={() => void handleQuickAccess()}
                    disabled={quickLoading}
                  />
                  {/* Item 3: Khách hội nghị */}
                  <MenuEntry
                    icon={<Ticket size={19} />}
                    iconClass="bg-rose-50 text-rose-600"
                    title="Khách hội nghị"
                    description="Nhập mã sự kiện 8 chữ số"
                    onClick={() => setScreen("conference")}
                  />
                </div>
                {error && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </AuthPageLayout>

      {/* Popup B: Mở trình duyệt để đăng nhập */}
      {context && (
        <Dialog open={handoffOpen} onOpenChange={setHandoffOpen}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
            <CnaBrowserHandoff context={context} />
          </DialogContent>
        </Dialog>
      )}

      {/* Fallback khi không có captive context (dev/testing) */}
      {!context && handoffOpen && (
        <Dialog open={handoffOpen} onOpenChange={setHandoffOpen}>
          <DialogContent className="sm:max-w-sm">
            <div className="p-6 text-center">
              <p className="text-sm font-medium text-slate-700">Không tìm thấy thông tin Captive Portal.</p>
              <p className="mt-2 text-xs text-slate-400">
                Truy cập trang này từ WiFi HCMUS để nhận đầy đủ thông số kết nối.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
