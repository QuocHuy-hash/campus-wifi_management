import { useState, useEffect } from 'react';
import { useSearch } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Plus, Edit, Trash2, Shield, Wifi, Clock, FileText } from 'lucide-react';

// Import types and mock data from centralized file
import {
  WifiPolicy,
  AreaLocation,
  initialPolicies,
  initialCampuses,
  initialBuildings,
} from "@/data/mockData";

export default function Policies() {
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const tabFromUrl = urlParams.get('tab');
  
  // Set initial tab from URL or default to 'bandwidth'
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'bandwidth');
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newUrl = `${window.location.pathname}?tab=${value}`;
    window.history.replaceState(null, '', newUrl);
  };
  
  // Update tab from URL on mount
  useEffect(() => {
    if (tabFromUrl && ['bandwidth', 'session', 'audit', 'security'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Data states
  const [policies, setPolicies] = useState<WifiPolicy[]>(initialPolicies);
  
  // Area locations for select
  const [areaLocations, setAreaLocations] = useState<AreaLocation[]>([]);
  
  useEffect(() => {
    // Generate area locations from campuses and buildings
    const locations: AreaLocation[] = [];
    initialBuildings.forEach(building => {
      const campus = initialCampuses.find(c => c.id === building.campusId);
      if (campus) {
        locations.push({
          id: `${campus.code}-${building.code}`,
          label: `${campus.name} - ${building.name}`,
          campusName: campus.name,
          buildingName: building.name,
        });
      }
    });
    setAreaLocations(locations);
  }, []);
  
  // Dialog states
  const [addPolicyDialogOpen, setAddPolicyDialogOpen] = useState(false);
  const [editPolicyDialogOpen, setEditPolicyDialogOpen] = useState(false);
  const [deletePolicyDialogOpen, setDeletePolicyDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<WifiPolicy | null>(null);
  const [policyForm, setPolicyForm] = useState<Partial<WifiPolicy>>({});

  // Policy Handlers
  const handleAddPolicy = (type: WifiPolicy['type']) => {
    setPolicyForm({ type, applyToRoles: [] });
    setAddPolicyDialogOpen(true);
  };

  const handleEditPolicy = (policy: WifiPolicy) => {
    setSelectedPolicy(policy);
    setPolicyForm({ ...policy });
    setEditPolicyDialogOpen(true);
  };

  const handleDeletePolicy = (policy: WifiPolicy) => {
    setSelectedPolicy(policy);
    setDeletePolicyDialogOpen(true);
  };

  const saveNewPolicy = () => {
    const newPolicy: WifiPolicy = {
      id: Math.max(...policies.map(p => p.id), 0) + 1,
      name: policyForm.name || '',
      description: policyForm.description || '',
      type: policyForm.type || 'bandwidth',
      downloadLimit: policyForm.downloadLimit,
      uploadLimit: policyForm.uploadLimit,
      maxSessionTime: policyForm.maxSessionTime,
      maxSessionData: policyForm.maxSessionData,
      applyToRoles: policyForm.applyToRoles || [],
      applyToArea: policyForm.applyToArea,
      applyByTime: policyForm.applyByTime,
    };
    setPolicies([...policies, newPolicy]);
    setAddPolicyDialogOpen(false);
    setPolicyForm({});
  };

  const saveEditPolicy = () => {
    if (selectedPolicy) {
      setPolicies(policies.map(p => p.id === selectedPolicy.id ? { ...p, ...policyForm } as WifiPolicy : p));
    }
    setEditPolicyDialogOpen(false);
    setSelectedPolicy(null);
    setPolicyForm({});
  };

  const confirmDeletePolicy = () => {
    if (selectedPolicy) {
      setPolicies(policies.filter(p => p.id !== selectedPolicy.id));
    }
    setDeletePolicyDialogOpen(false);
    setSelectedPolicy(null);
  };

  const getPolicyTypeLabel = (type: WifiPolicy['type']) => {
    switch (type) {
      case 'bandwidth': return 'Băng thông';
      case 'auth': return 'Xác thực';
      case 'session': return 'Phiên truy cập';
      case 'audit': return 'Kiểm toán';
      case 'security': return 'Bảo mật';
    }
  };

  // Render policy table
  const renderPolicyTable = (type: WifiPolicy['type']) => {
    const filteredPolicies = policies.filter(p => p.type === type);
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Tên chính sách</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Mô tả</th>
              {type === 'bandwidth' && (
                <>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Tải xuống</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Tải lên</th>
                </>
              )}
              {type === 'session' && (
                <>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Thời gian phiên</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Lưu lượng phiên</th>
                </>
              )}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Áp dụng cho</th>
              {(type === 'audit' || type === 'security') && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">
                  {type === 'audit' ? 'Khu vực' : 'Thời gian'}
                </th>
              )}
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredPolicies.map((policy, index) => (
              <tr
                key={policy.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{policy.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{policy.description}</td>
                {type === 'bandwidth' && (
                  <>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded">{policy.downloadLimit || 0} Mbps</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded">{policy.uploadLimit || 0} Mbps</span>
                    </td>
                  </>
                )}
                {type === 'session' && (
                  <>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="bg-[#1e3a5f]/10 text-[#1e3a5f] px-2 py-1 rounded">{policy.maxSessionTime || 0} phút</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="bg-[#1e3a5f]/10 text-[#1e3a5f] px-2 py-1 rounded">{policy.maxSessionData || 0} MB</span>
                    </td>
                  </>
                )}
                <td className="px-4 py-3 text-sm text-gray-600">
                  <div className="flex flex-wrap gap-1">
                    {policy.applyToRoles.map((role) => (
                      <span key={role} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                {type === 'audit' && (
                  <td className="px-4 py-3 text-sm text-gray-600">{policy.applyToArea || 'Tất cả'}</td>
                )}
                {type === 'security' && (
                  <td className="px-4 py-3 text-sm text-gray-600">{policy.applyByTime || '24/7'}</td>
                )}
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="ghost" size="sm" title="Chỉnh sửa" onClick={() => handleEditPolicy(policy)}>
                      <Edit size={18} className="text-amber-600" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Xóa" onClick={() => handleDeletePolicy(policy)}>
                      <Trash2 size={18} className="text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredPolicies.length === 0 && (
              <tr>
                <td colSpan={type === 'bandwidth' || type === 'session' ? 6 : 5} className="px-4 py-8 text-center text-gray-500">
                  <p>Chưa có chính sách {getPolicyTypeLabel(type).toLowerCase()} nào</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản trị Chính sách WiFi</h1>
        <p className="text-gray-600 mt-1">Quản lý các chính sách băng thông, phiên truy cập, kiểm toán và bảo mật</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className="p-4 bg-[#1e3a5f]/5 border-[#1e3a5f]/20 cursor-pointer hover:bg-[#1e3a5f]/10 transition-colors"
          onClick={() => handleTabChange('bandwidth')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
              <Wifi size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1e3a5f]">{policies.filter(p => p.type === 'bandwidth').length}</p>
              <p className="text-sm text-[#1e3a5f]/70">Chính sách Băng thông</p>
            </div>
          </div>
        </Card>
        <Card 
          className="p-4 bg-[#1e3a5f]/5 border-[#1e3a5f]/20 cursor-pointer hover:bg-[#1e3a5f]/10 transition-colors"
          onClick={() => handleTabChange('session')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1e3a5f]">{policies.filter(p => p.type === 'session').length}</p>
              <p className="text-sm text-[#1e3a5f]/70">Chính sách Phiên</p>
            </div>
          </div>
        </Card>
        <Card 
          className="p-4 bg-[#1e3a5f]/5 border-[#1e3a5f]/20 cursor-pointer hover:bg-[#1e3a5f]/10 transition-colors"
          onClick={() => handleTabChange('audit')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1e3a5f]">{policies.filter(p => p.type === 'audit').length}</p>
              <p className="text-sm text-[#1e3a5f]/70">Chính sách Kiểm toán</p>
            </div>
          </div>
        </Card>
        <Card 
          className="p-4 bg-[#1e3a5f]/5 border-[#1e3a5f]/20 cursor-pointer hover:bg-[#1e3a5f]/10 transition-colors"
          onClick={() => handleTabChange('security')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1e3a5f]">{policies.filter(p => p.type === 'security').length}</p>
              <p className="text-sm text-[#1e3a5f]/70">Chính sách Bảo mật</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Card className="bg-white shadow-sm">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <div className="grid grid-cols-4 w-full">
              <TabsTrigger 
                value="bandwidth" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1e3a5f] data-[state=active]:bg-transparent data-[state=active]:text-[#1e3a5f] py-3 px-4 flex items-center gap-2"
              >
                <Wifi size={18} />
                Băng thông
              </TabsTrigger>
              <TabsTrigger 
                value="session" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1e3a5f] data-[state=active]:bg-transparent data-[state=active]:text-[#1e3a5f] py-3 px-4 flex items-center gap-2"
              >
                <Clock size={18} />
                Phiên truy cập
              </TabsTrigger>
              <TabsTrigger 
                value="audit" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1e3a5f] data-[state=active]:bg-transparent data-[state=active]:text-[#1e3a5f] py-3 px-4 flex items-center gap-2"
              >
                <FileText size={18} />
                Kiểm toán
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1e3a5f] data-[state=active]:bg-transparent data-[state=active]:text-[#1e3a5f] py-3 px-4 flex items-center gap-2"
              >
                <Shield size={18} />
                Bảo mật
              </TabsTrigger>
            </div>
          </TabsList>

          {/* Tab: Bandwidth */}
          <TabsContent value="bandwidth" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Chính sách Băng thông</h3>
                <p className="text-sm text-gray-500">Giới hạn tốc độ tải xuống/tải lên theo nhóm người dùng</p>
              </div>
              <Button onClick={() => handleAddPolicy('bandwidth')} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                <Plus size={18} className="mr-2" />
                Thêm chính sách
              </Button>
            </div>
            {renderPolicyTable('bandwidth')}
          </TabsContent>

          {/* Tab: Session */}
          <TabsContent value="session" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Chính sách Phiên truy cập</h3>
                <p className="text-sm text-gray-500">Quản lý thời gian và lưu lượng phiên kết nối</p>
              </div>
              <Button onClick={() => handleAddPolicy('session')} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                <Plus size={18} className="mr-2" />
                Thêm chính sách
              </Button>
            </div>
            {renderPolicyTable('session')}
          </TabsContent>

          {/* Tab: Audit */}
          <TabsContent value="audit" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Chính sách Kiểm toán</h3>
                <p className="text-sm text-gray-500">Cấu hình ghi log và theo dõi hoạt động người dùng</p>
              </div>
              <Button onClick={() => handleAddPolicy('audit')} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                <Plus size={18} className="mr-2" />
                Thêm chính sách
              </Button>
            </div>
            {renderPolicyTable('audit')}
          </TabsContent>

          {/* Tab: Security */}
          <TabsContent value="security" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Chính sách Bảo mật</h3>
                <p className="text-sm text-gray-500">Cấu hình các quy tắc bảo mật mạng</p>
              </div>
              <Button onClick={() => handleAddPolicy('security')} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                <Plus size={18} className="mr-2" />
                Thêm chính sách
              </Button>
            </div>
            {renderPolicyTable('security')}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Add Policy Dialog */}
      <Dialog open={addPolicyDialogOpen} onOpenChange={setAddPolicyDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Thêm Chính sách {getPolicyTypeLabel(policyForm.type || 'bandwidth')}</DialogTitle>
            <DialogDescription>
              Tạo chính sách WiFi mới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="policy-name">Tên Chính sách</Label>
              <Input
                id="policy-name"
                value={policyForm.name || ''}
                onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })}
                placeholder="Tên chính sách"
              />
            </div>
            <div>
              <Label htmlFor="policy-desc">Mô tả</Label>
              <Input
                id="policy-desc"
                value={policyForm.description || ''}
                onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })}
                placeholder="Mô tả chính sách"
              />
            </div>
            
            {policyForm.type === 'bandwidth' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="policy-dl">Giới hạn Tải xuống (Mbps)</Label>
                  <Input
                    id="policy-dl"
                    type="number"
                    value={policyForm.downloadLimit || ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, downloadLimit: Number(e.target.value) })}
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label htmlFor="policy-ul">Giới hạn Tải lên (Mbps)</Label>
                  <Input
                    id="policy-ul"
                    type="number"
                    value={policyForm.uploadLimit || ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, uploadLimit: Number(e.target.value) })}
                    placeholder="5"
                  />
                </div>
              </div>
            )}
            
            {policyForm.type === 'session' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="policy-session-time">Thời gian phiên tối đa (phút)</Label>
                  <Input
                    id="policy-session-time"
                    type="number"
                    value={policyForm.maxSessionTime || ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, maxSessionTime: Number(e.target.value) })}
                    placeholder="480"
                  />
                </div>
                <div>
                  <Label htmlFor="policy-session-data">Lưu lượng phiên tối đa (MB)</Label>
                  <Input
                    id="policy-session-data"
                    type="number"
                    value={policyForm.maxSessionData || ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, maxSessionData: Number(e.target.value) })}
                    placeholder="5000"
                  />
                </div>
              </div>
            )}
            
            <div>
              <Label>Áp dụng cho Vai trò</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                {['Sinh viên', 'Cán bộ', 'Khách'].map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role}`}
                      checked={policyForm.applyToRoles?.includes(role)}
                      onCheckedChange={(checked) => {
                        const currentRoles = policyForm.applyToRoles || [];
                        if (checked) {
                          setPolicyForm({ ...policyForm, applyToRoles: [...currentRoles, role] });
                        } else {
                          setPolicyForm({ ...policyForm, applyToRoles: currentRoles.filter(r => r !== role) });
                        }
                      }}
                    />
                    <Label htmlFor={`role-${role}`} className="text-sm">{role}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policy-area">Áp dụng theo Khu vực</Label>
                <Select
                  value={policyForm.applyToArea || ''}
                  onValueChange={(value) => setPolicyForm({ ...policyForm, applyToArea: value === 'all' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khu vực" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả khu vực</SelectItem>
                    {areaLocations.map((area) => (
                      <SelectItem key={area.id} value={area.label}>
                        {area.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="policy-time">Áp dụng theo Thời gian</Label>
                <Select
                  value={policyForm.applyByTime || ''}
                  onValueChange={(value) => setPolicyForm({ ...policyForm, applyByTime: value === 'all' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">24/7</SelectItem>
                    <SelectItem value="6:00-22:00">6:00 - 22:00 (Giờ học)</SelectItem>
                    <SelectItem value="8:00-17:00">8:00 - 17:00 (Giờ hành chính)</SelectItem>
                    <SelectItem value="18:00-6:00">18:00 - 6:00 (Ngoài giờ)</SelectItem>
                    <SelectItem value="T2-T6">Thứ 2 - Thứ 6</SelectItem>
                    <SelectItem value="T7-CN">Thứ 7 - Chủ nhật</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPolicyDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveNewPolicy} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">Tạo chính sách</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Policy Dialog */}
      <Dialog open={editPolicyDialogOpen} onOpenChange={setEditPolicyDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Chính sách</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chính sách WiFi
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-policy-name">Tên Chính sách</Label>
              <Input
                id="edit-policy-name"
                value={policyForm.name || ''}
                onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-policy-desc">Mô tả</Label>
              <Input
                id="edit-policy-desc"
                value={policyForm.description || ''}
                onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })}
              />
            </div>
            
            {policyForm.type === 'bandwidth' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-policy-dl">Giới hạn Tải xuống (Mbps)</Label>
                  <Input
                    id="edit-policy-dl"
                    type="number"
                    value={policyForm.downloadLimit || ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, downloadLimit: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-policy-ul">Giới hạn Tải lên (Mbps)</Label>
                  <Input
                    id="edit-policy-ul"
                    type="number"
                    value={policyForm.uploadLimit || ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, uploadLimit: Number(e.target.value) })}
                  />
                </div>
              </div>
            )}
            
            {policyForm.type === 'session' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-policy-session-time">Thời gian phiên tối đa (phút)</Label>
                  <Input
                    id="edit-policy-session-time"
                    type="number"
                    value={policyForm.maxSessionTime || ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, maxSessionTime: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-policy-session-data">Lưu lượng phiên tối đa (MB)</Label>
                  <Input
                    id="edit-policy-session-data"
                    type="number"
                    value={policyForm.maxSessionData || ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, maxSessionData: Number(e.target.value) })}
                  />
                </div>
              </div>
            )}
            
            <div>
              <Label>Áp dụng cho Vai trò</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                {['Sinh viên', 'Cán bộ', 'Khách'].map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-role-${role}`}
                      checked={policyForm.applyToRoles?.includes(role)}
                      onCheckedChange={(checked) => {
                        const currentRoles = policyForm.applyToRoles || [];
                        if (checked) {
                          setPolicyForm({ ...policyForm, applyToRoles: [...currentRoles, role] });
                        } else {
                          setPolicyForm({ ...policyForm, applyToRoles: currentRoles.filter(r => r !== role) });
                        }
                      }}
                    />
                    <Label htmlFor={`edit-role-${role}`} className="text-sm">{role}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-policy-area">Áp dụng theo Khu vực</Label>
                <Select
                  value={policyForm.applyToArea || 'all'}
                  onValueChange={(value) => setPolicyForm({ ...policyForm, applyToArea: value === 'all' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khu vực" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả khu vực</SelectItem>
                    {areaLocations.map((area) => (
                      <SelectItem key={area.id} value={area.label}>
                        {area.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-policy-time">Áp dụng theo Thời gian</Label>
                <Select
                  value={policyForm.applyByTime || 'all'}
                  onValueChange={(value) => setPolicyForm({ ...policyForm, applyByTime: value === 'all' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">24/7</SelectItem>
                    <SelectItem value="6:00-22:00">6:00 - 22:00 (Giờ học)</SelectItem>
                    <SelectItem value="8:00-17:00">8:00 - 17:00 (Giờ hành chính)</SelectItem>
                    <SelectItem value="18:00-6:00">18:00 - 6:00 (Ngoài giờ)</SelectItem>
                    <SelectItem value="T2-T6">Thứ 2 - Thứ 6</SelectItem>
                    <SelectItem value="T7-CN">Thứ 7 - Chủ nhật</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPolicyDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveEditPolicy} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Policy Dialog */}
      <AlertDialog open={deletePolicyDialogOpen} onOpenChange={setDeletePolicyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa chính sách</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa chính sách <strong>{selectedPolicy?.name}</strong>?
              Các người dùng đang áp dụng chính sách này sẽ bị ảnh hưởng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePolicy} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
