import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Laptop, Smartphone, Monitor, HelpCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { closeDialog } from '../../slices/usersSlice';
import { getUserRoleBadgeClass, USER_DIALOG_KEYS } from '@/features/users/constants';
import { formatDate, formatDateTime } from '@/utils/dateTimeFormat';

const DeviceIcon = ({ deviceType }: { deviceType: string | null }) => {
  const cls = "text-blue-500 shrink-0";
  if (!deviceType) return <HelpCircle size={28} className="text-gray-400 shrink-0" />;
  const type = deviceType.toLowerCase();
  if (type === 'laptop') return <Laptop size={28} className={cls} />;
  if (type === 'smartphone') return <Smartphone size={28} className={cls} />;
  if (type === 'monitor') return <Monitor size={28} className={cls} />;
  return <HelpCircle size={28} className="text-gray-400 shrink-0" />;
};

export function ViewUserDialog() {
  const dispatch = useAppDispatch();
  const { dialogs, selectedUser } = useAppSelector(state => state.users);

  if (!selectedUser) return null;

  return (
    <Dialog open={dialogs.viewOpen} onOpenChange={(open) => !open && dispatch(closeDialog(USER_DIALOG_KEYS.VIEW))}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chi tiết Người dùng</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Email (IAM)</Label>
              <p className="text-sm font-medium">{selectedUser.email}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Họ tên</Label>
              <p className="text-sm font-medium">{selectedUser.name}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Đơn vị</Label>
              <p className="text-sm font-medium">{selectedUser.unit}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Ngày tạo</Label>
              <p className="text-sm font-medium">{formatDate(selectedUser.created)}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Vai trò</Label>
              <p className="text-sm font-medium">
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${getUserRoleBadgeClass(selectedUser.role)}`}>
                  {selectedUser.role}
                </span>
              </p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Trạng thái</Label>
              <p className="text-sm font-medium">
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                  selectedUser.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedUser.status}
                </span>
              </p>
            </div>
            <div className="col-span-2 border-t pt-4">
              <Label className="text-xs text-gray-500 block mb-3 font-bold uppercase tracking-wider">
                Thiết bị đã đăng ký
              </Label>
              {selectedUser.deviceMacAddress ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                  <DeviceIcon deviceType={selectedUser.deviceType ?? null} />
                  <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1">
                    <div>
                      <p className="text-xs text-gray-500">Tên thiết bị</p>
                      <p className="text-sm font-medium">{selectedUser.deviceName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Loại thiết bị</p>
                      <p className="text-sm font-medium">{selectedUser.deviceType || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">MAC Address</p>
                      <p className="text-sm font-medium font-mono tracking-wider">{selectedUser.deviceMacAddress}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Chưa đăng ký thiết bị</p>
              )}
            </div>
            <div className="col-span-2 border-t pt-4">
              <Label className="text-xs text-gray-500 block mb-2 font-bold uppercase tracking-wider">Tài khoản liên kết</Label>
              <div className="space-y-2">
                {selectedUser.linkedProviders && selectedUser.linkedProviders.length > 0 ? (
                  selectedUser.linkedProviders.map((acc, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded border">
                      {(acc.provider === 'gmail' || acc.provider === 'google') && <img src="/google.png" alt="Google" className="w-[18px] h-[18px]" />}
                      {(acc.provider === 'microsoft' || acc.provider === 'azure') && <img src="/microsoft.png" alt="Microsoft" className="w-[18px] h-[18px]" />}
                      {acc.provider === 'facebook' && <img src="/facebook.png" alt="Facebook" className="w-[18px] h-[18px]" />}
                      <div>
                        <p className="text-xs font-semibold capitalize">{acc.provider}</p>
                        <p className="text-sm text-gray-600">
                          {acc.providerEmail || 'Linked'}{acc.displayName ? ` (${acc.displayName})` : ''}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">Chưa có tài khoản liên kết</p>
                )}
              </div>
            </div>
          </div>
          <div className="border-t pt-4">
            <Label className="text-xs text-gray-500 block mb-2">Chính sách áp dụng</Label>
            <div className="space-y-2">
              <p className="text-xs">
                <span className="font-medium">Băng thông:</span>{' '}
                {selectedUser.policies?.find(p => p.type === 'BANDWIDTH')?.name || 'Chưa gán'}
              </p>
              <p className="text-xs">
                <span className="font-medium">Phiên:</span>{' '}
                {selectedUser.policies?.find(p => p.type === 'SESSION')?.name || 'Chưa gán'}
              </p>
              <p className="text-xs">
                <span className="font-medium">Kiểm toán/Xác thực:</span>{' '}
                {selectedUser.policies?.find(p => p.type === 'AUTHORIZATION')?.name || 'Chưa gán'}
              </p>
              <p className="text-xs">
                <span className="font-medium">Bảo mật:</span>{' '}
                {selectedUser.policies?.find(p => p.type === 'SECURITY')?.name || 'Chưa gán'}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => dispatch(closeDialog(USER_DIALOG_KEYS.VIEW))}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
