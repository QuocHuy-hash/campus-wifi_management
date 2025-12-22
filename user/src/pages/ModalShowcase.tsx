import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Wifi, LogOut, Clock, Download, Upload, Activity, Globe, Network, 
  Smartphone, Laptop, Monitor, Router, Key, FileText, User, 
  Eye, EyeOff, AlertCircle, CheckCircle, Mail, Phone, Building,
  Shield, Package, Gauge, Timer, HardDrive, Filter
} from 'lucide-react';
import { mockSessions, formatBytes, formatDurationShort, formatDateTime, getTerminateCauseLabel } from '@/data/mockData';

function getDeviceIcon(deviceType: string, size: number = 14) {
  switch (deviceType) {
    case 'Smartphone': return <Smartphone size={size} />;
    case 'Laptop': return <Laptop size={size} />;
    case 'Tablet': return <Monitor size={size} />;
    default: return <Monitor size={size} />;
  }
}

export default function ModalShowcase() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [guestAuthMethod, setGuestAuthMethod] = useState<'email' | 'phone'>('email');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const sampleSession = mockSessions[0];
  const activeDuration = 3661; // 1h 1m 1s
  const currentTime = Date.now();

  const userStr = localStorage.getItem('portalUser');
  const user = userStr ? JSON.parse(userStr) : { username: '21120001', fullname: 'Nguyễn Văn A', role: 'Student', department: 'Khoa CNTT' };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Wifi size={32} className="text-blue-500" />
            <h1 className="text-3xl font-bold text-white">Modal Showcase</h1>
          </div>
          <p className="text-gray-400">Tất cả modal, dialog và dropdown trong Campus WiFi Portal</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Logout WiFi Dialog */}
          <Card className="bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <LogOut size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Logout WiFi Dialog</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">Đăng xuất WiFi?</p>
                <p className="text-sm text-gray-500">
                  Bạn sẽ ngắt kết nối. Thời lượng phiên: {formatDurationShort(activeDuration)}
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline">Hủy</Button>
                <Button className="bg-gray-900 hover:bg-gray-800">Đăng xuất</Button>
              </div>
            </div>
          </Card>

          {/* 2. Logout All Dialog */}
          <Card className="bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <LogOut size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Logout All Dialog</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">Đăng xuất tất cả?</p>
                <p className="text-sm text-gray-500">Tất cả thiết bị sẽ ngắt kết nối WiFi.</p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline">Hủy</Button>
                <Button className="bg-gray-900 hover:bg-gray-800">Đăng xuất tất cả</Button>
              </div>
            </div>
          </Card>

          {/* 3. Session Detail Dialog - FULL */}
          <Card className="bg-white p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Session Detail Dialog (Chi tiết đầy đủ)</h3>
            </div>
            <div className="space-y-4">
              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><User size={14} /> Người dùng</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-gray-400 text-xs mb-0.5">Username</p><p className="font-mono">{user?.username || sampleSession.username}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">Họ tên</p><p>{user?.fullname || '--'}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">Vai trò</p><p>{user?.role || 'Student'}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">Khoa/Phòng</p><p>{user?.department || 'Khoa CNTT'}</p></div>
                </div>
              </div>

              {/* Time Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><Clock size={14} /> Thời gian</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-gray-400 text-xs mb-0.5">Bắt đầu</p><p>{formatDateTime(sampleSession.acctstarttime)}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">Kết thúc</p><p>{sampleSession.acctstoptime ? formatDateTime(sampleSession.acctstoptime) : <span className="text-green-600 font-medium">Đang online</span>}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">Thời lượng</p><p>{formatDurationShort(sampleSession.acctsessiontime)}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">Lý do kết thúc</p><p>{getTerminateCauseLabel(sampleSession.acctterminatecause)}</p></div>
                </div>
              </div>

              {/* Device Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><Laptop size={14} /> Thiết bị</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-gray-400 text-xs mb-0.5">Tên</p><p>{sampleSession.device_name}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">Loại</p><p>{sampleSession.device_type}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">Vendor</p><p>{sampleSession.device_vendor || '--'}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">MAC</p><p className="font-mono text-xs">{sampleSession.mac_address}</p></div>
                </div>
              </div>

              {/* Network Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><Network size={14} /> Mạng</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-gray-400 text-xs mb-0.5">SSID</p><p>{sampleSession.ssid}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">IP</p><p className="font-mono text-xs">{sampleSession.ip_address}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">Gateway</p><p className="font-mono text-xs">{sampleSession.ip_address.replace(/\.\d+$/, '.1')}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">VLAN</p><p>{sampleSession.vlan_id}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">AP</p><p>{sampleSession.ap_name}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">Vị trí</p><p>{sampleSession.ap_location}</p></div>
                  <div className="col-span-2"><p className="text-gray-400 text-xs mb-0.5">NAS IP</p><p className="font-mono text-xs">{sampleSession.nas_ip}</p></div>
                </div>
              </div>

              {/* Traffic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><Package size={14} /> Lưu lượng</p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <Download size={16} className="mx-auto text-blue-500 mb-1" />
                    <p className="text-xs text-gray-500">Download</p>
                    <p className="text-sm font-semibold text-blue-600">{formatBytes(sampleSession.acctinputoctets)}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                    <Upload size={16} className="mx-auto text-green-500 mb-1" />
                    <p className="text-xs text-gray-500">Upload</p>
                    <p className="text-sm font-semibold text-green-600">{formatBytes(sampleSession.acctoutputoctets)}</p>
                  </div>
                  <div className="text-center p-3 bg-violet-50 rounded-lg border border-violet-100">
                    <Activity size={16} className="mx-auto text-violet-500 mb-1" />
                    <p className="text-xs text-gray-500">Tổng</p>
                    <p className="text-sm font-semibold text-violet-600">{formatBytes(sampleSession.acctinputoctets + sampleSession.acctoutputoctets)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-gray-400">Input packets:</span> <span className="font-mono">{sampleSession.acctinputpackets.toLocaleString()}</span></div>
                  <div><span className="text-gray-400">Output packets:</span> <span className="font-mono">{sampleSession.acctoutputpackets.toLocaleString()}</span></div>
                </div>
              </div>

              {/* QoS Policy */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><Router size={14} /> QoS Policy</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1.5"><Gauge size={14} className="text-gray-400" /> {sampleSession.bandwidth_limit} Mbps</span>
                  <span className="flex items-center gap-1.5"><Timer size={14} className="text-gray-400" /> {sampleSession.session_timeout / 3600}h</span>
                  <span className="flex items-center gap-1.5"><Package size={14} className="text-gray-400" /> {formatBytes(sampleSession.quota_daily)}/ngày</span>
                </div>
              </div>
            </div>
          </Card>

          {/* 4. Change Password Dialog */}
          <Card className="bg-white p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Key size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Change Password Dialog</h3>
            </div>
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline">Hủy</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Đổi mật khẩu</Button>
              </div>
            </div>
          </Card>

          {/* 5. Terms Modal */}
          <Card className="bg-white p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Terms Modal</h3>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              <section>
                <h4 className="font-semibold text-gray-900 mb-2">1. Quyền và trách nhiệm người dùng</h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                  <li>Tuân thủ chính sách sử dụng mạng của trường</li>
                  <li>Không chia sẻ tài khoản cho người khác</li>
                  <li>Báo ngay khi phát hiện hành vi vi phạm</li>
                  <li>Chịu trách nhiệm về mọi hoạt động từ tài khoản của mình</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">2. Hành vi bị cấm</h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                  <li>Tấn công, xâm nhập hệ thống mạng</li>
                  <li>Phát tán virus, malware</li>
                  <li>Sử dụng băng thông quá mức cho mục đích cá nhân</li>
                  <li>Truy cập nội dung bất hợp pháp</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">3. Chính sách QoS</h4>
                <p className="text-xs text-gray-600 mb-2">Hệ thống áp dụng chính sách QoS để đảm bảo công bằng:</p>
                <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                  <li>Giới hạn băng thông theo vai trò</li>
                  <li>Hạn ngạch sử dụng hàng ngày</li>
                  <li>Thời gian phiên tối đa</li>
                </ul>
              </section>
            </div>
            <div className="flex justify-end pt-4 border-t mt-4">
              <Button className="bg-blue-600 hover:bg-blue-700">Đồng ý và tiếp tục</Button>
            </div>
          </Card>

          {/* 6. Guest Registration - Step 1: Form */}
          <Card className="bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Guest Registration (Step 1)</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guest-name">Họ và tên *</Label>
                <Input id="guest-name" placeholder="Nguyễn Văn A" />
              </div>

              <div className="space-y-2">
                <Label>Phương thức xác thực</Label>
                <Select value={guestAuthMethod} onValueChange={(v: 'email' | 'phone') => setGuestAuthMethod(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail size={14} />
                        Email
                      </div>
                    </SelectItem>
                    <SelectItem value="phone">
                      <div className="flex items-center gap-2">
                        <Phone size={14} />
                        Số điện thoại (Zalo OTP)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {guestAuthMethod === 'email' ? (
                <div className="space-y-2">
                  <Label htmlFor="guest-email">Email *</Label>
                  <Input id="guest-email" type="email" placeholder="example@gmail.com" />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="guest-phone">Số điện thoại *</Label>
                  <Input id="guest-phone" type="tel" placeholder="0901234567" />
                </div>
              )}

              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded text-xs">
                <AlertCircle size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-blue-900">
                  Tài khoản khách có hiệu lực <strong>7 ngày</strong> với băng thông giới hạn.
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline">Hủy</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Tiếp tục</Button>
              </div>
            </div>
          </Card>

          {/* 7. Guest Registration - Step 2: OTP */}
          <Card className="bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Guest Registration (Step 2 - OTP)</h3>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Nhập mã OTP đã gửi đến example@gmail.com</p>
              <div className="flex gap-2 justify-center">
                {[...Array(6)].map((_, i) => (
                  <Input
                    key={i}
                    type="text"
                    maxLength={1}
                    className="w-12 h-12 text-center text-lg font-semibold"
                  />
                ))}
              </div>

              <div className="text-center">
                <button className="text-sm text-blue-600 hover:underline">
                  Gửi lại mã OTP
                </button>
              </div>

              <div className="flex justify-end pt-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Xác nhận</Button>
              </div>
            </div>
          </Card>

          {/* 8. Guest Registration - Step 3: Password */}
          <Card className="bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Guest Registration (Step 3 - Password)</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guest-password">Mật khẩu</Label>
                <Input id="guest-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guest-confirm-password">Xác nhận mật khẩu</Label>
                <Input id="guest-confirm-password" type="password" />
              </div>

              <div className="flex justify-end pt-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Hoàn tất</Button>
              </div>
            </div>
          </Card>

          {/* 9. Guest Registration - Success */}
          <Card className="bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Guest Registration (Success)</h3>
            </div>
            <div className="py-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">Đăng ký thành công!</p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Tài khoản: <span className="font-mono font-semibold">guest_12345</span></p>
                <p>Hiệu lực: <span className="font-semibold">7 ngày</span></p>
              </div>
              <Button className="mt-6 bg-blue-600 hover:bg-blue-700">Đóng</Button>
            </div>
          </Card>

          {/* 10. Forgot Password - Step 1 */}
          <Card className="bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Forgot Password (Step 1)</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-contact">Email hoặc Số điện thoại</Label>
                <Input
                  id="forgot-contact"
                  placeholder="email@example.com hoặc 0901234567"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline">Hủy</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Tiếp tục</Button>
              </div>
            </div>
          </Card>

          {/* 11. Forgot Password - Success */}
          <Card className="bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Forgot Password (Success)</h3>
            </div>
            <div className="py-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">Đặt lại mật khẩu thành công!</p>
              <p className="text-sm text-gray-500 mb-6">Bạn có thể đăng nhập với mật khẩu mới</p>
              <Button className="bg-blue-600 hover:bg-blue-700">Đóng</Button>
            </div>
          </Card>

          {/* 12. All Dropdowns/Selects Showcase - EXPANDED */}
          <Card className="bg-white p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Tất cả Dropdown & Select Components (Expanded)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Device Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Loại thiết bị</Label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle size={14} className="text-blue-500" />
                      Tất cả
                    </div>
                  </div>
                  <div className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <Laptop size={14} className="text-gray-500" />
                      Laptop
                    </div>
                  </div>
                  <div className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <Smartphone size={14} className="text-gray-500" />
                      Smartphone
                    </div>
                  </div>
                  <div className="p-2 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-2 text-sm">
                      <Monitor size={14} className="text-gray-500" />
                      Tablet
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Trạng thái phiên</Label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle size={14} className="text-blue-500" />
                      Tất cả
                    </div>
                  </div>
                  <div className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <Activity size={14} className="text-green-500" />
                      Online
                    </div>
                  </div>
                  <div className="p-2 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle size={14} className="text-gray-500" />
                      Kết thúc
                    </div>
                  </div>
                </div>
              </div>

              {/* Auth Method */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Phương thức xác thực</Label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={14} className="text-gray-500" />
                      Email
                    </div>
                  </div>
                  <div className="p-2 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-gray-500" />
                      Số điện thoại (Zalo OTP)
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-900">
                <strong>📌 Dropdown Options:</strong> Tất cả options được hiển thị ở trạng thái mở (expanded) để dễ xem. Mỗi option có icon và hover effect để minh họa UX thực tế.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
