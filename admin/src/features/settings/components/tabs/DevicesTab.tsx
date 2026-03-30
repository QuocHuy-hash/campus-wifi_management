import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Server, Wifi, Plus, Edit, Trash2 } from 'lucide-react';
import { AppDispatch, RootState } from '../../../../stores/store';
import { 
  setSelectedControllerFilter, setControllerCampusFilter,
  setAddControllerDialogOpen, setEditControllerDialogOpen, setDeleteControllerDialogOpen, setSelectedController,
  setAddAPDialogOpen, setEditAPDialogOpen, setDeleteAPDialogOpen, setSelectedAP
} from '../../slices/devicesSlice';
import { AP, Controller } from '../../types';

export const DevicesTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { controllers, aps, selectedControllerFilter, controllerCampusFilter } = useSelector((state: RootState) => state.settings.devices);
  const campuses = useSelector((state: RootState) => state.settings.areas.campuses);

  const filteredControllers = useMemo(() => {
    if (controllerCampusFilter === 'all') return controllers;
    return controllers.filter(c => c.campusId === parseInt(controllerCampusFilter));
  }, [controllers, controllerCampusFilter]);

  const filteredAPs = useMemo(() => {
    if (!selectedControllerFilter) return aps;
    const selectedController = controllers.find(c => c.nasIdentifier === selectedControllerFilter);
    if (!selectedController) return aps;
    return aps.filter(ap => ap.controllerId === selectedController.id);
  }, [aps, controllers, selectedControllerFilter]);

  const handleControllerClick = (name: string) => {
    if (selectedControllerFilter === name) {
      dispatch(setSelectedControllerFilter(null));
    } else {
      dispatch(setSelectedControllerFilter(name));
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controller Management - Left */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Server size={20} className="text-blue-600" />
                Quản lý Controller
              </h3>
              <p className="text-sm text-gray-500 mt-1">Danh sách bộ điều khiển WiFi</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={controllerCampusFilter} onValueChange={(v) => dispatch(setControllerCampusFilter(v))}>
                <SelectTrigger className="w-[150px] h-8 text-xs">
                  <SelectValue placeholder="Lọc theo cơ sở" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả cơ sở</SelectItem>
                  {campuses.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id.toString()}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => dispatch(setAddControllerDialogOpen(true))} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus size={16} className="mr-1" />
                Thêm
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900">Tên</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900">IP</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900">Trạng thái</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 w-20"> Hành động </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredControllers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-gray-500 text-sm">
                      Không có Controller nào trong cơ sở này.
                    </td>
                  </tr>
                ) : filteredControllers.map((controller) => (
                  <tr 
                    key={controller.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedControllerFilter === controller.nasIdentifier 
                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleControllerClick(controller.nasIdentifier)}
                  >
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">
                      {controller.nasIdentifier}
                      {selectedControllerFilter === controller.nasIdentifier && (
                        <span className="ml-1 text-xs text-blue-600 font-normal">(Xem)</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-600 font-mono text-xs">{controller.ipAddress}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        controller.status === 'ONLINE' ? 'bg-green-100 text-green-800' : 
                        controller.status === 'WARNING' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {controller.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { dispatch(setSelectedController(controller)); dispatch(setEditControllerDialogOpen(true)); }}>
                          <Edit size={14} className="text-amber-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { dispatch(setSelectedController(controller)); dispatch(setDeleteControllerDialogOpen(true)); }}>
                          <Trash2 size={14} className="text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AP Management - Right */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Wifi size={20} className="text-green-600" />
                Quản lý AP
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedControllerFilter 
                  ? <span>Controller: <strong>{selectedControllerFilter}</strong> <Button variant="link" className="h-auto p-0 text-xs" onClick={() => dispatch(setSelectedControllerFilter(null))}>(Xem tất cả)</Button></span>
                  : "Tất cả thiết bị phát sóng"}
              </p>
            </div>
            <Button onClick={() => dispatch(setAddAPDialogOpen(true))} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus size={16} className="mr-1" />
              Thêm
            </Button>
          </div>

          <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900">Tên AP</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900">Vị trí</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900">Trạng thái</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 w-20"> Hành động </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAPs.length === 0 ? (
                   <tr>
                     <td colSpan={4} className="px-3 py-6 text-center text-gray-500 text-sm">
                       Không tìm thấy AP nào.
                     </td>
                   </tr>
                ) : filteredAPs.map((ap) => (
                  <tr key={ap.macAddress} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">{ap.apName}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{ap.modelName}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        ap.status === 'ONLINE' ? 'bg-green-100 text-green-800' :
                        ap.status === 'OFFLINE' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ap.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { dispatch(setSelectedAP(ap)); dispatch(setEditAPDialogOpen(true)); }}>
                          <Edit size={14} className="text-amber-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { dispatch(setSelectedAP(ap)); dispatch(setDeleteAPDialogOpen(true)); }}>
                          <Trash2 size={14} className="text-red-600" />
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
