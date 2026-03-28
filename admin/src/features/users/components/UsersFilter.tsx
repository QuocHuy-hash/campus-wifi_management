import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { setSelectedRole, openDialog } from '../slices/usersSlice';

const userRoles = ['Sinh viên', 'Cán bộ', 'Khách'];

export function UsersFilter() {
  const dispatch = useAppDispatch();
  const { selectedRole } = useAppSelector(state => state.users);

  return (
    <Card className="p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Lọc theo vai trò</h3>
        <Button
          onClick={() => dispatch(openDialog({ dialog: 'addOpen' }))}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus size={18} className="mr-2" />
          Thêm người dùng
        </Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          variant={selectedRole === null ? 'default' : 'outline'}
          onClick={() => dispatch(setSelectedRole(null))}
          className={selectedRole === null ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          Tất cả
        </Button>
        {userRoles.map((role) => (
          <Button
            key={role}
            variant={selectedRole === role ? 'default' : 'outline'}
            onClick={() => dispatch(setSelectedRole(role))}
            className={selectedRole === role ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            {role}
          </Button>
        ))}
      </div>
    </Card>
  );
}
