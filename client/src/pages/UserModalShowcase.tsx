import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, Plus, Edit } from 'lucide-react';
import {
  systemRoles,
  userGroups,
  resourceList,
} from "@/data/mockData";

const ModalCard = ({ title, icon: Icon, iconColor = "text-blue-600", children }: { 
  title: string; 
  icon: React.ElementType; 
  iconColor?: string;
  children: React.ReactNode 
}) => (
  <Card className="bg-white shadow-md border-2">
    <div className="bg-gray-50 px-6 py-4 border-b flex items-center gap-3">
      <Icon size={24} className={iconColor} />
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </Card>
);

export default function UserModalShowcase() {
  return (
    <div className="space-y-8 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Người dùng - Modal</h1>
        <p className="text-gray-600 mt-1">Các modal Thêm, Sửa, và Phân quyền cho người dùng</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thêm người dùng */}
        <ModalCard title="Thêm Người dùng" icon={Plus} iconColor="text-green-600">
          <div className="space-y-4">
            <div>
              <Label>Tên đăng nhập</Label>
              <Input placeholder="Tên đăng nhập" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" placeholder="Email" />
            </div>
            <div>
              <Label>Mật khẩu</Label>
              <Input type="password" placeholder="Nhập mật khẩu" />
            </div>
            <div>
              <Label>Vai trò Hệ thống</Label>
              <Select defaultValue={systemRoles[0]}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {systemRoles.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nhóm</Label>
              <Select defaultValue={userGroups[0]}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {userGroups.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Trạng thái tài khoản</Label>
              <Select defaultValue="Active">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Hoạt động</SelectItem>
                  <SelectItem value="Locked">Đã khóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline">Hủy</Button>
              <Button className="bg-blue-600 hover:bg-blue-700">Thêm người dùng</Button>
            </div>
          </div>
        </ModalCard>
        {/* Sửa người dùng */}
        <ModalCard title="Chỉnh sửa Người dùng" icon={Edit} iconColor="text-amber-600">
          <div className="space-y-4">
            <div>
              <Label>Tên đăng nhập</Label>
              <Input defaultValue="admin_user" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" defaultValue="admin@hcmus.edu.vn" />
            </div>
            <div>
              <Label>Vai trò Hệ thống</Label>
              <Select defaultValue={systemRoles[0]}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {systemRoles.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nhóm</Label>
              <Select defaultValue={userGroups[0]}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {userGroups.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Trạng thái tài khoản</Label>
              <Select defaultValue="Active">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Hoạt động</SelectItem>
                  <SelectItem value="Locked">Đã khóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline">Hủy</Button>
              <Button className="bg-blue-600 hover:bg-blue-700">Lưu thay đổi</Button>
            </div>
          </div>
        </ModalCard>
        {/* Phân quyền */}
        <ModalCard title="Phân quyền Người dùng" icon={Shield} iconColor="text-purple-600">
          <div className="space-y-4">
            <div>
              <Label>Chọn nhóm người dùng</Label>
              <Select defaultValue={userGroups[0]}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {userGroups.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-2 text-left text-xs font-semibold">Tài nguyên</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold">Quyền Xem</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold">Quyền Sửa</th>
                  </tr>
                </thead>
                <tbody>
                  {resourceList.slice(0, 4).map((resource, idx) => (
                    <tr key={resource} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-sm">{resource}</td>
                      <td className="px-4 py-2 text-center"><Checkbox defaultChecked /></td>
                      <td className="px-4 py-2 text-center"><Checkbox defaultChecked /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline">Hủy</Button>
              <Button className="bg-blue-600 hover:bg-blue-700">Lưu phân quyền</Button>
            </div>
          </div>
        </ModalCard>
      </div>
    </div>
  );
}
