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
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Edit, Trash2, Shield, Wifi, Clock, FileText, Search, RefreshCw, Filter, Key, GripVertical, ArrowDown, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';

// Import types and mock data from centralized file
import {
  WifiPolicy,
  AuthPolicy,
  AreaLocation,
  initialPolicies,
  initialAuthPolicies,
  authUserTypeOptions,
  authMethodOptions,
  AuthUserType,
  AuthMethod,
  initialCampuses,
  initialBuildings,
  initialAPs,
  initialControllers,
  getPolicyTypeLabel,
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
    if (tabFromUrl && ['bandwidth', 'auth', 'audit', 'security', 'authorization'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Data states
  const [policies, setPolicies] = useState<WifiPolicy[]>(initialPolicies);
  // ...existing code...
  
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

  // Auth Policy States
  const [authPolicies, setAuthPolicies] = useState<AuthPolicy[]>(initialAuthPolicies);
  const [addAuthPolicyDialogOpen, setAddAuthPolicyDialogOpen] = useState(false);
  const [editAuthPolicyDialogOpen, setEditAuthPolicyDialogOpen] = useState(false);
  const [deleteAuthPolicyDialogOpen, setDeleteAuthPolicyDialogOpen] = useState(false);
  const [selectedAuthPolicy, setSelectedAuthPolicy] = useState<AuthPolicy | null>(null);
  const [authPolicyForm, setAuthPolicyForm] = useState<Partial<AuthPolicy>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validate Auth Policy
  const validateAuthPolicy = (policy: Partial<AuthPolicy>) => {
    if (!policy.name) return "Tên chính sách là bắt buộc";
    if (!policy.userType) return "Loại người dùng là bắt buộc";
    if (!policy.authMethod) return "Phương thức xác thực là bắt buộc";

    // Validate Guest vs Enterprise Auth
    const isGuest = policy.userType === 'guest_reg' || policy.userType === 'guest_noreg';
    const isEnterprise = policy.authMethod === 'azure_ad' || policy.authMethod === 'google_workspace';
    
    if (isGuest && isEnterprise) {
      return "Người dùng Khách không thể sử dụng phương thức xác thực Doanh nghiệp (Azure/Google)";
    }

    return null;
  };

  // Filter states
  const [filterRole, setFilterRole] = useState('all');
  const [filterArea, setFilterArea] = useState('all');
  const [filterTime, setFilterTime] = useState('all');
  const [filterController, setFilterController] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');

  // Reset filters
  const resetFilters = () => {
    setFilterRole('all');
    setFilterArea('all');
    setFilterTime('all');
    setFilterController('all');
    setFilterSearch('');
  };

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
      // Audit-specific fields
      auditMaxSessionTime: policyForm.auditMaxSessionTime,
      auditMaxSessionTimeUnit: policyForm.auditMaxSessionTimeUnit,
      auditMaxDataUsage: policyForm.auditMaxDataUsage,
      auditMaxDataUsageUnit: policyForm.auditMaxDataUsageUnit,
      accountingInterval: policyForm.accountingInterval,
      accountingIntervalUnit: policyForm.accountingIntervalUnit,
      logRetentionPeriod: policyForm.logRetentionPeriod,
      logRetentionUnit: policyForm.logRetentionUnit,
      disconnectAction: policyForm.disconnectAction,
      // Security-specific fields
      maxConcurrentDevices: policyForm.maxConcurrentDevices,
      macCachingEnabled: policyForm.macCachingEnabled,
      macCacheTime: policyForm.macCacheTime,
      macCacheTimeUnit: policyForm.macCacheTimeUnit,
      reAuthInterval: policyForm.reAuthInterval,
      reAuthIntervalUnit: policyForm.reAuthIntervalUnit,
      allowUserMacManagement: policyForm.allowUserMacManagement,
      retryLimit: policyForm.retryLimit,
      applyToRoles: policyForm.applyToRoles || [],
      applyToArea: policyForm.applyToArea,
      applyByTime: policyForm.applyByTime,
      // Authorization-specific fields
      vlanId: policyForm.vlanId,
      maxDailyData: policyForm.maxDailyData,
      idleTimeout: policyForm.idleTimeout,
      autoReLogin: policyForm.autoReLogin,
      bindMacAddress: policyForm.bindMacAddress,
      isActive: policyForm.isActive,
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


  // Auth Policy Handlers
  const handleEditAuthPolicy = (policy: AuthPolicy) => {
    setSelectedAuthPolicy(policy);
    setAuthPolicyForm(policy);
    setEditAuthPolicyDialogOpen(true);
    setValidationError(null); // Clear validation errors on open
  };

  const handleDeleteAuthPolicy = (policy: AuthPolicy) => {
    setSelectedAuthPolicy(policy);
    setDeleteAuthPolicyDialogOpen(true);
  };

  const saveNewAuthPolicy = () => {
    const error = validateAuthPolicy(authPolicyForm);
    if (error) {
      setValidationError(error);
      return;
    }

    const newPolicy: AuthPolicy = {
      id: Math.max(...authPolicies.map(p => p.id), 0) + 1,
      name: authPolicyForm.name!,
      description: authPolicyForm.description || '',
      isActive: authPolicyForm.isActive ?? true,
      userType: authPolicyForm.userType!,
      authMethod: authPolicyForm.authMethod!,
      require2FA: authPolicyForm.require2FA || false,
      allowRegistration: authPolicyForm.allowRegistration || false,
      applyByTime: authPolicyForm.applyByTime || 'all',
      appliedAreas: authPolicyForm.appliedAreas || ['all'],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setAuthPolicies([...authPolicies, newPolicy]);
    setAddAuthPolicyDialogOpen(false);
    setAuthPolicyForm({});
    setValidationError(null);
  };

  const saveEditAuthPolicy = () => {
    const error = validateAuthPolicy(authPolicyForm);
    if (error) {
       setValidationError(error);
       return;
    }

    if (selectedAuthPolicy && authPolicyForm.name) {
      setAuthPolicies(authPolicies.map(p => 
        p.id === selectedAuthPolicy.id 
          ? { ...p, ...authPolicyForm, updatedAt: new Date().toISOString().split('T')[0] } as AuthPolicy 
          : p
      ));
    }
    setEditAuthPolicyDialogOpen(false);
    setSelectedAuthPolicy(null);
    setAuthPolicyForm({});
    setValidationError(null);
  };

  const confirmDeleteAuthPolicy = () => {
    if (selectedAuthPolicy) {
      setAuthPolicies(authPolicies.filter(p => p.id !== selectedAuthPolicy.id));
    }
    setDeleteAuthPolicyDialogOpen(false);
    setSelectedAuthPolicy(null);
  };




  // Render policy table
  const renderPolicyTable = (type: WifiPolicy['type']) => {
    // Apply filters
    let filteredPolicies = policies.filter(p => p.type === type);
    
    // Filter by role
    if (filterRole !== 'all') {
      filteredPolicies = filteredPolicies.filter(p => p.applyToRoles.includes(filterRole));
    }
    
    // Filter by area
    if (filterArea !== 'all') {
      filteredPolicies = filteredPolicies.filter(p => 
        !p.applyToArea || p.applyToArea === '' || p.applyToArea.includes(filterArea)
      );
    }
    
    // Filter by time
    if (filterTime !== 'all') {
      filteredPolicies = filteredPolicies.filter(p => 
        !p.applyByTime || p.applyByTime === '' || p.applyByTime === filterTime
      );
    }
    
    // Filter by search text
    if (filterSearch) {
      const searchLower = filterSearch.toLowerCase();
      filteredPolicies = filteredPolicies.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Special table for audit type
    if (type === 'audit') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Tên chính sách</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Giới hạn Thời gian Phiên</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Giới hạn Dung lượng</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Chu kỳ Ghi nhận</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Áp dụng cho</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Thao tác</th>
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
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{policy.name}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">{policy.description}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="bg-[#1e3a5f]/10 text-[#1e3a5f] px-2 py-1 rounded">
                      {policy.auditMaxSessionTime || 0} {policy.auditMaxSessionTimeUnit === 'hour' ? 'giờ' : 'phút'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded">
                      {policy.auditMaxDataUsage || 0} {policy.auditMaxDataUsageUnit || 'GB'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                      {policy.accountingInterval || 0} {policy.accountingIntervalUnit === 'minute' ? 'phút' : 'giây'}
                    </span>
                  </td>
                 
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex flex-wrap gap-1">
                      {policy.applyToRoles.map((role) => (
                        <span key={role} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                 
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
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    <p>Chưa có chính sách kiểm toán nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }
    
    // Special table for security type
    if (type === 'security') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Tên chính sách</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Thiết bị đồng thời</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Tái xác thực</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Retry</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Áp dụng cho</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Thao tác</th>
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
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{policy.name}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">{policy.description}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="bg-[#1e3a5f]/10 text-[#1e3a5f] px-2 py-1 rounded font-medium">
                      {policy.maxConcurrentDevices || 0} thiết bị
                    </span>
                  </td>
                 
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded">
                      {policy.reAuthInterval || 0} {policy.reAuthIntervalUnit === 'day' ? 'ngày' : 'giờ'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="bg-red-50 text-red-700 px-2 py-1 rounded">
                      {policy.retryLimit || 0} lần
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex flex-wrap gap-1">
                      {policy.applyToRoles.map((role) => (
                        <span key={role} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
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
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    <p>Chưa có chính sách bảo mật nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }

    // Table for auth type
    if (type === 'auth') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Tên chính sách</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Phương thức</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Áp dụng cho</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">IdP / Cấu hình</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {authPolicies.map((policy, index) => (
                <tr
                  key={policy.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{policy.name}</p>
                      {policy.description && (
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{policy.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {authMethodOptions.find(m => m.value === policy.authMethod)?.label || policy.authMethod}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                     <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                      {authUserTypeOptions.find(u => u.value === policy.userType)?.label || policy.userType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex flex-col text-xs">
                       {policy.authMethod === 'azure_ad' && <span>Tenant: {policy.idpConfig?.azureTenantId}</span>}
                       {policy.authMethod === 'google_workspace' && <span>Domain: {policy.idpConfig?.googleDomain}</span>}
                       {policy.authMethod === 'social' && <span>Platform: {policy.idpConfig?.socialPlatform}</span>}
                       {(policy.authMethod === 'email' || policy.authMethod === 'local_db') && <span>Nội bộ</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                     <div className="flex items-center justify-center">
                        <Switch
                          checked={policy.isActive}
                          onCheckedChange={(checked) => {
                             const updated = { ...policy, isActive: checked, updatedAt: new Date().toISOString().split('T')[0] };
                             setAuthPolicies(authPolicies.map(p => p.id === policy.id ? updated : p));
                          }}
                        />
                     </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <Button variant="ghost" size="sm" title="Chỉnh sửa" onClick={() => handleEditAuthPolicy(policy)}>
                        <Edit size={18} className="text-amber-600" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Xóa" onClick={() => handleDeleteAuthPolicy(policy)}>
                        <Trash2 size={18} className="text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {authPolicies.length === 0 && (
                <tr>
                   <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <p>Chưa có chính sách xác thực nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }
    
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
        <h1 className="text-3xl font-bold text-gray-900">Quản trị Chính sách</h1>
        <p className="text-gray-600 mt-1">Quản lý các chính sách xác thực, băng thông, phiên truy cập, kiểm toán và bảo mật</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        
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
        <Card 
          className="p-4 bg-[#1e3a5f]/5 border-[#1e3a5f]/20 cursor-pointer hover:bg-[#1e3a5f]/10 transition-colors"
          onClick={() => handleTabChange('authorization')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1e3a5f]">{policies.filter(p => p.type === 'authorization').length}</p>
              <p className="text-sm text-[#1e3a5f]/70">Cấp quyền (Phiên)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="bg-white shadow-sm p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={16} className="text-[#1e3a5f]" />
          <span className="text-sm font-medium text-[#1e3a5f] mr-1">Bộ lọc:</span>
          
          <Select value={filterRole} onValueChange={setFilterRole}>
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

          <Select value={filterArea} onValueChange={setFilterArea}>
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

          <Select value={filterTime} onValueChange={setFilterTime}>
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

          <Select value={filterController} onValueChange={setFilterController}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Controller" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả controller</SelectItem>
              {initialControllers.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Tìm kiếm..."
              className="h-8 w-[150px] text-xs pl-7"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="h-8 text-xs gap-1"
          >
            <RefreshCw size={12} />
            Đặt lại
          </Button>
        </div>
      </Card>

      {/* Main Content with Tabs */}
      <Card className="bg-white shadow-sm">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <div className="grid grid-cols-5 w-full">
              <TabsTrigger 
                value="bandwidth" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1e3a5f] data-[state=active]:bg-transparent data-[state=active]:text-[#1e3a5f] py-3 px-4 flex items-center gap-2"
              >
                <Wifi size={18} />
                Băng thông
              </TabsTrigger>
              <TabsTrigger 
                value="auth" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1e3a5f] data-[state=active]:bg-transparent data-[state=active]:text-[#1e3a5f] py-3 px-4 flex items-center gap-2"
              >
                <Key size={18} />
                Chính sách Xác thực
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
              <TabsTrigger 
                value="authorization" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1e3a5f] data-[state=active]:bg-transparent data-[state=active]:text-[#1e3a5f] py-3 px-4 flex items-center gap-2"
              >
                <CheckCircle size={18} />
                Cấp quyền (Phiên)
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

          {/* Tab: Auth */}
          <TabsContent value="auth" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Chính sách Xác thực</h3>
                <p className="text-sm text-gray-500">Quản lý phương thức đăng nhập cho từng nhóm người dùng</p>
              </div>
              <Button onClick={() => {setAddAuthPolicyDialogOpen(true); setValidationError(null);}} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                <Plus size={18} className="mr-2" />
                Thêm chính sách
              </Button>
            </div>
            {renderPolicyTable('auth')}
          </TabsContent>

          {/* Tab: Audit */}
          <TabsContent value="audit" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Chính sách Kiểm toán</h3>
                <p className="text-sm text-gray-500">Quản lý giới hạn phiên, dung lượng và lưu trữ logs hoạt động người dùng</p>
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

          {/* Tab: Authorization */}
          <TabsContent value="authorization" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Chính sách Cấp quyền</h3>
                <p className="text-sm text-gray-500">Quản lý quyền truy cập danh cho người dùng</p>
              </div>
              <Button onClick={() => handleAddPolicy('authorization')} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                <Plus size={18} className="mr-2" />
                Thêm chính sách
              </Button>
            </div>
            {renderPolicyTable('authorization')}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Add Policy Dialog */}
      <Dialog open={addPolicyDialogOpen} onOpenChange={setAddPolicyDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Thêm Chính sách {getPolicyTypeLabel(policyForm.type || 'bandwidth')}</DialogTitle>
            <DialogDescription>
              Tạo chính sách mới
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
            
            {policyForm.type === 'authorization' && (
              <div className="flex items-center space-x-2 pb-2">
                 <Switch 
                  id="policy-active" 
                  checked={policyForm.isActive}
                  onCheckedChange={(checked) => setPolicyForm({ ...policyForm, isActive: checked })}
                />
                <Label htmlFor="policy-active">Kích hoạt chính sách</Label>
              </div>
            )}
            
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
            
            {policyForm.type === 'audit' && (
              <div className="space-y-4">
                {/* Giới hạn Thời gian Phiên */}
                <div>
                  <Label>Giới hạn Thời gian Phiên</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      value={policyForm.auditMaxSessionTime || ''}
                      onChange={(e) => setPolicyForm({ ...policyForm, auditMaxSessionTime: Number(e.target.value) })}
                      placeholder="8"
                      className="flex-1"
                    />
                    <Select
                      value={policyForm.auditMaxSessionTimeUnit || 'hour'}
                      onValueChange={(value: 'minute' | 'hour') => setPolicyForm({ ...policyForm, auditMaxSessionTimeUnit: value })}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Đơn vị" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minute">Phút</SelectItem>
                        <SelectItem value="hour">Giờ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Giới hạn Tổng Dung lượng */}
                <div>
                  <Label>Giới hạn Tổng Dung lượng</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      value={policyForm.auditMaxDataUsage || ''}
                      onChange={(e) => setPolicyForm({ ...policyForm, auditMaxDataUsage: Number(e.target.value) })}
                      placeholder="10"
                      className="flex-1"
                    />
                    <Select
                      value={policyForm.auditMaxDataUsageUnit || 'GB'}
                      onValueChange={(value: 'MB' | 'GB') => setPolicyForm({ ...policyForm, auditMaxDataUsageUnit: value })}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Đơn vị" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MB">MB</SelectItem>
                        <SelectItem value="GB">GB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            
            {policyForm.type === 'security' && (
              <div className="space-y-4">
                {/* Giới hạn Thiết bị Đồng thời */}
                <div>
                  <Label>Giới hạn Thiết bị Đồng thời</Label>
                  <p className="text-xs text-gray-500 mb-1">Số lượng MAC Address tối đa được phép kết nối cùng lúc</p>
                  <Input
                    type="number"
                    value={policyForm.maxConcurrentDevices || ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, maxConcurrentDevices: Number(e.target.value) })}
                    placeholder="3"
                  />
                </div>
                
                {/* MAC Caching/Bypass */}
                <div className="space-y-2">
                
                  {policyForm.macCachingEnabled && (
                    <div className="flex gap-2 mt-2 pl-4 border-l-2 border-[#1e3a5f]/20">
                      <Input
                        type="number"
                        value={policyForm.macCacheTime || ''}
                        onChange={(e) => setPolicyForm({ ...policyForm, macCacheTime: Number(e.target.value) })}
                        placeholder="24"
                        className="flex-1"
                      />
                      <Select
                        value={policyForm.macCacheTimeUnit || 'hour'}
                        onValueChange={(value: 'hour' | 'day') => setPolicyForm({ ...policyForm, macCacheTimeUnit: value })}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Đơn vị" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hour">Giờ</SelectItem>
                          <SelectItem value="day">Ngày</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                
                {/* Thời gian Tái Xác thực */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Thời gian bắt buộc đăng nhập lại</p>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={policyForm.reAuthInterval || ''}
                      onChange={(e) => setPolicyForm({ ...policyForm, reAuthInterval: Number(e.target.value) })}
                      placeholder="7"
                      className="flex-1"
                    />
                    <Select
                      value={policyForm.reAuthIntervalUnit || 'day'}
                      onValueChange={(value: 'hour' | 'day') => setPolicyForm({ ...policyForm, reAuthIntervalUnit: value })}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Đơn vị" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hour">Giờ</SelectItem>
                        <SelectItem value="day">Ngày</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                
                {/* Số lần Thử lại */}
                <div>
                  <Label>Số lần Thử lại</Label>
                  <p className="text-xs text-gray-500 mb-1">Giới hạn số lần nhập sai mật khẩu trước khi khóa tạm thời</p>
                  <Input
                    type="number"
                    value={policyForm.retryLimit || ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, retryLimit: Number(e.target.value) })}
                    placeholder="5"
                  />
                </div>
              </div>
            )}
            
            {policyForm.type === 'authorization' && (
              <div className="space-y-6">
                {/* Cấu hình Quyền truy cập */}
                <div className="space-y-4 border-b pb-4">
                  <h4 className="text-sm font-semibold text-[#1e3a5f]">Cấu hình Quyền truy cập</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <Label htmlFor="authz-vlan">VLAN ID (1-4096)</Label>
                       <Input
                         id="authz-vlan"
                         type="number"
                         min={1}
                         max={4096}
                         value={policyForm.vlanId || ''}
                         onChange={(e) => setPolicyForm({ ...policyForm, vlanId: Number(e.target.value) })}
                         placeholder="10"
                       />
                     </div>
                     <div>
                       <Label htmlFor="authz-devices">Thiết bị đồng thời</Label>
                       <Input
                         id="authz-devices"
                         type="number"
                         value={policyForm.maxConcurrentDevices || ''}
                         onChange={(e) => setPolicyForm({ ...policyForm, maxConcurrentDevices: Number(e.target.value) })}
                         placeholder="3"
                       />
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="authz-dl">Tải xuống (Mbps)</Label>
                      <Input
                        id="authz-dl"
                        type="number"
                        value={policyForm.downloadLimit || ''}
                        onChange={(e) => setPolicyForm({ ...policyForm, downloadLimit: Number(e.target.value) })}
                        placeholder="20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="authz-ul">Tải lên (Mbps)</Label>
                      <Input
                        id="authz-ul"
                        type="number"
                        value={policyForm.uploadLimit || ''}
                        onChange={(e) => setPolicyForm({ ...policyForm, uploadLimit: Number(e.target.value) })}
                        placeholder="20"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="authz-time">Thời gian phiên (giờ)</Label>
                      <Input
                        id="authz-time"
                        type="number"
                        value={policyForm.maxSessionTime || ''}
                        onChange={(e) => setPolicyForm({ ...policyForm, maxSessionTime: Number(e.target.value) })}
                        placeholder="4"
                      />
                    </div>
                    <div>
                      <Label htmlFor="authz-data">Lưu lượng/ngày (GB)</Label>
                      <Input
                        id="authz-data"
                        type="number"
                        value={policyForm.maxDailyData || ''}
                        onChange={(e) => setPolicyForm({ ...policyForm, maxDailyData: Number(e.target.value) })}
                        placeholder="5"
                      />
                    </div>
                  </div>
                </div>

                {/* Cấu hình Bảo mật phiên */}
                <div className="space-y-4">
                   <h4 className="text-sm font-semibold text-[#1e3a5f]">Bảo mật phiên</h4>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <Label htmlFor="authz-timeout">Timeout không hoạt động (phút)</Label>
                       <Input
                         id="authz-timeout"
                         type="number"
                         value={policyForm.idleTimeout || ''}
                         onChange={(e) => setPolicyForm({ ...policyForm, idleTimeout: Number(e.target.value) })}
                         placeholder="30"
                       />
                     </div>
                     <div className="flex items-center space-x-2 pt-6">
                        <Checkbox
                          id="authz-mac"
                          checked={policyForm.bindMacAddress}
                          onCheckedChange={(checked) => setPolicyForm({ ...policyForm, bindMacAddress: checked as boolean })}
                        />
                        <Label htmlFor="authz-mac">Gắn với MAC Address</Label>
                     </div>
                   </div>
                   
                   <div>
                     <Label className="mb-2 block">Cho phép đăng nhập lại tự động</Label>
                     <RadioGroup 
                        value={policyForm.autoReLogin ? "yes" : "no"} 
                        onValueChange={(val) => setPolicyForm({ ...policyForm, autoReLogin: val === "yes" })}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="relogin-yes" />
                          <Label htmlFor="relogin-yes">Có</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="relogin-no" />
                          <Label htmlFor="relogin-no">Không</Label>
                        </div>
                      </RadioGroup>
                   </div>
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
              Cập nhật thông tin chính sách
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
            
            {policyForm.type === 'authorization' && (
              <div className="flex items-center space-x-2 pb-2">
                 <Switch 
                  id="edit-policy-active" 
                  checked={policyForm.isActive}
                  onCheckedChange={(checked) => setPolicyForm({ ...policyForm, isActive: checked })}
                />
                <Label htmlFor="edit-policy-active">Kích hoạt chính sách</Label>
              </div>
            )}
            
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
            
            {policyForm.type === 'audit' && (
              <div className="space-y-4">
                {/* Giới hạn Thời gian Phiên */}
                <div>
                  <Label>Giới hạn Thời gian Phiên</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      value={policyForm.auditMaxSessionTime || ''}
                      onChange={(e) => setPolicyForm({ ...policyForm, auditMaxSessionTime: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <Select
                      value={policyForm.auditMaxSessionTimeUnit || 'hour'}
                      onValueChange={(value: 'minute' | 'hour') => setPolicyForm({ ...policyForm, auditMaxSessionTimeUnit: value })}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Đơn vị" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minute">Phút</SelectItem>
                        <SelectItem value="hour">Giờ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Giới hạn Tổng Dung lượng */}
                <div>
                  <Label>Giới hạn Tổng Dung lượng</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      value={policyForm.auditMaxDataUsage || ''}
                      onChange={(e) => setPolicyForm({ ...policyForm, auditMaxDataUsage: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <Select
                      value={policyForm.auditMaxDataUsageUnit || 'GB'}
                      onValueChange={(value: 'MB' | 'GB') => setPolicyForm({ ...policyForm, auditMaxDataUsageUnit: value })}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Đơn vị" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MB">MB</SelectItem>
                        <SelectItem value="GB">GB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Chu kỳ Ghi nhận */}
                <div>
                  <Label>Chu kỳ Ghi nhận (Accounting Interval)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      value={policyForm.accountingInterval || ''}
                      onChange={(e) => setPolicyForm({ ...policyForm, accountingInterval: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <Select
                      value={policyForm.accountingIntervalUnit || 'second'}
                      onValueChange={(value: 'second' | 'minute') => setPolicyForm({ ...policyForm, accountingIntervalUnit: value })}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Đơn vị" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="second">Giây</SelectItem>
                        <SelectItem value="minute">Phút</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Thời gian Lưu trữ Logs */}
                <div>
                  <Label>Thời gian Lưu trữ Logs Phiên</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      value={policyForm.logRetentionPeriod || ''}
                      onChange={(e) => setPolicyForm({ ...policyForm, logRetentionPeriod: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <Select
                      value={policyForm.logRetentionUnit || 'month'}
                      onValueChange={(value: 'month' | 'year') => setPolicyForm({ ...policyForm, logRetentionUnit: value })}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Đơn vị" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">Tháng</SelectItem>
                        <SelectItem value="year">Năm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Hành động Ngắt kết nối */}
                <div>
                  <Label>Hành động khi đạt giới hạn</Label>
                  <Select
                    value={policyForm.disconnectAction || 'disconnect'}
                    onValueChange={(value: 'disconnect' | 'reauth' | 'notify') => setPolicyForm({ ...policyForm, disconnectAction: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn hành động" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disconnect">Ngắt kết nối</SelectItem>
                      <SelectItem value="reauth">Yêu cầu xác thực lại</SelectItem>
                      <SelectItem value="notify">Chỉ cảnh báo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {policyForm.type === 'security' && (
              <div className="space-y-4">
                {/* Giới hạn Thiết bị Đồng thời */}
                <div>
                  <Label>Giới hạn Thiết bị Đồng thời</Label>
                  <p className="text-xs text-gray-500 mb-1">Số lượng MAC Address tối đa được phép kết nối cùng lúc</p>
                  <Input
                    type="number"
                    value={policyForm.maxConcurrentDevices || ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, maxConcurrentDevices: Number(e.target.value) })}
                  />
                </div>
                {/* Thời gian Tái Xác thực */}
                <div>
                  <Label>Thời gian Tái Xác thực </Label>
                  <p className="text-xs text-gray-500 mb-1">Thời gian buộc người dùng phải đăng nhập lại Captive Portal</p>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={policyForm.reAuthInterval || ''}
                      onChange={(e) => setPolicyForm({ ...policyForm, reAuthInterval: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <Select
                      value={policyForm.reAuthIntervalUnit || 'day'}
                      onValueChange={(value: 'hour' | 'day') => setPolicyForm({ ...policyForm, reAuthIntervalUnit: value })}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Đơn vị" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hour">Giờ</SelectItem>
                        <SelectItem value="day">Ngày</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
             
                
                {/* Số lần Thử lại */}
                <div>
                  <Label>Số lần Thử lại </Label>
                  <p className="text-xs text-gray-500 mb-1">Giới hạn số lần nhập sai mật khẩu trước khi khóa tạm thời</p>
                  <Input
                    type="number"
                    value={policyForm.retryLimit || ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, retryLimit: Number(e.target.value) })}
                  />
                </div>
              </div>
            )}
            
            {policyForm.type === 'authorization' && (
              <div className="space-y-6">
                {/* Cấu hình Quyền truy cập */}
                <div className="space-y-4 border-b pb-4">
                  <h4 className="text-sm font-semibold text-[#1e3a5f]">Cấu hình Quyền truy cập</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <Label htmlFor="edit-authz-vlan">VLAN ID (1-4096)</Label>
                       <Input
                         id="edit-authz-vlan"
                         type="number"
                         min={1}
                         max={4096}
                         value={policyForm.vlanId || ''}
                         onChange={(e) => setPolicyForm({ ...policyForm, vlanId: Number(e.target.value) })}
                       />
                     </div>
                     <div>
                       <Label htmlFor="edit-authz-devices">Thiết bị đồng thời</Label>
                       <Input
                         id="edit-authz-devices"
                         type="number"
                         value={policyForm.maxConcurrentDevices || ''}
                         onChange={(e) => setPolicyForm({ ...policyForm, maxConcurrentDevices: Number(e.target.value) })}
                       />
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-authz-dl">Tải xuống (Mbps)</Label>
                      <Input
                        id="edit-authz-dl"
                        type="number"
                        value={policyForm.downloadLimit || ''}
                        onChange={(e) => setPolicyForm({ ...policyForm, downloadLimit: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-authz-ul">Tải lên (Mbps)</Label>
                      <Input
                        id="edit-authz-ul"
                        type="number"
                        value={policyForm.uploadLimit || ''}
                        onChange={(e) => setPolicyForm({ ...policyForm, uploadLimit: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-authz-time">Thời gian phiên (giờ)</Label>
                      <Input
                        id="edit-authz-time"
                        type="number"
                        value={policyForm.maxSessionTime || ''}
                        onChange={(e) => setPolicyForm({ ...policyForm, maxSessionTime: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-authz-data">Lưu lượng/ngày (GB)</Label>
                      <Input
                        id="edit-authz-data"
                        type="number"
                        value={policyForm.maxDailyData || ''}
                        onChange={(e) => setPolicyForm({ ...policyForm, maxDailyData: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                {/* Cấu hình Bảo mật phiên */}
                <div className="space-y-4">
                   <h4 className="text-sm font-semibold text-[#1e3a5f]">Bảo mật phiên</h4>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <Label htmlFor="edit-authz-timeout">Timeout không hoạt động (phút)</Label>
                       <Input
                         id="edit-authz-timeout"
                         type="number"
                         value={policyForm.idleTimeout || ''}
                         onChange={(e) => setPolicyForm({ ...policyForm, idleTimeout: Number(e.target.value) })}
                       />
                     </div>
                     <div className="flex items-center space-x-2 pt-6">
                        <Checkbox
                          id="edit-authz-mac"
                          checked={policyForm.bindMacAddress}
                          onCheckedChange={(checked) => setPolicyForm({ ...policyForm, bindMacAddress: checked as boolean })}
                        />
                        <Label htmlFor="edit-authz-mac">Gắn với MAC Address</Label>
                     </div>
                   </div>
                   
                   <div>
                     <Label className="mb-2 block">Cho phép đăng nhập lại tự động</Label>
                     <RadioGroup 
                        value={policyForm.autoReLogin ? "yes" : "no"} 
                        onValueChange={(val) => setPolicyForm({ ...policyForm, autoReLogin: val === "yes" })}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="edit-relogin-yes" />
                          <Label htmlFor="edit-relogin-yes">Có</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="edit-relogin-no" />
                          <Label htmlFor="edit-relogin-no">Không</Label>
                        </div>
                      </RadioGroup>
                   </div>
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

      {/* Add Auth Policy Dialog */}
      <Dialog open={addAuthPolicyDialogOpen} onOpenChange={setAddAuthPolicyDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm Chính sách Xác thực</DialogTitle>
            <DialogDescription>Cấu hình phương thức đăng nhập cho người dùng</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
             {validationError && (
               <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                 {validationError}
               </div>
             )}
             {/* Basic Info */}
             <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2">
                 <Label htmlFor="auth-name">Tên chính sách <span className="text-red-500">*</span></Label>
                 <Input 
                    id="auth-name" 
                    value={authPolicyForm.name || ''} 
                    onChange={e => setAuthPolicyForm({...authPolicyForm, name: e.target.value})}
                    placeholder="VD: Cán bộ - Azure AD"
                  />
               </div>
               <div className="col-span-2">
                 <Label htmlFor="auth-desc">Mô tả</Label>
                 <Input 
                    id="auth-desc" 
                    value={authPolicyForm.description || ''} 
                    onChange={e => setAuthPolicyForm({...authPolicyForm, description: e.target.value})}
                  />
               </div>
               <div className="flex items-center space-x-2">
                  <Switch 
                    id="auth-active"
                    checked={authPolicyForm.isActive ?? true}
                    onCheckedChange={(checked) => setAuthPolicyForm({...authPolicyForm, isActive: checked})} 
                  />
                  <Label htmlFor="auth-active">Kích hoạt chính sách này</Label>
               </div>
             </div>

             {/* User & Method */}
             <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                   <Label>Loại người dùng <span className="text-red-500">*</span></Label>
                   <Select 
                      value={authPolicyForm.userType} 
                      onValueChange={(val: AuthUserType) => setAuthPolicyForm({...authPolicyForm, userType: val})}
                   >
                      <SelectTrigger><SelectValue placeholder="Chọn loại người dùng" /></SelectTrigger>
                      <SelectContent>
                        {authUserTypeOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                   </Select>
                </div>
                <div>
                   <Label>Phương thức xác thực <span className="text-red-500">*</span></Label>
                   <Select 
                      value={authPolicyForm.authMethod} 
                      onValueChange={(val: AuthMethod) => setAuthPolicyForm({...authPolicyForm, authMethod: val})}
                   >
                      <SelectTrigger><SelectValue placeholder="Chọn phương thức" /></SelectTrigger>
                      <SelectContent>
                        {authMethodOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                   </Select>
                </div>
             </div>

            

             {/* Additional Config */}
             <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="flex items-center space-x-2">
                   <Checkbox 
                      id="req-2fa" 
                      checked={authPolicyForm.require2FA}
                      onCheckedChange={(c) => setAuthPolicyForm({...authPolicyForm, require2FA: !!c})}
                   />
                   <Label htmlFor="req-2fa">Yêu cầu xác thực 2 bước (2FA)</Label>
                </div>
                {(authPolicyForm.userType === 'guest_reg' || authPolicyForm.userType === 'guest_noreg') && (
                  <div className="flex items-center space-x-2">
                     <Checkbox 
                        id="allow-reg" 
                        checked={authPolicyForm.allowRegistration}
                        onCheckedChange={(c) => setAuthPolicyForm({...authPolicyForm, allowRegistration: !!c})}
                     />
                     <Label htmlFor="allow-reg">Cho phép khách tự đăng ký</Label>
                  </div>
                )}
             </div>
             
          
             {/* Applied Scope - Devices Only (Controllers/APs) */}
             <div className="pt-2">
               <Label className="mb-2 block">Phạm vi áp dụng (Thiết bị)</Label>
               <div className="border rounded-md p-3 max-h-48 overflow-y-auto mt-2 bg-white">
                    {/* Controllers */}
                    <div>
                      <h5 className="font-semibold text-sm mb-2 text-gray-700 sticky top-0 bg-white">Controllers</h5>
                      {initialControllers.map(ctrl => (
                        <div key={ctrl.id} className="flex items-center space-x-2 ml-2 mb-1">
                          <Checkbox 
                             id={`ctrl-${ctrl.id}`}
                             checked={authPolicyForm.appliedAreas?.includes(`ctrl:${ctrl.id}`)}
                             onCheckedChange={(checked) => {
                                const val = `ctrl:${ctrl.id}`;
                                const current = authPolicyForm.appliedAreas || [];
                                if (checked) {
                                  setAuthPolicyForm({...authPolicyForm, appliedAreas: [...current, val]});
                                } else {
                                  setAuthPolicyForm({...authPolicyForm, appliedAreas: current.filter(x => x !== val)});
                                }
                             }}
                          />
                          <Label htmlFor={`ctrl-${ctrl.id}`} className="text-sm font-normal cursor-pointer">
                            {ctrl.name} <span className="text-gray-500 text-xs">({ctrl.ipAddress})</span>
                          </Label>
                        </div>
                      ))}
                    </div>

                    {/* APs */}
                    <div className="mt-3">
                      <h5 className="font-semibold text-sm mb-2 text-gray-700 sticky top-0 bg-white">Access Points</h5>
                      {initialAPs.map(ap => (
                        <div key={ap.id} className="flex items-center space-x-2 ml-2 mb-1">
                          <Checkbox 
                             id={`ap-${ap.id}`}
                             checked={authPolicyForm.appliedAreas?.includes(`ap:${ap.id}`)}
                             onCheckedChange={(checked) => {
                                const val = `ap:${ap.id}`;
                                const current = authPolicyForm.appliedAreas || [];
                                if (checked) {
                                  setAuthPolicyForm({...authPolicyForm, appliedAreas: [...current, val]});
                                } else {
                                  setAuthPolicyForm({...authPolicyForm, appliedAreas: current.filter(x => x !== val)});
                                }
                             }}
                          />
                          <Label htmlFor={`ap-${ap.id}`} className="text-sm font-normal cursor-pointer">
                            {ap.name} <span className="text-gray-500 text-xs">- {ap.location}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
               </div>
             </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setAddAuthPolicyDialogOpen(false)}>Hủy</Button>
             <Button onClick={saveNewAuthPolicy} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">Lưu chính sách</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Auth Policy Dialog - Reusing similar structure via generic component or just copy paste for now as per simplicity */}
      <Dialog open={editAuthPolicyDialogOpen} onOpenChange={setEditAuthPolicyDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
           {/* Basically same as add but with Edit title and Save func */}
           <DialogHeader>
             <DialogTitle>Chỉnh sửa Chính sách Xác thực</DialogTitle>
          </DialogHeader>
           {/* Repetitive form logic - in a real app this should be a component. duplicating for now to ensure functionality */}
            <div className="space-y-6 py-4">
             {validationError && (
               <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                 {validationError}
               </div>
             )}
             {/* Basic Info */}
             <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2">
                 <Label htmlFor="edit-auth-name">Tên chính sách <span className="text-red-500">*</span></Label>
                 <Input 
                    id="edit-auth-name" 
                    value={authPolicyForm.name || ''} 
                    onChange={e => setAuthPolicyForm({...authPolicyForm, name: e.target.value})}
                  />
               </div>
               <div className="col-span-2">
                 <Label htmlFor="edit-auth-desc">Mô tả</Label>
                 <Input 
                    id="edit-auth-desc" 
                    value={authPolicyForm.description || ''} 
                    onChange={e => setAuthPolicyForm({...authPolicyForm, description: e.target.value})}
                  />
               </div>
               <div className="flex items-center space-x-2">
                  <Switch 
                    id="edit-auth-active"
                    checked={authPolicyForm.isActive ?? true}
                    onCheckedChange={(checked) => setAuthPolicyForm({...authPolicyForm, isActive: checked})} 
                  />
                  <Label htmlFor="edit-auth-active">Kích hoạt chính sách này</Label>
               </div>
             </div>

             {/* User & Method */}
             <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                   <Label>Loại người dùng <span className="text-red-500">*</span></Label>
                   <Select 
                      value={authPolicyForm.userType} 
                      onValueChange={(val: AuthUserType) => setAuthPolicyForm({...authPolicyForm, userType: val})}
                   >
                      <SelectTrigger><SelectValue placeholder="Chọn loại người dùng" /></SelectTrigger>
                      <SelectContent>
                        {authUserTypeOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                   </Select>
                </div>
                <div>
                   <Label>Phương thức xác thực <span className="text-red-500">*</span></Label>
                   <Select 
                      value={authPolicyForm.authMethod} 
                      onValueChange={(val: AuthMethod) => setAuthPolicyForm({...authPolicyForm, authMethod: val})}
                   >
                      <SelectTrigger><SelectValue placeholder="Chọn phương thức" /></SelectTrigger>
                      <SelectContent>
                        {authMethodOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                   </Select>
                </div>
             </div>
             
             {/* Additional */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="flex items-center space-x-2">
                   <Checkbox 
                      id="edit-req-2fa" 
                      checked={authPolicyForm.require2FA}
                      onCheckedChange={(c) => setAuthPolicyForm({...authPolicyForm, require2FA: !!c})}
                   />
                   <Label htmlFor="edit-req-2fa">Yêu cầu 2FA</Label>
                </div>
                {(authPolicyForm.userType === 'guest_reg' || authPolicyForm.userType === 'guest_noreg') && (
                  <div className="flex items-center space-x-2">
                     <Checkbox 
                        id="edit-allow-reg" 
                        checked={authPolicyForm.allowRegistration}
                        onCheckedChange={(c) => setAuthPolicyForm({...authPolicyForm, allowRegistration: !!c})}
                     />
                     <Label htmlFor="edit-allow-reg">Cho phép khách tự đăng ký</Label>
                  </div>
                )}
            </div>

            {/* Time & Scope */}
             <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                   <Label>Áp dụng theo Thời gian</Label>
                   <Select 
                      value={authPolicyForm.applyByTime || 'all'} 
                      onValueChange={(val) => setAuthPolicyForm({...authPolicyForm, applyByTime: val})}
                   >
                      <SelectTrigger><SelectValue placeholder="Chọn thời gian" /></SelectTrigger>
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

             {/* Applied Scope - Devices Only (Controllers/APs) */}
             <div className="pt-2">
               <Label className="mb-2 block">Phạm vi áp dụng (Thiết bị)</Label>
               <div className="border rounded-md p-3 max-h-48 overflow-y-auto mt-2 bg-white">
                    {/* Controllers */}
                    <div>
                      <h5 className="font-semibold text-sm mb-2 text-gray-700 sticky top-0 bg-white">Controllers</h5>
                      {initialControllers.map(ctrl => (
                        <div key={ctrl.id} className="flex items-center space-x-2 ml-2 mb-1">
                          <Checkbox 
                             id={`edit-ctrl-${ctrl.id}`}
                             checked={authPolicyForm.appliedAreas?.includes(`ctrl:${ctrl.id}`)}
                             onCheckedChange={(checked) => {
                                const val = `ctrl:${ctrl.id}`;
                                const current = authPolicyForm.appliedAreas || [];
                                if (checked) {
                                  setAuthPolicyForm({...authPolicyForm, appliedAreas: [...current, val]});
                                } else {
                                  setAuthPolicyForm({...authPolicyForm, appliedAreas: current.filter(x => x !== val)});
                                }
                             }}
                          />
                          <Label htmlFor={`edit-ctrl-${ctrl.id}`} className="text-sm font-normal cursor-pointer">
                            {ctrl.name} <span className="text-gray-500 text-xs">({ctrl.ipAddress})</span>
                          </Label>
                        </div>
                      ))}
                    </div>

                    {/* APs */}
                    <div className="mt-3">
                      <h5 className="font-semibold text-sm mb-2 text-gray-700 sticky top-0 bg-white">Access Points</h5>
                      {initialAPs.map(ap => (
                        <div key={ap.id} className="flex items-center space-x-2 ml-2 mb-1">
                          <Checkbox 
                             id={`edit-ap-${ap.id}`}
                             checked={authPolicyForm.appliedAreas?.includes(`ap:${ap.id}`)}
                             onCheckedChange={(checked) => {
                                const val = `ap:${ap.id}`;
                                const current = authPolicyForm.appliedAreas || [];
                                if (checked) {
                                  setAuthPolicyForm({...authPolicyForm, appliedAreas: [...current, val]});
                                } else {
                                  setAuthPolicyForm({...authPolicyForm, appliedAreas: current.filter(x => x !== val)});
                                }
                             }}
                          />
                          <Label htmlFor={`edit-ap-${ap.id}`} className="text-sm font-normal cursor-pointer">
                            {ap.name} <span className="text-gray-500 text-xs">- {ap.location}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
               </div>
             </div>

          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setEditAuthPolicyDialogOpen(false)}>Hủy</Button>
             <Button onClick={saveEditAuthPolicy} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Auth Policy Dialog */}
      <AlertDialog open={deleteAuthPolicyDialogOpen} onOpenChange={setDeleteAuthPolicyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa chính sách xác thực</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa chính sách <strong>{selectedAuthPolicy?.name}</strong>?
              Các Controller đang sử dụng chính sách này sẽ cần được cấu hình lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAuthPolicy} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
