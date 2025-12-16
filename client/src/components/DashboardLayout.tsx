import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Menu, X, LogOut, User, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface UserInfo {
  username: string;
  role: string;
  name: string;
}

interface MenuItem {
  label: string;
  path: string;
  subItems?: { label: string; path: string }[];
}

const menuItems: MenuItem[] = [
  { label: 'Tổng quan', path: '/' },
  { label: 'Quản lý Điểm phát WIFI', path: '/access-points' },
  { label: 'Quản lý Người dùng', path: '/users' },
  { label: 'Chính sách', path: '/policies' },
  { 
    label: 'Báo cáo', 
    path: '/reports',
    subItems: [
      { label: 'Người dùng', path: '/reports?tab=users' },
      { label: 'Băng thông', path: '/reports?tab=bandwidth' },
      { label: 'Điểm phát', path: '/reports?tab=ap' },
      { label: 'Bộ điều khiển', path: '/reports?tab=controllers' },
      { label: 'Vi phạm', path: '/reports?tab=violations' },
      { label: 'Nhật ký Phiên', path: '/reports?tab=sessions' },
      { label: 'Sự cố', path: '/reports?tab=incidents' },
      { label: 'Nhật ký', path: '/reports?tab=logs' },
    ]
  },
  { 
    label: 'Cài đặt', 
    path: '/settings',
    subItems: [
      { label: 'Quản trị viên', path: '/settings?tab=users' },
      { label: 'Khu vực & Tòa nhà', path: '/settings?tab=areas' },
      { label: 'Thiết bị', path: '/settings?tab=devices' },
      { label: 'Tích hợp hệ thống', path: '/settings?tab=technical' },
      { label: 'Bảo mật & SSID', path: '/settings?tab=security' },
      { label: 'Phân quyền', path: '/settings?tab=access' },
      { label: 'Nhật ký hệ thống', path: '/settings?tab=logs' },
    ]
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['/reports', '/settings']); // Default expand reports and settings

  const toggleSubmenu = (path: string) => {
    setExpandedMenus(prev => 
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

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
              const isActive = location === item.path || (item.subItems && location.startsWith(item.path));
              const isExpanded = expandedMenus.includes(item.path);
              const hasSubItems = item.subItems && item.subItems.length > 0;

              return (
                <div key={item.path}>
                  <div
                    onClick={() => {
                      if (hasSubItems) {
                        toggleSubmenu(item.path);
                      } else {
                        setLocation(item.path);
                         setMobileMenuOpen(false);
                      }
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                      isActive && !hasSubItems
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    } ${isActive && hasSubItems ? 'bg-blue-50 text-blue-700' : ''}`}
                  >
                    <span>{item.label}</span>
                    {hasSubItems && (
                      isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                    )}
                  </div>
                  
                  {/* Sub-menu */}
                  {hasSubItems && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-2">
                       {item.subItems!.map(subItem => {
                         // Check if this subItem is active. 
                         // For query params, we need to handle exact match or simple includes.
                         // But useLocation returns /path, not query. Wrapper might be needed.
                         // wouter's useLocation only returns pathname.
                         // So we check window.location.search or we rely on 'isActive' logic above?
                         // We can't easily check query param with just 'location' from wouter.
                         // We will implement a visual check using window.location for now or just generic highlighting.
                         
                         // Better: check if the full href matches current href
                         const isSubActive = window.location.pathname + window.location.search === subItem.path;
                         
                         return (
                           <a
                             key={subItem.path}
                             href={subItem.path}
                             onClick={(e) => {
                               e.preventDefault();
                               window.location.href = subItem.path;
                               setMobileMenuOpen(false);
                             }}
                            className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                              isSubActive 
                                ? 'text-blue-600 font-semibold bg-blue-50' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                           >
                             {subItem.label}
                           </a>
                         );
                       })}
                    </div>
                  )}
                </div>
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
