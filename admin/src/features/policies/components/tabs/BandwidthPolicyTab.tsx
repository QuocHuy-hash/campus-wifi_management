import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { RootState, AppDispatch } from '@/stores/store';
import { setEditPolicyDialogOpen, setDeletePolicyDialogOpen, setSelectedPolicy, setPolicyForm } from '../../slices/policiesSlice';
import { WifiPolicy } from '@/data/mockData';

export const BandwidthPolicyTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: policies, filterRole, filterArea, filterTime, filterSearch } = useSelector((state: RootState) => state.policies.policies);

  const filteredPolicies = policies.filter((p: WifiPolicy) => {
    if (p.type !== 'bandwidth') return false;
    if (filterRole !== 'all' && !p.applyToRoles.includes(filterRole)) return false;
    if (filterArea !== 'all' && (!p.applyToArea || p.applyToArea === '' || !p.applyToArea.includes(filterArea))) return false;
    if (filterTime !== 'all' && (!p.applyByTime || p.applyByTime === '' || p.applyByTime !== filterTime)) return false;
    if (filterSearch) {
      const searchLower = filterSearch.toLowerCase();
      if (!p.name.toLowerCase().includes(searchLower) && !p.description.toLowerCase().includes(searchLower)) return false;
    }
    return true;
  });
  const handleEditPolicy = (policy: WifiPolicy) => {
    dispatch(setSelectedPolicy(policy));
    dispatch(setPolicyForm(policy));
    dispatch(setEditPolicyDialogOpen(true));
  };

  const handleDeletePolicy = (policy: WifiPolicy) => {
    dispatch(setSelectedPolicy(policy));
    dispatch(setDeletePolicyDialogOpen(true));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Tên chính sách</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Mô tả</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Tải xuống</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Tải lên</th>
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
              <td className="px-4 py-3 text-sm text-center">
                <span className="bg-green-50 text-green-700 px-2 py-1 rounded">{policy.downloadLimit || 0} Mbps</span>
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded">{policy.uploadLimit || 0} Mbps</span>
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
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                <p>Chưa có chính sách băng thông nào</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
