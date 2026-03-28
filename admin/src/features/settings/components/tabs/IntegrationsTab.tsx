import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Plus, Edit, Trash2, Database, Mail } from 'lucide-react';
import { AppDispatch, RootState } from '../../../../stores/store';
import { 
  setAddIamDialogOpen, setEditIamDialogOpen, setDeleteIamDialogOpen, setSelectedIam,
} from '../../slices/integrationsSlice';
import { IamConnection } from '../../types';

export const IntegrationsTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { iamConnections } = useSelector((state: RootState) => state.settings.integrations);

  return (
    <div className="p-6 space-y-8">
      {/* Area 1: IAM Integration */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Globe size={24} className="text-blue-600" />
              Kết nối Hệ thống Định danh (IAM Integration)
            </h3>
            <p className="text-sm text-gray-500 mt-1">Quản lý liên kết Federation với các IdP</p>
          </div>
          <Button onClick={() => dispatch(setAddIamDialogOpen(true))} className="bg-blue-600 hover:bg-blue-700">
            <Plus size={18} className="mr-2" />
            Thêm kết nối IAM
          </Button>
        </div>

        <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên kết nối</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại IdP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {iamConnections.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{item.endpointUrl}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      item.status === 'Error' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'Active' ? 'Hoạt động' : item.status === 'Error' ? 'Lỗi' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <div className="flex justify-center gap-2">
                       <Button variant="ghost" size="sm" onClick={() => { dispatch(setSelectedIam(item)); dispatch(setEditIamDialogOpen(true)); }}><Edit size={16} className="text-amber-600" /></Button>
                       <Button variant="ghost" size="sm" onClick={() => { dispatch(setSelectedIam(item)); dispatch(setDeleteIamDialogOpen(true)); }}><Trash2 size={16} className="text-red-600" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {iamConnections.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Chưa có kết nối IAM nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Area 3: External Services */}
      <div>
         <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Database size={24} className="text-purple-600" />
            Cấu hình Hệ thống Khác
         </h3>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Database Card */}
           <div className="bg-white p-5 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-blue-800">
                <Database size={20} />
                <h4 className="font-semibold">Cơ sở Dữ liệu</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700">Database Host</label>
                  <Input className="mt-1 h-8 text-sm" defaultValue="db.hcmus.edu.vn" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Port</label>
                  <Input className="mt-1 h-8 text-sm" defaultValue="5432" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Username</label>
                  <Input className="mt-1 h-8 text-sm" defaultValue="admin" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Password</label>
                  <Input type="password" className="mt-1 h-8 text-sm" defaultValue="******" />
                </div>
                <Button size="sm" className="w-full mt-2" variant="outline">Kiểm tra kết nối</Button>
              </div>
           </div>

           {/* Email Card */}
           <div className="bg-white p-5 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-orange-800">
                <Mail size={20} />
                <h4 className="font-semibold">Email Hệ thống</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700">SMTP Server</label>
                  <Input className="mt-1 h-8 text-sm" defaultValue="mail.hcmus.edu.vn" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Port</label>
                  <Input className="mt-1 h-8 text-sm" defaultValue="587" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Sender Email</label>
                  <Input className="mt-1 h-8 text-sm" defaultValue="noreply@hcmus.edu.vn" />
                </div>
                <Button size="sm" className="w-full mt-2" variant="outline">Gửi mail test</Button>
              </div>
           </div>
         </div>
         
         <div className="mt-6 flex justify-end">
            <Button className="bg-blue-600 hover:bg-blue-700">Lưu cấu hình hệ thống</Button>
         </div>
      </div>
    </div>
  );
};
