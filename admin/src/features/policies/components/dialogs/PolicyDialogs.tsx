import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RootState, AppDispatch } from '@/stores/store';
import { 
  setAddPolicyDialogOpen, setEditPolicyDialogOpen, setDeletePolicyDialogOpen, 
  setPolicyForm, createWifiPolicyAsync, updateWifiPolicyAsync, deleteWifiPolicyAsync
} from '../../slices/policiesSlice';
import { WifiPolicy, AreaLocation, initialCampuses, initialBuildings, getPolicyTypeLabel } from '@/data/mockData';

export const PolicyDialogs = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    addPolicyDialogOpen, editPolicyDialogOpen, deletePolicyDialogOpen, 
    selectedPolicy, policyForm, data: policies
  } = useSelector((state: RootState) => state.policies.policies);

  const [areaLocations, setAreaLocations] = useState<AreaLocation[]>([]);

  useEffect(() => {
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

  const saveNewPolicy = () => {
    const newPolicy: Omit<WifiPolicy, 'id'> = {
      name: policyForm.name || '',
      description: policyForm.description || '',
      type: policyForm.type || 'bandwidth',
      downloadLimit: policyForm.downloadLimit,
      uploadLimit: policyForm.uploadLimit,
      maxSessionTime: policyForm.maxSessionTime,
      maxSessionData: policyForm.maxSessionData,
      auditMaxSessionTime: policyForm.auditMaxSessionTime,
      auditMaxSessionTimeUnit: policyForm.auditMaxSessionTimeUnit,
      auditMaxDataUsage: policyForm.auditMaxDataUsage,
      auditMaxDataUsageUnit: policyForm.auditMaxDataUsageUnit,
      accountingInterval: policyForm.accountingInterval,
      accountingIntervalUnit: policyForm.accountingIntervalUnit,
      logRetentionPeriod: policyForm.logRetentionPeriod,
      logRetentionUnit: policyForm.logRetentionUnit,
      disconnectAction: policyForm.disconnectAction,
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
      vlanId: policyForm.vlanId,
      maxDailyData: policyForm.maxDailyData,
      idleTimeout: policyForm.idleTimeout,
      autoReLogin: policyForm.autoReLogin,
      bindMacAddress: policyForm.bindMacAddress,
      isActive: policyForm.isActive,
    };
    dispatch(createWifiPolicyAsync(newPolicy));
  };

  const saveEditPolicy = () => {
    if (selectedPolicy) {
      dispatch(updateWifiPolicyAsync({ ...selectedPolicy, ...policyForm } as WifiPolicy));
    }
  };

  const confirmDeletePolicy = () => {
    if (selectedPolicy) {
      dispatch(deleteWifiPolicyAsync(selectedPolicy.id));
    }
  };

  const renderFormContent = (isEdit = false) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor={isEdit ? "edit-policy-name" : "policy-name"}>Tên Chính sách</Label>
        <Input
          id={isEdit ? "edit-policy-name" : "policy-name"}
          value={policyForm.name || ''}
          onChange={(e) => dispatch(setPolicyForm({ ...policyForm, name: e.target.value }))}
          placeholder="Tên chính sách"
        />
      </div>
      <div>
        <Label htmlFor={isEdit ? "edit-policy-desc" : "policy-desc"}>Mô tả</Label>
        <Input
          id={isEdit ? "edit-policy-desc" : "policy-desc"}
          value={policyForm.description || ''}
          onChange={(e) => dispatch(setPolicyForm({ ...policyForm, description: e.target.value }))}
          placeholder="Mô tả chính sách"
        />
      </div>
      
      {policyForm.type === 'authorization' && (
        <div className="flex items-center space-x-2 pb-2">
           <Switch 
            id={isEdit ? "edit-policy-active" : "policy-active"}
            checked={policyForm.isActive}
            onCheckedChange={(checked) => dispatch(setPolicyForm({ ...policyForm, isActive: checked }))}
          />
          <Label htmlFor={isEdit ? "edit-policy-active" : "policy-active"}>Kích hoạt chính sách</Label>
        </div>
      )}
      
      {policyForm.type === 'bandwidth' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={isEdit ? "edit-policy-dl" : "policy-dl"}>Giới hạn Tải xuống (Mbps)</Label>
            <Input
              id={isEdit ? "edit-policy-dl" : "policy-dl"}
              type="number"
              value={policyForm.downloadLimit || ''}
              onChange={(e) => dispatch(setPolicyForm({ ...policyForm, downloadLimit: Number(e.target.value) }))}
              placeholder="10"
            />
          </div>
          <div>
            <Label htmlFor={isEdit ? "edit-policy-ul" : "policy-ul"}>Giới hạn Tải lên (Mbps)</Label>
            <Input
              id={isEdit ? "edit-policy-ul" : "policy-ul"}
              type="number"
              value={policyForm.uploadLimit || ''}
              onChange={(e) => dispatch(setPolicyForm({ ...policyForm, uploadLimit: Number(e.target.value) }))}
              placeholder="5"
            />
          </div>
        </div>
      )}
      
      {policyForm.type === 'session' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={isEdit ? "edit-policy-session-time" : "policy-session-time"}>Thời gian phiên tối đa (phút)</Label>
            <Input
              id={isEdit ? "edit-policy-session-time" : "policy-session-time"}
              type="number"
              value={policyForm.maxSessionTime || ''}
              onChange={(e) => dispatch(setPolicyForm({ ...policyForm, maxSessionTime: Number(e.target.value) }))}
              placeholder="480"
            />
          </div>
          <div>
            <Label htmlFor={isEdit ? "edit-policy-session-data" : "policy-session-data"}>Lưu lượng phiên tối đa (MB)</Label>
            <Input
              id={isEdit ? "edit-policy-session-data" : "policy-session-data"}
              type="number"
              value={policyForm.maxSessionData || ''}
              onChange={(e) => dispatch(setPolicyForm({ ...policyForm, maxSessionData: Number(e.target.value) }))}
              placeholder="5000"
            />
          </div>
        </div>
      )}
      
      {policyForm.type === 'audit' && (
        <div className="space-y-4">
          <div>
            <Label>Giới hạn Thời gian Phiên</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="number"
                value={policyForm.auditMaxSessionTime || ''}
                onChange={(e) => dispatch(setPolicyForm({ ...policyForm, auditMaxSessionTime: Number(e.target.value) }))}
                placeholder="8"
                className="flex-1"
              />
              <Select
                value={policyForm.auditMaxSessionTimeUnit || 'hour'}
                onValueChange={(value: 'minute' | 'hour') => dispatch(setPolicyForm({ ...policyForm, auditMaxSessionTimeUnit: value }))}
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
          
          <div>
            <Label>Giới hạn Tổng Dung lượng</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="number"
                value={policyForm.auditMaxDataUsage || ''}
                onChange={(e) => dispatch(setPolicyForm({ ...policyForm, auditMaxDataUsage: Number(e.target.value) }))}
                placeholder="10"
                className="flex-1"
              />
              <Select
                value={policyForm.auditMaxDataUsageUnit || 'GB'}
                onValueChange={(value: 'MB' | 'GB') => dispatch(setPolicyForm({ ...policyForm, auditMaxDataUsageUnit: value }))}
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

          <div>
            <Label>Chu kỳ Ghi nhận (Accounting Interval)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="number"
                value={policyForm.accountingInterval || ''}
                onChange={(e) => dispatch(setPolicyForm({ ...policyForm, accountingInterval: Number(e.target.value) }))}
                className="flex-1"
              />
              <Select
                value={policyForm.accountingIntervalUnit || 'second'}
                onValueChange={(value: 'second' | 'minute') => dispatch(setPolicyForm({ ...policyForm, accountingIntervalUnit: value }))}
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

          <div>
            <Label>Thời gian Lưu trữ Logs Phiên</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="number"
                value={policyForm.logRetentionPeriod || ''}
                onChange={(e) => dispatch(setPolicyForm({ ...policyForm, logRetentionPeriod: Number(e.target.value) }))}
                className="flex-1"
              />
              <Select
                value={policyForm.logRetentionUnit || 'month'}
                onValueChange={(value: 'month' | 'year') => dispatch(setPolicyForm({ ...policyForm, logRetentionUnit: value }))}
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

          <div>
            <Label>Hành động khi đạt giới hạn</Label>
            <Select
              value={policyForm.disconnectAction || 'disconnect'}
              onValueChange={(value: 'disconnect' | 'reauth' | 'notify') => dispatch(setPolicyForm({ ...policyForm, disconnectAction: value }))}
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
          <div>
            <Label>Giới hạn Thiết bị Đồng thời</Label>
            <p className="text-xs text-gray-500 mb-1">Số lượng MAC Address tối đa được phép kết nối cùng lúc</p>
            <Input
              type="number"
              value={policyForm.maxConcurrentDevices || ''}
              onChange={(e) => dispatch(setPolicyForm({ ...policyForm, maxConcurrentDevices: Number(e.target.value) }))}
              placeholder="3"
            />
          </div>
          
          <div className="space-y-2">
            {policyForm.macCachingEnabled && (
              <div className="flex gap-2 mt-2 pl-4 border-l-2 border-[#1e3a5f]/20">
                <Input
                  type="number"
                  value={policyForm.macCacheTime || ''}
                  onChange={(e) => dispatch(setPolicyForm({ ...policyForm, macCacheTime: Number(e.target.value) }))}
                  placeholder="24"
                  className="flex-1"
                />
                <Select
                  value={policyForm.macCacheTimeUnit || 'hour'}
                  onValueChange={(value: 'hour' | 'day') => dispatch(setPolicyForm({ ...policyForm, macCacheTimeUnit: value }))}
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
          
          <div>
            <Label>Thời gian Tái Xác thực</Label>
            <p className="text-xs text-gray-500 mb-1">Thời gian bắt buộc đăng nhập lại</p>
            <div className="flex gap-2">
              <Input
                type="number"
                value={policyForm.reAuthInterval || ''}
                onChange={(e) => dispatch(setPolicyForm({ ...policyForm, reAuthInterval: Number(e.target.value) }))}
                placeholder="7"
                className="flex-1"
              />
              <Select
                value={policyForm.reAuthIntervalUnit || 'day'}
                onValueChange={(value: 'hour' | 'day') => dispatch(setPolicyForm({ ...policyForm, reAuthIntervalUnit: value }))}
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
          
          <div>
            <Label>Số lần Thử lại</Label>
            <p className="text-xs text-gray-500 mb-1">Giới hạn số lần nhập sai mật khẩu trước khi khóa tạm thời</p>
            <Input
              type="number"
              value={policyForm.retryLimit || ''}
              onChange={(e) => dispatch(setPolicyForm({ ...policyForm, retryLimit: Number(e.target.value) }))}
              placeholder="5"
            />
          </div>
        </div>
      )}
      
      {policyForm.type === 'authorization' && (
        <div className="space-y-6">
          <div className="space-y-4 border-b pb-4">
            <h4 className="text-sm font-semibold text-[#1e3a5f]">Cấu hình Quyền truy cập</h4>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor={isEdit ? "edit-authz-vlan" : "authz-vlan"}>VLAN ID (1-4096)</Label>
                 <Input
                   id={isEdit ? "edit-authz-vlan" : "authz-vlan"}
                   type="number"
                   min={1}
                   max={4096}
                   value={policyForm.vlanId || ''}
                   onChange={(e) => dispatch(setPolicyForm({ ...policyForm, vlanId: Number(e.target.value) }))}
                   placeholder="10"
                 />
               </div>
               <div>
                 <Label htmlFor={isEdit ? "edit-authz-devices" : "authz-devices"}>Thiết bị đồng thời</Label>
                 <Input
                   id={isEdit ? "edit-authz-devices" : "authz-devices"}
                   type="number"
                   value={policyForm.maxConcurrentDevices || ''}
                   onChange={(e) => dispatch(setPolicyForm({ ...policyForm, maxConcurrentDevices: Number(e.target.value) }))}
                   placeholder="3"
                 />
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={isEdit ? "edit-authz-dl" : "authz-dl"}>Tải xuống (Mbps)</Label>
                <Input
                  id={isEdit ? "edit-authz-dl" : "authz-dl"}
                  type="number"
                  value={policyForm.downloadLimit || ''}
                  onChange={(e) => dispatch(setPolicyForm({ ...policyForm, downloadLimit: Number(e.target.value) }))}
                  placeholder="20"
                />
              </div>
              <div>
                <Label htmlFor={isEdit ? "edit-authz-ul" : "authz-ul"}>Tải lên (Mbps)</Label>
                <Input
                  id={isEdit ? "edit-authz-ul" : "authz-ul"}
                  type="number"
                  value={policyForm.uploadLimit || ''}
                  onChange={(e) => dispatch(setPolicyForm({ ...policyForm, uploadLimit: Number(e.target.value) }))}
                  placeholder="20"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={isEdit ? "edit-authz-time" : "authz-time"}>Thời gian phiên (giờ)</Label>
                <Input
                  id={isEdit ? "edit-authz-time" : "authz-time"}
                  type="number"
                  value={policyForm.maxSessionTime || ''}
                  onChange={(e) => dispatch(setPolicyForm({ ...policyForm, maxSessionTime: Number(e.target.value) }))}
                  placeholder="4"
                />
              </div>
              <div>
                <Label htmlFor={isEdit ? "edit-authz-data" : "authz-data"}>Lưu lượng/ngày (GB)</Label>
                <Input
                  id={isEdit ? "edit-authz-data" : "authz-data"}
                  type="number"
                  value={policyForm.maxDailyData || ''}
                  onChange={(e) => dispatch(setPolicyForm({ ...policyForm, maxDailyData: Number(e.target.value) }))}
                  placeholder="5"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <h4 className="text-sm font-semibold text-[#1e3a5f]">Bảo mật phiên</h4>
             
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor={isEdit ? "edit-authz-timeout" : "authz-timeout"}>Timeout không hoạt động (phút)</Label>
                 <Input
                   id={isEdit ? "edit-authz-timeout" : "authz-timeout"}
                   type="number"
                   value={policyForm.idleTimeout || ''}
                   onChange={(e) => dispatch(setPolicyForm({ ...policyForm, idleTimeout: Number(e.target.value) }))}
                   placeholder="30"
                 />
               </div>
               <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id={isEdit ? "edit-authz-mac" : "authz-mac"}
                    checked={policyForm.bindMacAddress}
                    onCheckedChange={(checked) => dispatch(setPolicyForm({ ...policyForm, bindMacAddress: checked as boolean }))}
                  />
                  <Label htmlFor={isEdit ? "edit-authz-mac" : "authz-mac"}>Gắn với MAC Address</Label>
               </div>
             </div>
             
             <div>
               <Label className="mb-2 block">Cho phép đăng nhập lại tự động</Label>
               <RadioGroup 
                  value={policyForm.autoReLogin ? "yes" : "no"} 
                  onValueChange={(val) => dispatch(setPolicyForm({ ...policyForm, autoReLogin: val === "yes" }))}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id={isEdit ? "edit-relogin-yes" : "relogin-yes"} />
                    <Label htmlFor={isEdit ? "edit-relogin-yes" : "relogin-yes"}>Có</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id={isEdit ? "edit-relogin-no" : "relogin-no"} />
                    <Label htmlFor={isEdit ? "edit-relogin-no" : "relogin-no"}>Không</Label>
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
                id={isEdit ? `edit-role-${role}` : `role-${role}`}
                checked={policyForm.applyToRoles?.includes(role)}
                onCheckedChange={(checked) => {
                  const currentRoles = policyForm.applyToRoles || [];
                  if (checked) {
                    dispatch(setPolicyForm({ ...policyForm, applyToRoles: [...currentRoles, role] }));
                  } else {
                    dispatch(setPolicyForm({ ...policyForm, applyToRoles: currentRoles.filter(r => r !== role) }));
                  }
                }}
              />
              <Label htmlFor={isEdit ? `edit-role-${role}` : `role-${role}`} className="text-sm">{role}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={isEdit ? "edit-policy-area" : "policy-area"}>Áp dụng theo Khu vực</Label>
          <Select
            value={policyForm.applyToArea || 'all'}
            onValueChange={(value) => dispatch(setPolicyForm({ ...policyForm, applyToArea: value === 'all' ? '' : value }))}
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
          <Label htmlFor={isEdit ? "edit-policy-time" : "policy-time"}>Áp dụng theo Thời gian</Label>
          <Select
            value={policyForm.applyByTime || 'all'}
            onValueChange={(value) => dispatch(setPolicyForm({ ...policyForm, applyByTime: value === 'all' ? '' : value }))}
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
  );

  return (
    <>
      <Dialog open={addPolicyDialogOpen} onOpenChange={(open) => dispatch(setAddPolicyDialogOpen(open))}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Thêm Chính sách {getPolicyTypeLabel(policyForm.type || 'bandwidth')}</DialogTitle>
            <DialogDescription>
              Tạo chính sách mới
            </DialogDescription>
          </DialogHeader>
          
          {renderFormContent(false)}

          <DialogFooter>
            <Button variant="outline" onClick={() => dispatch(setAddPolicyDialogOpen(false))}>Hủy</Button>
            <Button onClick={saveNewPolicy} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">Tạo chính sách</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editPolicyDialogOpen} onOpenChange={(open) => dispatch(setEditPolicyDialogOpen(open))}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Chính sách</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chính sách
            </DialogDescription>
          </DialogHeader>

          {renderFormContent(true)}

          <DialogFooter>
            <Button variant="outline" onClick={() => dispatch(setEditPolicyDialogOpen(false))}>Hủy</Button>
            <Button onClick={saveEditPolicy} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletePolicyDialogOpen} onOpenChange={(open) => dispatch(setDeletePolicyDialogOpen(open))}>
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
    </>
  );
};
