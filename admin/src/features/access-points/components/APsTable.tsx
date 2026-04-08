import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { setSearchTerm, setSelectedBuilding } from '../slices/accessPointsSlice';
import { useMemo } from 'react';
import { formatDate, formatDateTime } from '@/utils/dateTimeFormat';

export function APsTable() {
  const dispatch = useAppDispatch();
  const {
    aps,
    apsLoading,
    searchTerm,
    selectedBuilding,
    selectedControllerFilter,
    controllers,
    buildings
  } = useAppSelector(state => state.accessPoints);

  const selectedController = useMemo(
    () => controllers.find((controller) => controller.nasIdentifier === selectedControllerFilter),
    [controllers, selectedControllerFilter],
  );

  // Lọc AP theo từ khoá tìm kiếm và bộ lọc đã chọn
  const filteredAPs = useMemo(() => {
    return aps.filter(ap => {
      const matchesSearch = ap.apName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ap.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ap.macAddress.toLowerCase().includes(searchTerm.toLowerCase());

      // Bộ lọc theo building
      const matchesBuilding = selectedBuilding === 'all' || ap.buildingId?.toString() === selectedBuilding;

      // Bộ lọc theo controller (được chọn ở bảng Controller)
      const matchesController = (() => {
        if (!selectedControllerFilter) return true;

        const apWithExtra = ap as typeof ap & {
          controllerId?: number | string;
          nasIdentifier?: string;
          controllerNasIdentifier?: string;
        };

        const apControllerCandidates = [
          ap.controller,
          apWithExtra.nasIdentifier,
          apWithExtra.controllerNasIdentifier,
          apWithExtra.controllerId != null ? String(apWithExtra.controllerId) : null,
        ]
          .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
          .map((value) => value.trim().toLowerCase());

        const selectedCandidates = [
          selectedControllerFilter,
          selectedController?.nasIdentifier,
          selectedController?.id != null ? String(selectedController.id) : null,
        ]
          .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
          .map((value) => value.trim().toLowerCase());

        return apControllerCandidates.some((candidate) => selectedCandidates.includes(candidate));
      })();

      return matchesSearch && matchesBuilding && matchesController;
    });
  }, [aps, searchTerm, selectedBuilding, selectedControllerFilter, selectedController]);

  return (
    <Card className="p-4">
      {/* Thanh công cụ tìm kiếm */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[#1e3a5f]">Danh sách AP</h3>
          <span className="text-xs text-gray-500">({filteredAPs.length} thiết bị)</span>
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
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {buildings.map(building => (
                <SelectItem key={building.id} value={building.id.toString()}>{building.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Bảng Access Points - cập nhật theo model Backend */}
      {apsLoading ? (
        <div className="p-8 text-center text-gray-500">Đang tải danh sách AP...</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Tên AP</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">MAC Address</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Model</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Mô tả</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAPs.map((ap) => (
                <tr key={ap.macAddress} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="font-medium">{ap.apName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{ap.macAddress}</td>
                  <td className="px-4 py-3 text-gray-600">{ap.modelName}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{ap.description || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {formatDate(ap.createdAt)}
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
