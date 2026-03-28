import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Key, Shield, ShieldCheck, X, Users, Database, Plus, Edit, Trash2 } from 'lucide-react';
import { AppDispatch, RootState } from '../../../../stores/store';
import { 
  addAllowedIp, removeAllowedIp,
  setAddGroupDialogOpen, setEditGroupDialogOpen, setDeleteGroupDialogOpen, setSelectedGroup,
  setManagePermissionsOpen
} from '../../slices/securitySlice';

export const SecurityTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { allowedIps, groups } = useSelector((state: RootState) => state.settings.security);
  const [newIp, setNewIp] = useState('');

  const handleAddIp = () => {
    if (newIp) {
      dispatch(addAllowedIp(newIp));
      setNewIp('');
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* User Groups Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              Quản lý Nhóm & Phân quyền
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Tạo nhóm và phân quyền truy cập cho từng nhóm.
            </p>
          </div>
          <div>
            <Button onClick={() => dispatch(setManagePermissionsOpen(true))} variant="outline" className="mr-3">
              <Database size={18} className="mr-2" />
              Tài nguyên Hệ thống
            </Button>
            <Button onClick={() => dispatch(setAddGroupDialogOpen(true))} className="bg-blue-600 hover:bg-blue-700">
              <Plus size={18} className="mr-2" />
              Thêm nhóm
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 w-16">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Tên nhóm</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Quyền hạn (Permissions)</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 w-32">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500 text-center">{group.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{group.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex flex-wrap gap-1">
                      {group.permissions.filter(p => p.canView || p.canEdit).length > 0 ? (
                        group.permissions.filter(p => p.canView || p.canEdit).slice(0, 3).map((p, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full border border-gray-200">
                            {p.resource} ({p.canEdit ? 'Edit' : 'View'})
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">Chưa phân quyền</span>
                      )}
                      {group.permissions.filter(p => p.canView || p.canEdit).length > 3 && (
                        <span className="text-gray-500 text-xs self-center">
                          +{group.permissions.filter(p => p.canView || p.canEdit).length - 3} more...
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { dispatch(setSelectedGroup(group)); dispatch(setEditGroupDialogOpen(true)); }}>
                        <Edit size={16} className="text-amber-600" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { dispatch(setSelectedGroup(group)); dispatch(setDeleteGroupDialogOpen(true)); }}>
                        <Trash2 size={16} className="text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Policies */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock size={20} />
          Thiết lập Bảo mật
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Password Policy */}
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Key size={16} className="text-gray-500" /> Chính sách Mật khẩu
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 font-medium">Yêu cầu</label>
                <select className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm bg-gray-50">
                  <option>Mạnh (8+ ký tự, A-Za-z0-9, đặc biệt)</option>
                  <option>Trung bình</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                  <label className="text-xs text-gray-600 font-medium">Đổi sau (ngày)</label>
                  <Input type="number" placeholder="90" className="mt-1 h-8" />
                  </div>
                  <div>
                  <label className="text-xs text-gray-600 font-medium">Hết hạn (ngày)</label>
                  <Input type="number" placeholder="365" className="mt-1 h-8" />
                  </div>
              </div>
            </div>
          </div>

          {/* Login Restrictions */}
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shield size={16} className="text-gray-500" /> Hạn chế Đăng nhập
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                  <label className="text-xs text-gray-600 font-medium">Sai tối đa</label>
                  <Input type="number" placeholder="5 lần" className="mt-1 h-8" />
                  </div>
                  <div>
                  <label className="text-xs text-gray-600 font-medium">Khóa (phút)</label>
                  <Input type="number" placeholder="30" className="mt-1 h-8" />
                  </div>
              </div>
                <div className="pt-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" className="rounded border-gray-300" defaultChecked /> Tự động gửi cảnh báo qua Email
                  </label>
                </div>
            </div>
          </div>

          {/* Admin Network Restriction - Compact */}
          <div className="p-4 bg-white rounded-lg border border-gray-200 col-span-1 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-green-600" />
                      <h4 className="text-sm font-semibold text-gray-900">Giới hạn IP Quản trị</h4>
                      <span className="text-xs text-gray-500 hidden sm:inline">(Chỉ cho phép truy cập từ các IP bên dưới)</span>
                  </div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="IP/CIDR (VD: 192.168.1.10)" 
                        value={newIp}
                        onChange={(e) => setNewIp(e.target.value)}
                        className="h-8 w-48 text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddIp()}
                      />
                      <Button onClick={handleAddIp} disabled={!newIp} size="sm" className="h-8 bg-green-600 hover:bg-green-700">
                      <Plus size={14} className="mr-1" /> Thêm
                      </Button>
                  </div>
              </div>

              <div className="flex flex-wrap gap-2">
                  {allowedIps.map((ip) => (
                    <div key={ip} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-mono transition-colors">
                        <span>{ip}</span>
                        <button onClick={() => dispatch(removeAllowedIp(ip))} className="text-gray-400 hover:text-red-600">
                          <X size={14} />
                        </button>
                    </div>
                  ))}
                  {allowedIps.length === 0 && (
                        <span className="text-sm text-gray-500 italic py-1">Chưa có giới hạn nào. Truy cập công khai.</span>
                  )}
              </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Lưu cài đặt bảo mật</Button>
        </div>
      </div>
    </div>
  );
};
