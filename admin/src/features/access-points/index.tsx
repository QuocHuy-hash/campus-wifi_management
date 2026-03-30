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
  const { showControllerSection } = useAppSelector(state => state.accessPoints);

  // Initial load
  useEffect(() => {
    dispatch(getAPs());
    dispatch(getControllers());
    dispatch(getCampuses());
    dispatch(getBuildings());
  }, [dispatch]);

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
