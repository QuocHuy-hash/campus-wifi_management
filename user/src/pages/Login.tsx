import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, EyeOff, Wifi, Lock, User, AlertCircle, Clock, Shield, Gauge, 
  UserPlus, Mail, Phone, ExternalLink, Database, FileText, HardDrive
} from 'lucide-react';
import { currentUser, qosPolicies, formatBytes } from '@/data/mockData';

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
  const [guestRegistered, setGuestRegistered] = useState(false);
  const [guestCredentials, setGuestCredentials] = useState({ username: '', password: '' });

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

  const handleSSOLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem('portalLoggedIn', 'true');
      localStorage.setItem('portalUser', JSON.stringify({ 
        ...currentUser,
        username: `sso.user@hcmus.edu.vn`,
        fullname: 'Người dùng SSO',
        loginTime: new Date().toISOString()
      }));
      setLocation('/session');
    }, 1500);
  };

  const handleGuestRegister = () => {
    if (!guestForm.fullName || !guestForm.email) return;
    
    const generatedUsername = 'guest_' + Math.random().toString(36).substring(2, 8);
    const generatedPassword = Math.random().toString(36).substring(2, 10);
    
    setGuestCredentials({ username: generatedUsername, password: generatedPassword });
    setGuestRegistered(true);
  };

  const handleUseGuestCredentials = () => {
    setUsername(guestCredentials.username);
    setPassword(guestCredentials.password);
    setGuestModalOpen(false);
    setGuestRegistered(false);
    setGuestForm({ fullName: '', email: '', phone: '', duration: '1h' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen flex flex-col lg:flex-row">
        
        {/* Left Side - Info Panel (Desktop only) */}
        <div className="hidden lg:flex lg:w-[45%] bg-gray-900 text-white p-8 flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Wifi size={28} />
              <span className="text-xl font-semibold">Campus WiFi</span>
            </div>
            
            <h2 className="text-3xl font-bold mb-3">Kết nối WiFi</h2>
            <p className="text-gray-400 mb-6">
              Truy cập mạng WiFi miễn phí tại tất cả cơ sở của Trường ĐHKHTN.
            </p>

            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <p className="text-gray-400 text-sm mb-1">SSID</p>
              <p className="text-lg font-semibold">HCMUS-Student</p>
            </div>
          </div>
          
          {/* Policy Info */}
          <div className="space-y-3">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Chính sách</p>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock size={16} className="text-gray-500" />
              <span>Phiên: {studentPolicy.session_timeout / 3600} giờ</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Gauge size={16} className="text-gray-500" />
              <span>Băng thông: {studentPolicy.bandwidth_limit} Mbps</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <HardDrive size={16} className="text-gray-500" />
              <span>Hạn ngạch: {formatBytes(studentPolicy.quota_daily)}/ngày</span>
            </div>
            <button 
              onClick={() => setTermsModalOpen(true)}
              className="text-sm text-gray-500 hover:text-gray-300 underline mt-2"
            >
              Xem điều khoản đầy đủ
            </button>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl mb-3">
                <Wifi size={28} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Campus WiFi</h1>
              <p className="text-gray-500 text-sm">HCMUS-Student</p>
            </div>

            <Card className="p-6 shadow-sm border border-gray-200">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-gray-900">Đăng nhập</h2>
                <p className="text-gray-500 text-sm mt-1">Nhập thông tin tài khoản</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-sm">MSSV / Email</Label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="21120001 hoặc email@hcmus.edu.vn"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-9 h-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm">Mật khẩu</Label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-9 h-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-tight">
                    Tôi đồng ý với{' '}
                    <button 
                      type="button"
                      onClick={() => setTermsModalOpen(true)}
                      className="text-blue-600 hover:underline"
                    >
                      Điều khoản sử dụng
                    </button>
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang đăng nhập...
                    </div>
                  ) : 'Đăng nhập'}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-white text-gray-400 text-sm">hoặc</span>
                  </div>
                </div>

                {/* SSO Options */}
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full h-10"
                  onClick={handleSSOLogin}
                  disabled={isLoading}
                >
                  <ExternalLink size={16} className="mr-2" />
                  SSO / Microsoft 365
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    type="button"
                    variant="outline" 
                    className="h-9 text-sm"
                    onClick={handleSSOLogin}
                    disabled={isLoading}
                  >
                    <Database size={14} className="mr-1.5" />
                    OAuth2
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="h-9 text-sm"
                    onClick={handleSSOLogin}
                    disabled={isLoading}
                  >
                    <Shield size={14} className="mr-1.5" />
                    SAML
                  </Button>
                </div>
              </form>

              {/* Guest Link */}
              <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                <button 
                  className="text-sm text-gray-500 hover:text-gray-700"
                  onClick={() => setGuestModalOpen(true)}
                >
                  <UserPlus size={14} className="inline mr-1.5" />
                  Đăng ký tài khoản Khách
                </button>
              </div>
            </Card>

            {/* Mobile Policy Info */}
            <div className="lg:hidden mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Chính sách</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-400" />
                  {studentPolicy.session_timeout / 3600}h/phiên
                </span>
                <span className="flex items-center gap-1.5">
                  <Gauge size={14} className="text-gray-400" />
                  {studentPolicy.bandwidth_limit} Mbps
                </span>
                <span className="flex items-center gap-1.5">
                  <HardDrive size={14} className="text-gray-400" />
                  {formatBytes(studentPolicy.quota_daily)}/ngày
                </span>
              </div>
            </div>

            <p className="text-center text-gray-400 text-xs mt-4">
              © 2024 HCMUS - Trường Đại học Khoa học Tự nhiên
            </p>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      <Dialog open={termsModalOpen} onOpenChange={setTermsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={18} />
              Điều khoản sử dụng WiFi
            </DialogTitle>
            <DialogDescription className="text-sm">
              Campus WiFi - Trường ĐHKHTN
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2 text-sm text-gray-600">
            <section>
              <h4 className="font-medium text-gray-900 mb-1.5">1. Quy định chung</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>WiFi miễn phí cho sinh viên, giảng viên và nhân viên.</li>
                <li>Mỗi tài khoản chỉ được sử dụng bởi chủ sở hữu.</li>
              </ul>
            </section>

            <section>
              <h4 className="font-medium text-gray-900 mb-1.5">2. Giới hạn sử dụng</h4>
              <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span>Thời lượng phiên:</span>
                  <span className="font-medium">{studentPolicy.session_timeout / 3600} giờ</span>
                </div>
                <div className="flex justify-between">
                  <span>Băng thông:</span>
                  <span className="font-medium">{qosPolicies.Student.bandwidth_limit}-{qosPolicies.Teacher.bandwidth_limit} Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span>Hạn ngạch:</span>
                  <span className="font-medium">{formatBytes(studentPolicy.quota_daily)}/ngày</span>
                </div>
              </div>
            </section>

            <section>
              <h4 className="font-medium text-gray-900 mb-1.5">3. Hành vi bị cấm</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Truy cập nội dung bất hợp pháp</li>
                <li>Tấn công, phá hoại hệ thống mạng</li>
                <li>Vi phạm bản quyền, sử dụng P2P/torrent</li>
              </ul>
            </section>

            <section>
              <h4 className="font-medium text-gray-900 mb-1.5">4. Xử lý vi phạm</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Lần 1: Cảnh cáo, khóa 30 phút</li>
                <li>Lần 2: Khóa 24 giờ</li>
                <li>Lần 3: Khóa vĩnh viễn</li>
              </ul>
            </section>
          </div>

          <DialogFooter>
            <Button onClick={() => setTermsModalOpen(false)} className="bg-blue-600 hover:bg-blue-700">
              Đã hiểu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Guest Registration Modal */}
      <Dialog open={guestModalOpen} onOpenChange={(open) => {
        setGuestModalOpen(open);
        if (!open) {
          setGuestRegistered(false);
          setGuestForm({ fullName: '', email: '', phone: '', duration: '1h' });
        }
      }}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus size={18} />
              Đăng ký Khách
            </DialogTitle>
            <DialogDescription className="text-sm">
              Tạo tài khoản tạm thời
            </DialogDescription>
          </DialogHeader>
          
          {!guestRegistered ? (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="guest-name" className="text-sm">Họ tên <span className="text-red-500">*</span></Label>
                <Input
                  id="guest-name"
                  placeholder="Nguyễn Văn A"
                  value={guestForm.fullName}
                  onChange={(e) => setGuestForm({...guestForm, fullName: e.target.value})}
                  className="h-10"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="guest-email" className="text-sm">Email <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="guest-email"
                    type="email"
                    placeholder="email@example.com"
                    value={guestForm.email}
                    onChange={(e) => setGuestForm({...guestForm, email: e.target.value})}
                    className="pl-9 h-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="guest-phone" className="text-sm">SĐT (tùy chọn)</Label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="guest-phone"
                    type="tel"
                    placeholder="0901234567"
                    value={guestForm.phone}
                    onChange={(e) => setGuestForm({...guestForm, phone: e.target.value})}
                    className="pl-9 h-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Thời gian</Label>
                <Select value={guestForm.duration} onValueChange={(v) => setGuestForm({...guestForm, duration: v})}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 giờ</SelectItem>
                    <SelectItem value="4h">4 giờ</SelectItem>
                    <SelectItem value="1d">1 ngày</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-500">
                Giới hạn: {qosPolicies.Guest.bandwidth_limit} Mbps • {formatBytes(qosPolicies.Guest.quota_daily)}/ngày
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button variant="outline" onClick={() => setGuestModalOpen(false)}>
                  Hủy
                </Button>
                <Button 
                  onClick={handleGuestRegister}
                  disabled={!guestForm.fullName || !guestForm.email}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Đăng ký
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="py-2">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Tên đăng nhập</p>
                  <p className="font-mono font-semibold text-lg">{guestCredentials.username}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Mật khẩu</p>
                  <p className="font-mono font-semibold text-lg">{guestCredentials.password}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Thông tin đã gửi đến {guestForm.email}
              </p>
              <Button onClick={handleUseGuestCredentials} className="w-full bg-blue-600 hover:bg-blue-700">
                Sử dụng ngay
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
