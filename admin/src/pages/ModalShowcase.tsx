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
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Users, Shield, FileText, MapPin, Building2, Server, Wifi, Globe, 
  Key, Plus, Edit, Trash2, Eye, Database, AlertTriangle
} from 'lucide-react';

import {
  systemRoles,
  userGroups,
  resourceList,
  initialCampuses,
  authUserTypeOptions,
  authMethodOptions,
} from "@/data/mockData";

// Component wrapper for each modal display
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

// Alert Dialog Card wrapper
const AlertCard = ({ title, description, actionText = "Xóa", actionColor = "bg-red-600" }: {
  title: string;
  description: React.ReactNode;
  actionText?: string;
  actionColor?: string;
}) => (
  <Card className="bg-white shadow-md border-2 border-red-200">
    <div className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="text-red-500 mt-1" size={24} />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-2">{description}</p>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
        <Button variant="outline">Hủy</Button>
        <Button className={actionColor}>{actionText}</Button>
      </div>
    </div>
  </Card>
);

export default function ModalShowcase() {
  const sampleLog = {
    timestamp: '2024-01-15 14:30:00',
    user: 'admin_user',
    action: 'Cập nhật chính sách băng thông',
    type: 'config',
    details: 'Thay đổi giới hạn tải xuống từ 10Mbps lên 20Mbps cho nhóm Sinh viên'
  };

  return (
    <div className="space-y-8 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Modal & Popup Showcase</h1>
        <p className="text-gray-600 mt-1">Trang hiển thị tất cả các Modal và Popup trong hệ thống</p>
      </div>

      {/* ==================== SECTION: SETTINGS - ADMIN USERS ==================== */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
          <Users className="text-blue-600" />
          Cài đặt - Quản lý Người dùng Hệ thống
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Admin User */}
          <ModalCard title="Thêm Người dùng Hệ thống" icon={Plus} iconColor="text-green-600">
            <p className="text-sm text-gray-500 mb-4">Tạo tài khoản quản trị viên mới</p>
            <div className="space-y-4">
              <div>
                <Label>Tên đăng nhập</Label>
                <Input placeholder="admin_user" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="admin@hcmus.edu.vn" />
              </div>
              <div>
                <Label>Mật khẩu</Label>
                <Input type="password" placeholder="Nhập mật khẩu" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vai trò Hệ thống</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Chọn vai trò" /></SelectTrigger>
                    <SelectContent>
                      {systemRoles.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nhóm</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Chọn nhóm" /></SelectTrigger>
                    <SelectContent>
                      {userGroups.map((group) => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Trạng thái tài khoản</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Hoạt động</SelectItem>
                    <SelectItem value="Locked">Đã khóa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Giới hạn thời gian truy cập (tùy chọn)</Label>
                <Input type="datetime-local" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline">Hủy</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Thêm người dùng</Button>
              </div>
            </div>
          </ModalCard>

          {/* Edit Admin User */}
          <ModalCard title="Chỉnh sửa Người dùng Hệ thống" icon={Edit} iconColor="text-amber-600">
            <p className="text-sm text-gray-500 mb-4">Cập nhật thông tin tài khoản quản trị viên</p>
            <div className="space-y-4">
              <div>
                <Label>Tên đăng nhập</Label>
                <Input defaultValue="admin_user" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" defaultValue="admin@hcmus.edu.vn" />
              </div>
              <div className="grid grid-cols-2 gap-4">
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

          {/* Delete Admin User */}
          <AlertCard 
            title="Xác nhận xóa người dùng"
            description={<>Bạn có chắc chắn muốn xóa tài khoản <strong>admin_user</strong>? Hành động này không thể hoàn tác.</>}
          />

          {/* Permission Matrix */}
          <ModalCard title="Cấu hình Phân quyền" icon={Shield} iconColor="text-purple-600">
            <p className="text-sm text-gray-500 mb-4">Thiết lập phân quyền cho các nhóm người dùng</p>
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
                        <td className="px-4 py-2 text-center"><Checkbox /></td>
                        <td className="px-4 py-2 text-center"><Checkbox /></td>
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

      {/* ==================== SECTION: SETTINGS - AREAS ==================== */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
          <MapPin className="text-green-600" />
          Cài đặt - Quản lý Khu vực (Campus & Building)
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Campus */}
          <ModalCard title="Thêm Cơ sở mới" icon={Plus} iconColor="text-green-600">
            <p className="text-sm text-gray-500 mb-4">Nhập thông tin cơ sở/khuôn viên mới</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tên cơ sở <span className="text-red-500">*</span></Label>
                  <Input placeholder="VD: Cơ sở Dĩ An" />
                </div>
                <div>
                  <Label>Mã cơ sở <span className="text-red-500">*</span></Label>
                  <Input placeholder="VD: DA" />
                </div>
              </div>
              <div>
                <Label>Địa chỉ</Label>
                <Input placeholder="Nhập địa chỉ cơ sở" />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Input placeholder="Mô tả ngắn về cơ sở" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline">Hủy</Button>
                <Button>Thêm cơ sở</Button>
              </div>
            </div>
          </ModalCard>

          {/* Edit Campus */}
          <ModalCard title="Chỉnh sửa Cơ sở" icon={Edit} iconColor="text-amber-600">
            <p className="text-sm text-gray-500 mb-4">Cập nhật thông tin cơ sở</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tên cơ sở <span className="text-red-500">*</span></Label>
                  <Input defaultValue="Cơ sở Nguyễn Văn Cừ" />
                </div>
                <div>
                  <Label>Mã cơ sở <span className="text-red-500">*</span></Label>
                  <Input defaultValue="NVC" />
                </div>
              </div>
              <div>
                <Label>Địa chỉ</Label>
                <Input defaultValue="227 Nguyễn Văn Cừ, Quận 5" />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Input defaultValue="Cơ sở chính" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline">Hủy</Button>
                <Button>Lưu thay đổi</Button>
              </div>
            </div>
          </ModalCard>

          {/* Delete Campus */}
          <AlertCard 
            title="Xác nhận xóa cơ sở"
            description={<>
              Bạn có chắc chắn muốn xóa cơ sở <strong>Cơ sở Nguyễn Văn Cừ</strong>?
              <br /><br />
              <span className="text-red-600 font-medium">Cảnh báo: Tất cả 5 tòa nhà trong cơ sở này cũng sẽ bị xóa!</span>
            </>}
            actionText="Xóa cơ sở"
          />

          {/* Add Building */}
          <ModalCard title="Thêm Tòa nhà mới" icon={Building2} iconColor="text-green-600">
            <p className="text-sm text-gray-500 mb-4">Nhập thông tin tòa nhà mới</p>
            <div className="space-y-4">
              <div>
                <Label>Thuộc cơ sở <span className="text-red-500">*</span></Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Chọn cơ sở" /></SelectTrigger>
                  <SelectContent>
                    {initialCampuses.map((campus) => (
                      <SelectItem key={campus.id} value={String(campus.id)}>{campus.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tên tòa nhà <span className="text-red-500">*</span></Label>
                  <Input placeholder="VD: Tòa nhà A" />
                </div>
                <div>
                  <Label>Mã tòa nhà <span className="text-red-500">*</span></Label>
                  <Input placeholder="VD: A" />
                </div>
              </div>
              <div>
                <Label>Số tầng</Label>
                <Input type="number" min={1} defaultValue={1} />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Input placeholder="Mô tả ngắn về tòa nhà" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline">Hủy</Button>
                <Button>Thêm tòa nhà</Button>
              </div>
            </div>
          </ModalCard>

          {/* Edit Building */}
          <ModalCard title="Chỉnh sửa Tòa nhà" icon={Edit} iconColor="text-amber-600">
            <p className="text-sm text-gray-500 mb-4">Cập nhật thông tin tòa nhà</p>
            <div className="space-y-4">
              <div>
                <Label>Thuộc cơ sở <span className="text-red-500">*</span></Label>
                <Select defaultValue="1">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {initialCampuses.map((campus) => (
                      <SelectItem key={campus.id} value={String(campus.id)}>{campus.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tên tòa nhà <span className="text-red-500">*</span></Label>
                  <Input defaultValue="Tòa nhà I" />
                </div>
                <div>
                  <Label>Mã tòa nhà <span className="text-red-500">*</span></Label>
                  <Input defaultValue="I" />
                </div>
              </div>
              <div>
                <Label>Số tầng</Label>
                <Input type="number" min={1} defaultValue={5} />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Input defaultValue="Khu giảng đường chính" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline">Hủy</Button>
                <Button>Lưu thay đổi</Button>
              </div>
            </div>
          </ModalCard>

          {/* Delete Building */}
          <AlertCard 
            title="Xác nhận xóa tòa nhà"
            description={<>
              Bạn có chắc chắn muốn xóa tòa nhà <strong>Tòa nhà I</strong> thuộc cơ sở <strong>Cơ sở Nguyễn Văn Cừ</strong>?
              <br /><br />
              Các Access Point đang được gán cho tòa nhà này có thể bị ảnh hưởng.
            </>}
            actionText="Xóa tòa nhà"
          />
        </div>
      </div>

      {/* ==================== SECTION: SETTINGS - DEVICES ==================== */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
          <Server className="text-purple-600" />
          Cài đặt - Quản lý Thiết bị (Controller & AP)
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Controller */}
          <ModalCard title="Thêm Controller Mới" icon={Server} iconColor="text-blue-600">
            <div className="space-y-4">
              <div>
                <Label>Tên Controller</Label>
                <Input placeholder="WLC-Main-01" />
              </div>
              <div>
                <Label>Địa chỉ IP</Label>
                <Input placeholder="10.0.1.1" />
              </div>
              <div>
                <Label>Phiên bản (Version)</Label>
                <Input placeholder="8.10.185.0" />
              </div>
              <div>
                <Label>Vị trí đặt máy chủ</Label>
                <Input placeholder="Phòng Server - Tầng 1" />
              </div>
              <div>
                <Label>Cơ sở</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Chọn cơ sở" /></SelectTrigger>
                  <SelectContent>
                    {initialCampuses.map((campus) => (
                      <SelectItem key={campus.id} value={campus.id.toString()}>{campus.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button>Lưu Controller</Button>
              </div>
            </div>
          </ModalCard>

          {/* Edit Controller */}
          <ModalCard title="Chỉnh sửa Controller" icon={Edit} iconColor="text-amber-600">
            <div className="space-y-4">
              <div>
                <Label>Tên Controller</Label>
                <Input defaultValue="WLC-Main-01" />
              </div>
              <div>
                <Label>Địa chỉ IP</Label>
                <Input defaultValue="10.0.1.1" />
              </div>
              <div>
                <Label>Cơ sở</Label>
                <Select defaultValue="1">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {initialCampuses.map((campus) => (
                      <SelectItem key={campus.id} value={campus.id.toString()}>{campus.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Phiên bản</Label>
                <Input defaultValue="8.10.185.0" />
              </div>
              <div>
                <Label>Vị trí</Label>
                <Input defaultValue="Phòng Server - Tầng 1" />
              </div>
              <div>
                <Label>Trạng thái</Label>
                <Select defaultValue="Online">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Offline">Offline</SelectItem>
                    <SelectItem value="Warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button>Lưu thay đổi</Button>
              </div>
            </div>
          </ModalCard>

          {/* Delete Controller */}
          <AlertCard 
            title="Xóa Controller?"
            description={<>
              Hành động này sẽ xóa controller <strong>"WLC-Main-01"</strong> khỏi hệ thống.
              Các AP được quản lý bởi controller này sẽ bị mất kết nối quản lý.
            </>}
            actionText="Xóa Controller"
          />

          {/* Add AP */}
          <ModalCard title="Thêm AP Mới" icon={Wifi} iconColor="text-green-600">
            <div className="space-y-4">
              <div>
                <Label>Tên AP</Label>
                <Input placeholder="AP-B1-01" />
              </div>
              <div>
                <Label>Địa chỉ IP / Model</Label>
                <Input placeholder="10.0.1.100 / Cisco AIR-AP1852I" />
              </div>
              <div>
                <Label>Vị trí chi tiết</Label>
                <Input placeholder="Tầng 1, Phòng 101" />
              </div>
              <div>
                <Label>Tòa nhà</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Chọn tòa nhà" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="227NVC">227 NVC</SelectItem>
                    <SelectItem value="Dĩ An">Dĩ An</SelectItem>
                    <SelectItem value="Thủ Đức">Thủ Đức</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Controller quản lý</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Chọn Controller" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WLC-Main-01">WLC-Main-01</SelectItem>
                    <SelectItem value="WLC-Main-02">WLC-Main-02</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button>Lưu AP</Button>
              </div>
            </div>
          </ModalCard>

          {/* Edit AP */}
          <ModalCard title="Chỉnh sửa AP" icon={Edit} iconColor="text-amber-600">
            <div className="space-y-4">
              <div>
                <Label>Tên AP</Label>
                <Input defaultValue="AP-B1-01" />
              </div>
              <div>
                <Label>Địa chỉ IP / Model</Label>
                <Input defaultValue="10.0.1.100 / Cisco AIR-AP1852I" />
              </div>
              <div>
                <Label>Vị trí chi tiết</Label>
                <Input defaultValue="Tầng 1, Phòng 101" />
              </div>
              <div>
                <Label>Controller quản lý</Label>
                <Select defaultValue="WLC-Main-01">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WLC-Main-01">WLC-Main-01</SelectItem>
                    <SelectItem value="WLC-Main-02">WLC-Main-02</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Trạng thái</Label>
                <Select defaultValue="Online">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Offline">Offline</SelectItem>
                    <SelectItem value="Warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button>Lưu thay đổi</Button>
              </div>
            </div>
          </ModalCard>

          {/* Delete AP */}
          <AlertCard 
            title="Xóa AP?"
            description={<>Hành động này sẽ xóa AP <strong>"AP-B1-01"</strong> khỏi hệ thống.</>}
            actionText="Xóa AP"
          />
        </div>
      </div>

      {/* ==================== SECTION: SETTINGS - IAM ==================== */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
          <Globe className="text-cyan-600" />
          Cài đặt - Tích hợp Hệ thống (IAM)
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add IAM */}
          <ModalCard title="Thêm kết nối IAM" icon={Plus} iconColor="text-green-600">
            <p className="text-sm text-gray-500 mb-4">Cấu hình thông tin tích hợp Identity Provider</p>
            <div className="space-y-4">
              <div>
                <Label>Tên kết nối</Label>
                <Input placeholder="VD: Google Workspace Staff" />
              </div>
              <div>
                <Label>Loại IdP</Label>
                <Select defaultValue="Google Workspace">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Google Workspace">Google Workspace</SelectItem>
                    <SelectItem value="Microsoft Azure AD">Microsoft Azure AD</SelectItem>
                    <SelectItem value="IAM Broker">IAM Broker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Endpoint URL</Label>
                <Input placeholder="https://accounts.google.com/..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client ID</Label>
                  <Input placeholder="client_id" />
                </div>
                <div>
                  <Label>Client Secret</Label>
                  <Input type="password" placeholder="******" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline">Hủy</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Thêm kết nối</Button>
              </div>
            </div>
          </ModalCard>

          {/* Edit IAM */}
          <ModalCard title="Chỉnh sửa kết nối IAM" icon={Edit} iconColor="text-amber-600">
            <p className="text-sm text-gray-500 mb-4">Cập nhật thông tin tích hợp Identity Provider</p>
            <div className="space-y-4">
              <div>
                <Label>Tên kết nối</Label>
                <Input defaultValue="HCMUS Workspace" />
              </div>
              <div>
                <Label>Loại IdP</Label>
                <Select defaultValue="Google Workspace">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Google Workspace">Google Workspace</SelectItem>
                    <SelectItem value="Microsoft Azure AD">Microsoft Azure AD</SelectItem>
                    <SelectItem value="IAM Broker">IAM Broker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Endpoint URL</Label>
                <Input defaultValue="https://accounts.google.com/o/oauth2/auth" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client ID</Label>
                  <Input defaultValue="789...apps.googleusercontent.com" />
                </div>
                <div>
                  <Label>Client Secret</Label>
                  <Input type="password" defaultValue="******" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline">Hủy</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Lưu thay đổi</Button>
              </div>
            </div>
          </ModalCard>

          {/* Delete IAM */}
          <AlertCard 
            title="Xóa kết nối IAM?"
            description={<>
              Hành động này sẽ xóa kết nối <strong>"HCMUS Workspace"</strong> khỏi hệ thống.
              Người dùng sử dụng phương thức xác thực này sẽ không thể đăng nhập.
            </>}
            actionText="Xóa kết nối"
          />
        </div>
      </div>

      {/* ==================== SECTION: SETTINGS - GROUPS ==================== */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
          <Database className="text-orange-600" />
          Cài đặt - Quản lý Nhóm & Quyền
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Group */}
          <ModalCard title="Thêm Nhóm mới" icon={Plus} iconColor="text-green-600">
            <p className="text-sm text-gray-500 mb-4">Tạo nhóm người dùng và phân quyền</p>
            <div className="space-y-4">
              <div>
                <Label>Tên nhóm</Label>
                <Input placeholder="VD: Quản trị viên hệ thống" />
              </div>
              <div>
                <Label>Phân quyền</Label>
                <div className="border rounded-lg p-4 space-y-2 max-h-[200px] overflow-y-auto">
                  {resourceList.slice(0, 4).map((resource) => (
                    <div key={resource} className="flex items-center justify-between">
                      <span className="text-sm">{resource}</span>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <Checkbox />
                          <Label className="text-xs">Xem</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox />
                          <Label className="text-xs">Sửa</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline">Hủy</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Thêm nhóm</Button>
              </div>
            </div>
          </ModalCard>

          {/* Edit Group */}
          <ModalCard title="Chỉnh sửa Nhóm" icon={Edit} iconColor="text-amber-600">
            <p className="text-sm text-gray-500 mb-4">Cập nhật thông tin và phân quyền nhóm</p>
            <div className="space-y-4">
              <div>
                <Label>Tên nhóm</Label>
                <Input defaultValue="Quản trị viên" />
              </div>
              <div>
                <Label>Phân quyền</Label>
                <div className="border rounded-lg p-4 space-y-2 max-h-[200px] overflow-y-auto">
                  {resourceList.slice(0, 4).map((resource, idx) => (
                    <div key={resource} className="flex items-center justify-between">
                      <span className="text-sm">{resource}</span>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <Checkbox defaultChecked={idx < 3} />
                          <Label className="text-xs">Xem</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox defaultChecked={idx < 2} />
                          <Label className="text-xs">Sửa</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline">Hủy</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Lưu thay đổi</Button>
              </div>
            </div>
          </ModalCard>

          {/* Delete Group */}
          <AlertCard 
            title="Xóa nhóm?"
            description={<>
              Bạn có chắc chắn muốn xóa nhóm <strong>"Quản trị viên"</strong>?
              Người dùng thuộc nhóm này sẽ mất quyền truy cập tương ứng.
            </>}
            actionText="Xóa nhóm"
          />

          {/* Manage Permissions */}
          <ModalCard title="Quản lý Danh sách Quyền" icon={Database} iconColor="text-purple-600">
            <p className="text-sm text-gray-500 mb-4">Thêm, sửa, xóa các tài nguyên trong hệ thống</p>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Tên tài nguyên mới" />
                <Button><Plus size={18} /></Button>
              </div>
              <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto">
                {resourceList.slice(0, 5).map((resource) => (
                  <div key={resource} className="flex items-center justify-between p-3">
                    <span className="text-sm">{resource}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit size={16} className="text-amber-600" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 size={16} className="text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline">Đóng</Button>
              </div>
            </div>
          </ModalCard>
        </div>
      </div>
    </div>
  );
}
