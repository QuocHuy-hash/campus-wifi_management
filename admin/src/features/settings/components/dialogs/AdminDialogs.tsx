import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppDispatch, RootState } from '../../../../stores/store';
import {
  setAddDialogOpen, setEditDialogOpen, setDeleteDialogOpen, setSelectedAdmin,
  addAdmin, updateAdmin, removeAdmin
} from '../../slices/adminSlice';
import { AdminUser } from '../../types';

export const AdminDialogs = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { addDialogOpen, editDialogOpen, deleteDialogOpen, selectedAdmin, roles, admins } = useSelector((state: RootState) => state.settings.admin);
  const { groups } = useSelector((state: RootState) => state.settings.security);

  const [form, setForm] = useState<Partial<AdminUser>>({ status: 'Active' });

  useEffect(() => {
    if (editDialogOpen && selectedAdmin) {
      setForm(selectedAdmin);
    } else if (addDialogOpen) {
      setForm({ status: 'Active' });
    }
  }, [editDialogOpen, addDialogOpen, selectedAdmin]);

  const handleSave = () => {
    if (!form.username || !form.email || !form.role || !form.group) return; // Simple validation
    
    if (editDialogOpen && selectedAdmin) {
      dispatch(updateAdmin(form as AdminUser));
      dispatch(setEditDialogOpen(false));
    } else {
      const newAdmin = {
        ...form,
        id: Math.max(...admins.map(a => a.id), 0) + 1,
      } as AdminUser;
      dispatch(addAdmin(newAdmin));
      dispatch(setAddDialogOpen(false));
    }
  };

  const handleDelete = () => {
    if (selectedAdmin) {
      dispatch(removeAdmin(selectedAdmin.id));
      dispatch(setDeleteDialogOpen(false));
    }
  };

  const handleCloseDialog = () => {
    dispatch(setAddDialogOpen(false));
    dispatch(setEditDialogOpen(false));
    dispatch(setDeleteDialogOpen(false));
    dispatch(setSelectedAdmin(null));
  };

  const isFormValid = form.username && form.email && form.role && form.group;

  return (
    <>
      <Dialog open={addDialogOpen || editDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editDialogOpen ? 'Chỉnh sửa Người dùng Hệ thống' : 'Thêm Người dùng Hệ thống'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="username" className="text-right text-sm font-medium">Tên đăng nhập *</label>
              <Input
                id="username"
                value={form.username || ''}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="col-span-3"
                disabled={editDialogOpen}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right text-sm font-medium">Email *</label>
              <Input
                id="email"
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            {/* Password field only on Add, mock functionality */}
            {!editDialogOpen && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Vai trò hệ thống *</label>
                <div className="col-span-3">
                  <Select value={form.role || ''} onValueChange={(val) => setForm({ ...form, role: val })}>
                    <SelectTrigger><SelectValue placeholder="Chọn vai trò" /></SelectTrigger>
                    <SelectContent>
                      {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {editDialogOpen && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Vai trò hệ thống *</label>
                <div className="col-span-3">
                  <Select value={form.role || ''} onValueChange={(val) => setForm({ ...form, role: val })}>
                    <SelectTrigger><SelectValue placeholder="Chọn vai trò" /></SelectTrigger>
                    <SelectContent>
                      {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Nhóm người dùng *</label>
              <div className="col-span-3">
                <Select value={form.group || ''} onValueChange={(val) => setForm({ ...form, group: val })}>
                  <SelectTrigger><SelectValue placeholder="Chọn nhóm" /></SelectTrigger>
                  <SelectContent>
                    {groups.map(g => <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Hủy</Button>
            <Button onClick={handleSave} disabled={!isFormValid} className="bg-blue-600 hover:bg-blue-700">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Xóa Người dùng</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Bạn có chắc chắn muốn xóa người dùng <span className="font-semibold">{selectedAdmin?.username}</span>?</p>
            <p className="text-sm text-gray-500 mt-2">Hành động này không thể hoàn tác.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
