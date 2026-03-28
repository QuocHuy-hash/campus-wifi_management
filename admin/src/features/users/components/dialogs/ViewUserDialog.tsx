import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, Globe, Facebook } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { closeDialog } from '../../slices/usersSlice';

export function ViewUserDialog() {
  const dispatch = useAppDispatch();
  const { dialogs, selectedUser } = useAppSelector(state => state.users);

  if (!selectedUser) return null;

  return (
    <Dialog open={dialogs.viewOpen} onOpenChange={(open) => !open && dispatch(closeDialog('viewOpen'))}>
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
              <p className="text-sm font-medium">{selectedUser.created}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Vai trò</Label>
              <p className="text-sm font-medium">
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                  selectedUser.role === 'Sinh viên' ? 'bg-blue-100 text-blue-800' :
                  selectedUser.role === 'Cán bộ' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
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
            <div className="col-span-2">
              <Label className="text-xs text-gray-500">MAC Address</Label>
              <p className="text-sm font-medium font-mono">{selectedUser.macAddress || 'Chưa đăng ký'}</p>
            </div>
            <div className="col-span-2 border-t pt-4">
              <Label className="text-xs text-gray-500 block mb-2 font-bold uppercase tracking-wider">Tài khoản liên kết</Label>
              <div className="space-y-2">
                {selectedUser.linkedAccounts && selectedUser.linkedAccounts.length > 0 ? (
                  selectedUser.linkedAccounts.map((acc, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded border">
                      {acc.type === 'gmail' && <Mail size={18} className="text-red-500" />}
                      {acc.type === 'microsoft' && <Globe size={18} className="text-blue-500" />}
                      {acc.type === 'facebook' && <Facebook size={16} className="text-blue-600" />}
                      <div>
                        <p className="text-xs font-semibold capitalize">{acc.type}</p>
                        <p className="text-sm text-gray-600">
                          {acc.email || acc.id} {acc.name ? `(${acc.name})` : ''}
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
              <p className="text-xs"><span className="font-medium">Băng thông:</span> {selectedUser.bandwidthPolicy}</p>
              <p className="text-xs"><span className="font-medium">Phiên:</span> {selectedUser.sessionPolicy}</p>
              <p className="text-xs"><span className="font-medium">Kiểm toán:</span> {selectedUser.auditPolicy}</p>
              <p className="text-xs"><span className="font-medium">Bảo mật:</span> {selectedUser.securityPolicy}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => dispatch(closeDialog('viewOpen'))}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
