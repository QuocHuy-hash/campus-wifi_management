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
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

type ForgotMethod = 'email' | 'phone';
type ForgotStep = 'form' | 'otp' | 'newpass' | 'success';

interface ForgotPasswordDialogProps {
  open: boolean;
  method: ForgotMethod;
  contact: string;
  step: ForgotStep;
  otp: string[];
  otpError: string;
  newPassword: string;
  confirmNewPassword: string;
  showNewPassword: boolean;
  isSendingOtp: boolean;
  isVerifyingOtp: boolean;
  isResettingPassword: boolean;
  resendCooldown: number;
  onOpenChange: (open: boolean) => void;
  onBackStep: () => void;
  onSetMethod: (value: ForgotMethod) => void;
  onSetContact: (value: string) => void;
  onSendOtp: () => void;
  onOtpChange: (index: number, value: string) => void;
  onOtpKeyDown: (index: number, e: React.KeyboardEvent) => void;
  onVerifyOtp: () => void;
  onResendOtp: () => void;
  onSetNewPassword: (value: string) => void;
  onSetConfirmNewPassword: (value: string) => void;
  onSetShowNewPassword: (value: boolean) => void;
  onResetPassword: () => void;
  onUseForgotCredentials: () => void;
}

export default function ForgotPasswordDialog({
  open,
  method,
  contact,
  step,
  otp,
  otpError,
  newPassword,
  confirmNewPassword,
  showNewPassword,
  isSendingOtp,
  isVerifyingOtp,
  isResettingPassword,
  resendCooldown,
  onOpenChange,
  onBackStep,
  onSetMethod,
  onSetContact,
  onSendOtp,
  onOtpChange,
  onOtpKeyDown,
  onVerifyOtp,
  onResendOtp,
  onSetNewPassword,
  onSetConfirmNewPassword,
  onSetShowNewPassword,
  onResetPassword,
  onUseForgotCredentials,
}: ForgotPasswordDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {(step === 'otp' || step === 'newpass') && (
              <button type="button" onClick={onBackStep} className="p-1 hover:bg-gray-100 rounded-lg mr-1">
                <ArrowLeft size={16} />
              </button>
            )}
            <Lock size={18} className="text-blue-600" />
            {step === 'form' && t('forgotPassword.title')}
            {step === 'otp' && t('forgotPassword.otpTitle')}
            {step === 'newpass' && t('forgotPassword.newPassTitle')}
            {step === 'success' && t('forgotPassword.successTitle')}
          </DialogTitle>
          <DialogDescription>
            {step === 'form' && t('forgotPassword.formDescription')}
            {step === 'otp' && t('forgotPassword.otpDescription', { contact })}
            {step === 'newpass' && t('forgotPassword.newPassDescription')}
            {step === 'success' && t('forgotPassword.successDescription')}
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('forgotPassword.method')}</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onSetMethod('email')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    method === 'email'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Mail size={18} />
                  <span className="font-medium text-sm">{t('forgotPassword.email')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSetMethod('phone')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    method === 'phone'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <MessageCircle size={18} />
                  <span className="font-medium text-sm">{t('forgotPassword.zalo')}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                {method === 'email' ? t('forgotPassword.email') : t('forgotPassword.phone')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                {method === 'email' ? (
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                ) : (
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                )}
                <Input
                  type={method === 'email' ? 'email' : 'tel'}
                  placeholder={method === 'email' ? 'email@example.com' : '0901234567'}
                  value={contact}
                  onChange={(e) => onSetContact(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                {t('common.cancel')}
              </Button>
              <Button
                onClick={onSendOtp}
                disabled={!contact || isSendingOtp}
                className="bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                {isSendingOtp ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('common.sending')}
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

        {step === 'otp' && (
          <div className="py-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {method === 'email' ? (
                  <Mail size={28} className="text-blue-600" />
                ) : (
                  <MessageCircle size={28} className="text-blue-600" />
                )}
              </div>
              <p className="text-sm text-gray-600">{t('forgotPassword.otpSentTo')}</p>
              <p className="font-medium text-gray-900">{contact}</p>
            </div>

            <div className="flex justify-center gap-2 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`forgot-otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => onOtpChange(index, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => onOtpKeyDown(index, e)}
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
              disabled={otp.some((d) => !d) || isVerifyingOtp}
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11 mb-3"
            >
              {isVerifyingOtp ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('common.verifying')}
                </div>
              ) : (
                t('common.continue')
              )}
            </Button>

            {/* Nút gửi lại OTP với đếm ngược 120s / Resend OTP button with 120s countdown */}
            <div className="text-center">
              <button
                onClick={onResendOtp}
                disabled={isSendingOtp || resendCooldown > 0}
                className="text-sm text-blue-600 hover:underline disabled:opacity-50"
              >
                {isSendingOtp
                  ? t('common.resending')
                  : resendCooldown > 0
                    ? t('common.resendIn', { seconds: resendCooldown })
                    : t('common.resendOtp')}
              </button>
            </div>
          </div>
        )}

        {step === 'newpass' && (
          <div className="space-y-4 py-2">
            {otpError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600">
                <AlertCircle size={16} />
                <span className="text-sm">{otpError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{t('forgotPassword.newPasswordLabel')}</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder={t('forgotPassword.newPasswordPlaceholder')}
                  value={newPassword}
                  onChange={(e) => onSetNewPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => onSetShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>


            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{t('forgotPassword.confirmNewPasswordLabel')}</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder={t('forgotPassword.confirmNewPasswordPlaceholder')}
                  value={confirmNewPassword}
                  onChange={(e) => onSetConfirmNewPassword(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
              {confirmNewPassword && newPassword !== confirmNewPassword && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {t('common.confirmPasswordNotMatch')}
                </p>
              )}
            </div>
            <PasswordStrengthChecklist password={newPassword} />

            <Button
              onClick={onResetPassword}
              disabled={
                !newPassword ||
                !confirmNewPassword ||
                newPassword.length < 8 ||
                !/[A-Z]/.test(newPassword) ||
                !/[a-z]/.test(newPassword) ||
                !/[0-9]/.test(newPassword) ||
                !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ||
                newPassword !== confirmNewPassword ||
                isResettingPassword
              }
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11"
            >
              {isResettingPassword ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('common.processing')}
                </div>
              ) : (
                t('forgotPassword.setNewPassword')
              )}
            </Button>
          </div>
        )}

        {step === 'success' && (
          <div className="py-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('forgotPassword.successHeading')}</h3>
              <p className="text-sm text-gray-500">{t('forgotPassword.successSubtitle')}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500 mb-1">{t('common.username')}</p>
              <p className="font-medium text-gray-900">{contact}</p>
            </div>

            <Button onClick={onUseForgotCredentials} className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11">
              {t('forgotPassword.loginNow')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
