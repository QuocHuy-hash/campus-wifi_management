import { useLocation, useSearch } from 'wouter';
import { useSelector } from 'react-redux';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { RootState } from '@/stores/store';

import { ReportsFilterBar } from './ReportsFilterBar';
import { UsersReportTab } from './tabs/UsersReportTab';
import { BandwidthReportTab } from './tabs/BandwidthReportTab';
import { InfrastructureReportTab } from './tabs/InfrastructureReportTab';
import { ViolationsReportTab } from './tabs/ViolationsReportTab';
import { SessionsReportTab } from './tabs/SessionsReportTab';
import { IncidentsReportTab } from './tabs/IncidentsReportTab';
import { LogsReportTab } from './tabs/LogsReportTab';
import { OverviewReportTab } from './tabs/OverviewReportTab';
import { SessionTimelineReportTab } from './tabs/SessionTimelineReportTab';
import { UserNetworkIncidentsReportTab } from './tabs/UserNetworkIncidentsReportTab';

export const ReportsFeature = () => {
  const [, setLocation] = useLocation();
  const reports = useSelector((state: RootState) => state.reports);
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const activeTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (value: string) => {
    setLocation(`/reports?tab=${value}`);
  };

  const isCurrentTabLoading = (() => {
    switch (activeTab) {
      case 'overview':
        return [
          reports.users.status,
          reports.bandwidth.status,
          reports.infrastructure.status,
          reports.violations.status,
          reports.sessions.status,
          reports.incidents.status,
          reports.logs.status,
        ].some((status) => status === 'loading');
      case 'users':
        return reports.users.status === 'loading';
      case 'bandwidth':
        return reports.bandwidth.status === 'loading';
      case 'infrastructure':
        return reports.infrastructure.status === 'loading';
      case 'violations':
        return reports.violations.status === 'loading';
      case 'sessions':
      case 'session-timeline':
        return reports.sessions.status === 'loading';
      case 'user-network-incidents':
        return reports.incidents.status === 'loading' || reports.users.status === 'loading' || reports.violations.status === 'loading' || reports.logs.status === 'loading';
      case 'incidents':
        return reports.incidents.status === 'loading';
      case 'logs':
        return reports.logs.status === 'loading';
      default:
        return false;
    }
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
          <p className="text-gray-500">Xem và xuất các báo cáo chi tiết về hệ thống WiFi</p>
        </div>
      </div>

      {activeTab !== 'users' && activeTab !== 'overview' && <ReportsFilterBar />}

      {isCurrentTabLoading ? (
        <Card className="p-10 text-center text-gray-600">
          Đang tải dữ liệu...
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
          {/* Main Content Areas mapped exactly to the URL query param */}
          <TabsContent value="overview" className="p-0 m-0">
            <OverviewReportTab />
          </TabsContent>

          <TabsContent value="users" className="p-2 m-0">
            <UsersReportTab />
          </TabsContent>
          
          <TabsContent value="bandwidth" className="p-6 m-0">
            <BandwidthReportTab />
          </TabsContent>
          
          <TabsContent value="infrastructure" className="p-2 m-0">
            <InfrastructureReportTab />
          </TabsContent>
          
          <TabsContent value="violations" className="p-6 m-0">
            <ViolationsReportTab />
          </TabsContent>
          
          <TabsContent value="sessions" className="p-6 m-0">
            <SessionsReportTab />
          </TabsContent>

          <TabsContent value="session-timeline" className="p-6 m-0">
            <SessionTimelineReportTab />
          </TabsContent>

          <TabsContent value="user-network-incidents" className="p-6 m-0">
            <UserNetworkIncidentsReportTab />
          </TabsContent>
          
          <TabsContent value="incidents" className="p-6 m-0">
            <IncidentsReportTab />
          </TabsContent>
          
          <TabsContent value="logs" className="p-6 m-0">
            <LogsReportTab />
          </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
};
