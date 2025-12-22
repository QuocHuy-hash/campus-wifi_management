import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, Check } from 'lucide-react';
import { Shield, Plus, Edit, Fingerprint, UserPlus, Eye } from 'lucide-react';
import {
  systemRoles,
  userGroups,
  resourceList,
  initialPolicies,
} from "@/data/mockData";

// Filter policies by type from mock data
const bandwidthPolicies = initialPolicies.filter(p => p.type === 'bandwidth');
const sessionPolicies = initialPolicies.filter(p => p.type === 'authorization');
const auditPolicies = initialPolicies.filter(p => p.type === 'audit');
const securityPolicies = initialPolicies.filter(p => p.type === 'security');

const userRoles = ['Sinh viên', 'Cán bộ', 'Khách'];
const accountStatuses = ['Active', 'Disabled'];

// Custom Static Select Component
const StaticSelect = ({ 
  value, 
  options, 
  placeholder = "Select...",
  className = "",
  expanded = false
}: { 
  value?: string; 
  options: { label: string; value: string }[] | string[]; 
  placeholder?: string;
  className?: string;
  expanded?: boolean;
}) => {
  const displayValue = value || placeholder;
  
  const formattedOptions = options.map(opt => 
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <div className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 border-gray-200 ${expanded ? 'border-b-0 rounded-b-none ring-2 ring-blue-500/20' : ''}`}>
        <span className="block truncate">{displayValue}</span>
        <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>
      
      {/* Expanded Content */}
      {expanded && (
        <div className="absolute top-full left-0 w-full min-w-[8rem] overflow-hidden rounded-b-md border border-t-0 bg-popover text-popover-foreground shadow-md animate-in fade-in-0 z-20 bg-white">
          <div className="p-1 max-h-[200px] overflow-y-auto">
            {formattedOptions.map((option) => (
              <div 
                key={option.value}
                className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none ${
                  value === option.value ? 'bg-accent text-accent-foreground bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                {value === option.value && (
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Check className="h-4 w-4" />
                  </span>
                )}
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Spacer for flow if expanded */}
      {expanded && (
        <div style={{ height: `${Math.min(formattedOptions.length * 32 + 10, 210)}px` }} className="w-full"></div>
      )}
    </div>
  );
};

const StaticSection = ({ title, description, icon: Icon, headerBg = "bg-blue-600", children }: { 
  title: string; 
  description: string;
  icon: React.ElementType; 
  headerBg?: string;
  children: React.ReactNode;
}) => (
  <Card className="overflow-visible border-2 shadow-xl rounded-2xl h-full flex flex-col">
    <div className={`${headerBg} px-6 py-8 text-white text-center relative overflow-hidden rounded-t-xl shrink-0`}>
      <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
        <Icon size={120} />
      </div>
      <div className="inline-flex p-3 bg-white/20 rounded-full mb-4 relative z-10">
        <Icon size={32} />
      </div>
      <h3 className="text-2xl font-bold relative z-10">{title}</h3>
      <p className="text-white/80 mt-1 text-sm relative z-10">{description}</p>
    </div>
    <div className="p-8 bg-white flex-1 overflow-visible">
      {children}
    </div>
  </Card>
);

export default function UserManagementModals() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 pt-10 space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-gray-900">Quản lý Người dùng - UI Showcase</h1>
          <p className="text-lg text-gray-600">Giao diện tĩnh các modal và danh sách dropdown phục vụ Design System.</p>
        </div>

        {/* --- PART 1: STATIC MODALS (CLOSED DROPDOWNS) --- */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
            Giao diện Modal (Form chuẩn)
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            
            {/* 1. Modal Thêm Người dùng */}
            <StaticSection 
              title="Thêm Người dùng mới" 
              description="Tạo tài khoản người dùng WIFI mới"
              icon={UserPlus} 
              headerBg="bg-gradient-to-r from-blue-600 to-blue-700"
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="add-email">Email</Label>
                  <Input id="add-email" placeholder="example@hcmus.edu.vn" className="border-gray-200 mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="add-name">Họ tên</Label>
                  <Input id="add-name" placeholder="Nguyễn Văn A" className="border-gray-200 mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="add-unit">Đơn vị</Label>
                  <Input id="add-unit" placeholder="Khoa CNTT" className="border-gray-200 mt-1.5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="add-role">Vai trò</Label>
                    <StaticSelect className="mt-1.5" value="Sinh viên" options={userRoles} expanded={false} />
                  </div>
                  <div>
                    <Label htmlFor="add-status">Trạng thái</Label>
                    <StaticSelect className="mt-1.5" value="Active" options={accountStatuses} expanded={false} />
                  </div>
                </div>
                <div className="border-t pt-4 flex justify-end gap-3 mt-6">
                  <Button variant="outline">Hủy</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">Thêm người dùng</Button>
                </div>
              </div>
            </StaticSection>

            {/* 2. Modal Chỉnh sửa Người dùng */}
            <StaticSection 
              title="Chỉnh sửa Người dùng" 
              description="Cập nhật thông tin người dùng WIFI"
              icon={Edit} 
              headerBg="bg-gradient-to-r from-amber-500 to-orange-600"
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-email">Email (IAM - Chỉ đọc)</Label>
                  <Input id="edit-email" value="10013@student.hcmus.edu.vn" disabled className="bg-gray-100 border-gray-200 mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="edit-name">Họ tên</Label>
                  <Input id="edit-name" value="Lê Quốc Huy" className="border-gray-200 mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="edit-unit">Đơn vị</Label>
                  <Input id="edit-unit" value="Khoa Hóa" className="border-gray-200 mt-1.5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-role">Vai trò</Label>
                    <StaticSelect className="mt-1.5" value="Sinh viên" options={userRoles} expanded={false} />
                  </div>
                  <div>
                    <Label htmlFor="edit-status">Trạng thái</Label>
                    <StaticSelect className="mt-1.5" value="Active" options={accountStatuses} expanded={false} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-mac">MAC Address</Label>
                  <Input id="edit-mac" value="AA:BB:CC:DD:EE:04" placeholder="AA:BB:CC:DD:EE:FF" className="border-gray-200 mt-1.5" />
                </div>
                <div className="border-t pt-4 flex justify-end gap-3 mt-6">
                  <Button variant="outline">Hủy</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">Lưu thay đổi</Button>
                </div>
              </div>
            </StaticSection>

            {/* 3. Modal Áp dụng Chính sách */}
            <StaticSection 
              title="Áp dụng Chính sách" 
              description="Gán chính sách cho người dùng: Lê Quốc Huy"
              icon={Fingerprint} 
              headerBg="bg-gradient-to-r from-green-600 to-emerald-700"
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="policy-bandwidth">Chính sách Băng thông</Label>
                  <StaticSelect className="mt-1.5" value={bandwidthPolicies[0]?.name} options={bandwidthPolicies.map(p => p.name)} expanded={false} />
                </div>
                <div>
                  <Label htmlFor="policy-session">Chính sách Cấp quyền truy cập (Phiên)</Label>
                  <StaticSelect className="mt-1.5" value={sessionPolicies[0]?.name} options={sessionPolicies.map(p => p.name)} expanded={false} />
                </div>
                <div>
                  <Label htmlFor="policy-audit">Chính sách Kiểm toán</Label>
                  <StaticSelect className="mt-1.5" value={auditPolicies[0]?.name} options={auditPolicies.map(p => p.name)} expanded={false} />
                </div>
                <div>
                  <Label htmlFor="policy-security">Chính sách Bảo mật</Label>
                  <StaticSelect className="mt-1.5" value={securityPolicies[0]?.name} options={securityPolicies.map(p => p.name)} expanded={false} />
                </div>
                <div className="border-t pt-4 flex justify-end gap-3 mt-6">
                  <Button variant="outline">Hủy</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">Áp dụng chính sách</Button>
                </div>
              </div>
            </StaticSection>

            {/* 4. Modal Phân quyền Hệ thống */}
            <StaticSection 
              title="Phân quyền Người dùng" 
              description="Thiết lập quyền hạn truy cập cho các nhóm người dùng"
              icon={Shield} 
              headerBg="bg-gradient-to-r from-purple-600 to-indigo-700"
            >
              <div className="space-y-4">
                <div>
                  <Label>Chọn nhóm người dùng</Label>
                  <StaticSelect className="mt-1.5" value={userGroups[0]} options={userGroups} expanded={false} />
                </div>
                
                <div className="border rounded-lg overflow-hidden mt-4">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Tài nguyên</th>
                        <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">Quyền Xem</th>
                        <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">Quyền Sửa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resourceList.slice(0, 4).map((resource, idx) => (
                        <tr key={resource} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-sm text-gray-700">{resource}</td>
                          <td className="px-4 py-2 text-center"><Checkbox defaultChecked className="data-[state=checked]:bg-purple-600" /></td>
                          <td className="px-4 py-2 text-center"><Checkbox defaultChecked className="data-[state=checked]:bg-purple-600" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="border-t pt-4 flex justify-end gap-3 mt-6">
                  <Button variant="outline">Hủy</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">Lưu phân quyền</Button>
                </div>
              </div>
            </StaticSection>

            {/* 5. Modal Chi Tiết Người dùng (New) */}
            <StaticSection 
              title="Chi tiết Người dùng" 
              description="Xem thông tin chi tiết và chính sách"
              icon={Eye} 
              headerBg="bg-gradient-to-r from-teal-500 to-cyan-600"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Email (IAM)</Label>
                    <p className="text-sm font-medium">10013@student.hcmus.edu.vn</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Họ tên</Label>
                    <p className="text-sm font-medium">Lê Quốc Huy</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Đơn vị</Label>
                    <p className="text-sm font-medium">Khoa Hóa</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Ngày tạo</Label>
                    <p className="text-sm font-medium">2023-01-15</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Vai trò</Label>
                    <p className="text-sm font-medium">
                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        Sinh viên
                      </span>
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Trạng thái</Label>
                    <p className="text-sm font-medium">
                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Active
                      </span>
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-gray-500">MAC Address</Label>
                    <p className="text-sm font-medium font-mono">AA:BB:CC:DD:EE:04</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <Label className="text-xs text-gray-500 block mb-2 font-bold uppercase tracking-wide">Chính sách áp dụng</Label>
                  <div className="space-y-2 bg-gray-50 p-3 rounded-lg border">
                    <p className="text-xs flex justify-between"><span className="font-medium text-gray-600">Băng thông:</span> <span>{bandwidthPolicies[0]?.name}</span></p>
                    <p className="text-xs flex justify-between"><span className="font-medium text-gray-600">Phiên:</span> <span>{sessionPolicies[0]?.name}</span></p>
                    <p className="text-xs flex justify-between"><span className="font-medium text-gray-600">Kiểm toán:</span> <span>{auditPolicies[0]?.name}</span></p>
                    <p className="text-xs flex justify-between"><span className="font-medium text-gray-600">Bảo mật:</span> <span>{securityPolicies[0]?.name}</span></p>
                  </div>
                </div>
                <div className="border-t pt-4 flex justify-end gap-3">
                  <Button variant="outline">Đóng</Button>
                </div>
              </div>
            </StaticSection>

          </div>
        </div>

        {/* --- PART 2: EXPANDED DROPDOWNS SHOWCASE --- */}
        <div>
           <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
            <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">2</span>
            Dropdown System (Design Reference)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 bg-white p-6 rounded-2xl border-2 shadow-sm">
            
            <div className="space-y-2">
              <Label className="text-gray-500 text-xs uppercase tracking-wider font-bold">1. Select Role</Label>
              <StaticSelect value="Sinh viên" options={userRoles} expanded={true} />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-500 text-xs uppercase tracking-wider font-bold">2. Select Status</Label>
              <StaticSelect value="Active" options={accountStatuses} expanded={true} />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-500 text-xs uppercase tracking-wider font-bold">3. Select Bandwidth Policy</Label>
              <StaticSelect value={bandwidthPolicies[0]?.name} options={bandwidthPolicies.map(p => p.name)} expanded={true} />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-500 text-xs uppercase tracking-wider font-bold">4. Select Security Policy</Label>
              <StaticSelect value={securityPolicies[0]?.name} options={securityPolicies.map(p => p.name)} expanded={true} />
            </div>

            <div className="space-y-2 pt-6">
              <Label className="text-gray-500 text-xs uppercase tracking-wider font-bold">5. Select User Group</Label>
              <StaticSelect value={userGroups[0]} options={userGroups} expanded={true} />
            </div>

             <div className="space-y-2 pt-6">
              <Label className="text-gray-500 text-xs uppercase tracking-wider font-bold">6. Select Session Policy</Label>
              <StaticSelect value={sessionPolicies[0]?.name} options={sessionPolicies.map(p => p.name)} expanded={true} />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
