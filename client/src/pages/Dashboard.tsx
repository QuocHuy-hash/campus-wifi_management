import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

// Sample data - Số lượt truy cập theo thời gian
const accessTrendData = [
  { day: 'Thứ Hai', users: 6930 },
  { day: 'Thứ Ba', users: 5940 },
  { day: 'Thứ Tư', users: 6930 },
  { day: 'Thứ Năm', users: 7920 },
  { day: 'Thứ Sáu', users: 7920 },
  { day: 'Thứ Bảy', users: 7920 },
  { day: 'Chủ Nhật', users: 1980 },
];

// Tỷ lệ người dùng theo nhóm
const userGroupData = [
  { name: 'Sinh viên', value: 79, color: '#1e3a5f' },
  { name: 'Cán bộ', value: 19, color: '#3b82f6' },
  { name: 'Khác', value: 2, color: '#93c5fd' },
];

// Tỷ lệ truy cập theo đơn vị
const departmentData = [
  { name: 'Khoa CNT...', value: 33, color: '#1e3a5f' },
  { name: 'Khoa Toá...', value: 16, color: '#2563eb' },
  { name: 'Khoa Hóa...', value: 14, color: '#3b82f6' },
  { name: 'Khoa VL-...', value: 9, color: '#60a5fa' },
  { name: 'Khoa KH&...', value: 8, color: '#93c5fd' },
];

// Custom label for pie chart
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }: any) => {
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

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState('2023-05-23');
  const [startDate, setStartDate] = useState('2025-05-21');
  const [endDate, setEndDate] = useState('2025-05-24');
  const [filterUnit, setFilterUnit] = useState('all');

  return (
    <div className="space-y-4">
      {/* Stats Bar - KPI Tiles */}
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
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Section - Charts */}
        <div className="col-span-9 space-y-4">
          {/* Filter Dropdown */}
          <Card className="p-3">
            <Select value={filterUnit} onValueChange={setFilterUnit}>
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
                    data={userGroupData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={renderCustomLabel}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userGroupData.map((entry, index) => (
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
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={renderCustomLabel}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
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
              <LineChart data={accessTrendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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

        {/* Right Sidebar */}
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
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 text-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">End date</Label>
              <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
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
      </div>
    </div>
  );
}
