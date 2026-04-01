import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SocialAuthButton from './SocialAuthButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

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
  onOpenForgotModal
}: GuestLoginTabProps) {
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  return (
    <div className="space-y-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
      {/* <div className="text-center mb-4">
        <div className="relative inline-flex items-start">
          <p className="text-sm text-gray-500 mt-1 whitespace-nowrap">
            Đăng nhập nhanh hoặc tạo tài khoản mới
          </p>
          <span 
            className="text-red-500 font-bold animate-pulse cursor-pointer hover:text-red-600 text-lg leading-none absolute -right-3 top-0 block"
            onClick={() => setHelpModalOpen(true)}
            title="Hướng dẫn đăng nhập khách"
          >
            *
          </span>
        </div>
      </div> */}

      {/* Standard Login Form */}
      <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-4 mt-2">
        <div className="space-y-1.5">
          <Label htmlFor="guest-login-username">Tài khoản (Email / Zalo)</Label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input 
              id="guest-login-username"
              type="text" 
              placeholder="Nhập email hoặc số ĐT Zalo"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              className="pl-10 h-11 rounded-xl"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="guest-login-password">Mật khẩu</Label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input 
              id="guest-login-password"
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="pl-10 pr-10 h-11 rounded-xl"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onOpenForgotModal}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Quên mật khẩu?
            </button>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading || !username || !password}
          className="w-full flex items-center justify-center gap-2 h-11 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-200/50"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Đăng nhập <ArrowRight size={18} />
            </>
          )}
        </button>

        <div className="text-center pt-1">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <button
              type="button"
              onClick={onOpenGuestModal}
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Đăng ký
            </button>
          </p>
        </div>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-white text-gray-400 text-sm">hoặc đăng nhập bằng</span>
        </div>
      </div>

      {/* Social Logins */}
      <div className="grid grid-cols-3 gap-3 mb-2">
        <SocialAuthButton 
          provider="Google"
          icon="/google.png"
          onClick={() => onSSOLogin('google')}
          disabled={isLoading}
          colorClass="text-red-600"
          bgClass=""
          hoverClass="hover:border-red-300 hover:bg-red-50"
        />
        <SocialAuthButton 
          provider="Microsoft"
          icon="/microsoft.png"
          onClick={() => onSSOLogin('azure')}
          disabled={isLoading}
          colorClass="text-blue-600"
          bgClass=""
          hoverClass="hover:border-blue-300 hover:bg-blue-50"
        />
        <SocialAuthButton 
          provider="Facebook"
          icon="/facebook.png"
          onClick={() => onSSOLogin('facebook')}
          disabled={isLoading}
          colorClass="text-blue-700"
          bgClass=""
          hoverClass="hover:border-blue-700 hover:bg-blue-50"
        />
      </div>

      <Dialog open={helpModalOpen} onOpenChange={setHelpModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Hướng dẫn đăng nhập khách
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-2 text-gray-700 leading-relaxed text-[15px] space-y-2">
            <p><strong>1. Đăng nhập nhanh:</strong> Sử dụng tài khoản Google, Microsoft, hoặc Facebook cá nhân của bạn để truy cập ngay.</p>
            <p><strong>2. Tạo tài khoản mới:</strong> Nếu bạn không muốn sử dụng mạng xã hội, có thể nhanh chóng đăng ký tài khoản tạm thời bằng Email hoặc Zalo. Hệ thống sẽ gửi một mã OTP để xác nhận và cấp quyền truy cập.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
