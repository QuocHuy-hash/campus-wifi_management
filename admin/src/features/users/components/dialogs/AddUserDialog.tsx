import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { closeDialog, addNewUser } from '../../slices/usersSlice';
import { User } from '../../types';
import { ACCOUNT_STATUSES, USER_DIALOG_KEYS, USER_ROLES } from '@/features/users/constants';

type AddUserForm = Partial<User> & {
  password: string;
};

export function AddUserDialog() {
  const dispatch = useAppDispatch();
  const { dialogs, policies } = useAppSelector(state => state.users);
  
  const bandwidthPolicies = policies.filter(p => p.type === 'bandwidth');
  const sessionPolicies = policies.filter(p => p.type === 'authorization');
  const auditPolicies = policies.filter(p => p.type === 'audit');
  const securityPolicies = policies.filter(p => p.type === 'security');

  const defaultForm = {
    role: USER_ROLES[0],
    status: ACCOUNT_STATUSES[0],
    email: '',
    password: '',
    name: '',
    unit: '',
  };

  const [addForm, setAddForm] = useState<AddUserForm>(defaultForm);

  // Set defaults when policies load
  useEffect(() => {
    if (dialogs.addOpen) {
      setAddForm({
        ...defaultForm
      });
    }
  }, [dialogs.addOpen, policies]);

  const handleAdd = () => {
    dispatch(addNewUser({
      email: addForm.email || '',
      name: addForm.name || '',
      unit: addForm.unit || '',
      role: addForm.role || USER_ROLES[0],
      status: addForm.status || ACCOUNT_STATUSES[0],
      macAddress: addForm.macAddress || '',
      policies: [],
      linkedProviders: [],
    } as any));
  };

  return (
    <Dialog open={dialogs.addOpen} onOpenChange={(open) => !open && dispatch(closeDialog(USER_DIALOG_KEYS.ADD))}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm Người dùng mới</DialogTitle>
          <DialogDescription>
            Tạo tài khoản người dùng WIFI mới
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
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
            <Label htmlFor="add-email">Email</Label>
            <Input 
              id="add-email" 
              value={addForm.email || ''} 
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              placeholder="example@hcmus.edu.vn"
            />
          </div>
          <div>
            <Label htmlFor="add-password">Mật khẩu</Label>
            <Input
              id="add-password"
              type="password"
              value={addForm.password}
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              placeholder="Nhập mật khẩu"
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
              <Select value={addForm.role || ''} onValueChange={(value) => setAddForm({ ...addForm, role: value })}>
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
              <Label htmlFor="add-status">Trạng thái</Label>
              <Select value={addForm.status || ''} onValueChange={(value) => setAddForm({ ...addForm, status: value })}>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => dispatch(closeDialog(USER_DIALOG_KEYS.ADD))}>Hủy</Button>
          <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">Thêm người dùng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
