import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSearch } from 'wouter';
import { AppDispatch } from '../../stores/store';

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
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const currentTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    dispatch(fetchAdmins());
    dispatch(fetchRoles());
    dispatch(fetchGroups());
    dispatch(fetchResources());
    dispatch(fetchAreas());
    dispatch(fetchDevices());
    dispatch(fetchIntegrations());
    dispatch(fetchLogs());
  }, [dispatch]);

  const renderContent = () => {
    switch (currentTab) {
      case 'overview':
        return <SystemOverviewTab />;
      case 'access':
        return <SecurityTab />;
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
