import { useDispatch, useSelector } from 'react-redux';
import { Input } from '@/components/ui/input';
import { TrendingUp } from 'lucide-react';
import { RootState, AppDispatch } from '@/stores/store';
import { setSelectedDate } from '../slices/dashboardSlice';

export const DashboardStatsBar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedDate = useSelector((state: RootState) => state.dashboard.selectedDate);

  return (
    <div className="grid grid-cols-5 gap-0 bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Người dùng online */}
      <div className="p-4 border-r border-gray-200">
        <p className="text-xs text-gray-600 mb-1">Người dùng online</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[#1e3a5f]">7822</span>
          <TrendingUp size={16} className="text-green-500" />
        </div>
        <p className="text-xs text-green-600 mt-1">vs 2h trước 7616 (<span className="text-green-600">29%</span>)</p>
      </div>

      {/* Số điểm phát WIFI */}
      <div className="p-4 border-r border-gray-200">
        <p className="text-xs text-gray-600 mb-1">Số điểm phát WIFI<br/>online/tổng</p>
        <span className="text-2xl font-bold text-[#1e3a5f]">323/412</span>
      </div>

      {/* Tổng số lượt truy cập */}
      <div className="p-4 border-r border-gray-200">
        <p className="text-xs text-gray-600 mb-1">Tổng số lượt truy cập</p>
        <span className="text-2xl font-bold text-[#1e3a5f]">2048K</span>
      </div>

      {/* Thời gian truy cập trung bình */}
      <div className="p-4 border-r border-gray-200">
        <p className="text-xs text-gray-600 mb-1">Thời gian truy cập trung bình</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-[#1e3a5f]">78</span>
          <span className="text-sm text-gray-600">phút</span>
        </div>
      </div>

      {/* Date */}
      <div className="p-4">
        <p className="text-xs text-gray-600 mb-1">Date</p>
        <Input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => dispatch(setSelectedDate(e.target.value))}
          className="h-8 text-sm"
        />
      </div>
    </div>
  );
};
