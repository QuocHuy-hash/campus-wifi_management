import { DashboardStatsBar } from './DashboardStatsBar';
import { DashboardCharts } from './DashboardCharts';
import { DashboardSidebar } from './DashboardSidebar';

export const DashboardFeature = () => {
  return (
    <div className="space-y-4">
      <DashboardStatsBar />

      <div className="grid grid-cols-12 gap-4">
        <DashboardCharts />
        <DashboardSidebar />
      </div>
    </div>
  );
};
