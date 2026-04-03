import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { getUsers, setSelectedRole, openDialog } from '../slices/usersSlice';
import { USER_DIALOG_KEYS, USER_ROLES, USER_UI_TEXT, getUserRoleLabel } from '@/features/users/constants';

export function UsersFilter() {
  const dispatch = useAppDispatch();
  const { selectedRole } = useAppSelector(state => state.users);

  const handleRoleChange = (role: string | null) => {
    dispatch(setSelectedRole(role));
    dispatch(getUsers(role));
  };

  return (
    <Card className="p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Lọc theo vai trò</h3>
        <Button
          onClick={() => dispatch(openDialog({ dialog: USER_DIALOG_KEYS.ADD }))}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus size={18} className="mr-2" />
          Thêm người dùng
        </Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          variant={selectedRole === null ? 'default' : 'outline'}
          onClick={() => handleRoleChange(null)}
          className={selectedRole === null ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          {USER_UI_TEXT.FILTER_ALL}
        </Button>

        {USER_ROLES.map((role) => (
          <Button
            key={role}
            variant={selectedRole === role ? 'default' : 'outline'}
            onClick={() => handleRoleChange(role)}
            className={selectedRole === role ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            {getUserRoleLabel(role)}
          </Button>
        ))}
      </div>
    </Card>
  );
}
