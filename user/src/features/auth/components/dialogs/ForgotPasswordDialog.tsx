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
            {step === 'form' && 'Quên mật khẩu'}
            {step === 'otp' && 'Xác thực OTP'}
            {step === 'newpass' && 'Đặt mật khẩu mới'}
            {step === 'success' && 'Thành công'}
          </DialogTitle>
          <DialogDescription>
            {step === 'form' && 'Nhập email hoặc số điện thoại để lấy lại mật khẩu'}
            {step === 'otp' && `Nhập mã OTP đã gửi đến ${contact}`}
            {step === 'newpass' && 'Tạo mật khẩu mới cho tài khoản'}
            {step === 'success' && 'Mật khẩu đã được đặt lại thành công'}
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Phương thức xác thực</Label>
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
                  <span className="font-medium text-sm">Email</span>
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
                  <span className="font-medium text-sm">Zalo</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                {method === 'email' ? 'Email' : 'Số điện thoại'} <span className="text-red-500">*</span>
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
                Hủy
              </Button>
              <Button
                onClick={onSendOtp}
                disabled={!contact || isSendingOtp}
                className="bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                {isSendingOtp ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang gửi...
                  </div>
                ) : (
                  <>
                    Gửi mã OTP
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
              <p className="text-sm text-gray-600">Mã OTP 6 số đã được gửi đến</p>
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
                  Đang xác thực...
                </div>
              ) : (
                'Tiếp tục'
              )}
            </Button>

            {/* Nút gửi lại OTP với đếm ngược 120s */}
            <div className="text-center">
              <button
                onClick={onResendOtp}
                disabled={isSendingOtp || resendCooldown > 0}
                className="text-sm text-blue-600 hover:underline disabled:opacity-50"
              >
                {isSendingOtp
                  ? 'Đang gửi lại...'
                  : resendCooldown > 0
                    ? `Gửi lại sau ${resendCooldown}s`
                    : 'Gửi lại mã OTP'}
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
              <Label className="text-sm font-medium">Mật khẩu mới</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu mới"
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
              <Label className="text-sm font-medium">Xác nhận mật khẩu mới</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmNewPassword}
                  onChange={(e) => onSetConfirmNewPassword(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
              {confirmNewPassword && newPassword !== confirmNewPassword && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> Mật khẩu không khớp
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
                  Đang xử lý...
                </div>
              ) : (
                'Đặt mật khẩu mới'
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
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Đặt lại mật khẩu thành công!</h3>
              <p className="text-sm text-gray-500">Bạn có thể đăng nhập với mật khẩu mới</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500 mb-1">Tên đăng nhập</p>
              <p className="font-medium text-gray-900">{contact}</p>
            </div>

            <Button onClick={onUseForgotCredentials} className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11">
              Đăng nhập ngay
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
