import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Map, MapPin, Building2, Plus, Edit, Trash2, X } from 'lucide-react';
import { AppDispatch, RootState } from '../../../../stores/store';
import { 
  setCampusFilter, setBuildingFilter,
  setAddCampusDialogOpen, setEditCampusDialogOpen, setDeleteCampusDialogOpen, setSelectedCampus,
  setAddBuildingDialogOpen, setEditBuildingDialogOpen, setDeleteBuildingDialogOpen, setSelectedBuilding,
  setAddLocationDialogOpen, setEditLocationDialogOpen, setDeleteLocationDialogOpen, setSelectedLocation
} from '../../slices/areasSlice';
import { Campus, Building, Location } from '../../types';

export const AreasTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    campuses, buildings, locations,
    selectedCampusFilter, selectedBuildingFilter
  } = useSelector((state: RootState) => state.settings.areas);

  const filteredBuildings = useMemo(() => {
    if (selectedCampusFilter === 'all') return buildings;
    return buildings.filter(b => b.campusId === selectedCampusFilter);
  }, [buildings, selectedCampusFilter]);

  const filteredLocations = useMemo(() => {
    if (selectedBuildingFilter === 'all') {
      if (selectedCampusFilter === 'all') return locations;
      const buildingIdsInCampus = buildings.filter(b => b.campusId === selectedCampusFilter).map(b => b.id);
      return locations.filter(l => buildingIdsInCampus.includes(l.buildingId));
    }
    return locations.filter(l => l.buildingId === selectedBuildingFilter);
  }, [locations, selectedBuildingFilter, selectedCampusFilter, buildings]);

  const getCampusName = (id: number) => campuses.find(c => c.id === id)?.name || 'Unknown';
  const getBuildingName = (id: number) => buildings.find(b => b.id === id)?.name || 'Unknown';
  const getBuildingCountByCampus = (campusId: number) => buildings.filter(b => b.campusId === campusId).length;

  return (
    <div className="p-6 space-y-6">
      {/* Campus Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Map size={20} className="text-blue-600" />
              Quản lý Cơ sở (Campus)
            </h3>
            <p className="text-sm text-gray-500 mt-1">Quản lý các cơ sở/khuôn viên của trường</p>
          </div>
          <Button onClick={() => dispatch(setAddCampusDialogOpen(true))} className="bg-blue-600 hover:bg-blue-700">
            <Plus size={18} className="mr-2" />
            Thêm cơ sở
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {campuses.map((campus) => (
            <div 
              key={campus.id} 
              className={`p-4 bg-white rounded-lg border-2 cursor-pointer transition-all ${
                selectedCampusFilter === campus.id 
                  ? 'border-blue-500 shadow-md ring-2 ring-blue-100' 
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
              }`}
              onClick={() => dispatch(setCampusFilter(selectedCampusFilter === campus.id ? 'all' : campus.id))}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedCampusFilter === campus.id ? 'bg-blue-500' : 'bg-blue-100'
                  }`}>
                    <MapPin size={20} className={selectedCampusFilter === campus.id ? 'text-white' : 'text-blue-600'} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{campus.name}</h4>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{campus.code}</span>
                  </div>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" onClick={() => { dispatch(setSelectedCampus(campus)); dispatch(setEditCampusDialogOpen(true)); }}>
                    <Edit size={16} className="text-amber-600" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { dispatch(setSelectedCampus(campus)); dispatch(setDeleteCampusDialogOpen(true)); }}>
                    <Trash2 size={16} className="text-red-600" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-2">{campus.address}</p>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">{campus.description}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  selectedCampusFilter === campus.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  {getBuildingCountByCampus(campus.id)} tòa nhà
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buildings & Locations Grid */}
      <div className="border-t pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Buildings Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building2 size={20} className="text-blue-600" />
                Quản lý Tòa nhà
              </h3>
              <p className="text-sm text-gray-500 mt-1">Quản lý các tòa nhà trong từng cơ sở</p>
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={selectedCampusFilter === 'all' ? 'all' : String(selectedCampusFilter)}
                onValueChange={(v) => dispatch(setCampusFilter(v === 'all' ? 'all' : Number(v)))}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Lọc theo cơ sở" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả cơ sở</SelectItem>
                  {campuses.map((campus) => (
                    <SelectItem key={campus.id} value={String(campus.id)}>{campus.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => dispatch(setAddBuildingDialogOpen(true))} className="bg-blue-600 hover:bg-green-700">
                <Plus size={18} className="mr-2" />
                Thêm tòa nhà
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 top-0 sticky">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Tên tòa nhà</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Cơ sở</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Số tầng</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredBuildings.map((building, index) => (
                  <tr
                    key={building.id}
                    onClick={() => dispatch(setBuildingFilter(selectedBuildingFilter === building.id ? 'all' : building.id))}
                    className={`border-b border-gray-100 transition-colors cursor-pointer ${
                      selectedBuildingFilter === building.id 
                        ? 'bg-blue-100 border-l-4 border-l-blue-600' 
                        : index % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 hover:bg-blue-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-gray-400" />
                        {building.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{getCampusName(building.campusId)}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{building.totalFloors} tầng</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => { dispatch(setSelectedBuilding(building)); dispatch(setEditBuildingDialogOpen(true)); }}>
                          <Edit size={16} className="text-amber-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { dispatch(setSelectedBuilding(building)); dispatch(setDeleteBuildingDialogOpen(true)); }}>
                          <Trash2 size={16} className="text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Locations Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin size={20} className="text-blue-600" />
                Quản lý Địa điểm
                {selectedBuildingFilter !== 'all' && (
                  <span className="text-sm font-normal text-blue-600">
                    - {getBuildingName(selectedBuildingFilter)}
                  </span>
                )}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {selectedBuildingFilter !== 'all' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => dispatch(setBuildingFilter('all'))}
                  className="text-gray-600"
                >
                  <X size={16} className="mr-1" />
                  Bỏ lọc
                </Button>
              )}
              <Button onClick={() => dispatch(setAddLocationDialogOpen(true))} className="bg-blue-600 hover:bg-green-700">
                <Plus size={18} className="mr-2" />
                Thêm địa điểm
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 top-0 sticky">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Tên địa điểm</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Tòa nhà</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredLocations.map((location, index) => (
                  <tr
                    key={location.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        {location.name}
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-mono text-xs">{location.code}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {getBuildingName(location.buildingId)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { dispatch(setSelectedLocation(location)); dispatch(setEditLocationDialogOpen(true)); }}>
                          <Edit size={16} className="text-amber-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { dispatch(setSelectedLocation(location)); dispatch(setDeleteLocationDialogOpen(true)); }}>
                          <Trash2 size={16} className="text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
