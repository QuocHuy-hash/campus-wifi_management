import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertTriangle } from 'lucide-react';
import { RootState, AppDispatch } from '@/stores/store';
import { fetchIncidents } from '../../slices/incidentsReportSlice';

export const IncidentsReportTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: mockIncidentData, status } = useSelector((state: RootState) => state.reports.incidents);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchIncidents());
    }
  }, [status, dispatch]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Báo cáo giám sát sự cố</h3>
      
      {/* List */}
      <div className="space-y-3">
        {mockIncidentData.map((item, idx) => (
          <div key={idx} className="p-4 bg-white border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                item.priority === 'high' ? 'bg-red-100' :
                item.priority === 'medium' ? 'bg-amber-100' : 'bg-gray-100'
              }`}>
                <AlertTriangle size={20} className={
                  item.priority === 'high' ? 'text-red-600' :
                  item.priority === 'medium' ? 'text-amber-600' : 'text-gray-600'
                } />
              </div>
              <div>
                <p className="font-medium">{item.ap}</p>
                <p className="text-sm text-gray-600">{item.type}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              item.status === 'pending' ? 'bg-red-100 text-red-700' :
              item.status === 'processing' ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>
              {item.status === 'pending' ? 'Chưa xử lý' :
               item.status === 'processing' ? 'Đang xử lý' : 'Đã xử lý'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
