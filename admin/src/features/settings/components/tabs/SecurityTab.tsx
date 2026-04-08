import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Key, Shield, ShieldCheck, X, Plus } from 'lucide-react';
import { AppDispatch, RootState } from '../../../../stores/store';
import { 
  addAllowedIp, removeAllowedIp,
} from '../../slices/securitySlice';

export const SecurityTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { allowedIps } = useSelector((state: RootState) => state.settings.security);
  const [newIp, setNewIp] = useState('');

  const handleAddIp = () => {
    if (newIp) {
      dispatch(addAllowedIp(newIp));
      setNewIp('');
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Security Policies */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock size={20} />
          Thiết lập Bảo mật
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Password Policy */}
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Key size={16} className="text-gray-500" /> Chính sách Mật khẩu
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 font-medium">Yêu cầu</label>
                <select className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm bg-gray-50">
                  <option>Mạnh (8+ ký tự, A-Za-z0-9, đặc biệt)</option>
                  <option>Trung bình</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                  <label className="text-xs text-gray-600 font-medium">Đổi sau (ngày)</label>
                  <Input type="number" placeholder="90" className="mt-1 h-8" />
                  </div>
                  <div>
                  <label className="text-xs text-gray-600 font-medium">Hết hạn (ngày)</label>
                  <Input type="number" placeholder="365" className="mt-1 h-8" />
                  </div>
              </div>
            </div>
          </div>

          {/* Login Restrictions */}
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shield size={16} className="text-gray-500" /> Hạn chế Đăng nhập
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                  <label className="text-xs text-gray-600 font-medium">Sai tối đa</label>
                  <Input type="number" placeholder="5 lần" className="mt-1 h-8" />
                  </div>
                  <div>
                  <label className="text-xs text-gray-600 font-medium">Khóa (phút)</label>
                  <Input type="number" placeholder="30" className="mt-1 h-8" />
                  </div>
              </div>
                <div className="pt-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" className="rounded border-gray-300" defaultChecked /> Tự động gửi cảnh báo qua Email
                  </label>
                </div>
            </div>
          </div>

          {/* Admin Network Restriction - Compact */}
          <div className="p-4 bg-white rounded-lg border border-gray-200 col-span-1 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-green-600" />
                      <h4 className="text-sm font-semibold text-gray-900">Giới hạn IP Quản trị</h4>
                      <span className="text-xs text-gray-500 hidden sm:inline">(Chỉ cho phép truy cập từ các IP bên dưới)</span>
                  </div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="IP/CIDR (VD: 192.168.1.10)" 
                        value={newIp}
                        onChange={(e) => setNewIp(e.target.value)}
                        className="h-8 w-48 text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddIp()}
                      />
                      <Button onClick={handleAddIp} disabled={!newIp} size="sm" className="h-8 bg-green-600 hover:bg-green-700">
                      <Plus size={14} className="mr-1" /> Thêm
                      </Button>
                  </div>
              </div>

              <div className="flex flex-wrap gap-2">
                  {allowedIps.map((ip) => (
                    <div key={ip} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-mono transition-colors">
                        <span>{ip}</span>
                        <button onClick={() => dispatch(removeAllowedIp(ip))} className="text-gray-400 hover:text-red-600">
                          <X size={14} />
                        </button>
                    </div>
                  ))}
                  {allowedIps.length === 0 && (
                        <span className="text-sm text-gray-500 italic py-1">Chưa có giới hạn nào. Truy cập công khai.</span>
                  )}
              </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Lưu cài đặt bảo mật</Button>
        </div>
      </div>
    </div>
  );
};
