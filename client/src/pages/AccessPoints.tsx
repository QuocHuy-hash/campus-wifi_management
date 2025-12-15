import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Edit, Trash2, Plus, MapPin, Settings, Server, Wifi, Activity, Loader2 } from 'lucide-react';

// Import types and mock data from centralized file
import {
  AP,
  Controller,
  AreaLocation,
  initialControllers,
  initialAPs,
  buildingFilters as buildings,
  campusFilters as campuses,
  areaFilters as areas,
  fetchAreaLocations,
  getOverloadedAPs,
} from "@/data/mockData";

// Calculate overloaded APs
const overloadedAPs = getOverloadedAPs(initialAPs);

export default function AccessPoints() {
  const [, setLocation] = useLocation();
  const [aps, setAps] = useState<AP[]>(initialAPs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('227NVC');
  const [selectedCampus, setSelectedCampus] = useState('Dĩ An');
  const [selectedArea, setSelectedArea] = useState('Nhà A');

  // Dialog states - AP
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAP, setSelectedAP] = useState<AP | null>(null);

  // Form state - AP
  const [formData, setFormData] = useState<Partial<AP>>({});

  // Controller states
  const [controllers, setControllers] = useState<Controller[]>(initialControllers);
  const [addControllerDialogOpen, setAddControllerDialogOpen] = useState(false);
  const [editControllerDialogOpen, setEditControllerDialogOpen] = useState(false);
  const [deleteControllerDialogOpen, setDeleteControllerDialogOpen] = useState(false);
  const [selectedController, setSelectedController] = useState<Controller | null>(null);
  const [controllerFormData, setControllerFormData] = useState<Partial<Controller>>({});
  const [showControllerSection, setShowControllerSection] = useState(false);
  const [selectedControllerFilter, setSelectedControllerFilter] = useState<string | null>(null);

  // Area locations from API
  const [areaLocations, setAreaLocations] = useState<AreaLocation[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(true);

  // Fetch area locations on mount (simulating API call)
  useEffect(() => {
    const loadAreaLocations = async () => {
      setLoadingAreas(true);
      try {
        const locations = await fetchAreaLocations();
        setAreaLocations(locations);
      } catch (error) {
        console.error('Failed to fetch area locations:', error);
      } finally {
        setLoadingAreas(false);
      }
    };
    loadAreaLocations();
  }, []);

  // Filtered APs
  const filteredAPs = aps.filter(ap => {
    const matchesSearch = ap.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ap.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBuilding = selectedBuilding === 'All' || ap.building === selectedBuilding;
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

  // Handlers
  const handleAdd = () => {
    setFormData({});
    setAddDialogOpen(true);
  };

  const handleEdit = (ap: AP) => {
    setSelectedAP(ap);
    setFormData({ ...ap });
    setEditDialogOpen(true);
  };

  const handleDelete = (ap: AP) => {
    setSelectedAP(ap);
    setDeleteDialogOpen(true);
  };

  const saveNew = () => {
    const newAP: AP = {
      id: Math.max(...aps.map(a => a.id)) + 1,
      name: formData.name || '',
      location: formData.location || '',
      building: formData.building || '227NVC',
      uptime: '00h00 0days',
      ipModel: formData.ipModel || '',
      controller: formData.controller || 'UniFi 1',
      clients: 0,
      usage: 0,
    };
    setAps([...aps, newAP]);
    setAddDialogOpen(false);
  };

  const saveEdit = () => {
    if (selectedAP) {
      setAps(aps.map(a => a.id === selectedAP.id ? { ...a, ...formData } as AP : a));
    }
    setEditDialogOpen(false);
    setSelectedAP(null);
  };

  const confirmDelete = () => {
    if (selectedAP) {
      setAps(aps.filter(a => a.id !== selectedAP.id));
    }
    setDeleteDialogOpen(false);
    setSelectedAP(null);
  };

  // Controller Handlers
  const handleAddController = () => {
    setControllerFormData({ status: 'Online' });
    setAddControllerDialogOpen(true);
  };

  const handleEditController = (controller: Controller) => {
    setSelectedController(controller);
    setControllerFormData({ ...controller });
    setEditControllerDialogOpen(true);
  };

  const handleDeleteController = (controller: Controller) => {
    setSelectedController(controller);
    setDeleteControllerDialogOpen(true);
  };

  const saveNewController = () => {
    const newController: Controller = {
      id: Math.max(...controllers.map(c => c.id), 0) + 1,
      name: controllerFormData.name || '',
      ipAddress: controllerFormData.ipAddress || '',
      version: controllerFormData.version || '7.4.156',
      status: controllerFormData.status || 'Online',
      apCount: 0,
      totalClients: 0,
      location: controllerFormData.location || '',
    };
    setControllers([...controllers, newController]);
    setAddControllerDialogOpen(false);
    setControllerFormData({});
  };

  const saveEditController = () => {
    if (selectedController) {
      setControllers(controllers.map(c => c.id === selectedController.id ? { ...c, ...controllerFormData } as Controller : c));
    }
    setEditControllerDialogOpen(false);
    setSelectedController(null);
    setControllerFormData({});
  };

  const confirmDeleteController = () => {
    if (selectedController) {
      setControllers(controllers.filter(c => c.id !== selectedController.id));
    }
    setDeleteControllerDialogOpen(false);
    setSelectedController(null);
  };

  const getControllerNames = () => controllers.map(c => c.name);

  const getStatusColor = (status: Controller['status']) => {
    switch (status) {
      case 'Online': return 'bg-green-100 text-green-800';
      case 'Offline': return 'bg-red-100 text-red-800';
      case 'Warning': return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <div className="space-y-4">
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
                  onClick={() => setLocation('/settings?tab=areas')}
                >
                  <Settings size={16} className="mr-1" />
                  QL Khu Vực
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  onClick={() => setShowControllerSection(!showControllerSection)}
                >
                  <Server size={16} className="mr-1" />
                  {showControllerSection ? 'Ẩn Controller' : 'QL Controller'}
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

      {/* Controller Management Section */}
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
              <Button size="sm" onClick={handleAddController} className="h-8 bg-[#1e3a5f] hover:bg-[#2d4a6f]">
                <Plus size={16} className="mr-1" />
                Thêm Controller
              </Button>
            </div>
          </div>
          
          {/* Controller List */}
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
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">Thao tác</th>
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
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0"
                          onClick={(e) => { e.stopPropagation(); handleEditController(controller); }}
                        >
                          <Edit size={14} className="text-amber-600" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0"
                          onClick={(e) => { e.stopPropagation(); handleDeleteController(controller); }}
                        >
                          <Trash2 size={14} className="text-red-600" />
                        </Button>
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
            <Button size="sm" onClick={handleAdd} className="h-8 bg-[#1e3a5f] hover:bg-[#2d4a6f]">
              <Plus size={16} className="mr-1" />
              Thêm AP
            </Button>
          </div>
        </div>
        {/* Table */}
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
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAPs.map((ap) => (
                <tr key={ap.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleEdit(ap)}>
                  <td className="px-4 py-3 font-medium">{ap.name}</td>
                  <td className="px-4 py-3 text-gray-600">{ap.location}</td>
                  <td className="px-4 py-3 text-gray-600">{ap.building}</td>
                  <td className="px-4 py-3 text-gray-600">{ap.uptime}</td>
                  <td className="px-4 py-3 text-gray-600">{ap.ipModel}</td>
                  <td className="px-4 py-3 text-gray-600">{ap.controller}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0"
                        onClick={(e) => { e.stopPropagation(); handleEdit(ap); }}
                      >
                        <Edit size={14} className="text-blue-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0"
                        onClick={(e) => { e.stopPropagation(); handleDelete(ap); }}
                      >
                        <Trash2 size={14} className="text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add AP Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm Access Point mới</DialogTitle>
            <DialogDescription>Nhập thông tin AP mới</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên AP</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: GD1-01"
              />
            </div>
            <div className="space-y-2">
              <Label>Vị trí (Khu vực) <span className="text-red-500">*</span></Label>
              {loadingAreas ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                  <Loader2 size={16} className="animate-spin" />
                  Đang tải danh sách khu vực...
                </div>
              ) : (
                <Select
                  value={formData.location || ''}
                  onValueChange={(value) => {
                    const area = areaLocations.find(a => a.label === value);
                    setFormData({ 
                      ...formData, 
                      location: value,
                      building: area?.campusName || formData.building 
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khu vực" />
                  </SelectTrigger>
                  <SelectContent>
                    {areaLocations.map(area => (
                      <SelectItem key={area.id} value={area.label}>{area.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>Campus</Label>
              <Select
                value={formData.building || '227NVC'}
                onValueChange={(value) => setFormData({ ...formData, building: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {buildings.filter(b => b !== 'All').map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>IP / Model</Label>
              <Input
                value={formData.ipModel || ''}
                onChange={(e) => setFormData({ ...formData, ipModel: e.target.value })}
                placeholder="VD: 172.29.99.1 - AC Mesh Pro"
              />
            </div>
            <div className="space-y-2">
              <Label>Controller</Label>
              <Select
                value={formData.controller || controllers[0]?.name || 'UniFi 1'}
                onValueChange={(value) => setFormData({ ...formData, controller: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getControllerNames().map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveNew} className="bg-[#1e3a5f] hover:bg-[#2d4a6f]">Thêm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit AP Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Access Point</DialogTitle>
            <DialogDescription>Cập nhật thông tin AP: {selectedAP?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên AP</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Vị trí (Khu vực) <span className="text-red-500">*</span></Label>
              {loadingAreas ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                  <Loader2 size={16} className="animate-spin" />
                  Đang tải danh sách khu vực...
                </div>
              ) : (
                <Select
                  value={formData.location || ''}
                  onValueChange={(value) => {
                    const area = areaLocations.find(a => a.label === value);
                    setFormData({ 
                      ...formData, 
                      location: value,
                      building: area?.campusName || formData.building 
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khu vực" />
                  </SelectTrigger>
                  <SelectContent>
                    {areaLocations.map(area => (
                      <SelectItem key={area.id} value={area.label}>{area.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>Campus</Label>
              <Select
                value={formData.building || '227NVC'}
                onValueChange={(value) => setFormData({ ...formData, building: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {buildings.filter(b => b !== 'All').map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>IP / Model</Label>
              <Input
                value={formData.ipModel || ''}
                onChange={(e) => setFormData({ ...formData, ipModel: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Controller</Label>
              <Select
                value={formData.controller || controllers[0]?.name || 'UniFi 1'}
                onValueChange={(value) => setFormData({ ...formData, controller: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getControllerNames().map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveEdit} className="bg-[#1e3a5f] hover:bg-[#2d4a6f]">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete AP Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa AP "{selectedAP?.name}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Controller Dialog */}
      <Dialog open={addControllerDialogOpen} onOpenChange={setAddControllerDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Server size={20} className="text-[#1e3a5f]" />
              Thêm Controller mới
            </DialogTitle>
            <DialogDescription>Nhập thông tin Controller mới</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên Controller <span className="text-red-500">*</span></Label>
              <Input
                value={controllerFormData.name || ''}
                onChange={(e) => setControllerFormData({ ...controllerFormData, name: e.target.value })}
                placeholder="VD: UniFi 4"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Địa chỉ IP <span className="text-red-500">*</span></Label>
                <Input
                  value={controllerFormData.ipAddress || ''}
                  onChange={(e) => setControllerFormData({ ...controllerFormData, ipAddress: e.target.value })}
                  placeholder="VD: 172.29.99.254"
                />
              </div>
              <div className="space-y-2">
                <Label>Phiên bản</Label>
                <Input
                  value={controllerFormData.version || ''}
                  onChange={(e) => setControllerFormData({ ...controllerFormData, version: e.target.value })}
                  placeholder="VD: 7.4.156"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Vị trí (Khu vực) <span className="text-red-500">*</span></Label>
              {loadingAreas ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                  <Loader2 size={16} className="animate-spin" />
                  Đang tải danh sách khu vực...
                </div>
              ) : (
                <Select
                  value={controllerFormData.location || ''}
                  onValueChange={(value) => setControllerFormData({ ...controllerFormData, location: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khu vực đặt Controller" />
                  </SelectTrigger>
                  <SelectContent>
                    {areaLocations.map(area => (
                      <SelectItem key={area.id} value={area.label}>{area.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={controllerFormData.status || 'Online'}
                onValueChange={(value) => setControllerFormData({ ...controllerFormData, status: value as Controller['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Offline">Offline</SelectItem>
                  <SelectItem value="Warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddControllerDialogOpen(false)}>Hủy</Button>
            <Button 
              onClick={saveNewController} 
              className="bg-[#1e3a5f] hover:bg-[#2d4a6f]"
              disabled={!controllerFormData.name || !controllerFormData.ipAddress}
            >
              Thêm Controller
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Controller Dialog */}
      <Dialog open={editControllerDialogOpen} onOpenChange={setEditControllerDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit size={20} className="text-amber-600" />
              Chỉnh sửa Controller
            </DialogTitle>
            <DialogDescription>Cập nhật thông tin: {selectedController?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên Controller <span className="text-red-500">*</span></Label>
              <Input
                value={controllerFormData.name || ''}
                onChange={(e) => setControllerFormData({ ...controllerFormData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Địa chỉ IP <span className="text-red-500">*</span></Label>
                <Input
                  value={controllerFormData.ipAddress || ''}
                  onChange={(e) => setControllerFormData({ ...controllerFormData, ipAddress: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phiên bản</Label>
                <Input
                  value={controllerFormData.version || ''}
                  onChange={(e) => setControllerFormData({ ...controllerFormData, version: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Vị trí (Khu vực) <span className="text-red-500">*</span></Label>
              {loadingAreas ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                  <Loader2 size={16} className="animate-spin" />
                  Đang tải danh sách khu vực...
                </div>
              ) : (
                <Select
                  value={controllerFormData.location || ''}
                  onValueChange={(value) => setControllerFormData({ ...controllerFormData, location: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khu vực đặt Controller" />
                  </SelectTrigger>
                  <SelectContent>
                    {areaLocations.map(area => (
                      <SelectItem key={area.id} value={area.label}>{area.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={controllerFormData.status || 'Online'}
                onValueChange={(value) => setControllerFormData({ ...controllerFormData, status: value as Controller['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Offline">Offline</SelectItem>
                  <SelectItem value="Warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditControllerDialogOpen(false)}>Hủy</Button>
            <Button 
              onClick={saveEditController} 
              className="bg-[#1e3a5f] hover:bg-[#2d4a6f]"
              disabled={!controllerFormData.name || !controllerFormData.ipAddress}
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Controller Dialog */}
      <AlertDialog open={deleteControllerDialogOpen} onOpenChange={setDeleteControllerDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa Controller</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa Controller <strong>{selectedController?.name}</strong>?
              <br /><br />
              <span className="text-amber-600">
                Cảnh báo: Các AP đang sử dụng Controller này có thể bị ảnh hưởng.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteController} className="bg-red-600 hover:bg-red-700">
              Xóa Controller
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
