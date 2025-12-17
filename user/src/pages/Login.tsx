import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Wifi, Lock, User, AlertCircle, Clock, Shield, Gauge, UserPlus, Mail, Phone, ExternalLink } from 'lucide-react';

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Guest Registration Modal
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [guestForm, setGuestForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    duration: '1h'
  });
  const [guestRegistered, setGuestRegistered] = useState(false);
  const [guestCredentials, setGuestCredentials] = useState({ username: '', password: '' });

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
          username: username,
          name: username === 'student' ? 'Nguyễn Văn A' : username,
          role: username.includes('@') ? 'Sinh viên' : 'Giảng viên',
          mssv: '21120001',
          ip: '10.0.15.' + Math.floor(Math.random() * 255),
          mac: 'AA:BB:CC:DD:EE:FF',
          ssid: 'HCMUS-Student',
          apName: 'AP-Library-F2-01',
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
        username: 'sso.user@hcmus.edu.vn',
        name: 'Người dùng SSO',
        role: 'Sinh viên',
        mssv: '21120999',
        ip: '10.0.15.' + Math.floor(Math.random() * 255),
        mac: 'AA:BB:CC:DD:EE:FF',
        ssid: 'HCMUS-Student',
        apName: 'AP-Library-F2-01',
        loginTime: new Date().toISOString()
      }));
      setLocation('/session');
    }, 1500);
  };

  const handleGuestRegister = () => {
    if (!guestForm.fullName || !guestForm.email) {
      return;
    }
    
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="min-h-screen flex flex-col lg:flex-row">
        
        {/* Left Side - Info Panel */}
        <div className="hidden md:flex md:w-2/5 lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 lg:p-12 flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Wifi size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">HCMUS WiFi</h1>
                <p className="text-blue-200 text-sm">Campus WiFi Network</p>
              </div>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Kết nối Internet<br />Không giới hạn
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Truy cập mạng WiFi miễn phí tại tất cả cơ sở của Trường Đại học Khoa học Tự nhiên
            </p>
          </div>
          
          {/* Policy Info Cards */}
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex items-start gap-3">
              <Clock className="w-6 h-6 text-blue-200 mt-0.5" />
              <div>
                <h3 className="font-semibold">Thời lượng phiên</h3>
                <p className="text-blue-200 text-sm">Tối đa 4 giờ mỗi phiên đăng nhập</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex items-start gap-3">
              <Gauge className="w-6 h-6 text-blue-200 mt-0.5" />
              <div>
                <h3 className="font-semibold">Băng thông</h3>
                <p className="text-blue-200 text-sm">Sinh viên: 10 Mbps | Giảng viên: 50 Mbps</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex items-start gap-3">
              <Shield className="w-6 h-6 text-blue-200 mt-0.5" />
              <div>
                <h3 className="font-semibold">Chính sách sử dụng</h3>
                <p className="text-blue-200 text-sm">Tuân thủ quy định CNTT của nhà trường</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="md:hidden text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-3">
                <Wifi size={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">HCMUS WiFi</h1>
              <p className="text-gray-500 text-sm">Campus WiFi – Trường ĐHKHTN</p>
            </div>

            <Card className="p-6 sm:p-8 shadow-xl border-0 bg-white">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Đăng nhập WiFi</h2>
                <p className="text-gray-500 mt-1">Nhập thông tin để kết nối mạng</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle size={18} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">MSSV / Email / Tài khoản</Label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="VD: 21120001 hoặc email@hcmus.edu.vn"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                    <a href="#" className="text-blue-600 hover:underline">Điều khoản sử dụng WiFi</a>
                    {' '}của nhà trường
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700"
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
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">hoặc</span>
                  </div>
                </div>

                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full h-11"
                  onClick={handleSSOLogin}
                  disabled={isLoading}
                >
                  <ExternalLink size={18} className="mr-2" />
                  Đăng nhập với SSO / Microsoft 365
                </Button>
              </form>

              {/* Guest Registration Link */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-center text-sm text-gray-500 mb-3">Bạn là khách?</p>
                <Button 
                  variant="ghost" 
                  className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => setGuestModalOpen(true)}
                >
                  <UserPlus size={18} className="mr-2" />
                  Đăng ký tài khoản Khách
                </Button>
              </div>
            </Card>

            {/* Mobile Policy Info */}
            <div className="md:hidden mt-6 space-y-3">
              <div className="bg-white rounded-xl p-4 shadow-sm border flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div className="text-sm">
                  <span className="font-medium">Thời lượng:</span>
                  <span className="text-gray-600 ml-1">Tối đa 4 giờ/phiên</span>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border flex items-center gap-3">
                <Gauge className="w-5 h-5 text-blue-600" />
                <div className="text-sm">
                  <span className="font-medium">Băng thông:</span>
                  <span className="text-gray-600 ml-1">10-50 Mbps</span>
                </div>
              </div>
            </div>

            <p className="text-center text-gray-400 text-xs mt-6">
              © 2024 HCMUS - Trường Đại học Khoa học Tự nhiên
            </p>
          </div>
        </div>
      </div>

      {/* Guest Registration Modal */}
      <Dialog open={guestModalOpen} onOpenChange={(open) => {
        setGuestModalOpen(open);
        if (!open) {
          setGuestRegistered(false);
          setGuestForm({ fullName: '', email: '', phone: '', duration: '1h' });
        }
      }}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus size={20} className="text-blue-600" />
              Đăng ký tài khoản Khách
            </DialogTitle>
            <DialogDescription>
              Tạo tài khoản tạm thời để truy cập WiFi
            </DialogDescription>
          </DialogHeader>
          
          {!guestRegistered ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="guest-name">Họ và tên <span className="text-red-500">*</span></Label>
                <Input
                  id="guest-name"
                  placeholder="Nguyễn Văn A"
                  value={guestForm.fullName}
                  onChange={(e) => setGuestForm({...guestForm, fullName: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="guest-email">Email <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="guest-email"
                    type="email"
                    placeholder="email@example.com"
                    value={guestForm.email}
                    onChange={(e) => setGuestForm({...guestForm, email: e.target.value})}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500">Thông tin đăng nhập sẽ được gửi qua email</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guest-phone">Số điện thoại (tùy chọn)</Label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="guest-phone"
                    type="tel"
                    placeholder="0901234567"
                    value={guestForm.phone}
                    onChange={(e) => setGuestForm({...guestForm, phone: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Thời gian sử dụng</Label>
                <Select value={guestForm.duration} onValueChange={(v) => setGuestForm({...guestForm, duration: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 giờ</SelectItem>
                    <SelectItem value="4h">4 giờ</SelectItem>
                    <SelectItem value="1d">1 ngày</SelectItem>
                    <SelectItem value="3d">3 ngày</SelectItem>
                    <SelectItem value="7d">7 ngày</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setGuestModalOpen(false)}>
                  Hủy
                </Button>
                <Button 
                  onClick={handleGuestRegister}
                  disabled={!guestForm.fullName || !guestForm.email}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Đăng ký và Nhận mật khẩu
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="py-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-green-800 mb-2">Đăng ký thành công!</h4>
                <p className="text-sm text-green-700">Thông tin đăng nhập của bạn:</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Tên đăng nhập</p>
                  <p className="font-mono font-semibold text-lg">{guestCredentials.username}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Mật khẩu</p>
                  <p className="font-mono font-semibold text-lg">{guestCredentials.password}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Thời hạn</p>
                  <p className="font-medium">
                    {guestForm.duration === '1h' ? '1 giờ' : 
                     guestForm.duration === '4h' ? '4 giờ' :
                     guestForm.duration === '1d' ? '1 ngày' :
                     guestForm.duration === '3d' ? '3 ngày' : '7 ngày'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                * Thông tin này cũng đã được gửi đến email {guestForm.email}
              </p>

              <DialogFooter className="pt-4">
                <Button onClick={handleUseGuestCredentials} className="w-full bg-blue-600 hover:bg-blue-700">
                  Sử dụng ngay
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
