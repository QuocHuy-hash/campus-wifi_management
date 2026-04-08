import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/stores/store';
import { fetchViolations } from '../../slices/violationsReportSlice';
import { formatDate, formatDateTime } from '@/utils/dateTimeFormat';

export const ViolationsReportTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: mockViolationData, status } = useSelector((state: RootState) => state.reports.violations);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchViolations());
    }
  }, [status, dispatch]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Báo cáo vi phạm chính sách</h3>
      
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div>
              <p className="text-2xl font-bold text-red-600">4</p>
              <p className="text-sm text-gray-600">Nghiêm trọng</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <div>
              <p className="text-2xl font-bold text-amber-600">5</p>
              <p className="text-sm text-gray-600">Trung bình</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-2xl font-bold text-green-600">3</p>
              <p className="text-sm text-gray-600">Thấp</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* List */}
      <div className="space-y-2">
        {mockViolationData.map((item, idx) => (
          <div key={idx} className={`p-4 rounded-lg border-l-4 ${
            item.severity === 'high' ? 'bg-red-50 border-red-500' :
            item.severity === 'medium' ? 'bg-amber-50 border-amber-500' :
            'bg-gray-50 border-gray-400'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">{formatDateTime(item.time)}</span>
                <span className="font-medium">{item.type}</span>
              </div>
              <span className="text-sm text-gray-600">{item.user}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
