import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Lock, Trash2 } from 'lucide-react';
import { AppDispatch, RootState } from '../../../../stores/store';
import { 
  setSearchQuery, setAddDialogOpen, setEditDialogOpen, 
  setDeleteDialogOpen, setSelectedAdmin, updateAdmin
} from '../../slices/adminSlice';
import { AdminUser } from '../../types';

export const AdminUsersTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { admins, searchQuery } = useSelector((state: RootState) => state.settings.admin);

  const filteredAdmins = useMemo(() => {
    return admins.filter(a => 
      a.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [admins, searchQuery]);

  const handleAddAdmin = () => dispatch(setAddDialogOpen(true));
  const handleEditAdmin = (admin: AdminUser) => {
    dispatch(setSelectedAdmin(admin));
    dispatch(setEditDialogOpen(true));
  };
  const handleDeleteAdmin = (admin: AdminUser) => {
    dispatch(setSelectedAdmin(admin));
    dispatch(setDeleteDialogOpen(true));
  };
  const handleLockAdmin = (admin: AdminUser) => {
    dispatch(updateAdmin({
      ...admin,
      status: admin.status === 'Active' ? 'Locked' : 'Active'
    }));
  };

  return (
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
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
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
            {filteredAdmins.map((admin, index) => (
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
    </div>
  );
};
