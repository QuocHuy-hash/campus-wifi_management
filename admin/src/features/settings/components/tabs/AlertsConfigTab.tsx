import React, { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

type RuleStatus = 'on' | 'off';

interface AlertRule {
  id: number;
  enabled: boolean;
  name: string;
  category: string;
  condition: string;
  channels: string[];
  emails: string[];
  updatedAt: string;
}

const initialRules: AlertRule[] = [
  {
    id: 1,
    enabled: true,
    name: 'Báo động rớt mạng AP',
    category: 'AP Offline',
    condition: 'AP Offline > 5 phút',
    channels: ['Email'],
    emails: ['it-support@company.vn', 'it-manager@company.vn'],
    updatedAt: '01/11/2023',
  },
  {
    id: 2,
    enabled: false,
    name: 'Cảnh báo Brute-force',
    category: 'Lỗi xác thực',
    condition: 'Lỗi xác thực > 50 lần / 5 phút',
    channels: ['Email'],
    emails: ['soc@company.vn'],
    updatedAt: '20/10/2023',
  },
  {
    id: 3,
    enabled: true,
    name: 'Cảnh báo sóng yếu (RSSI)',
    category: 'Sóng yếu',
    condition: 'Tỷ lệ user có RSSI < -80dBm > 20%',
    channels: ['Email'],
    emails: ['noc@company.vn', 'support@company.vn'],
    updatedAt: 'Hôm nay',
  },
];

const channelLabel: Record<string, string> = {
  Email: 'Email',
  Telegram: 'Telegram',
  'Web Push': 'Web Push',
  Webhook: 'Webhook',
};

const defaultFormState = {
  name: '',
  severity: 'warning',
  description: '',
  applyTo: 'system',
  metric: 'drop-rate',
  operator: '>',
  threshold: '20',
  thresholdUnit: '%',
  durationValue: '5',
  durationUnit: 'phút',
  logic: 'AND',
  emailRecipients: 'it-support@company.vn, it-manager@company.vn',
  messageTemplateMode: 'default',
  customMessage: '',
  cooldown: '30',
  schedule: '24-7',
};

const parseRecipients = (raw: string) =>
  raw
    .split(/[\n,;]+/)
    .map((email) => email.trim())
    .filter(Boolean);

export const AlertsConfigTab = () => {
  const [rules, setRules] = useState<AlertRule[]>(initialRules);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<RuleStatus | 'all'>('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [formState, setFormState] = useState(defaultFormState);

  const filteredRules = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return rules.filter((rule) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        rule.name.toLowerCase().includes(normalizedSearch) ||
        rule.condition.toLowerCase().includes(normalizedSearch);

      const matchesType = typeFilter === 'all' || rule.category === typeFilter;
      const matchesStatus =
        statusFilter === 'all' || (statusFilter === 'on' ? rule.enabled : !rule.enabled);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [rules, searchText, typeFilter, statusFilter]);

  const openCreateDrawer = () => {
    setEditingRuleId(null);
    setFormState(defaultFormState);
    setSheetOpen(true);
  };

  const openEditDrawer = (rule: AlertRule) => {
    setEditingRuleId(rule.id);
    setFormState((prev) => ({
      ...prev,
      name: rule.name,
      description: `Cập nhật từ quy tắc: ${rule.name}`,
      emailRecipients: rule.emails.join(', '),
    }));
    setSheetOpen(true);
  };

  const toggleRule = (id: number, checked: boolean) => {
    setRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, enabled: checked, updatedAt: 'Hôm nay' } : rule))
    );
  };

  const deleteRule = (id: number) => {
    setRules((prev) => prev.filter((rule) => rule.id !== id));
  };

  const saveRule = () => {
    const channels = ['Email'];
    const recipients = parseRecipients(formState.emailRecipients);

    const mappedCategory =
      formState.metric === 'ap-offline'
        ? 'AP Offline'
        : formState.metric === 'auth-fail'
        ? 'Lỗi xác thực'
        : formState.metric === 'weak-rssi'
        ? 'Sóng yếu'
        : 'Rớt mạng';

    const rulePayload: AlertRule = {
      id: editingRuleId ?? Date.now(),
      enabled: true,
      name: formState.name || 'Cảnh báo mới',
      category: mappedCategory,
      condition: `${formState.metric} ${formState.operator} ${formState.threshold} ${formState.thresholdUnit} trong ${formState.durationValue} ${formState.durationUnit}`,
      channels,
      emails: recipients.length > 0 ? recipients : ['it-support@company.vn'],
      updatedAt: 'Hôm nay',
    };

    setRules((prev) => {
      if (!editingRuleId) return [rulePayload, ...prev];
      return prev.map((rule) => (rule.id === editingRuleId ? { ...rule, ...rulePayload } : rule));
    });

    setSheetOpen(false);
  };

  const testAlert = () => {
    console.log('Test Alert payload', formState);
  };

  const uniqueCategories = useMemo(
    () => Array.from(new Set(rules.map((rule) => rule.category))),
    [rules]
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-2xl font-bold text-[#1e3a5f]">CẤU HÌNH CẢNH BÁO SỰ CỐ WIFI</h2>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={openCreateDrawer}>
          <Plus size={16} className="mr-2" />
          TẠO CẢNH BÁO MỚI
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Tìm kiếm tên quy tắc..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Bộ lọc loại cảnh báo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại cảnh báo</SelectItem>
              {uniqueCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RuleStatus | 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="on">Đang bật</SelectItem>
              <SelectItem value="off">Đang tắt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-left">Tên quy tắc (Rule Name)</th>
              <th className="px-4 py-3 text-left">Điều kiện kích hoạt (Condition)</th>
              <th className="px-4 py-3 text-left">Kênh thông báo</th>
              <th className="px-4 py-3 text-left">Cập nhật cuối</th>
              <th className="px-4 py-3 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRules.map((rule) => (
              <tr key={rule.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Switch checked={rule.enabled} onCheckedChange={(checked) => toggleRule(rule.id, checked)} />
                    <span className={`text-xs font-semibold ${rule.enabled ? 'text-emerald-700' : 'text-gray-500'}`}>
                      {rule.enabled ? '[BẬT]' : '[TẮT]'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{rule.name}</td>
                <td className="px-4 py-3 text-gray-700">{rule.condition}</td>
                <td className="px-4 py-3 text-gray-700">
                  {rule.channels.map((ch) => channelLabel[ch] || ch).join(', ')}
                </td>
                <td className="px-4 py-3 text-gray-600">{rule.updatedAt}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDrawer(rule)}>
                      <Pencil size={14} className="mr-1" /> Sửa
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteRule(rule.id)}>
                      <Trash2 size={14} className="mr-1" /> Xóa
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredRules.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={6}>
                  Không tìm thấy quy tắc cảnh báo phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f]">{editingRuleId ? 'Chỉnh sửa cảnh báo' : 'Tạo cảnh báo mới'}</DialogTitle>
            <DialogDescription>Cấu hình theo 4 khối: thông tin, điều kiện, hành động và nâng cao.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 px-4 pb-4">
            <Card className="p-4">
              <h4 className="mb-3 font-semibold text-gray-900">1. Thông tin cơ bản</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Tên quy tắc</Label>
                  <Input
                    placeholder="Nhập tên cảnh báo... VD: AP Tầng 1 sập"
                    value={formState.name}
                    onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mức độ nghiêm trọng</Label>
                  <RadioGroup
                    value={formState.severity}
                    onValueChange={(value) => setFormState((prev) => ({ ...prev, severity: value }))}
                    className="grid grid-cols-1 gap-2 md:grid-cols-3"
                  >
                    <Label
                      className={`rounded border p-2 transition-colors ${
                        formState.severity === 'critical'
                          ? 'border-red-300 bg-red-50 text-red-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-red-50/50'
                      }`}
                    >
                      <RadioGroupItem value="critical" /> Nguy cấp
                    </Label>
                    <Label
                      className={`rounded border p-2 transition-colors ${
                        formState.severity === 'warning'
                          ? 'border-amber-300 bg-amber-50 text-amber-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-amber-50/50'
                      }`}
                    >
                      <RadioGroupItem value="warning" /> Cảnh báo
                    </Label>
                    <Label
                      className={`rounded border p-2 transition-colors ${
                        formState.severity === 'info'
                          ? 'border-blue-300 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-blue-50/50'
                      }`}
                    >
                      <RadioGroupItem value="info" /> Thông tin
                    </Label>
                  </RadioGroup>
                </div>

                <div className="space-y-1">
                  <Label>Mô tả</Label>
                  <Textarea
                    placeholder="Nhập ghi chú cho đội ngũ IT (tùy chọn)..."
                    value={formState.description}
                    onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="mb-3 font-semibold text-gray-900">2. Cấu hình Điều kiện (NẾU)</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Áp dụng cho</Label>
                  <Select value={formState.applyTo} onValueChange={(value) => setFormState((prev) => ({ ...prev, applyTo: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zone">Khu vực</SelectItem>
                      <SelectItem value="ap-group">Nhóm AP</SelectItem>
                      <SelectItem value="system">Toàn bộ hệ thống</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                  <Select value={formState.metric} onValueChange={(value) => setFormState((prev) => ({ ...prev, metric: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drop-rate">Tỷ lệ rớt mạng</SelectItem>
                      <SelectItem value="ap-offline">AP Offline</SelectItem>
                      <SelectItem value="auth-fail">Lỗi xác thực</SelectItem>
                      <SelectItem value="weak-rssi">RSSI yếu</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={formState.operator} onValueChange={(value) => setFormState((prev) => ({ ...prev, operator: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value=">">Lớn hơn (&gt;)</SelectItem>
                      <SelectItem value="<">Nhỏ hơn (&lt;)</SelectItem>
                      <SelectItem value="=">Bằng (=)</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Ngưỡng"
                    value={formState.threshold}
                    onChange={(e) => setFormState((prev) => ({ ...prev, threshold: e.target.value }))}
                  />

                  <Select value={formState.thresholdUnit} onValueChange={(value) => setFormState((prev) => ({ ...prev, thresholdUnit: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lần">Lần</SelectItem>
                      <SelectItem value="%">%</SelectItem>
                      <SelectItem value="máy">Máy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                  <Select value={formState.logic} onValueChange={(value) => setFormState((prev) => ({ ...prev, logic: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Kéo dài"
                    value={formState.durationValue}
                    onChange={(e) => setFormState((prev) => ({ ...prev, durationValue: e.target.value }))}
                  />

                  <Select value={formState.durationUnit} onValueChange={(value) => setFormState((prev) => ({ ...prev, durationUnit: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phút">Phút</SelectItem>
                      <SelectItem value="giờ">Giờ</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline">+ Thêm điều kiện</Button>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="mb-3 font-semibold text-gray-900">3. Cấu hình Hành động (THÌ)</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Gửi thông báo qua kênh</Label>
                  <Input value="Email" disabled />
                </div>

                <div className="space-y-1">
                  <Label>Danh sách Email nhận cảnh báo</Label>
                  <Textarea
                    placeholder="vd: it-support@company.vn, it-manager@company.vn"
                    value={formState.emailRecipients}
                    onChange={(e) => setFormState((prev) => ({ ...prev, emailRecipients: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500">Nhập nhiều email, phân tách bằng dấu phẩy, chấm phẩy hoặc xuống dòng.</p>
                </div>

                <div className="space-y-2">
                  <RadioGroup
                    value={formState.messageTemplateMode}
                    onValueChange={(value) => setFormState((prev) => ({ ...prev, messageTemplateMode: value }))}
                    className="grid grid-cols-1 gap-2 md:grid-cols-2"
                  >
                    <Label className="rounded border p-2"><RadioGroupItem value="default" /> Sử dụng mẫu mặc định hệ thống</Label>
                    <Label className="rounded border p-2"><RadioGroupItem value="custom" /> Tự soạn nội dung</Label>
                  </RadioGroup>
                  {formState.messageTemplateMode === 'custom' && (
                    <Textarea
                      placeholder="Nhập nội dung cảnh báo tùy chỉnh..."
                      value={formState.customMessage}
                      onChange={(e) => setFormState((prev) => ({ ...prev, customMessage: e.target.value }))}
                    />
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="mb-3 font-semibold text-gray-900">4. Cài đặt nâng cao</h4>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Khoảng lặng (Cooldown period)</Label>
                  <Select value={formState.cooldown} onValueChange={(value) => setFormState((prev) => ({ ...prev, cooldown: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">Không gửi lại trong 15 phút</SelectItem>
                      <SelectItem value="30">Không gửi lại trong 30 phút</SelectItem>
                      <SelectItem value="60">Không gửi lại trong 60 phút</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Lịch hoạt động</Label>
                  <Select value={formState.schedule} onValueChange={(value) => setFormState((prev) => ({ ...prev, schedule: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24-7">Áp dụng 24/7</SelectItem>
                      <SelectItem value="office-hours">Chỉ áp dụng giờ hành chính</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>

          <DialogFooter className="border-t pt-4">
            <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setSheetOpen(false)}>Hủy bỏ</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={saveRule}>LƯU CẤU HÌNH</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
