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
  const sessionPolicies = policies.filter(p => p.type === 'session');
  const authorizationPolicies = policies.filter(p => p.type === 'authorization');
  const securityPolicies = policies.filter(p => p.type === 'security');

  const [selectedPolicies, setSelectedPolicies] = useState<{
    bandwidth?: string;
    session?: string;
    authorization?: string;
    security?: string;
  }>({});

  useEffect(() => {
    if (dialogs.policyOpen && selectedUser) {
      setSelectedPolicies({
        bandwidth: selectedUser.policies?.find(p => p.type === 'BANDWIDTH')?.id.toString(),
        session: selectedUser.policies?.find(p => p.type === 'SESSION')?.id.toString(),
        authorization: selectedUser.policies?.find(p => p.type === 'AUTHORIZATION')?.id.toString(),
        security: selectedUser.policies?.find(p => p.type === 'SECURITY')?.id.toString(),
      });
    }
  }, [dialogs.policyOpen, selectedUser]);

  const handleSave = () => {
    if (selectedUser) {
      const policyIds = Object.values(selectedPolicies)
        .filter(Boolean)
        .map(id => parseInt(id as string, 10));
        
      const policyObjs = policyIds.map(id => ({ id } as any));
      
      dispatch(applyPolicyToUser({
        userId: selectedUser.id,
        policyData: {
          policies: policyObjs
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
              value={selectedPolicies.bandwidth || ''} 
              onValueChange={(value) => setSelectedPolicies({ ...selectedPolicies, bandwidth: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn chính sách băng thông" />
              </SelectTrigger>
              <SelectContent>
                {bandwidthPolicies.map((policy) => (
                  <SelectItem key={policy.id} value={policy.id.toString()}>{policy.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="policy-session">Chính sách Phiên kết nối</Label>
            <Select 
              value={selectedPolicies.session || ''} 
              onValueChange={(value) => setSelectedPolicies({ ...selectedPolicies, session: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn chính sách phiên" />
              </SelectTrigger>
              <SelectContent>
                {sessionPolicies.map((policy) => (
                  <SelectItem key={policy.id} value={policy.id.toString()}>{policy.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="policy-authorization">Chính sách Xác thực (Authorization)</Label>
            <Select 
              value={selectedPolicies.authorization || ''} 
              onValueChange={(value) => setSelectedPolicies({ ...selectedPolicies, authorization: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn chính sách xác thực" />
              </SelectTrigger>
              <SelectContent>
                {authorizationPolicies.map((policy) => (
                  <SelectItem key={policy.id} value={policy.id.toString()}>{policy.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="policy-security">Chính sách Bảo mật</Label>
            <Select 
              value={selectedPolicies.security || ''} 
              onValueChange={(value) => setSelectedPolicies({ ...selectedPolicies, security: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn chính sách bảo mật" />
              </SelectTrigger>
              <SelectContent>
                {securityPolicies.map((policy) => (
                  <SelectItem key={policy.id} value={policy.id.toString()}>{policy.name}</SelectItem>
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
