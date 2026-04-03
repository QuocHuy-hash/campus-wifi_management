import { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Menu, X, LogOut, User, ChevronDown, ChevronRight, Settings, Key, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  { label: 'Giám sát Điểm phát Wifi', path: '/access-points' },
  { label: 'Quản lý Người dùng', path: '/users' },
  { label: 'Chính sách', path: '/policies' },
  { 
    label: 'Báo cáo', 
    path: '/reports',
    subItems: [
      { label: 'Tổng thể', path: '/reports?tab=overview' },
      { label: 'Người dùng', path: '/reports?tab=users' },
      { label: 'Băng thông', path: '/reports?tab=bandwidth' },
      { label: 'Hạ tầng WiFi', path: '/reports?tab=infrastructure' },
      { label: 'Vi phạm', path: '/reports?tab=violations' },
      { label: 'Phiên theo thời gian', path: '/reports?tab=session-timeline' },
      { label: 'Sự cố user & WiFi', path: '/reports?tab=user-network-incidents' },
      { label: 'Sự cố', path: '/reports?tab=incidents' },
      { label: 'Nhật ký', path: '/reports?tab=logs' },
    ]
  },
  { 
    label: 'Cài đặt', 
    path: '/settings',
    subItems: [
      { label: 'Tổng thể', path: '/settings?tab=overview' },
      { label: 'Phân quyền & Nhóm', path: '/settings?tab=access' },
      { label: 'Quản trị viên', path: '/settings?tab=users' },
      { label: 'Khu vực & Tòa nhà', path: '/settings?tab=areas' },
      { label: 'Thiết bị Điểm phát', path: '/settings?tab=devices' },
      { label: 'Tích hợp hệ thống', path: '/settings?tab=technical' },
      { label: 'Bảo mật & Truy cập', path: '/settings?tab=security' },
      { label: 'Cảnh báo sự cố WiFi', path: '/settings?tab=alerts' },
      { label: 'Nhật ký hệ thống', path: '/settings?tab=logs' },
    ]
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Account management dialogs
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  
  // Form states
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const toggleSubmenu = (path: string) => {
    setExpandedMenus(prev => 
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setProfileForm({ 
        name: parsedUser.name || '', 
        email: parsedUser.email || 'admin@hcmus.edu.vn',
        phone: parsedUser.phone || '0123456789'
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    setLocation('/login');
  };

  const handleSaveProfile = () => {
    const updatedUser = { ...user, ...profileForm };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser as UserInfo);
    setEditProfileOpen(false);
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    alert('Đổi mật khẩu thành công!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setChangePasswordOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Fixed */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
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

          {/* User Menu with Dropdown */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors cursor-pointer">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
                    <p className="text-xs text-gray-500">{user?.role || 'Quản trị viên'}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white">
                    <User size={20} />
                  </div>
                  <ChevronDown size={16} className="hidden sm:block text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user?.name || 'Admin User'}</span>
                    <span className="text-xs text-gray-500 font-normal">{user?.role || 'Quản trị viên'}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setViewProfileOpen(true)} className="cursor-pointer">
                  <UserCircle size={16} className="mr-2" />
                  Xem thông tin tài khoản
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditProfileOpen(true)} className="cursor-pointer">
                  <Settings size={16} className="mr-2" />
                  Thay đổi thông tin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChangePasswordOpen(true)} className="cursor-pointer">
                  <Key size={16} className="mr-2" />
                  Đổi mật khẩu
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut size={16} className="mr-2" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex pt-[73px]">
        {/* Sidebar - Fixed */}
        <aside
          className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-30 overflow-y-auto ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
          style={{ top: '73px', height: 'calc(100vh - 73px)' }}
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
                         const currentFullPath = location + (searchString ? `?${searchString}` : '');
                         const isSubActive = currentFullPath === subItem.path;
                         
                         return (
                           <div
                             key={subItem.path}
                             onClick={() => {
                               setLocation(subItem.path);
                               setMobileMenuOpen(false);
                             }}
                            className={`block px-3 py-2 rounded-md text-sm transition-colors cursor-pointer ${
                              isSubActive 
                                ? 'text-blue-600 font-semibold bg-blue-50' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                           >
                             {subItem.label}
                           </div>
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
        <main className="flex-1 min-h-[calc(100vh-73px)] overflow-auto md:ml-64">
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

      {/* View Profile Dialog */}
      <Dialog open={viewProfileOpen} onOpenChange={setViewProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle size={20} className="text-blue-600" />
              Thông tin tài khoản
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết tài khoản của bạn
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-500">Họ và tên</span>
                <span className="text-sm font-medium">{user?.name || 'Admin User'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-500">Tên đăng nhập</span>
                <span className="text-sm font-medium">{user?.username || 'admin'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-500">Email</span>
                <span className="text-sm font-medium">{profileForm.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-500">Số điện thoại</span>
                <span className="text-sm font-medium">{profileForm.phone}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Vai trò</span>
                <span className="text-sm font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded">{user?.role || 'Quản trị viên'}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewProfileOpen(false)}>Đóng</Button>
            <Button onClick={() => { setViewProfileOpen(false); setEditProfileOpen(true); }}>
              Chỉnh sửa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings size={20} className="text-amber-600" />
              Thay đổi thông tin
            </DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cá nhân của bạn
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="Nhập họ và tên"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="Nhập email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfileOpen(false)}>Hủy</Button>
            <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key size={20} className="text-green-600" />
              Đổi mật khẩu
            </DialogTitle>
            <DialogDescription>
              Nhập mật khẩu hiện tại và mật khẩu mới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>Hủy</Button>
            <Button 
              onClick={handleChangePassword} 
              className="bg-green-600 hover:bg-green-700"
              disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
            >
              Đổi mật khẩu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
