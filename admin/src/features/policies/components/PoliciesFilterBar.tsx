import { useDispatch, useSelector } from 'react-redux';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RefreshCw, Filter } from 'lucide-react';
import { RootState, AppDispatch } from '@/stores/store';
import { 
  setFilterRole, setFilterArea, setFilterTime, setFilterController, setFilterSearch, resetFilters 
} from '../slices/policiesSlice';

export const PoliciesFilterBar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { filterRole, filterArea, filterTime, filterController, filterSearch } = useSelector((state: RootState) => state.policies.policies);
  // Lấy danh sách Controller thực tế từ Redux Store thay vì mock data
  const controllers = useSelector((state: RootState) => state.settings.devices.controllers);

  return (
    <Card className="bg-white shadow-sm p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={16} className="text-[#1e3a5f]" />
        <span className="text-sm font-medium text-[#1e3a5f] mr-1">Bộ lọc:</span>
        
        <Select value={filterRole} onValueChange={(val) => dispatch(setFilterRole(val))}>
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue placeholder="Vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="student">Sinh viên</SelectItem>
            <SelectItem value="lecturer">Giảng viên</SelectItem>
            <SelectItem value="staff">Nhân viên</SelectItem>
            <SelectItem value="guest">Khách</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterArea} onValueChange={(val) => dispatch(setFilterArea(val))}>
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue placeholder="Khu vực" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả khu vực</SelectItem>
            <SelectItem value="campus-a">Cơ sở A (Q.5)</SelectItem>
            <SelectItem value="campus-b">Cơ sở B (Q.TĐ)</SelectItem>
            <SelectItem value="campus-c">Cơ sở C (Q.10)</SelectItem>
            <SelectItem value="library">Thư viện</SelectItem>
            <SelectItem value="lab">Phòng máy</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterTime} onValueChange={(val) => dispatch(setFilterTime(val))}>
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue placeholder="Thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="scheduled">Theo lịch</SelectItem>
            <SelectItem value="weekday">Trong tuần</SelectItem>
            <SelectItem value="weekend">Cuối tuần</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterController} onValueChange={(val) => dispatch(setFilterController(val))}>
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue placeholder="Controller" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả controller</SelectItem>
            {controllers.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.nasIdentifier || (c as any).name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={filterSearch}
            onChange={(e) => dispatch(setFilterSearch(e.target.value))}
            placeholder="Tìm kiếm..."
            className="h-8 w-[150px] text-xs pl-7"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch(resetFilters())}
          className="h-8 text-xs gap-1"
        >
          <RefreshCw size={12} />
          Đặt lại
        </Button>
      </div>
    </Card>
  );
};
