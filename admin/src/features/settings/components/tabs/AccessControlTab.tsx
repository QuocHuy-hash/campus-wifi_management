import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Users, Database, Plus, Edit, Trash2 } from 'lucide-react';
import { AppDispatch, RootState } from '../../../../stores/store';
import {
  setAddGroupDialogOpen,
  setEditGroupDialogOpen,
  setDeleteGroupDialogOpen,
  setSelectedGroup,
  setManagePermissionsOpen,
} from '../../slices/securitySlice';

export const AccessControlTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { groups } = useSelector((state: RootState) => state.settings.security);

  return (
    <div className="p-6 space-y-8">
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
                      {group.permissions.filter((p) => p.canView || p.canEdit).length > 0 ? (
                        group.permissions
                          .filter((p) => p.canView || p.canEdit)
                          .slice(0, 3)
                          .map((p, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full border border-gray-200">
                              {p.resource} ({p.canEdit ? 'Edit' : 'View'})
                            </span>
                          ))
                      ) : (
                        <span className="text-gray-400 italic">Chưa phân quyền</span>
                      )}
                      {group.permissions.filter((p) => p.canView || p.canEdit).length > 3 && (
                        <span className="text-gray-500 text-xs self-center">
                          +{group.permissions.filter((p) => p.canView || p.canEdit).length - 3} more...
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          dispatch(setSelectedGroup(group));
                          dispatch(setEditGroupDialogOpen(true));
                        }}
                      >
                        <Edit size={16} className="text-amber-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          dispatch(setSelectedGroup(group));
                          dispatch(setDeleteGroupDialogOpen(true));
                        }}
                      >
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
    </div>
  );
};

