import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Server } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { setSearchTerm, setSelectedBuilding, setSelectedControllerFilter } from '../slices/accessPointsSlice';
import { buildingFilters } from '@/data/mockData';
import { useMemo } from 'react';

export function APsTable() {
  const dispatch = useAppDispatch();
  const { 
    aps, 
    apsLoading, 
    searchTerm, 
    selectedBuilding, 
    selectedControllerFilter 
  } = useAppSelector(state => state.accessPoints);

  const filteredAPs = useMemo(() => {
    return aps.filter(ap => {
      const matchesSearch = ap.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ap.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBuilding = selectedBuilding === 'All' || 
                             ap.building === selectedBuilding ||
                             (selectedBuilding === 'Dĩ An' && ap.campusId === 1) ||
                             (selectedBuilding === 'Thủ Đức' && ap.campusId === 2) ||
                             (selectedBuilding === '227NVC' && ap.campusId === 3);

      const matchesController = !selectedControllerFilter || ap.controller === selectedControllerFilter;
      return matchesSearch && matchesBuilding && matchesController;
    });
  }, [aps, searchTerm, selectedBuilding, selectedControllerFilter]);

  return (
    <Card className="p-4">
      {/* Table Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[#1e3a5f]">Danh sách AP</h3>
          {selectedControllerFilter && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
              <Server size={12} />
              {selectedControllerFilter}
              <button 
                className="ml-1 hover:text-blue-900" 
                onClick={() => dispatch(setSelectedControllerFilter(null))}
              >
                ×
              </button>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Tìm kiếm</span>
            <div className="relative">
              <Input
                type="text"
                placeholder=""
                value={searchTerm}
                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                className="w-40 h-8 pr-8"
              />
              <Search size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <Select value={selectedBuilding} onValueChange={(val) => dispatch(setSelectedBuilding(val))}>
            <SelectTrigger className="w-28 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {buildingFilters.map(b => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Table - Read Only */}
      {apsLoading ? (
        <div className="p-8 text-center text-gray-500">Đang tải biểu đồ AP...</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Tên AP</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Vị trí</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Khu vực</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Uptime</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">IP / Model</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Controller</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Clients</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Tải (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAPs.map((ap) => (
                <tr key={ap.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        ap.status === 'Online' ? 'bg-green-500' : 
                        ap.status === 'Warning' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium">{ap.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{ap.location}</td>
                  <td className="px-4 py-3 text-gray-600">{ap.building}</td>
                  <td className="px-4 py-3 text-gray-600">{ap.uptime}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{ap.ipModel}</td>
                  <td className="px-4 py-3 text-gray-600">{ap.controller}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-medium text-blue-600">{ap.clients}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            ap.usagePercent > 80 ? 'bg-red-500' : 
                            ap.usagePercent > 60 ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${ap.usagePercent}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        ap.usagePercent > 80 ? 'text-red-600' : 
                        ap.usagePercent > 60 ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {ap.usagePercent}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAPs.length === 0 && (
            <div className="p-4 text-center text-gray-500">Không tìm thấy AP nào</div>
          )}
        </div>
      )}
    </Card>
  );
}
