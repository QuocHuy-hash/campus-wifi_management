import { useState } from 'react';
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
import { Search, Edit, Trash2, Plus, MapPin } from 'lucide-react';

// Types
interface AP {
  id: number;
  name: string;
  location: string;
  building: string;
  uptime: string;
  ipModel: string;
  controller: string;
  clients: number;
  usage: number;
}

// Mock data - Danh sách AP
const initialAPs: AP[] = [
  { id: 1, name: 'GD1-01', location: 'Giảng đường 1', building: '227 NVC', uptime: '15h00 1days', ipModel: '172.29.99.1 - AC Mesh Pro', controller: 'UniFi 1', clients: 112, usage: 90 },
  { id: 2, name: 'I1-01', location: 'Sảnh nhà I', building: '227NVC', uptime: '03h15 98days', ipModel: '172.29.99.2 - AC Pro 7', controller: 'UniFi 1', clients: 69, usage: 88 },
  { id: 3, name: 'I11-01', location: 'Nhà I lầu 11', building: '227NVC', uptime: '05h00 1days', ipModel: '172.29.99.9 - AC Mesh Pro', controller: 'UniFi 1', clients: 225, usage: 92 },
  { id: 4, name: 'F103-02', location: 'Nhà F', building: '227NVC', uptime: '01h00 1days', ipModel: '10.29.29.5 - U7 Pro', controller: 'UniFi 2', clients: 88, usage: 70 },
  { id: 5, name: 'GD2-01', location: 'Giảng đường 2', building: '227NVC', uptime: '03h00 0days', ipModel: '10.29.29.6 - U7 Pro', controller: 'UniFi 2', clients: 45, usage: 55 },
  { id: 6, name: 'A1-01', location: 'Nhà A Tầng 1', building: '227NVC', uptime: '12h30 5days', ipModel: '172.29.99.10 - AC Lite', controller: 'UniFi 1', clients: 32, usage: 45 },
  { id: 7, name: 'B2-03', location: 'Nhà B Tầng 2', building: 'Dĩ An', uptime: '08h45 3days', ipModel: '172.29.99.15 - AC Pro', controller: 'UniFi 3', clients: 78, usage: 82 },
  { id: 8, name: 'C3-02', location: 'Nhà C Tầng 3', building: 'Dĩ An', uptime: '20h00 7days', ipModel: '172.29.99.20 - U6 Pro', controller: 'UniFi 3', clients: 95, usage: 78 },
];

// AP quá tải (>80%)
const overloadedAPs = initialAPs.filter(ap => ap.usage >= 70).sort((a, b) => b.usage - a.usage).slice(0, 4);

// Buildings list
const buildings = ['All', '227NVC', 'Dĩ An', 'Thủ Đức'];
const campuses = ['Dĩ An', 'Thủ Đức', '227 NVC'];
const areas = ['Nhà A', 'Nhà B', 'Nhà C', 'Nhà I', 'Giảng đường'];

export default function AccessPoints() {
  const [aps, setAps] = useState<AP[]>(initialAPs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('227NVC');
  const [selectedCampus, setSelectedCampus] = useState('Dĩ An');
  const [selectedArea, setSelectedArea] = useState('Nhà A');

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAP, setSelectedAP] = useState<AP | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<AP>>({});

  // Filtered APs
  const filteredAPs = aps.filter(ap => {
    const matchesSearch = ap.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ap.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBuilding = selectedBuilding === 'All' || ap.building === selectedBuilding;
    return matchesSearch && matchesBuilding;
  });

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

      {/* AP List Table */}
      <Card className="p-4">
        {/* Table Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#1e3a5f]">Danh mục điểm truy cập WIFI</h3>
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
              <Label>Vị trí</Label>
              <Input
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="VD: Giảng đường 1"
              />
            </div>
            <div className="space-y-2">
              <Label>Khu vực</Label>
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
                value={formData.controller || 'UniFi 1'}
                onValueChange={(value) => setFormData({ ...formData, controller: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UniFi 1">UniFi 1</SelectItem>
                  <SelectItem value="UniFi 2">UniFi 2</SelectItem>
                  <SelectItem value="UniFi 3">UniFi 3</SelectItem>
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
              <Label>Vị trí</Label>
              <Input
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Khu vực</Label>
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
                value={formData.controller || 'UniFi 1'}
                onValueChange={(value) => setFormData({ ...formData, controller: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UniFi 1">UniFi 1</SelectItem>
                  <SelectItem value="UniFi 2">UniFi 2</SelectItem>
                  <SelectItem value="UniFi 3">UniFi 3</SelectItem>
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
    </div>
  );
}
