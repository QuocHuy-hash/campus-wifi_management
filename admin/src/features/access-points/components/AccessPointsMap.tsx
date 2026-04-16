import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Server } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { setSelectedCampus, setSelectedArea, toggleControllerSection, getCampuses, getBuildings } from '../slices/accessPointsSlice';
import { Pagination } from '@/components/ui/pagination';

export function AccessPointsMap() {
  const dispatch = useAppDispatch();
  const { selectedCampus, selectedArea, showControllerSection, campuses, buildings, campusesPagination } = useAppSelector(state => state.accessPoints);

  const handleCampusPageChange = (page: number) => {
    dispatch(getCampuses({ page, size: 1000 }));
  };

  const handleCampusPageSizeChange = (size: number) => {
    dispatch(getCampuses({ page: 1, size }));
  };

  // Get buildings for selected campus
  const filteredBuildings = selectedCampus && selectedCampus !== 'all'
    ? buildings.filter(b => b.campusId.toString() === selectedCampus)
    : buildings;

  return (
    <Card className="p-4 h-full">
      {/* Map Header with Filters */}
      <div className="flex items-center gap-4 mb-4">
        <h3 className="text-sm font-semibold text-[#1e3a5f]">Bản đồ bố trí AP</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Chọn campus</span>
          <Select value={selectedCampus} onValueChange={(val) => dispatch(setSelectedCampus(val))}>
            <SelectTrigger className="w-28 h-8">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {Array.isArray(campuses) && campuses.map(campus => (
                <SelectItem key={campus.id} value={campus.id.toString()}>{campus.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Campus Pagination */}
        {campusesPagination && campusesPagination.totalPages > 1 && (
          <div className="mt-2">
            <Pagination
              currentPage={campusesPagination.current}
              pageSize={campusesPagination.size}
              totalItems={campusesPagination.total}
              totalPages={campusesPagination.pages}
              onPageChange={handleCampusPageChange}
              onPageSizeChange={handleCampusPageSizeChange}
              showPageSizeSelector={false}
              showQuickJumper={false}
            />
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Chọn khu nhà</span>
          <Select value={selectedArea} onValueChange={(val) => dispatch(setSelectedArea(val))}>
            <SelectTrigger className="w-28 h-8">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {Array.isArray(filteredBuildings) && filteredBuildings.map(building => (
                <SelectItem key={building.id} value={building.id.toString()}>{building.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
            onClick={() => dispatch(toggleControllerSection())}
          >
            <Server size={16} className="mr-1" />
            {showControllerSection ? 'Ẩn Controller' : 'Xem Controller'}
          </Button>
        </div>
      </div>

      {/* Scale indicator */}
      <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
        <span>0</span>
        <div className="w-24 h-1 bg-gray-300"></div>
        <span>10</span>
      </div>

      {/* Map Placeholder - World Map Style */}
      <div className="relative bg-blue-50 rounded-lg h-52 overflow-hidden">
        {/* Simple world map representation */}
        <svg viewBox="0 0 800 400" className="w-full h-full opacity-60">
          <ellipse cx="400" cy="200" rx="350" ry="150" fill="#a5b4fc" opacity="0.3"/>
          <ellipse cx="200" cy="150" rx="80" ry="60" fill="#6366f1" opacity="0.5"/>
          <ellipse cx="350" cy="180" rx="100" ry="80" fill="#6366f1" opacity="0.5"/>
          <ellipse cx="550" cy="150" rx="120" ry="70" fill="#6366f1" opacity="0.5"/>
          <ellipse cx="650" cy="220" rx="60" ry="50" fill="#6366f1" opacity="0.5"/>
          <ellipse cx="250" cy="280" rx="70" ry="40" fill="#6366f1" opacity="0.5"/>
        </svg>
        
        {/* Map Marker */}
        <div className="absolute top-1/2 right-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <MapPin size={32} className="text-red-500 fill-red-500" />
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
          </div>
        </div>
      </div>
    </Card>
  );
}
