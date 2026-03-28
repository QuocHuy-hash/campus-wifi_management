import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Download, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { RootState } from '@/stores/store';
import { 
  setDateRange, 
  setStartDate, 
  setEndDate, 
  setControllerFilter, 
  setCampusFilter,
  resetFilters
} from '../slices/filtersSlice';

const initialCampuses = [
  { id: 1, name: 'Cơ sở Dĩ An' },
  { id: 2, name: 'Cơ sở 227 NVC' },
  { id: 3, name: 'Cơ sở Thủ Đức' },
];

export const ReportsFilterBar = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.reports.filters);

  const handleExport = (format: 'pdf' | 'excel', type: string) => {
    console.log(`Exporting ${type} as ${format}...`);
    // Logic export sẽ được thêm sau
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Thời gian</Label>
              <Select value={filters.dateRange} onValueChange={(v) => dispatch(setDateRange(v))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Chọn thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hôm nay</SelectItem>
                  <SelectItem value="yesterday">Hôm qua</SelectItem>
                  <SelectItem value="week">7 ngày qua</SelectItem>
                  <SelectItem value="month">30 ngày qua</SelectItem>
                  <SelectItem value="custom">Tùy chỉnh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filters.dateRange === 'custom' && (
              <div className="flex items-center gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Từ ngày</Label>
                  <Input 
                    type="date" 
                    value={filters.startDate}
                    onChange={(e) => dispatch(setStartDate(e.target.value))}
                    className="w-[140px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Đến ngày</Label>
                  <Input 
                    type="date" 
                    value={filters.endDate}
                    onChange={(e) => dispatch(setEndDate(e.target.value))}
                    className="w-[140px]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Controller</Label>
              <Select value={filters.controllerFilter} onValueChange={(v) => dispatch(setControllerFilter(v))}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tất cả Controller" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả Controller</SelectItem>
                  <SelectItem value="WLC-Core-01">WLC-Core-01</SelectItem>
                  <SelectItem value="WLC-Core-02">WLC-Core-02</SelectItem>
                  <SelectItem value="WLC-Dist-01">WLC-Dist-01</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Cơ sở</Label>
              <Select value={filters.campusFilter} onValueChange={(v) => dispatch(setCampusFilter(v))}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tất cả cơ sở" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả cơ sở</SelectItem>
                  {initialCampuses.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id.toString()}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1 flex items-end h-[62px]">
              <Button size="sm" variant="outline" onClick={() => dispatch(resetFilters())} className="mb-px h-10">
                <RefreshCw size={16} className="mr-2" />
                Đặt lại
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex items-center" onClick={() => handleExport('excel', 'report')}>
              <FileSpreadsheet size={16} className="mr-2 text-green-600" />
              Xuất Excel
            </Button>
            <Button variant="outline" className="flex items-center" onClick={() => handleExport('pdf', 'report')}>
              <Download size={16} className="mr-2 text-red-600" />
              Xuất PDF
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
