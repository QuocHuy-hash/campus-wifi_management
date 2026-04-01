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
  onOpenChange: (open: boolean) => void;
  onBackStep: () => void;
  onSetGuestAuthMethod: (method: GuestAuthMethod) => void;
  onSetGuestForm: (updater: (prev: { email: string; phone: string; password: string; confirmPassword: string }) => { email: string; phone: string; password: string; confirmPassword: string }) => void;
  onSetShowGuestPassword: (value: boolean) => void;
  onSendOtp: () => void;
  onOtpChange: (index: number, value: string) => void;
  onOtpKeyDown: (index: number, e: React.KeyboardEvent) => void;
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
  onOpenChange,
  onBackStep,
  onSetGuestAuthMethod,
  onSetGuestForm,
  onSetShowGuestPassword,
  onSendOtp,
  onOtpChange,
  onOtpKeyDown,
  onVerifyOtp,
  onResendOtp,
  onSetGuestNewPassword,
  onSetGuestConfirmPassword,
  onSetGuestPassword,
  onUseGuestCredentials,
}: GuestRegistrationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {(guestStep === 'otp' || guestStep === 'newpass') && (
              <button onClick={onBackStep} className="p-1 hover:bg-gray-100 rounded-lg mr-1">
                <ArrowLeft size={16} />
              </button>
            )}
            <UserPlus size={18} className="text-blue-600" />
            {guestStep === 'form' && 'Đăng ký tài khoản'}
            {guestStep === 'otp' && 'Xác thực OTP'}
            {guestStep === 'newpass' && 'Tạo mật khẩu'}
            {guestStep === 'success' && 'Đăng ký thành công'}
          </DialogTitle>
          <DialogDescription>
            {guestStep === 'form' && 'Tạo tài khoản WiFi bằng Email hoặc Zalo'}
            {guestStep === 'otp' &&
              `Nhập mã OTP đã gửi đến ${guestAuthMethod === 'email' ? guestForm.email : guestForm.phone}`}
            {guestStep === 'newpass' && 'Tạo mật khẩu cho tài khoản của bạn'}
            {guestStep === 'success' && 'Tài khoản WiFi tạm thời đã sẵn sàng'}
          </DialogDescription>
        </DialogHeader>

        {guestStep === 'form' && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Phương thức xác thực</Label>
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
                  <span className="font-medium text-sm">Email</span>
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
                  <span className="font-medium text-sm">Zalo</span>
                </button>
              </div>
            </div>

            {guestAuthMethod === 'email' ? (
              <div className="space-y-1.5">
                <Label htmlFor="guest-email" className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
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
                  Số điện thoại (Zalo) <span className="text-red-500">*</span>
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
                <p className="text-xs text-gray-500">Mã OTP sẽ được gửi qua Zalo</p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="guest-password" className="text-sm font-medium">
                Mật khẩu <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="guest-password"
                  type={showGuestPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 8 ký tự"
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
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="guest-confirm-password"
                  type={showGuestPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  value={guestForm.confirmPassword}
                  onChange={(e) =>
                    onSetGuestForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
            </div>

            {otpError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600">
                <AlertCircle size={16} />
                <span className="text-sm">{otpError}</span>
              </div>
            )}

            <DialogFooter className="pt-2 gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                Hủy
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
                    Đang gửi OTP...
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
              <p className="text-sm text-gray-600">Mã OTP 6 số đã được gửi đến</p>
              <p className="font-medium text-gray-900">
                {guestAuthMethod === 'email' ? guestForm.email : guestForm.phone}
              </p>
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
                  Đang xác thực...
                </div>
              ) : (
                'Xác nhận OTP'
              )}
            </Button>

            <div className="text-center">
              <button
                onClick={onResendOtp}
                disabled={isSendingOtp || resendLoading}
                className="text-sm text-blue-600 hover:underline disabled:opacity-50"
              >
                {isSendingOtp || resendLoading ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
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
              <Label className="text-sm font-medium">Mật khẩu</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showGuestPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
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

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
              <p className="text-xs font-medium text-gray-700">Yêu cầu mật khẩu:</p>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <div
                  className={`flex items-center gap-1.5 ${
                    guestNewPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {guestNewPassword.length >= 8 ? (
                    <CheckCircle size={12} />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-current" />
                  )}
                  <span>Tối thiểu 8 ký tự</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    /[A-Z]/.test(guestNewPassword) ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {/[A-Z]/.test(guestNewPassword) ? (
                    <CheckCircle size={12} />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-current" />
                  )}
                  <span>Chữ hoa (A-Z)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    /[a-z]/.test(guestNewPassword) ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {/[a-z]/.test(guestNewPassword) ? (
                    <CheckCircle size={12} />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-current" />
                  )}
                  <span>Chữ thường (a-z)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    /[0-9]/.test(guestNewPassword) ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {/[0-9]/.test(guestNewPassword) ? (
                    <CheckCircle size={12} />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-current" />
                  )}
                  <span>Số (0-9)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 col-span-2 ${
                    /[!@#$%^&*(),.?":{}|<>]/.test(guestNewPassword)
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                >
                  {/[!@#$%^&*(),.?":{}|<>]/.test(guestNewPassword) ? (
                    <CheckCircle size={12} />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-current" />
                  )}
                  <span>Ký tự đặc biệt (!@#$%^&*...)</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showGuestPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  value={guestConfirmPassword}
                  onChange={(e) => onSetGuestConfirmPassword(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
              {guestConfirmPassword && guestNewPassword !== guestConfirmPassword && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> Mật khẩu không khớp
                </p>
              )}
            </div>

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
                  Đang xử lý...
                </div>
              ) : (
                'Hoàn tất đăng ký'
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
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Đăng ký thành công!</h3>
              <p className="text-sm text-gray-500">Tài khoản WiFi tạm thời đã sẵn sàng</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500 mb-1">Tên đăng nhập</p>
              <p className="font-medium text-gray-900">
                {guestAuthMethod === 'email' ? guestForm.email : guestForm.phone}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                (Sử dụng {guestAuthMethod === 'email' ? 'email' : 'số điện thoại'} để đăng nhập)
              </p>
            </div>

            <Button onClick={onUseGuestCredentials} className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11">
              Đăng nhập ngay
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
