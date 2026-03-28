import { useDispatch, useSelector } from 'react-redux';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RootState, AppDispatch } from '@/stores/store';
import { setStartDate, setEndDate } from '../slices/dashboardSlice';

export const DashboardSidebar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { startDate, endDate } = useSelector((state: RootState) => state.dashboard);

  return (
    <div className="col-span-3 space-y-4">
      {/* Lượt truy cập hôm nay */}
      <Card className="p-4">
        <p className="text-xs text-gray-600 mb-1">Lượt truy cập hôm nay</p>
        <p className="text-3xl font-bold text-[#1e3a5f]">12.1K</p>
      </Card>

      {/* Date Range */}
      <Card className="p-4 space-y-3">
        <div>
          <Label className="text-xs text-gray-600">Start date</Label>
          <Input 
            type="date" 
            value={startDate} 
            onChange={(e) => dispatch(setStartDate(e.target.value))}
            className="h-8 text-sm mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-600">End date</Label>
          <Input 
            type="date" 
            value={endDate} 
            onChange={(e) => dispatch(setEndDate(e.target.value))}
            className="h-8 text-sm mt-1"
          />
        </div>
      </Card>

      {/* Lưu lượng dữ liệu */}
      <Card className="p-4">
        <p className="text-xs text-gray-600 text-center mb-3">Lưu lượng dữ liệu</p>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-[#1e3a5f]">45.2GB</p>
            <p className="text-xs text-gray-500">Download</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1e3a5f]">11.5GB</p>
            <p className="text-xs text-gray-500">Upload</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
