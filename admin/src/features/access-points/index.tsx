import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { getAPs, getControllers, getCampuses, getBuildings } from './slices/accessPointsSlice';
import { AccessPointsHeader } from './components/AccessPointsHeader';
import { AccessPointsMap } from './components/AccessPointsMap';
import { OverloadedAPsTable } from './components/OverloadedAPsTable';
import { ControllersTable } from './components/ControllersTable';
import { APsTable } from './components/APsTable';

export function AccessPointsFeature() {
  const dispatch = useAppDispatch();
  const {
    showControllerSection,
    aps,
    controllers,
    apsLoading,
    controllersLoading,
    locationsLoading,
  } = useAppSelector(state => state.accessPoints);

  // Initial load
  useEffect(() => {
    dispatch(getAPs());
    dispatch(getControllers());
    dispatch(getCampuses({ page: 1, size: 1000 }));
    dispatch(getBuildings({ page: 1, size: 1000 }));
  }, [dispatch]);

  const isInitialLoading = (apsLoading || controllersLoading || locationsLoading) && (aps.length === 0 || controllers.length === 0);

  if (isInitialLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-4 py-10 text-center text-gray-600">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AccessPointsHeader />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <AccessPointsMap />
        </div>
        <div className="col-span-4">
          <OverloadedAPsTable />
        </div>
      </div>

      {showControllerSection && (
        <ControllersTable />
      )}

      <APsTable />
    </div>
  );
}
