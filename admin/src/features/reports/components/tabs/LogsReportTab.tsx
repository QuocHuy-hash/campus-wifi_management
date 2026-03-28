import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { RootState, AppDispatch } from '@/stores/store';
import { fetchSystemLogs } from '../../slices/logsReportSlice';

export const LogsReportTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: mockLogs, status } = useSelector((state: RootState) => state.reports.logs);
  
  // Local state is fine for simple view filters on this tab 
  const [levelFilter, setLevelFilter] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSystemLogs());
    }
  }, [status, dispatch]);

  const filteredLogs = levelFilter 
    ? mockLogs.filter(l => l.level === levelFilter)
    : mockLogs;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Nhật ký hệ thống</h3>
      
      {/* Quick filters */}
      <div className="flex gap-2">
        <Button 
          variant={levelFilter === 'INFO' ? 'default' : 'outline'} 
          size="sm" 
          className={levelFilter === 'INFO' ? 'bg-blue-600' : 'bg-blue-50 border-blue-200 text-blue-700'}
          onClick={() => setLevelFilter(levelFilter === 'INFO' ? null : 'INFO')}
        >
          INFO
        </Button>
        <Button 
          variant={levelFilter === 'WARNING' ? 'default' : 'outline'} 
          size="sm" 
          className={levelFilter === 'WARNING' ? 'bg-amber-600' : 'bg-amber-50 border-amber-200 text-amber-700'}
          onClick={() => setLevelFilter(levelFilter === 'WARNING' ? null : 'WARNING')}
        >
          WARNING
        </Button>
        <Button 
          variant={levelFilter === 'ERROR' ? 'default' : 'outline'} 
          size="sm" 
          className={levelFilter === 'ERROR' ? 'bg-red-600' : 'bg-red-50 border-red-200 text-red-700'}
          onClick={() => setLevelFilter(levelFilter === 'ERROR' ? null : 'ERROR')}
        >
          ERROR
        </Button>
      </div>
      
      {/* Log entries */}
      <div className="font-mono text-sm bg-gray-900 text-gray-100 p-4 rounded-lg max-h-96 overflow-auto">
        {filteredLogs.map((log, idx) => (
          <p key={idx} className="text-blue-400">
            [{log.time}] <span className={
              log.level === 'INFO' ? 'text-green-400' :
              log.level === 'WARNING' ? 'text-amber-400' : 'text-red-400'
            }>{log.level}</span>  {log.message}
          </p>
        ))}
        {filteredLogs.length === 0 && (
          <p className="text-gray-500 text-center py-4">Không có nhật ký hệ thống</p>
        )}
      </div>
    </div>
  );
};
