import { useLocation, useSearch } from 'wouter';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';

import { ReportsFilterBar } from './ReportsFilterBar';
import { UsersReportTab } from './tabs/UsersReportTab';
import { BandwidthReportTab } from './tabs/BandwidthReportTab';
import { InfrastructureReportTab } from './tabs/InfrastructureReportTab';
import { ViolationsReportTab } from './tabs/ViolationsReportTab';
import { SessionsReportTab } from './tabs/SessionsReportTab';
import { IncidentsReportTab } from './tabs/IncidentsReportTab';
import { LogsReportTab } from './tabs/LogsReportTab';

export const ReportsFeature = () => {
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const activeTab = searchParams.get('tab') || 'users';

  const handleTabChange = (value: string) => {
    setLocation(`/reports?tab=${value}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
          <p className="text-gray-500">Xem và xuất các báo cáo chi tiết về hệ thống WiFi</p>
        </div>
      </div>

      {activeTab !== 'users' && <ReportsFilterBar />}

      <Card className="overflow-hidden">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          {/* Main Content Areas mapped exactly to the URL query param */}
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
          
          <TabsContent value="incidents" className="p-6 m-0">
            <IncidentsReportTab />
          </TabsContent>
          
          <TabsContent value="logs" className="p-6 m-0">
            <LogsReportTab />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
