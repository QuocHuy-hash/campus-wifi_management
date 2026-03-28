import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2 } from 'lucide-react';
import { AppDispatch, RootState } from '../../../../stores/store';
import {
  setAddGroupDialogOpen, setEditGroupDialogOpen, setDeleteGroupDialogOpen, setSelectedGroup, addGroup, updateGroup, removeGroup,
  setManagePermissionsOpen, addResource, removeResource
} from '../../slices/securitySlice';
import { UserGroup, Permission } from '../../types';

export const SecurityDialogs = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    groups, resources,
    addGroupDialogOpen, editGroupDialogOpen, deleteGroupDialogOpen, selectedGroup,
    managePermissionsOpen
  } = useSelector((state: RootState) => state.settings.security);

  const [groupForm, setGroupForm] = useState<Partial<UserGroup>>({ permissions: [] });
  const [newResource, setNewResource] = useState('');

  useEffect(() => {
    if (editGroupDialogOpen && selectedGroup) {
      setGroupForm(JSON.parse(JSON.stringify(selectedGroup))); // Deep copy for editing permissions safely
    } else if (addGroupDialogOpen) {
      // Default permissions based on existing resources
      const defaultPerms: Permission[] = resources.map(r => ({ resource: r, canView: false, canEdit: false }));
      setGroupForm({ permissions: defaultPerms });
    }
  }, [editGroupDialogOpen, addGroupDialogOpen, selectedGroup, resources]);

  const closeGroupDialogs = () => { dispatch(setAddGroupDialogOpen(false)); dispatch(setEditGroupDialogOpen(false)); dispatch(setDeleteGroupDialogOpen(false)); dispatch(setSelectedGroup(null)); };

  const handleSaveGroup = () => {
    if (editGroupDialogOpen && selectedGroup) dispatch(updateGroup(groupForm as UserGroup));
    else dispatch(addGroup({ ...groupForm, id: Math.max(0, ...groups.map(g => g.id)) + 1 } as UserGroup));
    closeGroupDialogs();
  };

  const handlePermissionChange = (resource: string, field: 'canView' | 'canEdit', checked: boolean) => {
    if (!groupForm.permissions) return;
    const newPerms = [...groupForm.permissions];
    const idx = newPerms.findIndex(p => p.resource === resource);
    if (idx !== -1) {
      newPerms[idx] = { ...newPerms[idx], [field]: checked };
      if (field === 'canEdit' && checked) newPerms[idx].canView = true;
    }
    setGroupForm({ ...groupForm, permissions: newPerms });
  };

  const handleAddResource = () => {
    if (newResource.trim()) {
      dispatch(addResource(newResource.trim()));
      setNewResource('');
    }
  };

  return (
    <>
      <Dialog open={addGroupDialogOpen || editGroupDialogOpen} onOpenChange={closeGroupDialogs}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{editGroupDialogOpen ? 'Sửa Nhóm & Phân quyền' : 'Thêm Nhóm & Phân quyền'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="font-semibold text-sm">Tên nhóm</div>
            <Input placeholder="Tên nhóm (VD: Hỗ trợ Kỹ thuật cấp 2)" value={groupForm.name || ''} onChange={e => setGroupForm({...groupForm, name: e.target.value})} />
            
            <div className="font-semibold text-sm mt-4">Phân quyền thao tác</div>
            <ScrollArea className="h-[250px] border rounded-md p-4">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-gray-500"><th className="pb-2">Tài nguyên</th><th className="pb-2 text-center">Xem</th><th className="pb-2 text-center">Chỉnh sửa</th></tr></thead>
                <tbody>
                  {(groupForm.permissions || []).map(perm => (
                    <tr key={perm.resource} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-700">{perm.resource}</td>
                      <td className="py-3 text-center"><Checkbox checked={perm.canView} onCheckedChange={(c) => handlePermissionChange(perm.resource, 'canView', !!c)} /></td>
                      <td className="py-3 text-center"><Checkbox checked={perm.canEdit} onCheckedChange={(c) => handlePermissionChange(perm.resource, 'canEdit', !!c)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </div>
          <DialogFooter><Button variant="outline" onClick={closeGroupDialogs}>Hủy</Button><Button onClick={handleSaveGroup} disabled={!groupForm.name} className="bg-blue-600">Lưu</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteGroupDialogOpen} onOpenChange={closeGroupDialogs}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-red-500">Xóa Nhóm Nguời dùng</DialogTitle></DialogHeader>
          <p>Xác nhận xóa nhóm {selectedGroup?.name}?</p>
          <DialogFooter><Button variant="outline" onClick={closeGroupDialogs}>Hủy</Button><Button variant="destructive" onClick={() => { dispatch(removeGroup(selectedGroup!.id)); closeGroupDialogs(); }}>Xóa</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Resources Dialog */}
      <Dialog open={managePermissionsOpen} onOpenChange={(open) => dispatch(setManagePermissionsOpen(open))}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Quản lý Tài nguyên Hệ thống</DialogTitle>
            <DialogDescription>Danh sách các tài nguyên hoặc chức năng có thể phân quyền trên hệ thống.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex gap-2 mb-4">
              <Input placeholder="Thêm tài nguyên mới (VD: QuanLyThietBi)" value={newResource} onChange={e => setNewResource(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddResource()} />
              <Button onClick={handleAddResource} disabled={!newResource.trim()} className="bg-blue-600">Thêm</Button>
            </div>
            <ScrollArea className="h-[300px] border rounded-md">
              <ul className="divide-y">
                {resources.map(res => (
                  <li key={res} className="flex items-center justify-between p-3 hover:bg-gray-50">
                    <span className="text-sm font-medium">{res}</span>
                    <Button variant="ghost" size="sm" onClick={() => dispatch(removeResource(res))}><Trash2 size={16} className="text-red-600"/></Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
