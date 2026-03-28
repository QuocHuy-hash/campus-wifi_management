import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2 } from 'lucide-react';
import { RootState, AppDispatch } from '@/stores/store';
import { setEditAuthPolicyDialogOpen, setDeleteAuthPolicyDialogOpen, setSelectedAuthPolicy, setAuthPolicyForm, updateAuthPolicy } from '../../slices/authPoliciesSlice';
import { AuthPolicy, authUserTypeOptions, authMethodOptions } from '@/data/mockData';

export const AuthPolicyTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authPolicies = useSelector((state: RootState) => state.policies.authPolicies.data);

  const handleEditAuthPolicy = (policy: AuthPolicy) => {
    dispatch(setSelectedAuthPolicy(policy));
    dispatch(setAuthPolicyForm(policy));
    dispatch(setEditAuthPolicyDialogOpen(true));
  };

  const handleDeleteAuthPolicy = (policy: AuthPolicy) => {
    dispatch(setSelectedAuthPolicy(policy));
    dispatch(setDeleteAuthPolicyDialogOpen(true));
  };

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
                         dispatch(updateAuthPolicy(updated));
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
};
