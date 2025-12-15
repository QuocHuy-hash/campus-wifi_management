import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Menu, X, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface UserInfo {
  username: string;
  role: string;
  name: string;
}

const menuItems = [
  { label: 'Tổng quan', path: '/' },
  { label: 'Quản lý Người dùng', path: '/users' },
  { label: 'Quản lý Điểm phát WIFI', path: '/access-points' },
  { label: 'Chính sách', path: '/policies' },
  { label: 'Báo cáo', path: '/reports' },
  { label: 'Cài đặt', path: '/settings' },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    setLocation('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 md:px-6 py-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                H
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">WIFI MANAGEMENT</h1>
                <p className="text-xs text-gray-500">HỆ THỐNG QUẢN LÝ TRUY CẬP WIFI</p>
              </div>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-right">
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Quản trị viên'}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white">
                <User size={20} />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-red-600 hover:bg-red-50"
              title="Đăng xuất"
              onClick={handleLogout}
            >
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-30 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
          style={{ top: '73px' }}
        >
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = location === item.path;
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/50 md:hidden z-20"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
          <div className="p-4 md:p-6 mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
