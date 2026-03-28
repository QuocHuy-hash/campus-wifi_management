import { useEffect } from 'react';
import { useAppDispatch } from '@/stores/hooks';
import { getUsers, getPolicies } from './slices/usersSlice';
import { UsersHeader } from './components/UsersHeader';
import { UsersFilter } from './components/UsersFilter';
import { UsersTable } from './components/UsersTable';
import { AddUserDialog } from './components/dialogs/AddUserDialog';
import { EditUserDialog } from './components/dialogs/EditUserDialog';
import { ViewUserDialog } from './components/dialogs/ViewUserDialog';
import { PolicyDialog } from './components/dialogs/PolicyDialog';
import { DeleteUserDialog } from './components/dialogs/DeleteUserDialog';

export function UsersFeature() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getUsers());
    dispatch(getPolicies());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <UsersHeader />
      <UsersFilter />
      <UsersTable />

      {/* Dialogs mounted once and driven by Redux state */}
      <AddUserDialog />
      <EditUserDialog />
      <ViewUserDialog />
      <PolicyDialog />
      <DeleteUserDialog />
    </div>
  );
}
