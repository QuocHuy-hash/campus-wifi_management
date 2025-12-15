import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Lock, Database, Mail, Shield, Clock, Eye, Plus, Edit, Trash2, Users, Search, FileText } from 'lucide-react';

// Types
interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  status: 'Active' | 'Locked';
  group: string;
  accessTimeLimit?: string;
}

interface WifiPolicy {
  id: number;
  name: string;
  description: string;
  type: 'bandwidth' | 'auth' | 'session' | 'audit' | 'security';
  downloadLimit?: number;
  uploadLimit?: number;
  maxSessionTime?: number;
  maxSessionData?: number;
  applyToRoles: string[];
  applyToArea?: string;
  applyByTime?: string;
}

interface Permission {
  resource: string;
  canView: boolean;
  canEdit: boolean;
}

interface UserGroup {
  id: number;
  name: string;
  permissions: Permission[];
}

interface LogEntry {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  type: 'access' | 'error' | 'config' | 'account';
}

// Initial Data
const systemRoles = ['Super Admin', 'Admin', 'Nhân viên IT', 'Người giám sát'];
const userGroups = ['Quản trị viên cấp cao', 'Quản trị viên', 'Nhóm kỹ thuật', 'Nhóm giám sát'];
const resourceList = ['Quản lý AP', 'Quản lý Policy', 'Quản lý Người dùng', 'Báo cáo', 'Cài đặt hệ thống', 'Nhật ký'];

const initialAdminUsers: AdminUser[] = [
  { id: 1, username: 'superadmin', email: 'superadmin@hcmus.edu.vn', role: 'Super Admin', status: 'Active', group: 'Quản trị viên cấp cao' },
  { id: 2, username: 'admin_it', email: 'admin_it@hcmus.edu.vn', role: 'Admin', status: 'Active', group: 'Quản trị viên' },
  { id: 3, username: 'tech_user', email: 'tech@hcmus.edu.vn', role: 'Nhân viên IT', status: 'Active', group: 'Nhóm kỹ thuật' },
  { id: 4, username: 'monitor_user', email: 'monitor@hcmus.edu.vn', role: 'Người giám sát', status: 'Locked', group: 'Nhóm giám sát' },
];

const initialPolicies: WifiPolicy[] = [
  { id: 1, name: 'Băng thông Sinh viên', description: 'Giới hạn băng thông cho sinh viên', type: 'bandwidth', downloadLimit: 10, uploadLimit: 5, applyToRoles: ['Sinh viên'] },
  { id: 2, name: 'Băng thông Cán bộ', description: 'Băng thông cao cấp cho cán bộ', type: 'bandwidth', downloadLimit: 50, uploadLimit: 20, applyToRoles: ['Cán bộ'] },
  { id: 3, name: 'Phiên Sinh viên', description: 'Thời gian phiên cho sinh viên', type: 'session', maxSessionTime: 480, maxSessionData: 5000, applyToRoles: ['Sinh viên'] },
  { id: 4, name: 'Phiên Khách', description: 'Thời gian phiên cho khách', type: 'session', maxSessionTime: 120, maxSessionData: 1000, applyToRoles: ['Khách'] },
  { id: 5, name: 'Kiểm toán Cơ bản', description: 'Ghi log cơ bản', type: 'audit', applyToRoles: ['Sinh viên', 'Khách'] },
  { id: 6, name: 'Bảo mật Tiêu chuẩn', description: 'Chính sách bảo mật tiêu chuẩn', type: 'security', applyToRoles: ['Sinh viên', 'Cán bộ', 'Khách'] },
];

const initialLogs: LogEntry[] = [
  { id: 1, timestamp: '2024-01-15 10:30:00', user: 'superadmin', action: 'Đăng nhập', details: 'Đăng nhập thành công từ IP 192.168.1.100', type: 'access' },
  { id: 2, timestamp: '2024-01-15 10:35:00', user: 'superadmin', action: 'Thêm AP', details: 'Thêm mới AP-A1-07 tại Tòa A Tầng 1', type: 'config' },
  { id: 3, timestamp: '2024-01-15 11:00:00', user: 'admin_it', action: 'Sửa Policy', details: 'Cập nhật chính sách băng thông Sinh viên', type: 'config' },
  { id: 4, timestamp: '2024-01-15 11:30:00', user: 'system', action: 'Lỗi kết nối', details: 'Mất kết nối đến Controller UniFi 2', type: 'error' },
  { id: 5, timestamp: '2024-01-15 12:00:00', user: 'superadmin', action: 'Khóa tài khoản', details: 'Khóa tài khoản monitor_user', type: 'account' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('users');
  
  // Data states
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(initialAdminUsers);
  const [policies, setPolicies] = useState<WifiPolicy[]>(initialPolicies);
  const [logs] = useState<LogEntry[]>(initialLogs);
  
  // Dialog states - Admin Users
  const [addAdminDialogOpen, setAddAdminDialogOpen] = useState(false);
  const [editAdminDialogOpen, setEditAdminDialogOpen] = useState(false);
  const [deleteAdminDialogOpen, setDeleteAdminDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [adminForm, setAdminForm] = useState<Partial<AdminUser>>({});
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  
  // Dialog states - Policies
  const [addPolicyDialogOpen, setAddPolicyDialogOpen] = useState(false);
  const [editPolicyDialogOpen, setEditPolicyDialogOpen] = useState(false);
  const [deletePolicyDialogOpen, setDeletePolicyDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<WifiPolicy | null>(null);
  const [policyForm, setPolicyForm] = useState<Partial<WifiPolicy>>({});
  
  // Dialog states - Permission
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [selectedGroupPermissions, setSelectedGroupPermissions] = useState<Permission[]>(
    resourceList.map(r => ({ resource: r, canView: false, canEdit: false }))
  );
  
  // Dialog states - Logs
  const [logDetailDialogOpen, setLogDetailDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [logFilter, setLogFilter] = useState<string>('all');

  // Filtered data
  const filteredAdminUsers = adminUsers.filter(user =>
    user.username.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(adminSearchTerm.toLowerCase())
  );
  
  const filteredLogs = logFilter === 'all' ? logs : logs.filter(log => log.type === logFilter);

  // Admin User Handlers
  const handleAddAdmin = () => {
    setAdminForm({ status: 'Active', role: systemRoles[0], group: userGroups[0] });
    setAddAdminDialogOpen(true);
  };

  const handleEditAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setAdminForm({ ...admin });
    setEditAdminDialogOpen(true);
  };

  const handleDeleteAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setDeleteAdminDialogOpen(true);
  };

  const handleLockAdmin = (admin: AdminUser) => {
    setAdminUsers(adminUsers.map(u => 
      u.id === admin.id ? { ...u, status: u.status === 'Active' ? 'Locked' : 'Active' } : u
    ));
  };

  const saveNewAdmin = () => {
    const newAdmin: AdminUser = {
      id: Math.max(...adminUsers.map(u => u.id)) + 1,
      username: adminForm.username || '',
      email: adminForm.email || '',
      role: adminForm.role || '',
      status: adminForm.status || 'Active',
      group: adminForm.group || '',
      accessTimeLimit: adminForm.accessTimeLimit,
    };
    setAdminUsers([...adminUsers, newAdmin]);
    setAddAdminDialogOpen(false);
    setAdminForm({});
  };

  const saveEditAdmin = () => {
    if (selectedAdmin) {
      setAdminUsers(adminUsers.map(u => u.id === selectedAdmin.id ? { ...u, ...adminForm } as AdminUser : u));
    }
    setEditAdminDialogOpen(false);
    setSelectedAdmin(null);
    setAdminForm({});
  };

  const confirmDeleteAdmin = () => {
    if (selectedAdmin) {
      setAdminUsers(adminUsers.filter(u => u.id !== selectedAdmin.id));
    }
    setDeleteAdminDialogOpen(false);
    setSelectedAdmin(null);
  };

  // Policy Handlers
  const handleAddPolicy = (type: WifiPolicy['type']) => {
    setPolicyForm({ type, applyToRoles: [] });
    setAddPolicyDialogOpen(true);
  };

  const handleEditPolicy = (policy: WifiPolicy) => {
    setSelectedPolicy(policy);
    setPolicyForm({ ...policy });
    setEditPolicyDialogOpen(true);
  };

  const handleDeletePolicy = (policy: WifiPolicy) => {
    setSelectedPolicy(policy);
    setDeletePolicyDialogOpen(true);
  };

  const saveNewPolicy = () => {
    const newPolicy: WifiPolicy = {
      id: Math.max(...policies.map(p => p.id)) + 1,
      name: policyForm.name || '',
      description: policyForm.description || '',
      type: policyForm.type || 'bandwidth',
      downloadLimit: policyForm.downloadLimit,
      uploadLimit: policyForm.uploadLimit,
      maxSessionTime: policyForm.maxSessionTime,
      maxSessionData: policyForm.maxSessionData,
      applyToRoles: policyForm.applyToRoles || [],
      applyToArea: policyForm.applyToArea,
      applyByTime: policyForm.applyByTime,
    };
    setPolicies([...policies, newPolicy]);
    setAddPolicyDialogOpen(false);
    setPolicyForm({});
  };

  const saveEditPolicy = () => {
    if (selectedPolicy) {
      setPolicies(policies.map(p => p.id === selectedPolicy.id ? { ...p, ...policyForm } as WifiPolicy : p));
    }
    setEditPolicyDialogOpen(false);
    setSelectedPolicy(null);
    setPolicyForm({});
  };

  const confirmDeletePolicy = () => {
    if (selectedPolicy) {
      setPolicies(policies.filter(p => p.id !== selectedPolicy.id));
    }
    setDeletePolicyDialogOpen(false);
    setSelectedPolicy(null);
  };

  const handleViewLog = (log: LogEntry) => {
    setSelectedLog(log);
    setLogDetailDialogOpen(true);
  };

  const getPolicyTypeLabel = (type: WifiPolicy['type']) => {
    switch (type) {
      case 'bandwidth': return 'Băng thông';
      case 'auth': return 'Xác thực';
      case 'session': return 'Cấp quyền truy cập';
      case 'audit': return 'Kiểm toán';
      case 'security': return 'Bảo mật';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
        <p className="text-gray-600 mt-1">Cấu hình hệ thống và chính sách</p>
      </div>

      {/* Tabs */}
      <Card className="bg-white shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 border-b border-gray-200 rounded-none">
            <TabsTrigger value="users" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
              Người dùng
            </TabsTrigger>
            <TabsTrigger value="policies" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
              Chính sách
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
              Bảo mật
            </TabsTrigger>
            <TabsTrigger value="access" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
              Truy cập
            </TabsTrigger>
            <TabsTrigger value="technical" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
              Kỹ thuật
            </TabsTrigger>
            <TabsTrigger value="logs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
              Logs
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Users */}
          <TabsContent value="users" className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Quản lý Người dùng Hệ thống (Admin Users)</h3>
                <Button onClick={handleAddAdmin} className="bg-blue-600 hover:bg-blue-700">
                  <Plus size={18} className="mr-2" />
                  Thêm người dùng
                </Button>
              </div>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <Input
                  placeholder="Tìm kiếm theo tên đăng nhập hoặc email..."
                  value={adminSearchTerm}
                  onChange={(e) => setAdminSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Admin Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Tên đăng nhập</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Vai trò</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Nhóm</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Trạng thái</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdminUsers.map((admin, index) => (
                      <tr
                        key={admin.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{admin.username}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{admin.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{admin.role}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{admin.group}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            admin.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {admin.status === 'Active' ? 'Hoạt động' : 'Đã khóa'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="sm" title="Chỉnh sửa" onClick={() => handleEditAdmin(admin)}>
                              <Edit size={18} className="text-amber-600" />
                            </Button>
                            <Button variant="ghost" size="sm" title={admin.status === 'Active' ? 'Khóa' : 'Mở khóa'} onClick={() => handleLockAdmin(admin)}>
                              <Lock size={18} className={admin.status === 'Active' ? 'text-gray-600' : 'text-green-600'} />
                            </Button>
                            <Button variant="ghost" size="sm" title="Xóa" onClick={() => handleDeleteAdmin(admin)}>
                              <Trash2 size={18} className="text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Permission Config */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-900 mb-3">Phân quyền Cập nhật</p>
                <p className="text-sm text-gray-600 mb-3">Thiết lập quyền xem và cập nhật dữ liệu trên tài nguyên theo người dùng và theo nhóm</p>
                <Button variant="outline" size="sm" onClick={() => setPermissionDialogOpen(true)}>
                  <Shield size={16} className="mr-2" />
                  Cấu hình phân quyền
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Policies */}
          <TabsContent value="policies" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý Chính sách WIFI</h3>
              <div className="space-y-4">
                {[
                  { type: 'bandwidth' as const, name: 'Chính sách Băng thông', desc: 'Giới hạn tốc độ theo nhóm/vai trò' },
                  { type: 'session' as const, name: 'Chính sách Cấp quyền truy cập', desc: 'Quản lý phiên và thời gian truy cập' },
                ].map((policyType) => (
                  <div key={policyType.type} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">{policyType.name}</p>
                        <p className="text-sm text-gray-600">{policyType.desc}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleAddPolicy(policyType.type)}>
                        <Plus size={16} className="mr-1" /> Tạo mới
                      </Button>
                    </div>
                    {/* List policies of this type */}
                    <div className="mt-3 space-y-2">
                      {policies.filter(p => p.type === policyType.type).map(policy => (
                        <div key={policy.id} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div>
                            <p className="text-sm font-medium">{policy.name}</p>
                            <p className="text-xs text-gray-500">{policy.description}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditPolicy(policy)}>
                              <Edit size={16} className="text-amber-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeletePolicy(policy)}>
                              <Trash2 size={16} className="text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Security */}
          <TabsContent value="security" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock size={24} />
                Thiết lập Bảo mật
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-3">Chính sách Mật khẩu</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Yêu cầu mật khẩu mạnh</label>
                      <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm">
                        <option>Bắt buộc (tối thiểu 8 ký tự, chữ hoa, số, ký tự đặc biệt)</option>
                        <option>Tùy chọn</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Thời gian thay đổi mật khẩu</label>
                      <Input type="number" placeholder="90 (ngày)" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Thời gian hợp lệ</label>
                      <Input type="number" placeholder="365 (ngày)" className="mt-1" />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-3">Chính sách Hạn chế Đăng nhập</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Giới hạn số lần đăng nhập sai</label>
                      <Input type="number" placeholder="5 lần" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Tự động vô hiệu hóa tài khoản sau</label>
                      <Input type="number" placeholder="30 phút" className="mt-1" />
                    </div>
                  </div>
                </div>

                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Lưu cài đặt bảo mật</Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab 4: Access Control */}
          <TabsContent value="access" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Eye size={24} />
                Kiểm soát Truy cập
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-3">Thiết lập Timeout</p>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Thời gian chờ (phút)</label>
                    <Input type="number" placeholder="30" className="mt-1" />
                    <p className="text-xs text-gray-500 mt-1">Đóng phiên kết nối khi không hoạt động</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-3">Giới hạn Địa chỉ Mạng Quản trị</p>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">IP/Subnet được phép</label>
                    <Input placeholder="192.168.1.0/24" className="mt-1" />
                    <p className="text-xs text-gray-500 mt-1">Danh sách IP được phép truy cập từ xa</p>
                  </div>
                </div>

                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Lưu cài đặt truy cập</Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab 5: Technical */}
          <TabsContent value="technical" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Database size={24} />
                Cấu hình Kỹ thuật
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-3">Kết nối Cơ sở Dữ liệu</p>
                  <div className="space-y-3">
                    <Input placeholder="Host" defaultValue="db.hcmus.edu.vn" />
                    <Input placeholder="Port" defaultValue="5432" />
                    <Input placeholder="Database" defaultValue="wifi_management" />
                    <Input placeholder="Username" defaultValue="admin" />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Mail size={18} />
                    Email Hệ thống
                  </p>
                  <div className="space-y-3">
                    <Input placeholder="SMTP Server" defaultValue="mail.hcmus.edu.vn" />
                    <Input placeholder="SMTP Port" defaultValue="587" />
                    <Input placeholder="Email" defaultValue="noreply@hcmus.edu.vn" />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-3">Kết nối Zalo OA & ZNS</p>
                  <div className="space-y-3">
                    <Input placeholder="Zalo OA ID" />
                    <Input placeholder="Zalo ZNS Token" />
                    <p className="text-xs text-gray-500">Hỗ trợ đăng ký Khách qua Zalo</p>
                  </div>
                </div>

                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Lưu cài đặt kỹ thuật</Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab 6: Logs */}
          <TabsContent value="logs" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý Nhật ký (Logs)</h3>
              
              {/* Log Filter */}
              <div className="flex gap-2 mb-4">
                <Button 
                  variant={logFilter === 'all' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setLogFilter('all')}
                  className={logFilter === 'all' ? 'bg-blue-600' : ''}
                >
                  Tất cả
                </Button>
                <Button 
                  variant={logFilter === 'access' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setLogFilter('access')}
                  className={logFilter === 'access' ? 'bg-blue-600' : ''}
                >
                  Truy cập
                </Button>
                <Button 
                  variant={logFilter === 'error' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setLogFilter('error')}
                  className={logFilter === 'error' ? 'bg-blue-600' : ''}
                >
                  Lỗi
                </Button>
                <Button 
                  variant={logFilter === 'config' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setLogFilter('config')}
                  className={logFilter === 'config' ? 'bg-blue-600' : ''}
                >
                  Cấu hình
                </Button>
                <Button 
                  variant={logFilter === 'account' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setLogFilter('account')}
                  className={logFilter === 'account' ? 'bg-blue-600' : ''}
                >
                  Tài khoản
                </Button>
              </div>
              
              {/* Logs Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Thời gian</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Người dùng</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Hành động</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Loại</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log, index) => (
                      <tr
                        key={log.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{log.timestamp}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{log.user}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{log.action}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            log.type === 'access' ? 'bg-blue-100 text-blue-800' :
                            log.type === 'error' ? 'bg-red-100 text-red-800' :
                            log.type === 'config' ? 'bg-amber-100 text-amber-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {log.type === 'access' ? 'Truy cập' :
                             log.type === 'error' ? 'Lỗi' :
                             log.type === 'config' ? 'Cấu hình' : 'Tài khoản'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button variant="ghost" size="sm" onClick={() => handleViewLog(log)}>
                            <Eye size={18} className="text-blue-600" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Add Admin User Dialog */}
      <Dialog open={addAdminDialogOpen} onOpenChange={setAddAdminDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users size={20} />
              Thêm Người dùng Hệ thống
            </DialogTitle>
            <DialogDescription>
              Tạo tài khoản quản trị viên mới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-username">Tên đăng nhập</Label>
              <Input
                id="admin-username"
                value={adminForm.username || ''}
                onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                placeholder="admin_user"
              />
            </div>
            <div>
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={adminForm.email || ''}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                placeholder="admin@hcmus.edu.vn"
              />
            </div>
            <div>
              <Label htmlFor="admin-password">Mật khẩu</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Nhập mật khẩu"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="admin-role">Vai trò Hệ thống</Label>
                <Select
                  value={adminForm.role}
                  onValueChange={(value) => setAdminForm({ ...adminForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {systemRoles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="admin-group">Nhóm</Label>
                <Select
                  value={adminForm.group}
                  onValueChange={(value) => setAdminForm({ ...adminForm, group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhóm" />
                  </SelectTrigger>
                  <SelectContent>
                    {userGroups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="admin-status">Trạng thái tài khoản</Label>
              <Select
                value={adminForm.status}
                onValueChange={(value) => setAdminForm({ ...adminForm, status: value as AdminUser['status'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Hoạt động</SelectItem>
                  <SelectItem value="Locked">Đã khóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="admin-time-limit">Giới hạn thời gian truy cập (tùy chọn)</Label>
              <Input
                id="admin-time-limit"
                type="datetime-local"
                value={adminForm.accessTimeLimit || ''}
                onChange={(e) => setAdminForm({ ...adminForm, accessTimeLimit: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAdminDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveNewAdmin} className="bg-blue-600 hover:bg-blue-700">Thêm người dùng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin User Dialog */}
      <Dialog open={editAdminDialogOpen} onOpenChange={setEditAdminDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Người dùng Hệ thống</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin tài khoản quản trị viên
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-admin-username">Tên đăng nhập</Label>
              <Input
                id="edit-admin-username"
                value={adminForm.username || ''}
                onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-admin-email">Email</Label>
              <Input
                id="edit-admin-email"
                type="email"
                value={adminForm.email || ''}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-admin-role">Vai trò Hệ thống</Label>
                <Select
                  value={adminForm.role}
                  onValueChange={(value) => setAdminForm({ ...adminForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {systemRoles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-admin-group">Nhóm</Label>
                <Select
                  value={adminForm.group}
                  onValueChange={(value) => setAdminForm({ ...adminForm, group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhóm" />
                  </SelectTrigger>
                  <SelectContent>
                    {userGroups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-admin-status">Trạng thái tài khoản</Label>
              <Select
                value={adminForm.status}
                onValueChange={(value) => setAdminForm({ ...adminForm, status: value as AdminUser['status'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Hoạt động</SelectItem>
                  <SelectItem value="Locked">Đã khóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-admin-time-limit">Giới hạn thời gian truy cập (tùy chọn)</Label>
              <Input
                id="edit-admin-time-limit"
                type="datetime-local"
                value={adminForm.accessTimeLimit || ''}
                onChange={(e) => setAdminForm({ ...adminForm, accessTimeLimit: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAdminDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveEditAdmin} className="bg-blue-600 hover:bg-blue-700">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Admin User Dialog */}
      <AlertDialog open={deleteAdminDialogOpen} onOpenChange={setDeleteAdminDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản <strong>{selectedAdmin?.username}</strong>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAdmin} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permission Matrix Dialog */}
      <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield size={20} />
              Cấu hình Phân quyền
            </DialogTitle>
            <DialogDescription>
              Thiết lập ma trận phân quyền cho các nhóm người dùng
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Chọn nhóm người dùng</Label>
              <Select defaultValue={userGroups[0]}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhóm" />
                </SelectTrigger>
                <SelectContent>
                  {userGroups.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">Tài nguyên</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-900">Quyền Xem</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-900">Quyền Sửa</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedGroupPermissions.map((perm, idx) => (
                    <tr key={perm.resource} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-sm text-gray-900">{perm.resource}</td>
                      <td className="px-4 py-2 text-center">
                        <Checkbox 
                          checked={perm.canView}
                          onCheckedChange={(checked) => {
                            const newPerms = [...selectedGroupPermissions];
                            newPerms[idx].canView = !!checked;
                            setSelectedGroupPermissions(newPerms);
                          }}
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Checkbox 
                          checked={perm.canEdit}
                          onCheckedChange={(checked) => {
                            const newPerms = [...selectedGroupPermissions];
                            newPerms[idx].canEdit = !!checked;
                            setSelectedGroupPermissions(newPerms);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionDialogOpen(false)}>Hủy</Button>
            <Button onClick={() => setPermissionDialogOpen(false)} className="bg-blue-600 hover:bg-blue-700">Lưu phân quyền</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Policy Dialog */}
      <Dialog open={addPolicyDialogOpen} onOpenChange={setAddPolicyDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Thêm Chính sách {getPolicyTypeLabel(policyForm.type || 'bandwidth')}</DialogTitle>
            <DialogDescription>
              Tạo chính sách WIFI mới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="policy-name">Tên Chính sách</Label>
              <Input
                id="policy-name"
                value={policyForm.name || ''}
                onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })}
                placeholder="Tên chính sách"
              />
            </div>
            <div>
              <Label htmlFor="policy-desc">Mô tả</Label>
              <Input
                id="policy-desc"
                value={policyForm.description || ''}
                onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })}
                placeholder="Mô tả chính sách"
              />
            </div>
            
            {policyForm.type === 'bandwidth' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="policy-dl">Giới hạn Tải xuống (Mbps)</Label>
                  <Input
                    id="policy-dl"
                    type="number"
                    value={policyForm.downloadLimit || ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, downloadLimit: Number(e.target.value) })}
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label htmlFor="policy-ul">Giới hạn Tải lên (Mbps)</Label>
                  <Input
                    id="policy-ul"
                    type="number"
                    value={policyForm.uploadLimit || ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, uploadLimit: Number(e.target.value) })}
                    placeholder="5"
                  />
                </div>
              </div>
            )}
            
            {policyForm.type === 'session' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="policy-session-time">Thời gian phiên tối đa (phút)</Label>
                  <Input
                    id="policy-session-time"
                    type="number"
                    value={policyForm.maxSessionTime || ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, maxSessionTime: Number(e.target.value) })}
                    placeholder="480"
                  />
                </div>
                <div>
                  <Label htmlFor="policy-session-data">Lưu lượng phiên tối đa (MB)</Label>
                  <Input
                    id="policy-session-data"
                    type="number"
                    value={policyForm.maxSessionData || ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, maxSessionData: Number(e.target.value) })}
                    placeholder="5000"
                  />
                </div>
              </div>
            )}
            
            <div>
              <Label>Áp dụng cho Vai trò</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                {['Sinh viên', 'Cán bộ', 'Khách'].map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role}`}
                      checked={policyForm.applyToRoles?.includes(role)}
                      onCheckedChange={(checked) => {
                        const currentRoles = policyForm.applyToRoles || [];
                        if (checked) {
                          setPolicyForm({ ...policyForm, applyToRoles: [...currentRoles, role] });
                        } else {
                          setPolicyForm({ ...policyForm, applyToRoles: currentRoles.filter(r => r !== role) });
                        }
                      }}
                    />
                    <Label htmlFor={`role-${role}`} className="text-sm">{role}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policy-area">Áp dụng theo Khu vực (tùy chọn)</Label>
                <Input
                  id="policy-area"
                  value={policyForm.applyToArea || ''}
                  onChange={(e) => setPolicyForm({ ...policyForm, applyToArea: e.target.value })}
                  placeholder="Tất cả / Tòa A / Khoa CNTT"
                />
              </div>
              <div>
                <Label htmlFor="policy-time">Áp dụng theo Thời gian (tùy chọn)</Label>
                <Input
                  id="policy-time"
                  value={policyForm.applyByTime || ''}
                  onChange={(e) => setPolicyForm({ ...policyForm, applyByTime: e.target.value })}
                  placeholder="24/7 / 8:00-22:00"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPolicyDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveNewPolicy} className="bg-blue-600 hover:bg-blue-700">Tạo chính sách</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Policy Dialog */}
      <Dialog open={editPolicyDialogOpen} onOpenChange={setEditPolicyDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Chính sách</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chính sách WIFI
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-policy-name">Tên Chính sách</Label>
              <Input
                id="edit-policy-name"
                value={policyForm.name || ''}
                onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-policy-desc">Mô tả</Label>
              <Input
                id="edit-policy-desc"
                value={policyForm.description || ''}
                onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })}
              />
            </div>
            
            {policyForm.type === 'bandwidth' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-policy-dl">Giới hạn Tải xuống (Mbps)</Label>
                  <Input
                    id="edit-policy-dl"
                    type="number"
                    value={policyForm.downloadLimit || ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, downloadLimit: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-policy-ul">Giới hạn Tải lên (Mbps)</Label>
                  <Input
                    id="edit-policy-ul"
                    type="number"
                    value={policyForm.uploadLimit || ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, uploadLimit: Number(e.target.value) })}
                  />
                </div>
              </div>
            )}
            
            {policyForm.type === 'session' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-policy-session-time">Thời gian phiên tối đa (phút)</Label>
                  <Input
                    id="edit-policy-session-time"
                    type="number"
                    value={policyForm.maxSessionTime || ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, maxSessionTime: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-policy-session-data">Lưu lượng phiên tối đa (MB)</Label>
                  <Input
                    id="edit-policy-session-data"
                    type="number"
                    value={policyForm.maxSessionData || ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, maxSessionData: Number(e.target.value) })}
                  />
                </div>
              </div>
            )}
            
            <div>
              <Label>Áp dụng cho Vai trò</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                {['Sinh viên', 'Cán bộ', 'Khách'].map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-role-${role}`}
                      checked={policyForm.applyToRoles?.includes(role)}
                      onCheckedChange={(checked) => {
                        const currentRoles = policyForm.applyToRoles || [];
                        if (checked) {
                          setPolicyForm({ ...policyForm, applyToRoles: [...currentRoles, role] });
                        } else {
                          setPolicyForm({ ...policyForm, applyToRoles: currentRoles.filter(r => r !== role) });
                        }
                      }}
                    />
                    <Label htmlFor={`edit-role-${role}`} className="text-sm">{role}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-policy-area">Áp dụng theo Khu vực</Label>
                <Input
                  id="edit-policy-area"
                  value={policyForm.applyToArea || ''}
                  onChange={(e) => setPolicyForm({ ...policyForm, applyToArea: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-policy-time">Áp dụng theo Thời gian</Label>
                <Input
                  id="edit-policy-time"
                  value={policyForm.applyByTime || ''}
                  onChange={(e) => setPolicyForm({ ...policyForm, applyByTime: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPolicyDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveEditPolicy} className="bg-blue-600 hover:bg-blue-700">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Policy Dialog */}
      <AlertDialog open={deletePolicyDialogOpen} onOpenChange={setDeletePolicyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa chính sách</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa chính sách <strong>{selectedPolicy?.name}</strong>?
              Các người dùng đang áp dụng chính sách này sẽ bị ảnh hưởng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePolicy} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Log Detail Dialog */}
      <Dialog open={logDetailDialogOpen} onOpenChange={setLogDetailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={20} />
              Chi tiết Nhật ký
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Thời gian</Label>
                  <p className="text-sm font-mono">{selectedLog.timestamp}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Người dùng</Label>
                  <p className="text-sm font-medium">{selectedLog.user}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Hành động</Label>
                <p className="text-sm">{selectedLog.action}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Loại</Label>
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                  selectedLog.type === 'access' ? 'bg-blue-100 text-blue-800' :
                  selectedLog.type === 'error' ? 'bg-red-100 text-red-800' :
                  selectedLog.type === 'config' ? 'bg-amber-100 text-amber-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedLog.type === 'access' ? 'Truy cập' :
                   selectedLog.type === 'error' ? 'Lỗi' :
                   selectedLog.type === 'config' ? 'Cấu hình' : 'Tài khoản'}
                </span>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Chi tiết</Label>
                <p className="text-sm p-3 bg-gray-50 rounded-lg border">{selectedLog.details}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogDetailDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
