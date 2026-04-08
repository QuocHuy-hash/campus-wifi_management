import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RootState, AppDispatch } from '@/stores/store';
import { 
  setAddAuthPolicyDialogOpen, setEditAuthPolicyDialogOpen, setDeleteAuthPolicyDialogOpen,
  setAuthPolicyForm, setValidationError, createAuthPolicyAsync, updateAuthPolicyAsync, deleteAuthPolicyAsync
} from '../../slices/authPoliciesSlice';
import { 
  AuthPolicy, AuthMethod, AuthUserType,
  authUserTypeOptions, authMethodOptions
} from '@/data/mockData';

export const AuthPolicyDialogs = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [scopeType, setScopeType] = useState<'controller' | 'ap'>('controller');
  const [scopeValue, setScopeValue] = useState('');
  const { 
    addAuthPolicyDialogOpen, editAuthPolicyDialogOpen, deleteAuthPolicyDialogOpen, 
    selectedAuthPolicy, authPolicyForm, validationError, data: authPolicies
  } = useSelector((state: RootState) => state.policies.authPolicies);

  // Lấy danh sách Controllers và APs thực tế từ hệ thống cài đặt
  const { controllers, aps } = useSelector((state: RootState) => state.settings.devices);
  const appliedAreas = authPolicyForm.appliedAreas || [];

  const scopeOptions = useMemo(() => {
    if (scopeType === 'controller') {
      return controllers.map((ctrl) => ({
        value: String(ctrl.id),
        label: `${ctrl.nasIdentifier || `Controller ${ctrl.id}`} (${ctrl.ipAddress})`,
      }));
    }

    return aps.map((ap) => ({
      value: ap.macAddress,
      label: `${ap.name} (${ap.macAddress})`,
    }));
  }, [scopeType, controllers, aps]);

  const appliedAreaItems = useMemo(() => {
    const controllerMap = new Map(controllers.map((ctrl) => [String(ctrl.id), `${ctrl.nasIdentifier || `Controller ${ctrl.id}`} (${ctrl.ipAddress})`]));
    const apMap = new Map(aps.map((ap) => [ap.macAddress, `${ap.name} (${ap.macAddress})`]));

    return appliedAreas.map((item) => {
      if (item.startsWith('ctrl:')) {
        const id = item.replace('ctrl:', '');
        return { key: item, label: `Controller: ${controllerMap.get(id) || id}` };
      }
      if (item.startsWith('ap:')) {
        const mac = item.replace('ap:', '');
        return { key: item, label: `AP: ${apMap.get(mac) || mac}` };
      }
      return { key: item, label: item };
    });
  }, [appliedAreas, controllers, aps]);

  const addScopeArea = () => {
    if (!scopeValue) return;
    const nextValue = scopeType === 'controller' ? `ctrl:${scopeValue}` : `ap:${scopeValue}`;
    if (appliedAreas.includes(nextValue)) return;
    dispatch(setAuthPolicyForm({ ...authPolicyForm, appliedAreas: [...appliedAreas, nextValue] }));
    setScopeValue('');
  };

  const removeScopeArea = (value: string) => {
    dispatch(setAuthPolicyForm({ ...authPolicyForm, appliedAreas: appliedAreas.filter((item) => item !== value) }));
  };

  const validateAuthPolicy = (policy: Partial<AuthPolicy>) => {
    if (!policy.name?.trim()) return "Vui lòng nhập tên chính sách.";
    if (!policy.userType) return "Vui lòng chọn loại người dùng.";
    if (!policy.authMethod) return "Vui lòng chọn phương thức xác thực.";
    if (!policy.appliedAreas || policy.appliedAreas.length === 0) return "Vui lòng chọn ít nhất 1 thiết bị áp dụng.";
    return null;
  };

  const saveNewAuthPolicy = () => {
    const error = validateAuthPolicy(authPolicyForm);
    if (error) {
      dispatch(setValidationError(error));
      return;
    }
    const newPolicy: Omit<AuthPolicy, 'id'> = {
      name: authPolicyForm.name || '',
      description: authPolicyForm.description || '',
      userType: authPolicyForm.userType as AuthUserType,
      authMethod: authPolicyForm.authMethod as AuthMethod,
      isActive: authPolicyForm.isActive !== undefined ? authPolicyForm.isActive : true,
      require2FA: authPolicyForm.require2FA ?? false,
      allowRegistration: authPolicyForm.allowRegistration ?? false,
      applyByTime: authPolicyForm.applyByTime,
      appliedAreas: authPolicyForm.appliedAreas || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch(createAuthPolicyAsync(newPolicy));
  };

  const saveEditAuthPolicy = () => {
    const error = validateAuthPolicy(authPolicyForm);
    if (error) {
      dispatch(setValidationError(error));
      return;
    }
    if (selectedAuthPolicy) {
      dispatch(updateAuthPolicyAsync({ ...selectedAuthPolicy, ...authPolicyForm } as AuthPolicy));
    }
  };

  const confirmDeleteAuthPolicy = () => {
    if (selectedAuthPolicy) {
      dispatch(deleteAuthPolicyAsync(selectedAuthPolicy.id));
    }
  };

  const renderAuthFormContent = (isEdit = false) => (
    <div className="space-y-6 py-4">
      {validationError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
          {validationError}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor={isEdit ? "edit-auth-name" : "auth-name"}>Tên chính sách <span className="text-red-500">*</span></Label>
          <Input 
            id={isEdit ? "edit-auth-name" : "auth-name"} 
            value={authPolicyForm.name || ''} 
            onChange={e => dispatch(setAuthPolicyForm({...authPolicyForm, name: e.target.value}))}
            placeholder="VD: Cán bộ - Azure AD"
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor={isEdit ? "edit-auth-desc" : "auth-desc"}>Mô tả</Label>
          <Input 
            id={isEdit ? "edit-auth-desc" : "auth-desc"} 
            value={authPolicyForm.description || ''} 
            onChange={e => dispatch(setAuthPolicyForm({...authPolicyForm, description: e.target.value}))}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch 
            id={isEdit ? "edit-auth-active" : "auth-active"}
            checked={authPolicyForm.isActive ?? true}
            onCheckedChange={(checked) => dispatch(setAuthPolicyForm({...authPolicyForm, isActive: checked}))} 
          />
          <Label htmlFor={isEdit ? "edit-auth-active" : "auth-active"}>Kích hoạt chính sách này</Label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <div>
           <Label>Loại người dùng <span className="text-red-500">*</span></Label>
           <Select 
              value={authPolicyForm.userType || ''} 
              onValueChange={(val: AuthUserType) => dispatch(setAuthPolicyForm({...authPolicyForm, userType: val}))}
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
              value={authPolicyForm.authMethod || ''} 
              onValueChange={(val: AuthMethod) => dispatch(setAuthPolicyForm({...authPolicyForm, authMethod: val}))}
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

      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <div className="flex items-center space-x-2">
           <Checkbox 
              id={isEdit ? "edit-req-2fa" : "req-2fa"} 
              checked={authPolicyForm.require2FA}
              onCheckedChange={(c) => dispatch(setAuthPolicyForm({...authPolicyForm, require2FA: !!c}))}
           />
           <Label htmlFor={isEdit ? "edit-req-2fa" : "req-2fa"}>Yêu cầu xác thực 2 bước (2FA)</Label>
        </div>
        {(authPolicyForm.userType === 'guest_reg' || authPolicyForm.userType === 'guest_noreg') && (
          <div className="flex items-center space-x-2">
             <Checkbox 
                id={isEdit ? "edit-allow-reg" : "allow-reg"} 
                checked={authPolicyForm.allowRegistration}
                onCheckedChange={(c) => dispatch(setAuthPolicyForm({...authPolicyForm, allowRegistration: !!c}))}
             />
             <Label htmlFor={isEdit ? "edit-allow-reg" : "allow-reg"}>Cho phép khách tự đăng ký</Label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <div>
           <Label>Áp dụng theo Thời gian</Label>
           <Select 
              value={authPolicyForm.applyByTime || 'all'} 
              onValueChange={(val) => dispatch(setAuthPolicyForm({...authPolicyForm, applyByTime: val}))}
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

      <div className="pt-2">
        <Label className="mb-2 block">Phạm vi áp dụng (Thiết bị)</Label>
        <div className="border rounded-md p-3 mt-2 bg-white space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-[150px_1fr_auto] gap-2">
            <Select
              value={scopeType}
              onValueChange={(value: 'controller' | 'ap') => {
                setScopeType(value);
                setScopeValue('');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Loại thiết bị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="controller">Controller</SelectItem>
                <SelectItem value="ap">Access Point</SelectItem>
              </SelectContent>
            </Select>

            <Select value={scopeValue} onValueChange={setScopeValue}>
              <SelectTrigger>
                <SelectValue placeholder={scopeType === 'controller' ? 'Chọn controller' : 'Chọn access point'} />
              </SelectTrigger>
              <SelectContent>
                {scopeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="button" onClick={addScopeArea} disabled={!scopeValue}>
              Thêm
            </Button>
          </div>

          <div className="min-h-10 rounded-md border border-dashed border-gray-300 p-2">
            {appliedAreaItems.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa chọn phạm vi áp dụng.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {appliedAreaItems.map((item) => (
                  <span key={item.key} className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                    {item.label}
                    <button
                      type="button"
                      className="text-gray-500 hover:text-red-600"
                      onClick={() => removeScopeArea(item.key)}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={addAuthPolicyDialogOpen} onOpenChange={(open) => dispatch(setAddAuthPolicyDialogOpen(open))}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm Chính sách Xác thực</DialogTitle>
            <DialogDescription>Cấu hình phương thức đăng nhập cho người dùng</DialogDescription>
          </DialogHeader>
          
          {renderAuthFormContent(false)}

          <DialogFooter>
             <Button variant="outline" onClick={() => dispatch(setAddAuthPolicyDialogOpen(false))}>Hủy</Button>
             <Button onClick={saveNewAuthPolicy} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">Lưu chính sách</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={editAuthPolicyDialogOpen} onOpenChange={(open) => dispatch(setEditAuthPolicyDialogOpen(open))}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
             <DialogTitle>Chỉnh sửa Chính sách Xác thực</DialogTitle>
          </DialogHeader>
          
          {renderAuthFormContent(true)}

          <DialogFooter>
             <Button variant="outline" onClick={() => dispatch(setEditAuthPolicyDialogOpen(false))}>Hủy</Button>
             <Button onClick={saveEditAuthPolicy} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAuthPolicyDialogOpen} onOpenChange={(open) => dispatch(setDeleteAuthPolicyDialogOpen(open))}>
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
    </>
  );
};
