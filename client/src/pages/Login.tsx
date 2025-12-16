import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Wifi, Lock, User, AlertCircle } from 'lucide-react';

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập');
      return;
    }

    setIsLoading(true);
    
    // Simulate login - in real app, this would call an API
    setTimeout(() => {
      // Mock credentials: admin / admin123
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify({ 
          username: 'admin', 
          role: 'Super Admin',
          name: 'Quản trị viên'
        }));
        setLocation('/');
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-2xl shadow-lg mb-4 border border-blue-100">
            <Wifi size={40} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HCMUS WiFi</h1>
          <p className="text-gray-500">Hệ thống quản lý mạng không dây</p>
        </div>

        {/* Login Card */}
        <Card className="p-8 shadow-lg border border-gray-200 bg-white">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Đăng nhập</h2>
            <p className="text-gray-600 mt-1">Nhập thông tin để truy cập hệ thống</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700">
                Tên đăng nhập
              </Label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-11"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
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
                  className="pl-10 pr-10 h-11"
                  autoComplete="current-password"
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                  Ghi nhớ đăng nhập
                </Label>
              </div>
              <button type="button" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                Quên mật khẩu?
              </button>
            </div>

            {/* Login Button */}
            <Button 
              type="submit" 
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang đăng nhập...
                </div>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">
              Tên đăng nhập: <span className="font-mono font-semibold">admin</span> | Mật khẩu: <span className="font-mono font-semibold">admin123</span>
            </p>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-6">
          © 2026 HCMUS - Trường Đại học Khoa học Tự nhiên
        </p>
      </div>
    </div>
  );
}
