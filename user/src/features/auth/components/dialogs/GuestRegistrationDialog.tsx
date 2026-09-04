import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PasswordStrengthChecklist from '@/components/PasswordStrengthChecklist';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  UserPlus,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

type GuestAuthMethod = 'email' | 'phone';
type GuestStep = 'form' | 'otp' | 'newpass' | 'success';

interface GuestRegistrationDialogProps {
  open: boolean;
  guestStep: GuestStep;
  guestAuthMethod: GuestAuthMethod;
  guestForm: { email: string; phone: string; password: string; confirmPassword: string };
  otpCode: string[];
  otpError: string;
  guestNewPassword: string;
  guestConfirmPassword: string;
  showGuestPassword: boolean;
  isSendingOtp: boolean;
  isVerifyingOtp: boolean;
  isSettingGuestPassword: boolean;
  registerLoading: boolean;
  verifyLoading: boolean;
  resendLoading: boolean;
  resendCooldown: number;
  onOpenChange: (open: boolean) => void;
  onBackStep: () => void;
  onSetGuestAuthMethod: (method: GuestAuthMethod) => void;
  onSetGuestForm: (updater: (prev: { email: string; phone: string; password: string; confirmPassword: string }) => { email: string; phone: string; password: string; confirmPassword: string }) => void;
  onSetShowGuestPassword: (value: boolean) => void;
  onSendOtp: () => void;
  onOtpChange: (index: number, value: string) => void;
  onOtpKeyDown: (index: number, e: React.KeyboardEvent) => void;
  onOtpPaste: (value: string) => void;
  onVerifyOtp: () => void;
  onResendOtp: () => void;
  onSetGuestNewPassword: (value: string) => void;
  onSetGuestConfirmPassword: (value: string) => void;
  onSetGuestPassword: () => void;
  onUseGuestCredentials: () => void;
}

export default function GuestRegistrationDialog({
  open,
  guestStep,
  guestAuthMethod,
  guestForm,
  otpCode,
  otpError,
  guestNewPassword,
  guestConfirmPassword,
  showGuestPassword,
  isSendingOtp,
  isVerifyingOtp,
  isSettingGuestPassword,
  registerLoading,
  verifyLoading,
  resendLoading,
  resendCooldown,
  onOpenChange,
  onBackStep,
  onSetGuestAuthMethod,
  onSetGuestForm,
  onSetShowGuestPassword,
  onSendOtp,
  onOtpChange,
  onOtpKeyDown,
  onOtpPaste,
  onVerifyOtp,
  onResendOtp,
  onSetGuestNewPassword,
  onSetGuestConfirmPassword,
  onSetGuestPassword,
  onUseGuestCredentials,
}: GuestRegistrationDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="auth-light-dialog sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {(guestStep === 'otp' || guestStep === 'newpass') && (
              <button type="button" onClick={onBackStep} className="p-1 hover:bg-gray-100 rounded-lg mr-1">
                <ArrowLeft size={16} />
              </button>
            )}
            <UserPlus size={18} className="text-blue-600" />
            {guestStep === 'form' && t('register.title')}
            {guestStep === 'otp' && t('register.otpTitle')}
            {guestStep === 'newpass' && t('register.newPassTitle')}
            {guestStep === 'success' && t('register.successTitle')}
          </DialogTitle>
          <DialogDescription>
            {guestStep === 'form' && t('register.description')}
            {guestStep === 'otp' &&
              t('register.otpDescription', {
                contact: guestAuthMethod === 'email' ? guestForm.email : guestForm.phone,
              })}
            {guestStep === 'newpass' && t('register.newPassDescription')}
            {guestStep === 'success' && t('register.successDescription')}
          </DialogDescription>
        </DialogHeader>

        {guestStep === 'form' && (
          <div className="space-y-4 py-2">
            {/* <div className="space-y-2">
              <Label className="text-sm font-medium">{t('register.method')}</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onSetGuestAuthMethod('email')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    guestAuthMethod === 'email'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <img src="/mail.png" alt="Email" className="w-5 h-5 object-contain" />
                  <span className="font-medium text-sm">{t('register.email')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSetGuestAuthMethod('phone')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    guestAuthMethod === 'phone'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <img src="/zalo.png" alt="Zalo" className="w-5 h-5 object-contain" />
                  <span className="font-medium text-sm">{t('register.zalo')}</span>
                </button>
              </div>
            </div> */}

            {guestAuthMethod === 'email' ? (
              <div className="space-y-1.5">
                <Label htmlFor="guest-email" className="text-sm font-medium">
                  {t('register.email')} <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="guest-email"
                    type="email"
                    placeholder="email@example.com"
                    value={guestForm.email}
                    onChange={(e) => onSetGuestForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="guest-phone" className="text-sm font-medium">
                  {t('register.phoneZalo')} <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="guest-phone"
                    type="tel"
                    placeholder="0901234567"
                    value={guestForm.phone}
                    onChange={(e) => onSetGuestForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
                <p className="text-xs text-gray-500">{t('register.otpSentViaZalo')}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="guest-password" className="text-sm font-medium">
                {t('register.passwordLabel')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="guest-password"
                  type={showGuestPassword ? 'text' : 'password'}
                  placeholder={t('register.passwordPlaceholder')}
                  value={guestForm.password}
                  onChange={(e) => onSetGuestForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="pl-10 pr-10 h-11 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => onSetShowGuestPassword(!showGuestPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showGuestPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="guest-confirm-password" className="text-sm font-medium">
                {t('register.confirmPasswordLabel')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="guest-confirm-password"
                  type={showGuestPassword ? 'text' : 'password'}
                  placeholder={t('register.confirmPasswordPlaceholder')}
                  value={guestForm.confirmPassword}
                  onChange={(e) =>
                    onSetGuestForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
            </div>

            <PasswordStrengthChecklist password={guestForm.password} />

            {otpError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600">
                <AlertCircle size={16} />
                <span className="text-sm">{otpError}</span>
              </div>
            )}

            <DialogFooter className="pt-2 gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                {t('common.cancel')}
              </Button>
              <Button
                onClick={onSendOtp}
                disabled={
                  !guestForm.password ||
                  !guestForm.confirmPassword ||
                  (guestAuthMethod === 'email' ? !guestForm.email : !guestForm.phone) ||
                  isSendingOtp ||
                  registerLoading
                }
                className="bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                {isSendingOtp || registerLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('common.sendingOtp')}
                  </div>
                ) : (
                  <>
                    {t('common.sendOtp')}
                    <ChevronRight size={16} className="ml-1" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {guestStep === 'otp' && (
          <div className="py-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {guestAuthMethod === 'email' ? (
                  <Mail size={28} className="text-blue-600" />
                ) : (
                  <MessageCircle size={28} className="text-blue-600" />
                )}
              </div>
              <p className="text-sm text-gray-600">{t('register.otpSentTo')}</p>
              <p className="font-medium text-gray-900">
                {guestAuthMethod === 'email' ? guestForm.email : guestForm.phone}
              </p>
              <button
                type="button"
                onClick={onBackStep}
                className="text-sm text-blue-600 hover:underline mt-1"
              >
                {t('common.changeAccount')}
              </button>
            </div>

            <div className="flex justify-center gap-2 mb-4">
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => onOtpChange(index, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => onOtpKeyDown(index, e)}
                  onPaste={(e) => {
                    e.preventDefault();
                    onOtpPaste(e.clipboardData.getData('text'));
                  }}
                  className="w-11 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              ))}
            </div>

            {otpError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center gap-2 text-red-600">
                <AlertCircle size={16} />
                <span className="text-sm">{otpError}</span>
              </div>
            )}

            <Button
              onClick={onVerifyOtp}
              disabled={otpCode.some((d) => !d) || isVerifyingOtp || verifyLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11 mb-3"
            >
              {isVerifyingOtp || verifyLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('common.verifying')}
                </div>
              ) : (
                t('register.verifyOtp')
              )}
            </Button>

            <div className="text-center">
              <button
                onClick={onResendOtp}
                disabled={isSendingOtp || resendLoading || resendCooldown > 0}
                className="text-sm text-blue-600 hover:underline disabled:opacity-50"
              >
                {isSendingOtp || resendLoading
                  ? t('common.resending')
                  : resendCooldown > 0
                    ? t('common.resendIn', { seconds: resendCooldown })
                    : t('common.resendOtp')}
              </button>
            </div>
          </div>
        )}

        {guestStep === 'newpass' && (
          <div className="space-y-4 py-2">
            {otpError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600">
                <AlertCircle size={16} />
                <span className="text-sm">{otpError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{t('register.passwordLabel')}</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showGuestPassword ? 'text' : 'password'}
                  placeholder={t('register.enterPasswordPlaceholder')}
                  value={guestNewPassword}
                  onChange={(e) => onSetGuestNewPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => onSetShowGuestPassword(!showGuestPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showGuestPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>


            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{t('register.confirmPasswordLabel')}</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showGuestPassword ? 'text' : 'password'}
                  placeholder={t('register.confirmPasswordPlaceholder')}
                  value={guestConfirmPassword}
                  onChange={(e) => onSetGuestConfirmPassword(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
              {guestConfirmPassword && guestNewPassword !== guestConfirmPassword && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {t('common.confirmPasswordNotMatch')}
                </p>
              )}
            </div>
            <PasswordStrengthChecklist password={guestNewPassword} />

            <Button
              onClick={onSetGuestPassword}
              disabled={
                !guestNewPassword ||
                !guestConfirmPassword ||
                guestNewPassword.length < 8 ||
                !/[A-Z]/.test(guestNewPassword) ||
                !/[a-z]/.test(guestNewPassword) ||
                !/[0-9]/.test(guestNewPassword) ||
                !/[!@#$%^&*(),.?":{}|<>]/.test(guestNewPassword) ||
                guestNewPassword !== guestConfirmPassword ||
                isSettingGuestPassword
              }
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11"
            >
              {isSettingGuestPassword ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('common.processing')}
                </div>
              ) : (
                t('register.finishRegistration')
              )}
            </Button>
          </div>
        )}

        {guestStep === 'success' && (
          <div className="py-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('register.successHeading')}</h3>
              <p className="text-sm text-gray-500">{t('register.successDescription')}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500 mb-1">{t('register.usernameLabel')}</p>
              <p className="font-medium text-gray-900">
                {guestAuthMethod === 'email' ? guestForm.email : guestForm.phone}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {t('register.loginWithInfo', {
                  method: guestAuthMethod === 'email' ? t('register.email') : t('register.phoneZalo'),
                })}
              </p>
            </div>

            <Button onClick={onUseGuestCredentials} className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11">
              {t('register.loginNow')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
