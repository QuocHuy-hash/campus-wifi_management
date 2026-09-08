import { useRef, useState, type ClipboardEvent, type KeyboardEvent, type ReactNode } from 'react';
import SocialAuthButton from './SocialAuthButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LogIn,
  Lock,
  Ticket,
  User,
  Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

type GuestScreen = 'menu' | 'account' | 'conference';

interface GuestLoginTabProps {
  isLoading: boolean;
  onSSOLogin: (provider: string) => void;
  onOpenGuestModal: () => void;
  username: string;
  onUsernameChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  onLogin: () => void;
  onOpenForgotModal: () => void;
  onQuickAccess: () => void;
  loginError?: string;
}

export default function GuestLoginTab({
  isLoading,
  onSSOLogin,
  onOpenGuestModal,
  username,
  onUsernameChange,
  password,
  onPasswordChange,
  showPassword,
  onTogglePassword,
  onLogin,
  onOpenForgotModal,
  onQuickAccess,
  loginError,
}: GuestLoginTabProps) {
  const { t } = useTranslation();
  const [screen, setScreen] = useState<GuestScreen>('menu');
  const [conferenceCode, setConferenceCode] = useState<string[]>(Array(8).fill(''));
  const [conferenceMessage, setConferenceMessage] = useState('');
  const codeRefs = useRef<Array<HTMLInputElement | null>>([]);

  const goToMenu = () => {
    setConferenceMessage('');
    setScreen('menu');
  };

  // Huy- Cập nhật ngày 2026-09-08: hỗ trợ dán đủ 8 chữ số hoặc nhập từng ô trên điện thoại.
  const updateConferenceCode = (index: number, rawValue: string) => {
    const digits = rawValue.replace(/\D/g, '').slice(0, 8);
    if (!digits) {
      const next = [...conferenceCode];
      next[index] = '';
      setConferenceCode(next);
      return;
    }

    const next = [...conferenceCode];
    digits.split('').forEach((digit, offset) => {
      if (index + offset < next.length) next[index + offset] = digit;
    });
    setConferenceCode(next);
    codeRefs.current[Math.min(index + digits.length, next.length - 1)]?.focus();
  };

  const handleConferencePaste = (event: ClipboardEvent<HTMLInputElement>, index: number) => {
    event.preventDefault();
    updateConferenceCode(index, event.clipboardData.getData('text'));
  };

  const handleConferenceKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace' && !conferenceCode[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const submitConferenceCode = () => {
    // Huy- Cập nhật ngày 2026-09-08: chỉ hoàn thiện UI; chưa gọi API khi backend Conference Code chưa có.
    setConferenceMessage('Chức năng xác thực mã hội nghị đang chờ API từ backend.');
  };

  if (screen === 'account') {
    return (
      <div className="animate-in fade-in slide-in-from-right-2 duration-200">
        <BackButton onClick={goToMenu} />
        <p className="mb-4 text-sm leading-5 text-slate-500"></p>

        <form onSubmit={(event) => { event.preventDefault(); onLogin(); }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guest-login-username">{t('guestLogin.usernameLabel')}</Label>
            <div className="relative">
              <User size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                id="guest-login-username"
                type="text"
                autoComplete="username"
                placeholder={t('guestLogin.usernamePlaceholder')}
                value={username}
                onChange={(event) => onUsernameChange(event.target.value)}
                className="h-11 rounded-xl border-slate-200 pl-12 focus-visible:ring-blue-600"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guest-login-password">{t('guestLogin.passwordLabel')}</Label>
            <div className="relative">
              <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                id="guest-login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                className="h-11 rounded-xl border-slate-200 pl-12 pr-12 focus-visible:ring-blue-600"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={onTogglePassword}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={onOpenForgotModal} className="text-sm font-medium text-blue-700 hover:underline">
                {t('guestLogin.forgotPassword')}
              </button>
            </div>
          </div>

          <InlineError message={loginError} />

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isLoading ? <LoadingDots /> : <>{t('common.login')} <ArrowRight size={17} /></>}
          </button>

          <p className="text-center text-sm text-slate-600">
            {t('guestLogin.noAccount')}{' '}
            <button type="button" onClick={onOpenGuestModal} className="font-semibold text-blue-700 hover:underline">
              {t('guestLogin.register')}
            </button>
          </p>
        </form>

        <div className="relative my-6 border-t border-slate-200">
          <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-slate-400">
            {t('guestLogin.orLoginWith')}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <SocialAuthButton provider="Google" icon="/google.png" onClick={() => onSSOLogin('google')} disabled={isLoading} colorClass="text-red-600" bgClass="" hoverClass="hover:border-red-300 hover:bg-red-50" />
          <SocialAuthButton provider="Microsoft" icon="/microsoft.png" onClick={() => onSSOLogin('azure')} disabled={isLoading} colorClass="text-blue-600" bgClass="" hoverClass="hover:border-blue-700 hover:bg-blue-50" />
          <SocialAuthButton provider="Facebook" icon="/facebook.png" onClick={() => onSSOLogin('facebook')} disabled={isLoading} colorClass="text-blue-700" bgClass="" hoverClass="hover:border-blue-700 hover:bg-blue-50" />
        </div>
      </div>
    );
  }

  if (screen === 'conference') {
    const isComplete = conferenceCode.every(Boolean);
    return (
      <div className="animate-in fade-in slide-in-from-right-2 duration-200">
        <BackButton onClick={goToMenu} />
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Nhập mã sự kiện</h2>
        <p className="mt-1 text-sm leading-5 text-slate-500">Mã gồm 8 chữ số do ban tổ chức cung cấp cho khách mời hội nghị.</p>

        <form onSubmit={(event) => { event.preventDefault(); submitConferenceCode(); }} className="mt-5">
          <div className="flex items-center justify-between gap-1.5" aria-label="Mã sự kiện gồm 8 chữ số">
            {conferenceCode.map((value, index) => (
              <span key={index} className="contents">
                {index === 4 && <span aria-hidden="true" className="mx-0.5 h-px w-2 bg-slate-300" />}
                <input
                  ref={(element) => { codeRefs.current[index] = element; }}
                  value={value}
                  onChange={(event) => updateConferenceCode(index, event.target.value)}
                  onPaste={(event) => handleConferencePaste(event, index)}
                  onKeyDown={(event) => handleConferenceKeyDown(event, index)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  aria-label={`Chữ số ${index + 1} của mã sự kiện`}
                  maxLength={8}
                  className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-100 text-center text-lg font-semibold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-blue-700 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </span>
            ))}
          </div>

          <button
            type="submit"
            disabled={!isComplete || isLoading}
            className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-blue-700 text-sm font-semibold text-white transition hover:bg-blue-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Xác nhận
          </button>
          {conferenceMessage && <p className="mt-3 text-center text-sm text-slate-500">{conferenceMessage}</p>}
        </form>

        <p className="mt-5 text-center text-xs text-slate-500">Không có mã sự kiện? <button type="button" className="font-semibold text-blue-700 hover:underline">Liên hệ ban tổ chức</button></p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
      <p className="mb-3 text-sm text-slate-500">Chọn một cách để kết nối WiFi khách.</p>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white divide-y divide-slate-200">
        <GuestEntry icon={<LogIn size={19} />} iconClass="bg-blue-50 text-blue-700" title="Đăng nhập bằng tài khoản" description="Dùng email hoặc Zalo đã đăng ký" onClick={() => setScreen('account')} />
        <GuestEntry
          icon={<Zap size={19} />}
          iconClass="bg-amber-50 text-amber-600"
          title="Truy cập nhanh"
          description="Không cần tài khoản hay mật khẩu"
          onClick={onQuickAccess}
          disabled={isLoading}
        />
        <GuestEntry icon={<Ticket size={19} />} iconClass="bg-rose-50 text-rose-600" title="Khách hội nghị" description="Nhập mã sự kiện 8 chữ số" onClick={() => setScreen('conference')} />
      </div>
      <InlineError message={loginError} />
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="fixed left-4 top-4 z-50 inline-flex items-center gap-1 rounded-lg bg-white/95 px-3 py-2 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
      <ArrowLeft size={16} /> Quay lại
    </button>
  );
}

function GuestEntry({ icon, iconClass, title, description, onClick, disabled = false }: {
  icon: ReactNode;
  iconClass: string;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-55 focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-700">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${iconClass}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-800">{title}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
      </span>
      <ArrowRight size={17} className="shrink-0 text-slate-400" />
    </button>
  );
}

function InlineError({ message }: { message?: string }) {
  if (!message) return null;
  return <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700"><AlertCircle size={16} className="shrink-0" />{message}</div>;
}

function LoadingDots() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" aria-label="Đang xử lý" />;
}
