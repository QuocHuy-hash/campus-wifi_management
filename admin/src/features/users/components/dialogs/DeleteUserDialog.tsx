import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { closeDialog, removeUser } from '../../slices/usersSlice';

export function DeleteUserDialog() {
  const dispatch = useAppDispatch();
  const { dialogs, selectedUser } = useAppSelector(state => state.users);

  if (!selectedUser) return null;

  const handleConfirm = () => {
    dispatch(removeUser(selectedUser.id));
  };

  return (
    <AlertDialog open={dialogs.deleteOpen} onOpenChange={(open) => !open && dispatch(closeDialog('deleteOpen'))}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser.name}</strong> ({selectedUser.email})? 
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => dispatch(closeDialog('deleteOpen'))}>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-red-600 hover:bg-red-700">
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
