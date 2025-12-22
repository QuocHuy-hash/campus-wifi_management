import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, EyeOff, Lock, User, AlertCircle, Clock, Shield, Gauge, 
  UserPlus, Mail, Phone, FileText, HardDrive, Globe, ChevronRight,
  MessageCircle, ArrowLeft, CheckCircle, Facebook
} from 'lucide-react';
import { currentUser, qosPolicies, formatBytes } from '@/data/mockData';
import hcmusLogo from '@/assets/logo_hcmus.png';

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [guestForm, setGuestForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    duration: '1h'
  });
  const [guestAuthMethod, setGuestAuthMethod] = useState<'email' | 'phone'>('email');
  const [guestStep, setGuestStep] = useState<'form' | 'otp' | 'newpass' | 'success'>('form');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [guestNewPassword, setGuestNewPassword] = useState('');
  const [guestConfirmPassword, setGuestConfirmPassword] = useState('');
  const [showGuestPassword, setShowGuestPassword] = useState(false);
  const [isSettingGuestPassword, setIsSettingGuestPassword] = useState(false);

  // Forgot password states
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotMethod, setForgotMethod] = useState<'email' | 'phone'>('email');
  const [forgotContact, setForgotContact] = useState('');
  const [forgotStep, setForgotStep] = useState<'form' | 'otp' | 'newpass' | 'success'>('form');
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '', '', '']);
  const [forgotOtpError, setForgotOtpError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSendingForgotOtp, setIsSendingForgotOtp] = useState(false);
  const [isVerifyingForgotOtp, setIsVerifyingForgotOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const studentPolicy = qosPolicies.Student;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập');
      return;
    }

    if (!agreeTerms) {
      setError('Vui lòng đồng ý với Điều khoản sử dụng WiFi');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      if (username && password) {
        localStorage.setItem('portalLoggedIn', 'true');
        localStorage.setItem('portalUser', JSON.stringify({ 
          ...currentUser,
          username: username,
          loginTime: new Date().toISOString()
        }));
        setLocation('/session');
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleSSOLogin = (provider: string) => {
    if (!agreeTerms) {
      setError('Vui lòng đồng ý với Điều khoản sử dụng WiFi');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const providerLower = provider.toLowerCase();
      const linkedAccount = {
        type: providerLower,
        email: `${providerLower}.user@gmail.com`,
        name: `User ${provider}`
      };

      localStorage.setItem('portalLoggedIn', 'true');
      localStorage.setItem('portalUser', JSON.stringify({ 
        ...currentUser,
        id: Date.now(),
        username: linkedAccount.email,
        fullname: `Người dùng ${provider}`,
        loginTime: new Date().toISOString(),
        linkedAccounts: [linkedAccount]
      }));
      setLocation('/session');
    }, 1500);
  };

  const handleSendOtp = () => {
    const contact = guestAuthMethod === 'email' ? guestForm.email : guestForm.phone;
    if (!guestForm.fullName || !contact) return;
    
    setIsSendingOtp(true);
    setOtpError('');
    
    // Simulate sending OTP
    setTimeout(() => {
      setIsSendingOtp(false);
      setGuestStep('otp');
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    
    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const otp = otpCode.join('');
    if (otp.length !== 6) {
      setOtpError('Vui lòng nhập đủ 6 số');
      return;
    }
    
    setIsVerifyingOtp(true);
    setOtpError('');
    
    // Simulate OTP verification
    setTimeout(() => {
      setIsVerifyingOtp(false);
      setGuestStep('newpass');
    }, 1500);
  };

  const handleSetGuestPassword = () => {
    // Validate password policy
    if (!guestNewPassword || guestNewPassword.length < 8) {
      setOtpError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    if (!/[A-Z]/.test(guestNewPassword)) {
      setOtpError('Mật khẩu phải có ít nhất 1 chữ hoa (A-Z)');
      return;
    }
    if (!/[a-z]/.test(guestNewPassword)) {
      setOtpError('Mật khẩu phải có ít nhất 1 chữ thường (a-z)');
      return;
    }
    if (!/[0-9]/.test(guestNewPassword)) {
      setOtpError('Mật khẩu phải có ít nhất 1 số (0-9)');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(guestNewPassword)) {
      setOtpError('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
      return;
    }
    if (guestNewPassword !== guestConfirmPassword) {
      setOtpError('Xác nhận mật khẩu không khớp');
      return;
    }
    
    setIsSettingGuestPassword(true);
    setOtpError('');
    
    setTimeout(() => {
      setIsSettingGuestPassword(false);
      setGuestStep('success');
    }, 1500);
  };

  const handleResendOtp = () => {
    setOtpCode(['', '', '', '', '', '']);
    setOtpError('');
    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
    }, 1500);
  };

  const resetGuestForm = () => {
    setGuestForm({ fullName: '', email: '', phone: '', duration: '1h' });
    setGuestAuthMethod('email');
    setGuestStep('form');
    setOtpCode(['', '', '', '', '', '']);
    setOtpError('');
    setGuestNewPassword('');
    setGuestConfirmPassword('');
    setShowGuestPassword(false);
  };

  const handleUseGuestCredentials = () => {
    // Use email or phone as username
    const guestUsername = guestAuthMethod === 'email' ? guestForm.email : guestForm.phone;
    setUsername(guestUsername);
    setPassword(guestNewPassword);
    setGuestModalOpen(false);
    resetGuestForm();
  };

  // Forgot password handlers
  const handleSendForgotOtp = () => {
    if (!forgotContact) return;
    setIsSendingForgotOtp(true);
    setForgotOtpError('');
    setTimeout(() => {
      setIsSendingForgotOtp(false);
      setForgotStep('otp');
    }, 1500);
  };

  const handleForgotOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...forgotOtp];
    newOtp[index] = value;
    setForgotOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`forgot-otp-${index + 1}`)?.focus();
    }
  };

  const handleForgotOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !forgotOtp[index] && index > 0) {
      document.getElementById(`forgot-otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyForgotOtp = () => {
    const otp = forgotOtp.join('');
    if (otp.length !== 6) {
      setForgotOtpError('Vui lòng nhập đủ 6 số');
      return;
    }
    setIsVerifyingForgotOtp(true);
    setForgotOtpError('');
    setTimeout(() => {
      setIsVerifyingForgotOtp(false);
      setForgotStep('newpass');
    }, 1500);
  };

  const handleResetPassword = () => {
    // Validate password policy
    if (!newPassword || newPassword.length < 8) {
      setForgotOtpError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setForgotOtpError('Mật khẩu phải có ít nhất 1 chữ hoa (A-Z)');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setForgotOtpError('Mật khẩu phải có ít nhất 1 chữ thường (a-z)');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setForgotOtpError('Mật khẩu phải có ít nhất 1 số (0-9)');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setForgotOtpError('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotOtpError('Xác nhận mật khẩu không khớp');
      return;
    }
    setIsResettingPassword(true);
    setForgotOtpError('');
    setTimeout(() => {
      setIsResettingPassword(false);
      setForgotStep('success');
    }, 1500);
  };

  const resetForgotForm = () => {
    setForgotContact('');
    setForgotMethod('email');
    setForgotStep('form');
    setForgotOtp(['', '', '', '', '', '']);
    setForgotOtpError('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowNewPassword(false);
  };

  const handleUseForgotCredentials = () => {
    setUsername(forgotContact);
    setPassword(newPassword);
    setForgotModalOpen(false);
    resetForgotForm();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src={hcmusLogo} alt="HCMUS Logo" className="w-18 h-18 object-contain" />
            <p className="text-gray-600 font-sans">Trường Đại học KHTN - ĐHQG HCM</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  MSSV / Email / Tài khoản AD
                </Label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="21120001 hoặc email@hcmus.edu.vn"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-3 py-1">
                <Checkbox 
                  id="terms" 
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  className="mt-0.5 rounded"
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                  Tôi đồng ý với{' '}
                  <button 
                    type="button"
                    onClick={() => setTermsModalOpen(true)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Điều khoản sử dụng WiFi
                  </button>
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang đăng nhập...
                  </div>
                ) : (
                  <>
                    Đăng nhập
                    <ChevronRight size={18} className="ml-1" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-gray-400 text-sm">hoặc đăng nhập với</span>
              </div>
            </div>

            {/* SSO Options */}
            <div className="grid grid-cols-3 gap-3">
              <button 
                type="button"
                onClick={() => handleSSOLogin('Gmail')}
                disabled={isLoading}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Mail size={20} className="text-red-600" />
                </div>
                <span className="text-xs font-medium text-gray-700">Gmail</span>
              </button>
              <button 
                type="button"
                onClick={() => handleSSOLogin('Microsoft')}
                disabled={isLoading}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Globe size={20} className="text-blue-600" />
                </div>
                <span className="text-xs font-medium text-gray-700">Microsoft</span>
              </button>
              <button 
                type="button"
                onClick={() => handleSSOLogin('Facebook')}
                disabled={isLoading}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Facebook size={20} className="text-blue-700" />
                </div>
                <span className="text-xs font-medium text-gray-700">Facebook</span>
              </button>
            </div>
          </div>

          {/* Guest Registration */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <button 
              className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-600 transition-colors"
              onClick={() => setGuestModalOpen(true)}
            >
              <UserPlus size={16} className="text-blue-600" />
              Đăng ký tài khoản Khách
            </button>
          </div>
        </div>

        {/* Policy Info */}
        <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Chính sách sử dụng</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Clock size={18} className="text-blue-600" />
              </div>
              <p className="text-gray-900 font-semibold">{studentPolicy.session_timeout / 3600}h</p>
              <p className="text-gray-500 text-xs">mỗi phiên</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Gauge size={18} className="text-blue-600" />
              </div>
              <p className="text-gray-900 font-semibold">{studentPolicy.bandwidth_limit} Mbps</p>
              <p className="text-gray-500 text-xs">băng thông</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                <HardDrive size={18} className="text-blue-600" />
              </div>
              <p className="text-gray-900 font-semibold">{formatBytes(studentPolicy.quota_daily)}</p>
              <p className="text-gray-500 text-xs">hạn ngạch/ngày</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          © 2026 HCMUS - Trường Đại học Khoa học Tự nhiên
        </p>
      </div>

      {/* Terms Modal */}
      <Dialog open={termsModalOpen} onOpenChange={setTermsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              Điều khoản sử dụng WiFi
            </DialogTitle>
            <DialogDescription>
              Campus WiFi - Trường ĐHKHTN
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2 text-sm text-gray-600">
            <section>
              <h4 className="font-semibold text-gray-900 mb-2">1. Quy định chung</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>WiFi miễn phí cho sinh viên, giảng viên và nhân viên</li>
                <li>Mỗi tài khoản chỉ được sử dụng bởi chủ sở hữu</li>
                <li>Không chia sẻ tài khoản cho người khác</li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold text-gray-900 mb-2">2. Giới hạn sử dụng</h4>
              <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời lượng phiên:</span>
                  <span className="font-semibold text-gray-900">{studentPolicy.session_timeout / 3600} giờ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Băng thông:</span>
                  <span className="font-semibold text-gray-900">{qosPolicies.Student.bandwidth_limit}-{qosPolicies.Teacher.bandwidth_limit} Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hạn ngạch hàng ngày:</span>
                  <span className="font-semibold text-gray-900">{formatBytes(studentPolicy.quota_daily)}</span>
                </div>
              </div>
            </section>

            <section>
              <h4 className="font-semibold text-gray-900 mb-2">3. Hành vi bị cấm</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Truy cập nội dung bất hợp pháp, khiêu dâm</li>
                <li>Tấn công, phá hoại hệ thống mạng</li>
                <li>Vi phạm bản quyền, sử dụng P2P/torrent</li>
                <li>Spam, phishing, hoạt động lừa đảo</li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold text-gray-900 mb-2">4. Xử lý vi phạm</h4>
              <div className="bg-red-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Cảnh cáo, khóa tài khoản 30 phút</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Khóa tài khoản 24 giờ</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Khóa tài khoản vĩnh viễn</span>
                </div>
              </div>
            </section>
          </div>

          <DialogFooter>
            <Button onClick={() => { setTermsModalOpen(false); setAgreeTerms(true); }} className="bg-blue-600 hover:bg-blue-700">
              Đồng ý và tiếp tục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Guest Registration Modal */}
      <Dialog open={guestModalOpen} onOpenChange={(open) => {
        setGuestModalOpen(open);
        if (!open) resetGuestForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {(guestStep === 'otp' || guestStep === 'newpass') && (
                <button 
                  onClick={() => setGuestStep(guestStep === 'newpass' ? 'otp' : 'form')} 
                  className="p-1 hover:bg-gray-100 rounded-lg mr-1"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              <UserPlus size={18} className="text-blue-600" />
              {guestStep === 'form' && 'Đăng ký tài khoản Khách'}
              {guestStep === 'otp' && 'Xác thực OTP'}
              {guestStep === 'newpass' && 'Tạo mật khẩu'}
              {guestStep === 'success' && 'Đăng ký thành công'}
            </DialogTitle>
            <DialogDescription>
              {guestStep === 'form' && 'Xác thực bằng Email hoặc Số điện thoại (Zalo)'}
              {guestStep === 'otp' && `Nhập mã OTP đã gửi đến ${guestAuthMethod === 'email' ? guestForm.email : guestForm.phone}`}
              {guestStep === 'newpass' && 'Tạo mật khẩu cho tài khoản của bạn'}
              {guestStep === 'success' && 'Tài khoản WiFi tạm thời đã sẵn sàng'}
            </DialogDescription>
          </DialogHeader>
          
          {guestStep === 'form' && (
            <div className="space-y-4 py-2">
              {/* Auth Method Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Phương thức xác thực</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGuestAuthMethod('email')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      guestAuthMethod === 'email' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Mail size={18} />
                    <span className="font-medium text-sm">Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuestAuthMethod('phone')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      guestAuthMethod === 'phone' 
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
                <Label htmlFor="guest-name" className="text-sm font-medium">
                  Họ tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="guest-name"
                  placeholder="Nguyễn Văn A"
                  value={guestForm.fullName}
                  onChange={(e) => setGuestForm({...guestForm, fullName: e.target.value})}
                  className="h-11 rounded-xl"
                />
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
                      onChange={(e) => setGuestForm({...guestForm, email: e.target.value})}
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
                      onChange={(e) => setGuestForm({...guestForm, phone: e.target.value})}
                      className="pl-10 h-11 rounded-xl"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Mã OTP sẽ được gửi qua Zalo</p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Thời gian sử dụng</Label>
                <Select value={guestForm.duration} onValueChange={(v) => setGuestForm({...guestForm, duration: v})}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 giờ</SelectItem>
                    <SelectItem value="4h">4 giờ</SelectItem>
                    <SelectItem value="1d">1 ngày</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">
                <p className="font-medium text-amber-800 mb-1">Giới hạn tài khoản Khách:</p>
                <p className="text-amber-700">
                  {qosPolicies.Guest.bandwidth_limit} Mbps • {formatBytes(qosPolicies.Guest.quota_daily)}/ngày
                </p>
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button variant="outline" onClick={() => setGuestModalOpen(false)} className="rounded-xl">
                  Hủy
                </Button>
                <Button 
                  onClick={handleSendOtp}
                  disabled={!guestForm.fullName || (guestAuthMethod === 'email' ? !guestForm.email : !guestForm.phone) || isSendingOtp}
                  className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  {isSendingOtp ? (
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
                <p className="text-sm text-gray-600">
                  Mã OTP 6 số đã được gửi đến
                </p>
                <p className="font-medium text-gray-900">
                  {guestAuthMethod === 'email' ? guestForm.email : guestForm.phone}
                </p>
              </div>

              {/* OTP Input */}
              <div className="flex justify-center gap-2 mb-4">
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
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
                onClick={handleVerifyOtp}
                disabled={otpCode.some(d => !d) || isVerifyingOtp}
                className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11 mb-3"
              >
                {isVerifyingOtp ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang xác thực...
                  </div>
                ) : 'Xác nhận OTP'}
              </Button>

              <div className="text-center">
                <button
                  onClick={handleResendOtp}
                  disabled={isSendingOtp}
                  className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                >
                  {isSendingOtp ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
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
                    onChange={(e) => setGuestNewPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGuestPassword(!showGuestPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showGuestPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
                <p className="text-xs font-medium text-gray-700">Yêu cầu mật khẩu:</p>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div className={`flex items-center gap-1.5 ${guestNewPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                    {guestNewPassword.length >= 8 ? <CheckCircle size={12} /> : <div className="w-3 h-3 rounded-full border border-current" />}
                    <span>Tối thiểu 8 ký tự</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(guestNewPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                    {/[A-Z]/.test(guestNewPassword) ? <CheckCircle size={12} /> : <div className="w-3 h-3 rounded-full border border-current" />}
                    <span>Chữ hoa (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[a-z]/.test(guestNewPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                    {/[a-z]/.test(guestNewPassword) ? <CheckCircle size={12} /> : <div className="w-3 h-3 rounded-full border border-current" />}
                    <span>Chữ thường (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[0-9]/.test(guestNewPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                    {/[0-9]/.test(guestNewPassword) ? <CheckCircle size={12} /> : <div className="w-3 h-3 rounded-full border border-current" />}
                    <span>Số (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 col-span-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(guestNewPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                    {/[!@#$%^&*(),.?":{}|<>]/.test(guestNewPassword) ? <CheckCircle size={12} /> : <div className="w-3 h-3 rounded-full border border-current" />}
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
                    onChange={(e) => setGuestConfirmPassword(e.target.value)}
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
                onClick={handleSetGuestPassword}
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
                ) : 'Hoàn tất đăng ký'}
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
              
              <Button onClick={handleUseGuestCredentials} className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11">
                Đăng nhập ngay
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Forgot Password Modal */}
      <Dialog open={forgotModalOpen} onOpenChange={(open) => {
        setForgotModalOpen(open);
        if (!open) resetForgotForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {(forgotStep === 'otp' || forgotStep === 'newpass') && (
                <button 
                  onClick={() => setForgotStep(forgotStep === 'newpass' ? 'otp' : 'form')} 
                  className="p-1 hover:bg-gray-100 rounded-lg mr-1"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              <Lock size={18} className="text-blue-600" />
              {forgotStep === 'form' && 'Quên mật khẩu'}
              {forgotStep === 'otp' && 'Xác thực OTP'}
              {forgotStep === 'newpass' && 'Đặt mật khẩu mới'}
              {forgotStep === 'success' && 'Thành công'}
            </DialogTitle>
            <DialogDescription>
              {forgotStep === 'form' && 'Nhập email hoặc số điện thoại để lấy lại mật khẩu'}
              {forgotStep === 'otp' && `Nhập mã OTP đã gửi đến ${forgotContact}`}
              {forgotStep === 'newpass' && 'Tạo mật khẩu mới cho tài khoản'}
              {forgotStep === 'success' && 'Mật khẩu đã được đặt lại thành công'}
            </DialogDescription>
          </DialogHeader>

          {forgotStep === 'form' && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Phương thức xác thực</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotMethod('email')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      forgotMethod === 'email' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Mail size={18} />
                    <span className="font-medium text-sm">Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotMethod('phone')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      forgotMethod === 'phone' 
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
                  {forgotMethod === 'email' ? 'Email' : 'Số điện thoại'} <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  {forgotMethod === 'email' ? (
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  ) : (
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  )}
                  <Input
                    type={forgotMethod === 'email' ? 'email' : 'tel'}
                    placeholder={forgotMethod === 'email' ? 'email@example.com' : '0901234567'}
                    value={forgotContact}
                    onChange={(e) => setForgotContact(e.target.value)}
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button variant="outline" onClick={() => setForgotModalOpen(false)} className="rounded-xl">
                  Hủy
                </Button>
                <Button 
                  onClick={handleSendForgotOtp}
                  disabled={!forgotContact || isSendingForgotOtp}
                  className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  {isSendingForgotOtp ? (
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

          {forgotStep === 'otp' && (
            <div className="py-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {forgotMethod === 'email' ? (
                    <Mail size={28} className="text-blue-600" />
                  ) : (
                    <MessageCircle size={28} className="text-blue-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600">Mã OTP 6 số đã được gửi đến</p>
                <p className="font-medium text-gray-900">{forgotContact}</p>
              </div>

              <div className="flex justify-center gap-2 mb-4">
                {forgotOtp.map((digit, index) => (
                  <input
                    key={index}
                    id={`forgot-otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleForgotOtpChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleForgotOtpKeyDown(index, e)}
                    className="w-11 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                ))}
              </div>

              {forgotOtpError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center gap-2 text-red-600">
                  <AlertCircle size={16} />
                  <span className="text-sm">{forgotOtpError}</span>
                </div>
              )}

              <Button 
                onClick={handleVerifyForgotOtp}
                disabled={forgotOtp.some(d => !d) || isVerifyingForgotOtp}
                className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11 mb-3"
              >
                {isVerifyingForgotOtp ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang xác thực...
                  </div>
                ) : 'Tiếp tục'}
              </Button>

              <div className="text-center">
                <button
                  onClick={() => {
                    setForgotOtp(['', '', '', '', '', '']);
                    setIsSendingForgotOtp(true);
                    setTimeout(() => setIsSendingForgotOtp(false), 1500);
                  }}
                  disabled={isSendingForgotOtp}
                  className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                >
                  {isSendingForgotOtp ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
                </button>
              </div>
            </div>
          )}

          {forgotStep === 'newpass' && (
            <div className="space-y-4 py-2">
              {forgotOtpError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600">
                  <AlertCircle size={16} />
                  <span className="text-sm">{forgotOtpError}</span>
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
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
                <p className="text-xs font-medium text-gray-700">Yêu cầu mật khẩu:</p>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div className={`flex items-center gap-1.5 ${newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                    {newPassword.length >= 8 ? <CheckCircle size={12} /> : <div className="w-3 h-3 rounded-full border border-current" />}
                    <span>Tối thiểu 8 ký tự</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                    {/[A-Z]/.test(newPassword) ? <CheckCircle size={12} /> : <div className="w-3 h-3 rounded-full border border-current" />}
                    <span>Chữ hoa (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                    {/[a-z]/.test(newPassword) ? <CheckCircle size={12} /> : <div className="w-3 h-3 rounded-full border border-current" />}
                    <span>Chữ thường (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                    {/[0-9]/.test(newPassword) ? <CheckCircle size={12} /> : <div className="w-3 h-3 rounded-full border border-current" />}
                    <span>Số (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 col-span-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                    {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? <CheckCircle size={12} /> : <div className="w-3 h-3 rounded-full border border-current" />}
                    <span>Ký tự đặc biệt (!@#$%^&*...)</span>
                  </div>
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
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
                {confirmNewPassword && newPassword !== confirmNewPassword && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} /> Mật khẩu không khớp
                  </p>
                )}
              </div>

              <Button 
                onClick={handleResetPassword}
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
                ) : 'Đặt mật khẩu mới'}
              </Button>
            </div>
          )}

          {forgotStep === 'success' && (
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
                <p className="font-medium text-gray-900">{forgotContact}</p>
              </div>

              <Button onClick={handleUseForgotCredentials} className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11">
                Đăng nhập ngay
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
