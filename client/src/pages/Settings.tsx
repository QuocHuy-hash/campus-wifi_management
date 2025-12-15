import { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Lock, Database, Mail, Shield, Clock, Eye, Plus, Edit, Trash2, Users, Search, FileText, MapPin, Building2, Map } from 'lucide-react';

// Import types and mock data from centralized file
import {
  AdminUser,
  Permission,
  UserGroup,
  LogEntry,
  Campus,
  Building,
  initialAdminUsers,
  initialLogs,
  initialCampuses,
  initialBuildings,
  systemRoles,
  userGroups,
  resourceList,
} from "@/data/mockData";

export default function Settings() {
  const searchString = useSearch();
  const [activeTab, setActiveTab] = useState('users');

  // Handle tab query parameter
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const tab = params.get('tab');
    if (tab && ['users', 'areas', 'security', 'access', 'technical', 'logs'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchString]);
  
  // Data states
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(initialAdminUsers);
  const [logs] = useState<LogEntry[]>(initialLogs);
  
  // Dialog states - Admin Users
  const [addAdminDialogOpen, setAddAdminDialogOpen] = useState(false);
  const [editAdminDialogOpen, setEditAdminDialogOpen] = useState(false);
  const [deleteAdminDialogOpen, setDeleteAdminDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [adminForm, setAdminForm] = useState<Partial<AdminUser>>({});
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  
  // Dialog states - Permission
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [selectedGroupPermissions, setSelectedGroupPermissions] = useState<Permission[]>(
    resourceList.map(r => ({ resource: r, canView: false, canEdit: false }))
  );
  
  // Dialog states - Logs
  const [logDetailDialogOpen, setLogDetailDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [logFilter, setLogFilter] = useState<string>('all');

  // Data states - Areas (Campus & Buildings)
  const [campuses, setCampuses] = useState<Campus[]>(initialCampuses);
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings);
  
  // Dialog states - Campus
  const [addCampusDialogOpen, setAddCampusDialogOpen] = useState(false);
  const [editCampusDialogOpen, setEditCampusDialogOpen] = useState(false);
  const [deleteCampusDialogOpen, setDeleteCampusDialogOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
  const [campusForm, setCampusForm] = useState<Partial<Campus>>({});
  const [selectedCampusFilter, setSelectedCampusFilter] = useState<number | 'all'>('all');

  // Dialog states - Building
  const [addBuildingDialogOpen, setAddBuildingDialogOpen] = useState(false);
  const [editBuildingDialogOpen, setEditBuildingDialogOpen] = useState(false);
  const [deleteBuildingDialogOpen, setDeleteBuildingDialogOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [buildingForm, setBuildingForm] = useState<Partial<Building>>({});

  // Filtered data
  const filteredAdminUsers = adminUsers.filter(user =>
    user.username.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(adminSearchTerm.toLowerCase())
  );
  
  const filteredLogs = logFilter === 'all' ? logs : logs.filter(log => log.type === logFilter);
  
  const filteredBuildings = selectedCampusFilter === 'all' 
    ? buildings 
    : buildings.filter(b => b.campusId === selectedCampusFilter);

  // Campus Handlers
  const handleAddCampus = () => {
    setCampusForm({});
    setAddCampusDialogOpen(true);
  };

  const handleEditCampus = (campus: Campus) => {
    setSelectedCampus(campus);
    setCampusForm({ ...campus });
    setEditCampusDialogOpen(true);
  };

  const handleDeleteCampus = (campus: Campus) => {
    setSelectedCampus(campus);
    setDeleteCampusDialogOpen(true);
  };

  const saveNewCampus = () => {
    const newCampus: Campus = {
      id: Math.max(...campuses.map(c => c.id), 0) + 1,
      name: campusForm.name || '',
      code: campusForm.code || '',
      address: campusForm.address || '',
      description: campusForm.description || '',
    };
    setCampuses([...campuses, newCampus]);
    setAddCampusDialogOpen(false);
    setCampusForm({});
  };

  const saveEditCampus = () => {
    if (selectedCampus) {
      setCampuses(campuses.map(c => c.id === selectedCampus.id ? { ...c, ...campusForm } as Campus : c));
    }
    setEditCampusDialogOpen(false);
    setSelectedCampus(null);
    setCampusForm({});
  };

  const confirmDeleteCampus = () => {
    if (selectedCampus) {
      // Also delete all buildings in this campus
      setBuildings(buildings.filter(b => b.campusId !== selectedCampus.id));
      setCampuses(campuses.filter(c => c.id !== selectedCampus.id));
    }
    setDeleteCampusDialogOpen(false);
    setSelectedCampus(null);
  };

  // Building Handlers
  const handleAddBuilding = () => {
    setBuildingForm({ campusId: selectedCampusFilter === 'all' ? campuses[0]?.id : selectedCampusFilter });
    setAddBuildingDialogOpen(true);
  };

  const handleEditBuilding = (building: Building) => {
    setSelectedBuilding(building);
    setBuildingForm({ ...building });
    setEditBuildingDialogOpen(true);
  };

  const handleDeleteBuilding = (building: Building) => {
    setSelectedBuilding(building);
    setDeleteBuildingDialogOpen(true);
  };

  const saveNewBuilding = () => {
    const newBuilding: Building = {
      id: Math.max(...buildings.map(b => b.id), 0) + 1,
      campusId: buildingForm.campusId || campuses[0]?.id || 1,
      name: buildingForm.name || '',
      code: buildingForm.code || '',
      floors: buildingForm.floors || 1,
      description: buildingForm.description || '',
    };
    setBuildings([...buildings, newBuilding]);
    setAddBuildingDialogOpen(false);
    setBuildingForm({});
  };

  const saveEditBuilding = () => {
    if (selectedBuilding) {
      setBuildings(buildings.map(b => b.id === selectedBuilding.id ? { ...b, ...buildingForm } as Building : b));
    }
    setEditBuildingDialogOpen(false);
    setSelectedBuilding(null);
    setBuildingForm({});
  };

  const confirmDeleteBuilding = () => {
    if (selectedBuilding) {
      setBuildings(buildings.filter(b => b.id !== selectedBuilding.id));
    }
    setDeleteBuildingDialogOpen(false);
    setSelectedBuilding(null);
  };

  const getCampusName = (campusId: number) => {
    return campuses.find(c => c.id === campusId)?.name || 'N/A';
  };

  const getBuildingCountByCampus = (campusId: number) => {
    return buildings.filter(b => b.campusId === campusId).length;
  };

  // Admin User Handlers
  const handleAddAdmin = () => {
    setAdminForm({ status: 'Active', role: systemRoles[0], group: userGroups[0] });
    setAddAdminDialogOpen(true);
  };

  const handleEditAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setAdminForm({ ...admin });
    setEditAdminDialogOpen(true);
  };

  const handleDeleteAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setDeleteAdminDialogOpen(true);
  };

  const handleLockAdmin = (admin: AdminUser) => {
    setAdminUsers(adminUsers.map(u => 
      u.id === admin.id ? { ...u, status: u.status === 'Active' ? 'Locked' : 'Active' } : u
    ));
  };

  const saveNewAdmin = () => {
    const newAdmin: AdminUser = {
      id: Math.max(...adminUsers.map(u => u.id)) + 1,
      username: adminForm.username || '',
      email: adminForm.email || '',
      role: adminForm.role || '',
      status: adminForm.status || 'Active',
      group: adminForm.group || '',
      accessTimeLimit: adminForm.accessTimeLimit,
    };
    setAdminUsers([...adminUsers, newAdmin]);
    setAddAdminDialogOpen(false);
    setAdminForm({});
  };

  const saveEditAdmin = () => {
    if (selectedAdmin) {
      setAdminUsers(adminUsers.map(u => u.id === selectedAdmin.id ? { ...u, ...adminForm } as AdminUser : u));
    }
    setEditAdminDialogOpen(false);
    setSelectedAdmin(null);
    setAdminForm({});
  };

  const confirmDeleteAdmin = () => {
    if (selectedAdmin) {
      setAdminUsers(adminUsers.filter(u => u.id !== selectedAdmin.id));
    }
    setDeleteAdminDialogOpen(false);
    setSelectedAdmin(null);
  };

  const handleViewLog = (log: LogEntry) => {
    setSelectedLog(log);
    setLogDetailDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
        <p className="text-gray-600 mt-1">Cấu hình hệ thống và chính sách</p>
      </div>

      {/* Tabs */}
      <Card className="bg-white shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 border-b border-gray-200 rounded-none">
            <TabsTrigger value="users" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
              Quản trị viên
            </TabsTrigger>
            <TabsTrigger value="areas" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
              Khu vực
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
              Bảo mật
            </TabsTrigger>
            <TabsTrigger value="access" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
              Truy cập
            </TabsTrigger>
            <TabsTrigger value="technical" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
              Kỹ thuật
            </TabsTrigger>
            <TabsTrigger value="logs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
              Logs
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Users */}
          <TabsContent value="users" className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Quản lý Người dùng Hệ thống (Admin Users)</h3>
                <Button onClick={handleAddAdmin} className="bg-blue-600 hover:bg-blue-700">
                  <Plus size={18} className="mr-2" />
                  Thêm người dùng
                </Button>
              </div>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <Input
                  placeholder="Tìm kiếm theo tên đăng nhập hoặc email..."
                  value={adminSearchTerm}
                  onChange={(e) => setAdminSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Admin Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Tên đăng nhập</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Vai trò</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Nhóm</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Trạng thái</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdminUsers.map((admin, index) => (
                      <tr
                        key={admin.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{admin.username}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{admin.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{admin.role}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{admin.group}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            admin.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {admin.status === 'Active' ? 'Hoạt động' : 'Đã khóa'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="sm" title="Chỉnh sửa" onClick={() => handleEditAdmin(admin)}>
                              <Edit size={18} className="text-amber-600" />
                            </Button>
                            <Button variant="ghost" size="sm" title={admin.status === 'Active' ? 'Khóa' : 'Mở khóa'} onClick={() => handleLockAdmin(admin)}>
                              <Lock size={18} className={admin.status === 'Active' ? 'text-gray-600' : 'text-green-600'} />
                            </Button>
                            <Button variant="ghost" size="sm" title="Xóa" onClick={() => handleDeleteAdmin(admin)}>
                              <Trash2 size={18} className="text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Permission Config */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-900 mb-3">Phân quyền Cập nhật</p>
                <p className="text-sm text-gray-600 mb-3">Thiết lập quyền xem và cập nhật dữ liệu trên tài nguyên theo người dùng và theo nhóm</p>
                <Button variant="outline" size="sm" onClick={() => setPermissionDialogOpen(true)}>
                  <Shield size={16} className="mr-2" />
                  Cấu hình phân quyền
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Areas (Campus & Buildings) */}
          <TabsContent value="areas" className="p-6 space-y-6">
            {/* Campus Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Map size={20} className="text-blue-600" />
                    Quản lý Cơ sở (Campus)
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Quản lý các cơ sở/khuôn viên của trường</p>
                </div>
                <Button onClick={handleAddCampus} className="bg-blue-600 hover:bg-blue-700">
                  <Plus size={18} className="mr-2" />
                  Thêm cơ sở
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {campuses.map((campus) => (
                  <div 
                    key={campus.id} 
                    className={`p-4 bg-white rounded-lg border-2 cursor-pointer transition-all ${
                      selectedCampusFilter === campus.id 
                        ? 'border-blue-500 shadow-md ring-2 ring-blue-100' 
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedCampusFilter(selectedCampusFilter === campus.id ? 'all' : campus.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedCampusFilter === campus.id ? 'bg-blue-500' : 'bg-blue-100'
                        }`}>
                          <MapPin size={20} className={selectedCampusFilter === campus.id ? 'text-white' : 'text-blue-600'} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{campus.name}</h4>
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{campus.code}</span>
                        </div>
                      </div>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => handleEditCampus(campus)}>
                          <Edit size={16} className="text-amber-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCampus(campus)}>
                          <Trash2 size={16} className="text-red-600" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{campus.address}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">{campus.description}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        selectedCampusFilter === campus.id 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {getBuildingCountByCampus(campus.id)} tòa nhà
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buildings Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 size={20} className="text-green-600" />
                    Quản lý Tòa nhà
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Quản lý các tòa nhà trong từng cơ sở</p>
                </div>
                <div className="flex items-center gap-3">
                  <Select
                    value={selectedCampusFilter === 'all' ? 'all' : String(selectedCampusFilter)}
                    onValueChange={(v) => setSelectedCampusFilter(v === 'all' ? 'all' : Number(v))}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Lọc theo cơ sở" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả cơ sở</SelectItem>
                      {campuses.map((campus) => (
                        <SelectItem key={campus.id} value={String(campus.id)}>{campus.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddBuilding} className="bg-green-600 hover:bg-green-700">
                    <Plus size={18} className="mr-2" />
                    Thêm tòa nhà
                  </Button>
                </div>
              </div>
              
              {/* Buildings Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Tên tòa nhà</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Mã</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Cơ sở</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Số tầng</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Mô tả</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBuildings.map((building, index) => (
                      <tr
                        key={building.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-gray-400" />
                            {building.name}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono text-xs">{building.code}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{getCampusName(building.campusId)}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{building.floors} tầng</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{building.description}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="sm" title="Chỉnh sửa" onClick={() => handleEditBuilding(building)}>
                              <Edit size={18} className="text-amber-600" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Xóa" onClick={() => handleDeleteBuilding(building)}>
                              <Trash2 size={18} className="text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredBuildings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          <Building2 size={40} className="mx-auto text-gray-300 mb-2" />
                          <p>Chưa có tòa nhà nào{selectedCampusFilter !== 'all' && ` trong cơ sở "${getCampusName(selectedCampusFilter)}"`}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Security */}
          <TabsContent value="security" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock size={24} />
                Thiết lập Bảo mật
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-3">Chính sách Mật khẩu</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Yêu cầu mật khẩu mạnh</label>
                      <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm">
                        <option>Bắt buộc (tối thiểu 8 ký tự, chữ hoa, số, ký tự đặc biệt)</option>
                        <option>Tùy chọn</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Thời gian thay đổi mật khẩu</label>
                      <Input type="number" placeholder="90 (ngày)" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Thời gian hợp lệ</label>
                      <Input type="number" placeholder="365 (ngày)" className="mt-1" />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-3">Chính sách Hạn chế Đăng nhập</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Giới hạn số lần đăng nhập sai</label>
                      <Input type="number" placeholder="5 lần" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Tự động vô hiệu hóa tài khoản sau</label>
                      <Input type="number" placeholder="30 phút" className="mt-1" />
                    </div>
                  </div>
                </div>

                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Lưu cài đặt bảo mật</Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab 4: Access Control */}
          <TabsContent value="access" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Eye size={24} />
                Kiểm soát Truy cập
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-3">Thiết lập Timeout</p>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Thời gian chờ (phút)</label>
                    <Input type="number" placeholder="30" className="mt-1" />
                    <p className="text-xs text-gray-500 mt-1">Đóng phiên kết nối khi không hoạt động</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-3">Giới hạn Địa chỉ Mạng Quản trị</p>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">IP/Subnet được phép</label>
                    <Input placeholder="192.168.1.0/24" className="mt-1" />
                    <p className="text-xs text-gray-500 mt-1">Danh sách IP được phép truy cập từ xa</p>
                  </div>
                </div>

                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Lưu cài đặt truy cập</Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab 5: Technical */}
          <TabsContent value="technical" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Database size={24} />
                Cấu hình Kỹ thuật
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-3">Kết nối Cơ sở Dữ liệu</p>
                  <div className="space-y-3">
                    <Input placeholder="Host" defaultValue="db.hcmus.edu.vn" />
                    <Input placeholder="Port" defaultValue="5432" />
                    <Input placeholder="Database" defaultValue="wifi_management" />
                    <Input placeholder="Username" defaultValue="admin" />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Mail size={18} />
                    Email Hệ thống
                  </p>
                  <div className="space-y-3">
                    <Input placeholder="SMTP Server" defaultValue="mail.hcmus.edu.vn" />
                    <Input placeholder="SMTP Port" defaultValue="587" />
                    <Input placeholder="Email" defaultValue="noreply@hcmus.edu.vn" />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-3">Kết nối Zalo OA & ZNS</p>
                  <div className="space-y-3">
                    <Input placeholder="Zalo OA ID" />
                    <Input placeholder="Zalo ZNS Token" />
                    <p className="text-xs text-gray-500">Hỗ trợ đăng ký Khách qua Zalo</p>
                  </div>
                </div>

                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Lưu cài đặt kỹ thuật</Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab 6: Logs */}
          <TabsContent value="logs" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý Nhật ký (Logs)</h3>
              
              {/* Log Filter */}
              <div className="flex gap-2 mb-4">
                <Button 
                  variant={logFilter === 'all' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setLogFilter('all')}
                  className={logFilter === 'all' ? 'bg-blue-600' : ''}
                >
                  Tất cả
                </Button>
                <Button 
                  variant={logFilter === 'access' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setLogFilter('access')}
                  className={logFilter === 'access' ? 'bg-blue-600' : ''}
                >
                  Truy cập
                </Button>
                <Button 
                  variant={logFilter === 'error' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setLogFilter('error')}
                  className={logFilter === 'error' ? 'bg-blue-600' : ''}
                >
                  Lỗi
                </Button>
                <Button 
                  variant={logFilter === 'config' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setLogFilter('config')}
                  className={logFilter === 'config' ? 'bg-blue-600' : ''}
                >
                  Cấu hình
                </Button>
                <Button 
                  variant={logFilter === 'account' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setLogFilter('account')}
                  className={logFilter === 'account' ? 'bg-blue-600' : ''}
                >
                  Tài khoản
                </Button>
              </div>
              
              {/* Logs Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Thời gian</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Người dùng</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Hành động</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Loại</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log, index) => (
                      <tr
                        key={log.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{log.timestamp}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{log.user}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{log.action}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            log.type === 'access' ? 'bg-blue-100 text-blue-800' :
                            log.type === 'error' ? 'bg-red-100 text-red-800' :
                            log.type === 'config' ? 'bg-amber-100 text-amber-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {log.type === 'access' ? 'Truy cập' :
                             log.type === 'error' ? 'Lỗi' :
                             log.type === 'config' ? 'Cấu hình' : 'Tài khoản'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button variant="ghost" size="sm" onClick={() => handleViewLog(log)}>
                            <Eye size={18} className="text-blue-600" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Add Admin User Dialog */}
      <Dialog open={addAdminDialogOpen} onOpenChange={setAddAdminDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users size={20} />
              Thêm Người dùng Hệ thống
            </DialogTitle>
            <DialogDescription>
              Tạo tài khoản quản trị viên mới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-username">Tên đăng nhập</Label>
              <Input
                id="admin-username"
                value={adminForm.username || ''}
                onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                placeholder="admin_user"
              />
            </div>
            <div>
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={adminForm.email || ''}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                placeholder="admin@hcmus.edu.vn"
              />
            </div>
            <div>
              <Label htmlFor="admin-password">Mật khẩu</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Nhập mật khẩu"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="admin-role">Vai trò Hệ thống</Label>
                <Select
                  value={adminForm.role}
                  onValueChange={(value) => setAdminForm({ ...adminForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {systemRoles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="admin-group">Nhóm</Label>
                <Select
                  value={adminForm.group}
                  onValueChange={(value) => setAdminForm({ ...adminForm, group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhóm" />
                  </SelectTrigger>
                  <SelectContent>
                    {userGroups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="admin-status">Trạng thái tài khoản</Label>
              <Select
                value={adminForm.status}
                onValueChange={(value) => setAdminForm({ ...adminForm, status: value as AdminUser['status'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Hoạt động</SelectItem>
                  <SelectItem value="Locked">Đã khóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="admin-time-limit">Giới hạn thời gian truy cập (tùy chọn)</Label>
              <Input
                id="admin-time-limit"
                type="datetime-local"
                value={adminForm.accessTimeLimit || ''}
                onChange={(e) => setAdminForm({ ...adminForm, accessTimeLimit: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAdminDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveNewAdmin} className="bg-blue-600 hover:bg-blue-700">Thêm người dùng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin User Dialog */}
      <Dialog open={editAdminDialogOpen} onOpenChange={setEditAdminDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Người dùng Hệ thống</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin tài khoản quản trị viên
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-admin-username">Tên đăng nhập</Label>
              <Input
                id="edit-admin-username"
                value={adminForm.username || ''}
                onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-admin-email">Email</Label>
              <Input
                id="edit-admin-email"
                type="email"
                value={adminForm.email || ''}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-admin-role">Vai trò Hệ thống</Label>
                <Select
                  value={adminForm.role}
                  onValueChange={(value) => setAdminForm({ ...adminForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {systemRoles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-admin-group">Nhóm</Label>
                <Select
                  value={adminForm.group}
                  onValueChange={(value) => setAdminForm({ ...adminForm, group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhóm" />
                  </SelectTrigger>
                  <SelectContent>
                    {userGroups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-admin-status">Trạng thái tài khoản</Label>
              <Select
                value={adminForm.status}
                onValueChange={(value) => setAdminForm({ ...adminForm, status: value as AdminUser['status'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Hoạt động</SelectItem>
                  <SelectItem value="Locked">Đã khóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-admin-time-limit">Giới hạn thời gian truy cập (tùy chọn)</Label>
              <Input
                id="edit-admin-time-limit"
                type="datetime-local"
                value={adminForm.accessTimeLimit || ''}
                onChange={(e) => setAdminForm({ ...adminForm, accessTimeLimit: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAdminDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveEditAdmin} className="bg-blue-600 hover:bg-blue-700">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Admin User Dialog */}
      <AlertDialog open={deleteAdminDialogOpen} onOpenChange={setDeleteAdminDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản <strong>{selectedAdmin?.username}</strong>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAdmin} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permission Matrix Dialog */}
      <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield size={20} />
              Cấu hình Phân quyền
            </DialogTitle>
            <DialogDescription>
              Thiết lập ma trận phân quyền cho các nhóm người dùng
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Chọn nhóm người dùng</Label>
              <Select defaultValue={userGroups[0]}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhóm" />
                </SelectTrigger>
                <SelectContent>
                  {userGroups.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">Tài nguyên</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-900">Quyền Xem</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-900">Quyền Sửa</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedGroupPermissions.map((perm, idx) => (
                    <tr key={perm.resource} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-sm text-gray-900">{perm.resource}</td>
                      <td className="px-4 py-2 text-center">
                        <Checkbox 
                          checked={perm.canView}
                          onCheckedChange={(checked) => {
                            const newPerms = [...selectedGroupPermissions];
                            newPerms[idx].canView = !!checked;
                            setSelectedGroupPermissions(newPerms);
                          }}
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Checkbox 
                          checked={perm.canEdit}
                          onCheckedChange={(checked) => {
                            const newPerms = [...selectedGroupPermissions];
                            newPerms[idx].canEdit = !!checked;
                            setSelectedGroupPermissions(newPerms);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionDialogOpen(false)}>Hủy</Button>
            <Button onClick={() => setPermissionDialogOpen(false)} className="bg-blue-600 hover:bg-blue-700">Lưu phân quyền</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Detail Dialog */}
      <Dialog open={logDetailDialogOpen} onOpenChange={setLogDetailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={20} />
              Chi tiết Nhật ký
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Thời gian</Label>
                  <p className="text-sm font-mono">{selectedLog.timestamp}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Người dùng</Label>
                  <p className="text-sm font-medium">{selectedLog.user}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Hành động</Label>
                <p className="text-sm">{selectedLog.action}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Loại</Label>
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                  selectedLog.type === 'access' ? 'bg-blue-100 text-blue-800' :
                  selectedLog.type === 'error' ? 'bg-red-100 text-red-800' :
                  selectedLog.type === 'config' ? 'bg-amber-100 text-amber-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedLog.type === 'access' ? 'Truy cập' :
                   selectedLog.type === 'error' ? 'Lỗi' :
                   selectedLog.type === 'config' ? 'Cấu hình' : 'Tài khoản'}
                </span>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Chi tiết</Label>
                <p className="text-sm p-3 bg-gray-50 rounded-lg border">{selectedLog.details}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogDetailDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Campus Dialog */}
      <Dialog open={addCampusDialogOpen} onOpenChange={setAddCampusDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              Thêm Cơ sở mới
            </DialogTitle>
            <DialogDescription>Nhập thông tin cơ sở/khuôn viên mới</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tên cơ sở <span className="text-red-500">*</span></Label>
                <Input
                  value={campusForm.name || ''}
                  onChange={(e) => setCampusForm({ ...campusForm, name: e.target.value })}
                  placeholder="VD: Cơ sở Dĩ An"
                />
              </div>
              <div>
                <Label>Mã cơ sở <span className="text-red-500">*</span></Label>
                <Input
                  value={campusForm.code || ''}
                  onChange={(e) => setCampusForm({ ...campusForm, code: e.target.value.toUpperCase() })}
                  placeholder="VD: DA"
                />
              </div>
            </div>
            <div>
              <Label>Địa chỉ</Label>
              <Input
                value={campusForm.address || ''}
                onChange={(e) => setCampusForm({ ...campusForm, address: e.target.value })}
                placeholder="Nhập địa chỉ cơ sở"
              />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Input
                value={campusForm.description || ''}
                onChange={(e) => setCampusForm({ ...campusForm, description: e.target.value })}
                placeholder="Mô tả ngắn về cơ sở"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCampusDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveNewCampus} disabled={!campusForm.name || !campusForm.code}>Thêm cơ sở</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Campus Dialog */}
      <Dialog open={editCampusDialogOpen} onOpenChange={setEditCampusDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit size={20} className="text-amber-600" />
              Chỉnh sửa Cơ sở
            </DialogTitle>
            <DialogDescription>Cập nhật thông tin cơ sở "{selectedCampus?.name}"</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tên cơ sở <span className="text-red-500">*</span></Label>
                <Input
                  value={campusForm.name || ''}
                  onChange={(e) => setCampusForm({ ...campusForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Mã cơ sở <span className="text-red-500">*</span></Label>
                <Input
                  value={campusForm.code || ''}
                  onChange={(e) => setCampusForm({ ...campusForm, code: e.target.value.toUpperCase() })}
                />
              </div>
            </div>
            <div>
              <Label>Địa chỉ</Label>
              <Input
                value={campusForm.address || ''}
                onChange={(e) => setCampusForm({ ...campusForm, address: e.target.value })}
              />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Input
                value={campusForm.description || ''}
                onChange={(e) => setCampusForm({ ...campusForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCampusDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveEditCampus} disabled={!campusForm.name || !campusForm.code}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Campus Dialog */}
      <AlertDialog open={deleteCampusDialogOpen} onOpenChange={setDeleteCampusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa cơ sở</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa cơ sở <strong>{selectedCampus?.name}</strong>?
              <br /><br />
              <span className="text-red-600 font-medium">
                Cảnh báo: Tất cả {getBuildingCountByCampus(selectedCampus?.id || 0)} tòa nhà trong cơ sở này cũng sẽ bị xóa!
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCampus} className="bg-red-600 hover:bg-red-700">
              Xóa cơ sở
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Building Dialog */}
      <Dialog open={addBuildingDialogOpen} onOpenChange={setAddBuildingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 size={20} className="text-green-600" />
              Thêm Tòa nhà mới
            </DialogTitle>
            <DialogDescription>Nhập thông tin tòa nhà mới</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Thuộc cơ sở <span className="text-red-500">*</span></Label>
              <Select
                value={String(buildingForm.campusId)}
                onValueChange={(v) => setBuildingForm({ ...buildingForm, campusId: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn cơ sở" />
                </SelectTrigger>
                <SelectContent>
                  {campuses.map((campus) => (
                    <SelectItem key={campus.id} value={String(campus.id)}>{campus.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tên tòa nhà <span className="text-red-500">*</span></Label>
                <Input
                  value={buildingForm.name || ''}
                  onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
                  placeholder="VD: Tòa nhà A"
                />
              </div>
              <div>
                <Label>Mã tòa nhà <span className="text-red-500">*</span></Label>
                <Input
                  value={buildingForm.code || ''}
                  onChange={(e) => setBuildingForm({ ...buildingForm, code: e.target.value.toUpperCase() })}
                  placeholder="VD: A"
                />
              </div>
            </div>
            <div>
              <Label>Số tầng</Label>
              <Input
                type="number"
                min={1}
                value={buildingForm.floors || 1}
                onChange={(e) => setBuildingForm({ ...buildingForm, floors: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Input
                value={buildingForm.description || ''}
                onChange={(e) => setBuildingForm({ ...buildingForm, description: e.target.value })}
                placeholder="Mô tả ngắn về tòa nhà"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddBuildingDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveNewBuilding} disabled={!buildingForm.name || !buildingForm.code || !buildingForm.campusId}>
              Thêm tòa nhà
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Building Dialog */}
      <Dialog open={editBuildingDialogOpen} onOpenChange={setEditBuildingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit size={20} className="text-amber-600" />
              Chỉnh sửa Tòa nhà
            </DialogTitle>
            <DialogDescription>Cập nhật thông tin tòa nhà "{selectedBuilding?.name}"</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Thuộc cơ sở <span className="text-red-500">*</span></Label>
              <Select
                value={String(buildingForm.campusId)}
                onValueChange={(v) => setBuildingForm({ ...buildingForm, campusId: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn cơ sở" />
                </SelectTrigger>
                <SelectContent>
                  {campuses.map((campus) => (
                    <SelectItem key={campus.id} value={String(campus.id)}>{campus.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tên tòa nhà <span className="text-red-500">*</span></Label>
                <Input
                  value={buildingForm.name || ''}
                  onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Mã tòa nhà <span className="text-red-500">*</span></Label>
                <Input
                  value={buildingForm.code || ''}
                  onChange={(e) => setBuildingForm({ ...buildingForm, code: e.target.value.toUpperCase() })}
                />
              </div>
            </div>
            <div>
              <Label>Số tầng</Label>
              <Input
                type="number"
                min={1}
                value={buildingForm.floors || 1}
                onChange={(e) => setBuildingForm({ ...buildingForm, floors: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Input
                value={buildingForm.description || ''}
                onChange={(e) => setBuildingForm({ ...buildingForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBuildingDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveEditBuilding} disabled={!buildingForm.name || !buildingForm.code || !buildingForm.campusId}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Building Dialog */}
      <AlertDialog open={deleteBuildingDialogOpen} onOpenChange={setDeleteBuildingDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tòa nhà</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tòa nhà <strong>{selectedBuilding?.name}</strong> thuộc cơ sở <strong>{getCampusName(selectedBuilding?.campusId || 0)}</strong>?
              <br /><br />
              Các Access Point đang được gán cho tòa nhà này có thể bị ảnh hưởng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteBuilding} className="bg-red-600 hover:bg-red-700">
              Xóa tòa nhà
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
