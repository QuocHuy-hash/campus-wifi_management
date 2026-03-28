import { useDispatch, useSelector } from 'react-redux';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Shield, CheckCircle, Clock } from 'lucide-react';
import { RootState, AppDispatch } from '@/stores/store';
import { setEditPolicyDialogOpen, setDeletePolicyDialogOpen, setSelectedPolicy, setPolicyForm } from '../../slices/policiesSlice';
import { WifiPolicy } from '@/data/mockData';

export const SecurityPolicyTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const policies = useSelector((state: RootState) => state.policies.policies.data);
  const data = policies.filter(p => p.type === 'security');

  const handleEdit = (policy: WifiPolicy) => {
    dispatch(setSelectedPolicy(policy));
    dispatch(setPolicyForm(policy));
    dispatch(setEditPolicyDialogOpen(true));
  };

  const handleDelete = (policy: WifiPolicy) => {
    dispatch(setSelectedPolicy(policy));
    dispatch(setDeletePolicyDialogOpen(true));
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Không có chính sách nào. Hãy thêm mới.
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên Chính sách</TableHead>
            <TableHead>Giới hạn Thiết bị</TableHead>
            <TableHead>MAC Caching</TableHead>
            <TableHead>Tái Xác thực</TableHead>
            <TableHead>Số lần Thử lại</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((policy) => (
            <TableRow key={policy.id}>
              <TableCell className="font-medium text-[#1e3a5f]">
                 {policy.name}
                 <div className="text-xs text-gray-500 font-normal">{policy.description}</div>
              </TableCell>
              <TableCell>
                 Tối đa {policy.maxConcurrentDevices} thiết bị/user
              </TableCell>
              <TableCell>
                 {policy.macCachingEnabled ? (
                   <div className="flex items-center text-sm text-green-600">
                      <CheckCircle size={14} className="mr-1" />
                      Lưu {policy.macCacheTime} {policy.macCacheTimeUnit === 'day' ? 'Ngày' : 'Giờ'}
                   </div>
                 ) : (
                   <span className="text-gray-400">Không bật</span>
                 )}
              </TableCell>
              <TableCell>
                 <div className="flex items-center text-sm">
                    <Clock size={14} className="mr-1 text-gray-400" />
                    Mỗi {policy.reAuthInterval} {policy.reAuthIntervalUnit === 'day' ? 'Ngày' : 'Giờ'}
                 </div>
              </TableCell>
              <TableCell>
                 {policy.retryLimit} lần
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(policy)} className="text-blue-600">
                  <Edit size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(policy)} className="text-red-600">
                  <Trash2 size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
