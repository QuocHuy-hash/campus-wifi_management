import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearch } from 'wouter';
import { AppDispatch, RootState } from '../../stores/store';

import { fetchAdmins, fetchRoles } from './slices/adminSlice';
import { fetchAreas } from './slices/areasSlice';
import { fetchDevices } from './slices/devicesSlice';
import { fetchIntegrations } from './slices/integrationsSlice';
import { fetchGroups, fetchResources } from './slices/securitySlice';
import { fetchLogs } from './slices/logsSlice';

import { AdminUsersTab } from './components/tabs/AdminUsersTab';
import { AreasTab } from './components/tabs/AreasTab';
import { DevicesTab } from './components/tabs/DevicesTab';
import { IntegrationsTab } from './components/tabs/IntegrationsTab';
import { SecurityTab } from './components/tabs/SecurityTab';
import { AccessControlTab } from './components/tabs/AccessControlTab';
import { LogsTab } from './components/tabs/LogsTab';
import { SystemOverviewTab } from './components/tabs/SystemOverviewTab';
import { AlertsConfigTab } from './components/tabs/AlertsConfigTab';

import { AdminDialogs } from './components/dialogs/AdminDialogs';
import { AreasDialogs } from './components/dialogs/AreasDialogs';
import { DevicesDialogs } from './components/dialogs/DevicesDialogs';
import { IntegrationsDialogs } from './components/dialogs/IntegrationsDialogs';
import { SecurityDialogs } from './components/dialogs/SecurityDialogs';
import { LogsDialogs } from './components/dialogs/LogsDialogs';

export const SettingsFeature = () => {
  const dispatch = useDispatch<AppDispatch>();
  const adminStatus = useSelector((state: RootState) => state.settings.admin.status);
  const securityStatus = useSelector((state: RootState) => state.settings.security.status);
  const areasStatus = useSelector((state: RootState) => state.settings.areas.status);
  const devicesStatus = useSelector((state: RootState) => state.settings.devices.status);
  const integrationsStatus = useSelector((state: RootState) => state.settings.integrations.status);
  const logsStatus = useSelector((state: RootState) => state.settings.logs.status);
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const currentTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    dispatch(fetchAdmins());
    dispatch(fetchRoles());
    dispatch(fetchGroups());
    dispatch(fetchResources());
    dispatch(fetchAreas({ page: 1, size: 1000 }));
    dispatch(fetchDevices());
    dispatch(fetchIntegrations());
    dispatch(fetchLogs());
  }, [dispatch]);

  const getCurrentTabLoading = () => {
    switch (currentTab) {
      case 'overview':
        return (
          adminStatus === 'loading'
          || securityStatus === 'loading'
          || areasStatus === 'loading'
          || devicesStatus === 'loading'
          || integrationsStatus === 'loading'
          || logsStatus === 'loading'
        );
      case 'access':
      case 'security':
        return securityStatus === 'loading';
      case 'users':
        return adminStatus === 'loading';
      case 'areas':
        return areasStatus === 'loading';
      case 'devices':
        return devicesStatus === 'loading';
      case 'technical':
        return integrationsStatus === 'loading';
      case 'logs':
        return logsStatus === 'loading';
      default:
        return false;
    }
  };

  const isCurrentTabLoading = getCurrentTabLoading();

  const renderContent = () => {
    if (isCurrentTabLoading) {
      return (
        <div className="p-6">
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-10 text-center text-gray-600">
            Đang tải dữ liệu...
          </div>
        </div>
      );
    }

    switch (currentTab) {
      case 'overview':
        return <SystemOverviewTab />;
      case 'access':
        return <AccessControlTab />;
      case 'users':
        return <AdminUsersTab />;
      case 'areas':
        return <AreasTab />;
      case 'devices':
        return <DevicesTab />;
      case 'technical':
        return <IntegrationsTab />;
      case 'security':
        return <SecurityTab />;
      case 'logs':
        return <LogsTab />;
      case 'alerts':
        return <AlertsConfigTab />;
      default:
        return <SystemOverviewTab />;
    }
  };

  return (
    <div className="w-full">
      {renderContent()}

      {/* Global Dialogs */}
      <AdminDialogs />
      <AreasDialogs />
      <DevicesDialogs />
      <IntegrationsDialogs />
      <SecurityDialogs />
      <LogsDialogs />
    </div>
  );
};

export default SettingsFeature;
