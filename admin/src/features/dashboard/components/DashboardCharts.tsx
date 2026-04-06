import { useDispatch, useSelector } from 'react-redux';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RootState, AppDispatch } from '@/stores/store';
import { setFilterUnit } from '../slices/dashboardSlice';


const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, name, value }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.3;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="#374151" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
    >
      {`${name} ${value}%`}
    </text>
  );
};

export const DashboardCharts = () => {
  const dispatch = useDispatch<AppDispatch>();
  const filterUnit = useSelector((state: RootState) => state.dashboard.filterUnit);

  return (
    <div className="col-span-9 space-y-4">
      {/* Filter Dropdown */}
      <Card className="p-3">
        <Select value={filterUnit} onValueChange={(value) => dispatch(setFilterUnit(value))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="cntt">Khoa CNTT</SelectItem>
            <SelectItem value="toan">Khoa Toán</SelectItem>
            <SelectItem value="hoa">Khoa Hóa</SelectItem>
            <SelectItem value="vatly">Khoa Vật lý</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {/* Two Pie Charts */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tỷ lệ người dùng theo nhóm */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-[#1e3a5f] mb-2">Tỷ lệ người dùng theo nhóm</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={[]}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={renderCustomLabel}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {[]?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Tỷ lệ truy cập theo đơn vị */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-[#1e3a5f] mb-2">Tỷ lệ truy cập theo đơn vị</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={[]}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={renderCustomLabel}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {[]?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Line Chart - Số lượt truy cập theo thời gian */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-[#1e3a5f] mb-4">Số lượt truy cập theo thời gian</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={[]} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="day" 
              stroke="#6b7280" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#6b7280" 
              tick={{ fontSize: 12 }}
              ticks={[0, 990, 1980, 2970, 3960, 4950, 5940, 6930, 7920]}
              domain={[0, 7920]}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#1e3a5f"
              strokeWidth={2}
              dot={{ fill: '#1e3a5f', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
