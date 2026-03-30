import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mail, Globe, Facebook } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { closeDialog, editUser } from '../../slices/usersSlice';
import { User } from '../../types';
import { ACCOUNT_STATUSES, USER_DIALOG_KEYS, USER_ROLES } from '@/features/users/constants';

export function EditUserDialog() {
  const dispatch = useAppDispatch();
  const { dialogs, selectedUser } = useAppSelector(state => state.users);
  
  const [editForm, setEditForm] = useState<Partial<User>>({});

  useEffect(() => {
    if (dialogs.editOpen && selectedUser) {
      setEditForm({ ...selectedUser });
    }
  }, [dialogs.editOpen, selectedUser]);

  const handleSave = () => {
    if (selectedUser) {
      dispatch(editUser({ ...selectedUser, ...editForm } as User));
    }
  };

  return (
    <Dialog open={dialogs.editOpen} onOpenChange={(open) => !open && dispatch(closeDialog(USER_DIALOG_KEYS.EDIT))}>
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
              <Select value={editForm.role || ''} onValueChange={(value) => setEditForm({ ...editForm, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-status">Trạng thái</Label>
              <Select value={editForm.status || ''} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_STATUSES.map((status) => (
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
          {editForm.linkedAccounts && editForm.linkedAccounts.length > 0 && (
            <div className="border-t pt-4">
              <Label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Tài khoản đã liên kết (OAuth)</Label>
              <div className="space-y-2">
                {editForm.linkedAccounts.map((acc, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-100">
                    {acc.type === 'gmail' && <Mail size={16} className="text-red-500" />}
                    {acc.type === 'microsoft' && <Globe size={16} className="text-blue-500" />}
                    {acc.type === 'facebook' && <Facebook size={16} className="text-blue-600" />}
                    <span className="text-sm text-gray-700">{acc.email || acc.id}</span>
                    <span className="ml-auto text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase">Verified</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => dispatch(closeDialog(USER_DIALOG_KEYS.EDIT))}>Hủy</Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
