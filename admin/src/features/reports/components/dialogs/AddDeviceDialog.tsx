import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { AppDispatch, RootState } from '@/stores/store';
import { UserSession } from '../../types';
import { registerDevice, resetRegisterDeviceStatus } from '../../slices/usersReportSlice';

interface AddDeviceDialogProps {
  session: UserSession | null;
  userId: number | null;
  onClose: () => void;
}

export const AddDeviceDialog = ({ session, userId, onClose }: AddDeviceDialogProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const registerDeviceStatus = useSelector(
    (state: RootState) => state.reports.users.registerDeviceStatus,
  );

  const isOpen = !!session;
  const isSubmitting = registerDeviceStatus === 'loading';
  useEffect(() => {
    if (registerDeviceStatus === 'succeeded') {
      toast.success('Thêm thiết bị thành công');
      dispatch(resetRegisterDeviceStatus());
      onClose();
    }
    if (registerDeviceStatus === 'failed') {
      toast.error('Thêm thiết bị thất bại. Vui lòng thử lại.');
      dispatch(resetRegisterDeviceStatus());
    }
  }, [registerDeviceStatus, dispatch, onClose]);

  const handleConfirm = () => {
    if (!session || userId === null) return;
    dispatch(
      registerDevice({
        userId,
        deviceMacAddress: session.mac,
        deviceType: session.deviceType,
        deviceName: session.deviceName,
      }),
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Thêm thiết bị</DialogTitle>
        </DialogHeader>

        {session && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-600 mb-1">MAC Address</p>
              <Input value={session.mac} readOnly />
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Loại &amp; Tên thiết bị</p>
              <Input value={`${session.deviceType} - ${session.deviceName}`} readOnly />
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Tên đăng nhập</p>
              <Input value={session.username} readOnly />
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Tên người dùng</p>
              <Input value={session.fullName} readOnly />
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Nhóm người dùng</p>
              <Input value={session.identity ?? '-'} readOnly />
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Phiên làm việc</p>
              <Input value={session.sessionId} readOnly />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Đang thêm...
              </>
            ) : (
              'Thêm thiết bị'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
