import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Server, Wifi, Users, Activity } from 'lucide-react';
import { RootState, AppDispatch } from '@/stores/store';
import { fetchControllers, fetchApAccess, setSelectedController } from '../../slices/infrastructureReportSlice';

export const InfrastructureReportTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { controllers, apAccessList, selectedController, status } = useSelector((state: RootState) => state.reports.infrastructure);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchControllers());
      dispatch(fetchApAccess());
    }
  }, [status, dispatch]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Tổng Controller</p>
              <p className="text-2xl font-bold">{controllers.length}</p>
            </div>
            <Server size={28} className="text-blue-200" />
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Tổng AP</p>
              <p className="text-2xl font-bold">{controllers.reduce((sum, c) => sum + c.apCount, 0)}</p>
            </div>
            <Wifi size={28} className="text-green-200" />
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm">Tổng Clients</p>
              <p className="text-2xl font-bold">{controllers.reduce((sum, c) => sum + c.clients, 0).toLocaleString()}</p>
            </div>
            <Users size={28} className="text-cyan-200" />
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">CPU TB</p>
              <p className="text-2xl font-bold">
                {controllers.length > 0 
                  ? Math.round(controllers.reduce((sum, c) => sum + c.cpu, 0) / controllers.length) 
                  : 0}%
              </p>
            </div>
            <Activity size={28} className="text-amber-200" />
          </div>
        </Card>
      </div>

      {/* Controllers Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Server size={20} className="text-blue-600" />
            Bộ điều khiển WiFi (Controllers)
          </h3>
          <p className="text-sm text-gray-500">Click vào controller để xem danh sách AP</p>
        </div>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tên Controller</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Model/Firmware</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vị trí</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Số AP</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Clients</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">CPU/Memory</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {controllers.map((row) => (
                  <tr 
                    key={row.id} 
                    className={`cursor-pointer transition-colors ${selectedController === row.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
                    onClick={() => dispatch(setSelectedController(selectedController === row.id ? null : row.id))}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${selectedController === row.id ? 'bg-blue-500' : 'bg-gray-300'}`} />
                        <div>
                          <div className="font-medium text-sm">{row.name}</div>
                          <div className="text-xs text-gray-500">{row.ip}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="text-gray-900">{row.model}</div>
                      <div className="text-xs text-gray-500">v{row.firmware}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.location}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{row.apCount}</td>
                    <td className="px-4 py-3 text-sm text-right">{row.clients.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <div className={`text-xs ${row.cpu > 80 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                            CPU: {row.cpu}%
                          </div>
                          <div className={`text-xs ${row.memory > 80 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                            Mem: {row.memory}%
                          </div>
                        </div>
                        <div className="w-12 space-y-1">
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${row.cpu > 80 ? 'bg-red-500' : row.cpu > 60 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${row.cpu}%` }} />
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${row.memory > 80 ? 'bg-red-500' : row.memory > 60 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${row.memory}%` }} />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Access Points Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Wifi size={20} className="text-green-600" />
            Điểm phát WiFi (Access Points)
            {selectedController && (
              <span className="text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                của {selectedController}
              </span>
            )}
          </h3>
          {selectedController && (
            <Button size="sm" variant="outline" onClick={() => dispatch(setSelectedController(null))}>
              Xem tất cả AP
            </Button>
          )}
        </div>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tên AP</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vị trí</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Trạng thái</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Lượt truy cập</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Client TB</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">% Sử dụng</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {apAccessList
                  .filter(ap => !selectedController || ap.controllerId === selectedController)
                  .map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{row.apName}</div>
                      {!selectedController && <div className="text-xs text-gray-400">{row.controllerId}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.location}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        row.status === 'online' ? 'bg-green-100 text-green-700' :
                        row.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          row.status === 'online' ? 'bg-green-500' :
                          row.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        {row.status === 'online' ? 'Online' : row.status === 'warning' ? 'Cảnh báo' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">{row.totalAccess.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right">{row.avgClients}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              row.usage > 80 ? 'bg-red-500' : row.usage > 60 ? 'bg-amber-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${row.usage}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${
                          row.usage > 80 ? 'text-red-600' : row.usage > 60 ? 'text-amber-600' : 'text-green-600'
                        }`}>{row.usage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedController && apAccessList.filter(ap => ap.controllerId === selectedController).length === 0 && (
            <div className="p-8 text-center text-gray-500">Không có AP nào thuộc controller này</div>
          )}
        </Card>
      </div>
    </div>
  );
};
