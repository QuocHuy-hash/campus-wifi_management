import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Server, Settings, Wifi, Activity } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { setSelectedControllerFilter } from '../slices/accessPointsSlice';
import { Controller } from '../types';

export function ControllersTable() {
  const [, setLocation] = useLocation();
  const dispatch = useAppDispatch();
  const { controllers, aps, selectedControllerFilter, controllersLoading } = useAppSelector(state => state.accessPoints);

  // Helpers to get counts directly from the current Redux AP state
  const getAPCountByController = (controllerName: string) => {
    return aps.filter(ap => ap.controller === controllerName).length;
  };

  const getTotalClientsByController = (controllerName: string) => {
    return aps.filter(ap => ap.controller === controllerName).reduce((sum, ap) => sum + ap.clients, 0);
  };

  const getStatusColor = (status: Controller['status']) => {
    switch (status) {
      case 'Online': return 'bg-green-100 text-green-800';
      case 'Offline': return 'bg-red-100 text-red-800';
      case 'Warning': return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Server size={20} className="text-[#1e3a5f]" />
          <h3 className="text-sm font-semibold text-[#1e3a5f]">Danh sách Controller</h3>
          {selectedControllerFilter && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              Đang lọc: {selectedControllerFilter}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedControllerFilter && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-gray-600"
              onClick={() => dispatch(setSelectedControllerFilter(null))}
            >
              Xóa bộ lọc
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-[#1e3a5f] border-[#1e3a5f]"
            onClick={() => setLocation('/settings?tab=devices')}
          >
            <Settings size={14} className="mr-1" />
            Quản lý Controller
          </Button>
        </div>
      </div>
      
      {controllersLoading ? (
        <div className="p-8 text-center text-gray-500">Đang tải dữ liệu Controller...</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Tên Controller</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Địa chỉ IP</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Version</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Vị trí</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Trạng thái</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Số AP</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Clients</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {controllers.map((controller) => (
                <tr 
                  key={controller.id} 
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedControllerFilter === controller.name ? 'bg-blue-50 hover:bg-blue-100' : ''
                  }`}
                  onClick={() => dispatch(
                    setSelectedControllerFilter(selectedControllerFilter === controller.name ? null : controller.name)
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        controller.status === 'Online' ? 'bg-green-100' : 
                        controller.status === 'Warning' ? 'bg-amber-100' : 'bg-red-100'
                      }`}>
                        <Server size={16} className={
                          controller.status === 'Online' ? 'text-green-600' : 
                          controller.status === 'Warning' ? 'text-amber-600' : 'text-red-600'
                        } />
                      </div>
                      <span className="font-medium">{controller.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-600">{controller.ipAddress}</td>
                  <td className="px-4 py-3 text-gray-600">{controller.version}</td>
                  <td className="px-4 py-3 text-gray-600">{controller.location}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(controller.status)}`}>
                      {controller.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Wifi size={14} className="text-blue-500" />
                      <span className="font-medium">{getAPCountByController(controller.name)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Activity size={14} className="text-green-500" />
                      <span className="font-medium">{getTotalClientsByController(controller.name)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-2 italic">
        * Nhấn vào Controller để lọc danh sách AP theo Controller đó
      </p>
    </Card>
  );
}
