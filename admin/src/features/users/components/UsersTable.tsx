import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Edit, Trash2, Eye, Shield, Mail, Globe } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { setSearchTerm, openDialog } from '../slices/usersSlice';
import { useMemo } from 'react';
import { getUserRoleBadgeClass, getUserRoleLabel, USER_DIALOG_KEYS, USER_UI_TEXT } from '@/features/users/constants';

export function UsersTable() {
  const dispatch = useAppDispatch();
  const { users, searchTerm, selectedRole, loading } = useAppSelector(state => state.users);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = !selectedRole || user.role === selectedRole;
      const matchesSearch =
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.unit.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [users, searchTerm, selectedRole]);

  return (
    <Card className="p-6 bg-white shadow-sm">
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <Input
            placeholder="Tìm kiếm theo email, tên hoặc đơn vị..."
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">{USER_UI_TEXT.LOADING_USERS}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Họ tên</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Đơn vị</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Ngày tạo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Vai trò</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Liên kết</th>
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
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getUserRoleBadgeClass(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      {user.linkedAccounts?.map((acc, idx) => (
                        <span key={idx} title={`${acc.type}: ${acc.email || acc.id}`}>
                          {acc.type === 'gmail' && <Mail size={16} className="text-red-500" />}
                          {acc.type === 'microsoft' && <Globe size={16} className="text-blue-500" />}
                          {acc.type === 'facebook' && <Facebook size={16} className="text-blue-600" />}
                        </span>
                      ))}
                      {(!user.linkedAccounts || user.linkedAccounts.length === 0) && (
                        <span className="text-gray-300">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="sm" title="Xem chi tiết" onClick={() => dispatch(openDialog({ dialog: USER_DIALOG_KEYS.VIEW, user }))}>
                        <Eye size={18} className="text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Áp chính sách" onClick={() => dispatch(openDialog({ dialog: USER_DIALOG_KEYS.POLICY, user }))}>
                        <Shield size={18} className="text-green-600" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Chỉnh sửa" onClick={() => dispatch(openDialog({ dialog: USER_DIALOG_KEYS.EDIT, user }))}>
                        <Edit size={18} className="text-amber-600" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Xóa" onClick={() => dispatch(openDialog({ dialog: USER_DIALOG_KEYS.DELETE, user }))}>
                        <Trash2 size={18} className="text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredUsers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">{USER_UI_TEXT.EMPTY_USERS}</p>
        </div>
      ) : null}
    </Card>
  );
}
