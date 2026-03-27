import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, MapPin, Settings, Server, Wifi, Activity, Eye } from 'lucide-react';

// Import types and mock data from centralized file
import {
  AP,
  Controller,
  initialControllers,
  initialAPs,
  buildingFilters as buildings,
  campusFilters as campuses,
  areaFilters as areas,
  getOverloadedAPs,
} from "@/data/mockData";

// Calculate overloaded APs
const overloadedAPs = getOverloadedAPs(initialAPs);

export default function AccessPoints() {
  const [, setLocation] = useLocation();
  // Use imported data directly to ensure HMR updates behave correctly
  const aps = initialAPs;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('All');
  const [selectedCampus, setSelectedCampus] = useState('Dĩ An');
  const [selectedArea, setSelectedArea] = useState('Nhà A');

  // Controller states - read only
  const controllers = initialControllers;
  const [showControllerSection, setShowControllerSection] = useState(false);
  const [selectedControllerFilter, setSelectedControllerFilter] = useState<string | null>(null);

  // Filtered APs
  const filteredAPs = aps.filter(ap => {
    const matchesSearch = ap.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ap.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Map filter values to Campus IDs for backward compatibility since the dropdown uses Campus names
    const matchesBuilding = selectedBuilding === 'All' || 
                           ap.building === selectedBuilding ||
                           (selectedBuilding === 'Dĩ An' && ap.campusId === 1) ||
                           (selectedBuilding === 'Thủ Đức' && ap.campusId === 2) ||
                           (selectedBuilding === '227NVC' && ap.campusId === 3);

    const matchesController = !selectedControllerFilter || ap.controller === selectedControllerFilter;
    return matchesSearch && matchesBuilding && matchesController;
  });

  // Get AP count by controller
  const getAPCountByController = (controllerName: string) => {
    return aps.filter(ap => ap.controller === controllerName).length;
  };

  // Get total clients by controller
  const getTotalClientsByController = (controllerName: string) => {
    return aps.filter(ap => ap.controller === controllerName).reduce((sum, ap) => sum + ap.clients, 0);
  };

  const getStatusColor = (status: Controller['status']) => {
    switch (status) {
      case 'Online': return 'bg-green-100 text-green-800';
      case 'Offline': return 'bg-red-100 text-red-800';
      case 'Warning': return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Giám sát Điểm phát WiFi</h1>
          <p className="text-gray-600 text-sm">Theo dõi trạng thái AP và Controller trong hệ thống</p>
        </div>
        <Button 
          variant="outline" 
          className="text-[#1e3a5f] border-[#1e3a5f] hover:bg-[#1e3a5f]/10"
          onClick={() => setLocation('/settings?tab=devices')}
        >
          <Settings size={16} className="mr-2" />
          Quản lý thiết bị
        </Button>
      </div>

      {/* Top Section - Map and Overload */}
      <div className="grid grid-cols-12 gap-4">
        {/* Map Section */}
        <div className="col-span-8">
          <Card className="p-4 h-full">
            {/* Map Header with Filters */}
            <div className="flex items-center gap-4 mb-4">
              <h3 className="text-sm font-semibold text-[#1e3a5f]">Bản đồ bố trí AP</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Chọn campus</span>
                <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                  <SelectTrigger className="w-28 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {campuses.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Chọn khu nhà</span>
                <Select value={selectedArea} onValueChange={setSelectedArea}>
                  <SelectTrigger className="w-28 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map(a => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  onClick={() => setShowControllerSection(!showControllerSection)}
                >
                  <Server size={16} className="mr-1" />
                  {showControllerSection ? 'Ẩn Controller' : 'Xem Controller'}
                </Button>
              </div>
            </div>

            {/* Scale indicator */}
            <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
              <span>0</span>
              <div className="w-24 h-1 bg-gray-300"></div>
              <span>10</span>
            </div>

            {/* Map Placeholder - World Map Style */}
            <div className="relative bg-blue-50 rounded-lg h-52 overflow-hidden">
              {/* Simple world map representation */}
              <svg viewBox="0 0 800 400" className="w-full h-full opacity-60">
                {/* Simplified world map paths */}
                <ellipse cx="400" cy="200" rx="350" ry="150" fill="#a5b4fc" opacity="0.3"/>
                <ellipse cx="200" cy="150" rx="80" ry="60" fill="#6366f1" opacity="0.5"/>
                <ellipse cx="350" cy="180" rx="100" ry="80" fill="#6366f1" opacity="0.5"/>
                <ellipse cx="550" cy="150" rx="120" ry="70" fill="#6366f1" opacity="0.5"/>
                <ellipse cx="650" cy="220" rx="60" ry="50" fill="#6366f1" opacity="0.5"/>
                <ellipse cx="250" cy="280" rx="70" ry="40" fill="#6366f1" opacity="0.5"/>
              </svg>
              
              {/* Map Marker */}
              <div className="absolute top-1/2 right-1/4 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <MapPin size={32} className="text-red-500 fill-red-500" />
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* AP Overload Table */}
        <div className="col-span-4">
          <Card className="p-4 h-full">
            <h3 className="text-sm font-semibold text-[#1e3a5f] mb-3">AP quá tải</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-gray-600">Tên AP</th>
                  <th className="text-right py-2 font-medium text-gray-600">Số client</th>
                  <th className="text-right py-2 font-medium text-gray-600">% sử dụng</th>
                </tr>
              </thead>
              <tbody>
                {overloadedAPs.map((ap) => (
                  <tr key={ap.id} className="border-b last:border-0">
                    <td className="py-2">{ap.name}</td>
                    <td className="py-2 text-right">{ap.clients}</td>
                    <td className="py-2 text-right">
                      <span className={ap.usage >= 90 ? 'text-red-600 font-medium' : 'text-amber-600'}>
                        {ap.usage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>

      {/* Controller Monitoring Section - Read Only */}
      {showControllerSection && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Server size={20} className="text-[#1e3a5f]" />
              <h3 className="text-sm font-semibold text-[#1e3a5f]">Danh sách Controller</h3>
              {selectedControllerFilter && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Đang lọc: {selectedControllerFilter}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedControllerFilter && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-gray-600"
                  onClick={() => setSelectedControllerFilter(null)}
                >
                  Xóa bộ lọc
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-[#1e3a5f] border-[#1e3a5f]"
                onClick={() => setLocation('/settings?tab=devices')}
              >
                <Settings size={14} className="mr-1" />
                Quản lý Controller
              </Button>
            </div>
          </div>
          
          {/* Controller List - Read Only */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Tên Controller</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Địa chỉ IP</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Version</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Vị trí</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">Trạng thái</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">Số AP</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">Clients</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {controllers.map((controller) => (
                  <tr 
                    key={controller.id} 
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedControllerFilter === controller.name ? 'bg-blue-50 hover:bg-blue-100' : ''
                    }`}
                    onClick={() => setSelectedControllerFilter(
                      selectedControllerFilter === controller.name ? null : controller.name
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          controller.status === 'Online' ? 'bg-green-100' : 
                          controller.status === 'Warning' ? 'bg-amber-100' : 'bg-red-100'
                        }`}>
                          <Server size={16} className={
                            controller.status === 'Online' ? 'text-green-600' : 
                            controller.status === 'Warning' ? 'text-amber-600' : 'text-red-600'
                          } />
                        </div>
                        <span className="font-medium">{controller.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-600">{controller.ipAddress}</td>
                    <td className="px-4 py-3 text-gray-600">{controller.version}</td>
                    <td className="px-4 py-3 text-gray-600">{controller.location}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(controller.status)}`}>
                        {controller.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Wifi size={14} className="text-blue-500" />
                        <span className="font-medium">{getAPCountByController(controller.name)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Activity size={14} className="text-green-500" />
                        <span className="font-medium">{getTotalClientsByController(controller.name)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <p className="text-xs text-gray-500 mt-2 italic">
            * Nhấn vào Controller để lọc danh sách AP theo Controller đó
          </p>
        </Card>
      )}

      {/* AP List Table */}
      <Card className="p-4">
        {/* Table Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#1e3a5f]">Danh sách AP</h3>
            {selectedControllerFilter && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                <Server size={12} />
                {selectedControllerFilter}
                <button 
                  className="ml-1 hover:text-blue-900" 
                  onClick={() => setSelectedControllerFilter(null)}
                >
                  ×
                </button>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Tìm kiếm</span>
              <div className="relative">
                <Input
                  type="text"
                  placeholder=""
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-40 h-8 pr-8"
                />
                <Search size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
              <SelectTrigger className="w-28 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {buildings.map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-[#1e3a5f] border-[#1e3a5f]"
              onClick={() => setLocation('/settings?tab=devices')}
            >
              <Settings size={14} className="mr-1" />
              Quản lý AP
            </Button> */}
          </div>
        </div>
        {/* Table - Read Only */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Tên AP</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Vị trí</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Khu vực</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Uptime</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">IP / Model</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Controller</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Clients</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Tải (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAPs.map((ap) => (
                <tr key={ap.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        ap.status === 'Online' ? 'bg-green-500' : 
                        ap.status === 'Warning' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium">{ap.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{ap.location}</td>
                  <td className="px-4 py-3 text-gray-600">{ap.building}</td>
                  <td className="px-4 py-3 text-gray-600">{ap.uptime}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{ap.ipModel}</td>
                  <td className="px-4 py-3 text-gray-600">{ap.controller}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-medium text-blue-600">{ap.clients}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            ap.usagePercent > 80 ? 'bg-red-500' : 
                            ap.usagePercent > 60 ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${ap.usagePercent}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        ap.usagePercent > 80 ? 'text-red-600' : 
                        ap.usagePercent > 60 ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {ap.usagePercent}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
