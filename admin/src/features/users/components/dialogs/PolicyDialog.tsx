import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { closeDialog, applyPolicyToUser } from '../../slices/usersSlice';
import { User } from '../../types';

export function PolicyDialog() {
  const dispatch = useAppDispatch();
  const { dialogs, selectedUser, policies } = useAppSelector(state => state.users);
  
  const bandwidthPolicies = policies.filter(p => p.type === 'bandwidth');
  const sessionPolicies = policies.filter(p => p.type === 'authorization');
  const auditPolicies = policies.filter(p => p.type === 'audit');
  const securityPolicies = policies.filter(p => p.type === 'security');

  const [editForm, setEditForm] = useState<Partial<User>>({});

  useEffect(() => {
    if (dialogs.policyOpen && selectedUser) {
      setEditForm({ ...selectedUser });
    }
  }, [dialogs.policyOpen, selectedUser]);

  const handleSave = () => {
    if (selectedUser) {
      dispatch(applyPolicyToUser({
        userId: selectedUser.id,
        policyData: {
          bandwidthPolicy: editForm.bandwidthPolicy,
          sessionPolicy: editForm.sessionPolicy,
          auditPolicy: editForm.auditPolicy,
          securityPolicy: editForm.securityPolicy,
        }
      }));
    }
  };

  return (
    <Dialog open={dialogs.policyOpen} onOpenChange={(open) => !open && dispatch(closeDialog('policyOpen'))}>
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
              value={editForm.bandwidthPolicy || ''} 
              onValueChange={(value) => setEditForm({ ...editForm, bandwidthPolicy: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn chính sách băng thông" />
              </SelectTrigger>
              <SelectContent>
                {bandwidthPolicies.map((policy) => (
                  <SelectItem key={policy.id} value={policy.name}>{policy.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="policy-session">Chính sách Cấp quyền truy cập (Phiên)</Label>
            <Select 
              value={editForm.sessionPolicy || ''} 
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
              value={editForm.auditPolicy || ''} 
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
              value={editForm.securityPolicy || ''} 
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
          <Button variant="outline" onClick={() => dispatch(closeDialog('policyOpen'))}>Hủy</Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Áp dụng chính sách</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
