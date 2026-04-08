import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { AppDispatch, RootState } from '../../../../stores/store';
import { setLogFilter, setLogDetailDialogOpen, setSelectedLog } from '../../slices/logsSlice';
import { LogEntry } from '../../types';
import { formatDate, formatDateTime } from '@/utils/dateTimeFormat';

export const LogsTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { logs, logFilter } = useSelector((state: RootState) => state.settings.logs);

  const filteredLogs = useMemo(() => {
    if (logFilter === 'all') return logs;
    return logs.filter(log => log.type === logFilter);
  }, [logs, logFilter]);

  const handleViewLog = (log: LogEntry) => {
    dispatch(setSelectedLog(log));
    dispatch(setLogDetailDialogOpen(true));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý Nhật ký (Logs)</h3>
        
        {/* Log Filter */}
        <div className="flex gap-2 mb-4">
          <Button 
            variant={logFilter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => dispatch(setLogFilter('all'))}
            className={logFilter === 'all' ? 'bg-blue-600' : ''}
          >
            Tất cả
          </Button>
          <Button 
            variant={logFilter === 'access' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => dispatch(setLogFilter('access'))}
            className={logFilter === 'access' ? 'bg-blue-600' : ''}
          >
            Truy cập
          </Button>
          <Button 
            variant={logFilter === 'error' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => dispatch(setLogFilter('error'))}
            className={logFilter === 'error' ? 'bg-blue-600' : ''}
          >
            Lỗi
          </Button>
          <Button 
            variant={logFilter === 'config' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => dispatch(setLogFilter('config'))}
            className={logFilter === 'config' ? 'bg-blue-600' : ''}
          >
            Cấu hình
          </Button>
          <Button 
            variant={logFilter === 'account' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => dispatch(setLogFilter('account'))}
            className={logFilter === 'account' ? 'bg-blue-600' : ''}
          >
            Tài khoản
          </Button>
        </div>
        
        {/* Logs Table */}
        <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Thời gian</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Người dùng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Hành động</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Loại</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr
                  key={log.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">{formatDateTime(log.timestamp)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{log.user}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.action}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      log.type === 'access' ? 'bg-blue-100 text-blue-800' :
                      log.type === 'error' ? 'bg-red-100 text-red-800' :
                      log.type === 'config' ? 'bg-amber-100 text-amber-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {log.type === 'access' ? 'Truy cập' :
                       log.type === 'error' ? 'Lỗi' :
                       log.type === 'config' ? 'Cấu hình' : 'Tài khoản'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="ghost" size="sm" onClick={() => handleViewLog(log)}>
                      <Eye size={18} className="text-blue-600" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
