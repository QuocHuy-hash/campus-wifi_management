import { useDispatch, useSelector } from 'react-redux';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Activity, Network } from 'lucide-react';
import { RootState, AppDispatch } from '@/stores/store';
import { setEditPolicyDialogOpen, setDeletePolicyDialogOpen, setSelectedPolicy, setPolicyForm } from '../../slices/policiesSlice';
import { WifiPolicy } from '@/data/mockData';

export const AuthorizationPolicyTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const policies = useSelector((state: RootState) => state.policies.policies.data);
  const data = policies.filter(p => p.type === 'authorization');

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
            <TableHead>VLAN ID</TableHead>
            <TableHead>Thiết bị Đồng thời</TableHead>
            <TableHead>Giới hạn Tốc độ</TableHead>
            <TableHead>Giới hạn Phiên</TableHead>
            <TableHead>Bảo mật</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((policy) => (
            <TableRow key={policy.id} className={!policy.isActive ? "opacity-60 bg-gray-50" : ""}>
              <TableCell>
                 <div className="font-medium text-[#1e3a5f] flex items-center space-x-2">
                   <span>{policy.name}</span>
                   {!policy.isActive && <Badge variant="secondary" className="text-[10px]">Tạm ngưng</Badge>}
                 </div>
                 <div className="text-xs text-gray-500 font-normal">{policy.description}</div>
              </TableCell>
              <TableCell>
                 <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                   <Network size={12} className="mr-1" />
                   VLAN {policy.vlanId}
                 </Badge>
              </TableCell>
              <TableCell>
                 Tối đa {policy.maxConcurrentDevices} thiết bị
              </TableCell>
              <TableCell>
                 <div className="text-sm">
                   <div><span className="text-gray-500 w-6 inline-block">DL:</span> {policy.downloadLimit} Mbps</div>
                   <div><span className="text-gray-500 w-6 inline-block">UL:</span> {policy.uploadLimit} Mbps</div>
                 </div>
              </TableCell>
              <TableCell>
                 <div className="text-sm">
                   <div><span className="text-gray-500">Max:</span> {policy.maxSessionTime} giờ/phiên</div>
                   <div><span className="text-gray-500">Quota:</span> {policy.maxDailyData} GB/ngày</div>
                 </div>
              </TableCell>
              <TableCell>
                 <div className="flex flex-col gap-1 text-xs">
                    {policy.bindMacAddress && <Badge variant="secondary" className="bg-blue-50 text-blue-700">MAC Binding</Badge>}
                    {policy.autoReLogin && <Badge variant="secondary" className="bg-green-50 text-green-700">Auto Re-login</Badge>}
                    {policy.idleTimeout && <span className="text-gray-500">Idle timeout: {policy.idleTimeout}p</span>}
                 </div>
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
