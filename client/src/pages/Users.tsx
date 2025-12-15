import { useState } from 'react';
import { Card } from '@/components/ui/card';
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
import { Search, Edit, Trash2, Eye, Plus, Shield } from 'lucide-react';
import { initialPolicies, initialUsers, User } from '../data/mockData';

const userRoles = ['Sinh viên', 'Cán bộ', 'Khách'];
const accountStatuses = ['Active', 'Disabled'];

// Filter policies by type from mock data
const bandwidthPolicies = initialPolicies.filter(p => p.type === 'bandwidth');
const sessionPolicies = initialPolicies.filter(p => p.type === 'authorization'); // Mapping "Cấp quyền (Phiên)" to authorization
const auditPolicies = initialPolicies.filter(p => p.type === 'audit');
const securityPolicies = initialPolicies.filter(p => p.type === 'security');



export default function Users() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form states for editing
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [addForm, setAddForm] = useState<Partial<User>>({
    role: 'Sinh viên',
    status: 'Active',
    bandwidthPolicy: bandwidthPolicies[0]?.name,
    sessionPolicy: sessionPolicies[0]?.name,
    auditPolicy: auditPolicies[0]?.name,
    securityPolicy: securityPolicies[0]?.name,
  });

  const filteredUsers = users.filter((user) => {
    const matchesRole = !selectedRole || user.role === selectedRole;
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.unit.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Handlers
  const handleView = (user: User) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({ ...user });
    setEditDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handlePolicy = (user: User) => {
    setSelectedUser(user);
    setEditForm({ ...user });
    setPolicyDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      setUsers(users.filter((u) => u.id !== selectedUser.id));
    }
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const saveEdit = () => {
    if (selectedUser && editForm) {
      setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, ...editForm } : u)));
    }
    setEditDialogOpen(false);
    setSelectedUser(null);
    setEditForm({});
  };

  const savePolicy = () => {
    if (selectedUser && editForm) {
      setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, ...editForm } : u)));
    }
    setPolicyDialogOpen(false);
    setSelectedUser(null);
    setEditForm({});
  };

  const handleAdd = () => {
    const newUser: User = {
      id: Math.max(...users.map((u) => u.id)) + 1,
      email: addForm.email || '',
      name: addForm.name || '',
      unit: addForm.unit || '',
      created: new Date().toISOString().split('T')[0],
      role: addForm.role || 'Sinh viên',
      status: addForm.status || 'Active',
      macAddress: addForm.macAddress || '',
      bandwidthPolicy: addForm.bandwidthPolicy || bandwidthPolicies[0]?.name || '',
      sessionPolicy: addForm.sessionPolicy || sessionPolicies[0]?.name || '',
      auditPolicy: addForm.auditPolicy || auditPolicies[0]?.name || '',
      securityPolicy: addForm.securityPolicy || securityPolicies[0]?.name || '',
    };
    setUsers([...users, newUser]);
    setAddDialogOpen(false);
    setAddForm({ 
      role: 'Sinh viên', 
      status: 'Active',
      bandwidthPolicy: bandwidthPolicies[0]?.name,
      sessionPolicy: sessionPolicies[0]?.name,
      auditPolicy: auditPolicies[0]?.name,
      securityPolicy: securityPolicies[0]?.name,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Người dùng WIFI</h1>
        <p className="text-gray-600 mt-1">Quản lý danh sách người dùng và gán chính sách</p>
      </div>

      {/* Role Filter */}
      <Card className="p-6 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Lọc theo vai trò</h3>
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={18} className="mr-2" />
            Thêm người dùng
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={selectedRole === null ? 'default' : 'outline'}
            onClick={() => setSelectedRole(null)}
            className={selectedRole === null ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            Tất cả
          </Button>
          {userRoles.map((role) => (
            <Button
              key={role}
              variant={selectedRole === role ? 'default' : 'outline'}
              onClick={() => setSelectedRole(role)}
              className={selectedRole === role ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              {role}
            </Button>
          ))}
        </div>
      </Card>

      {/* Search and Table */}
      <Card className="p-6 bg-white shadow-sm">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <Input
              placeholder="Tìm kiếm theo email, tên hoặc đơn vị..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Họ tên</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Đơn vị</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Ngày tạo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Vai trò</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-700">{user.email}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.unit}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.created}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'Sinh viên'
                          ? 'bg-blue-100 text-blue-800'
                          : user.role === 'Cán bộ'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="sm" title="Xem chi tiết" onClick={() => handleView(user)}>
                        <Eye size={18} className="text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Áp chính sách" onClick={() => handlePolicy(user)}>
                        <Shield size={18} className="text-green-600" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Chỉnh sửa" onClick={() => handleEdit(user)}>
                        <Edit size={18} className="text-amber-600" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Xóa" onClick={() => handleDelete(user)}>
                        <Trash2 size={18} className="text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Không tìm thấy người dùng nào</p>
          </div>
        )}
      </Card>

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chi tiết Người dùng</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Email (IAM)</Label>
                  <p className="text-sm font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Họ tên</Label>
                  <p className="text-sm font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Đơn vị</Label>
                  <p className="text-sm font-medium">{selectedUser.unit}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Ngày tạo</Label>
                  <p className="text-sm font-medium">{selectedUser.created}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Vai trò</Label>
                  <p className="text-sm font-medium">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      selectedUser.role === 'Sinh viên' ? 'bg-blue-100 text-blue-800' :
                      selectedUser.role === 'Cán bộ' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedUser.role}
                    </span>
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Trạng thái</Label>
                  <p className="text-sm font-medium">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      selectedUser.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUser.status}
                    </span>
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-gray-500">MAC Address</Label>
                  <p className="text-sm font-medium font-mono">{selectedUser.macAddress || 'Chưa đăng ký'}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <Label className="text-xs text-gray-500 block mb-2">Chính sách áp dụng</Label>
                <div className="space-y-2">
                  <p className="text-xs"><span className="font-medium">Băng thông:</span> {selectedUser.bandwidthPolicy}</p>
                  <p className="text-xs"><span className="font-medium">Phiên:</span> {selectedUser.sessionPolicy}</p>
                  <p className="text-xs"><span className="font-medium">Kiểm toán:</span> {selectedUser.auditPolicy}</p>
                  <p className="text-xs"><span className="font-medium">Bảo mật:</span> {selectedUser.securityPolicy}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin người dùng WIFI
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-email">Email (IAM - Chỉ đọc)</Label>
              <Input id="edit-email" value={editForm.email || ''} disabled className="bg-gray-100" />
            </div>
            <div>
              <Label htmlFor="edit-name">Họ tên</Label>
              <Input 
                id="edit-name" 
                value={editForm.name || ''} 
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-unit">Đơn vị</Label>
              <Input 
                id="edit-unit" 
                value={editForm.unit || ''} 
                onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-role">Vai trò</Label>
                <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {userRoles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Trạng thái</Label>
                <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountStatuses.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-mac">MAC Address</Label>
              <Input 
                id="edit-mac" 
                value={editForm.macAddress || ''} 
                onChange={(e) => setEditForm({ ...editForm, macAddress: e.target.value })}
                placeholder="AA:BB:CC:DD:EE:FF"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveEdit} className="bg-blue-600 hover:bg-blue-700">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apply Policy Dialog */}
      <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Áp dụng Chính sách</DialogTitle>
            <DialogDescription>
              Gán chính sách cho người dùng: {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="policy-bandwidth">Chính sách Băng thông</Label>
              <Select 
                value={editForm.bandwidthPolicy} 
                onValueChange={(value) => setEditForm({ ...editForm, bandwidthPolicy: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chính sách băng thông" />
                </SelectTrigger>
                <SelectContent>
                  {bandwidthPolicies.map((policy) => (
                    <SelectItem key={policy.id} value={policy.name}>{policy.name }</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="policy-session mb-5">Chính sách Cấp quyền truy cập (Phiên)</Label>
              <Select 
                value={editForm.sessionPolicy} 
                onValueChange={(value) => setEditForm({ ...editForm, sessionPolicy: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chính sách phiên" />
                </SelectTrigger>
                <SelectContent>
                  {sessionPolicies.map((policy) => (
                    <SelectItem key={policy.id} value={policy.name}>{policy.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="policy-audit">Chính sách Kiểm toán</Label>
              <Select 
                value={editForm.auditPolicy} 
                onValueChange={(value) => setEditForm({ ...editForm, auditPolicy: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chính sách kiểm toán" />
                </SelectTrigger>
                <SelectContent>
                  {auditPolicies.map((policy) => (
                    <SelectItem key={policy.id} value={policy.name}>{policy.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="policy-security">Chính sách Bảo mật</Label>
              <Select 
                value={editForm.securityPolicy} 
                onValueChange={(value) => setEditForm({ ...editForm, securityPolicy: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chính sách bảo mật" />
                </SelectTrigger>
                <SelectContent>
                  {securityPolicies.map((policy) => (
                    <SelectItem key={policy.id} value={policy.name}>{policy.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPolicyDialogOpen(false)}>Hủy</Button>
            <Button onClick={savePolicy} className="bg-blue-600 hover:bg-blue-700">Áp dụng chính sách</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm Người dùng mới</DialogTitle>
            <DialogDescription>
              Tạo tài khoản người dùng WIFI mới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="add-email">Email</Label>
              <Input 
                id="add-email" 
                value={addForm.email || ''} 
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                placeholder="example@hcmus.edu.vn"
              />
            </div>
            <div>
              <Label htmlFor="add-name">Họ tên</Label>
              <Input 
                id="add-name" 
                value={addForm.name || ''} 
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <Label htmlFor="add-unit">Đơn vị</Label>
              <Input 
                id="add-unit" 
                value={addForm.unit || ''} 
                onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })}
                placeholder="Khoa CNTT"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="add-role">Vai trò</Label>
                <Select value={addForm.role} onValueChange={(value) => setAddForm({ ...addForm, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {userRoles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="add-status">Trạng thái</Label>
                <Select value={addForm.status} onValueChange={(value) => setAddForm({ ...addForm, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountStatuses.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">Thêm người dùng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser?.name}</strong> ({selectedUser?.email})? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
