"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Wifi, LogOut, Clock, Download, Upload, Activity, Network, 
  Smartphone, Laptop, Monitor, Key, FileText, User, 
  Eye, EyeOff, AlertCircle, CheckCircle, Mail, Phone, Building,
  Shield, Package, Gauge, Timer, HardDrive, Filter, Lock, MessageCircle,
  UserPlus, ArrowLeft, ChevronRight
} from 'lucide-react';
import { mockSessions, formatBytes, formatDurationShort, formatDateTime, getTerminateCauseLabel } from '@/data/mockData';
import { useTranslation } from 'react-i18next';

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
  const [showGuestPassword, setShowGuestPassword] = useState(false);
  const { t } = useTranslation();

  const sampleSession = mockSessions[0];
  const activeDuration = 3661; // 1h 1m 1s
  const currentTime = Date.now();

  const userStr = typeof window !== 'undefined' ? localStorage.getItem('portalUser') : null;
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
          <p className="text-gray-400">{t('showcase.description')}</p>
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
                <p className="text-lg font-medium text-gray-900 mb-2">{t('showcase.logoutWifiTitle')}</p>
                <p className="text-sm text-gray-500">
                  {t('showcase.logoutWifiDesc', { duration: formatDurationShort(activeDuration) })}
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline">{t('common.cancel')}</Button>
                <Button className="bg-gray-900 hover:bg-gray-800">{t('common.logout')}</Button>
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
                <p className="text-lg font-medium text-gray-900 mb-2">{t('showcase.logoutAllTitle')}</p>
                <p className="text-sm text-gray-500">{t('showcase.logoutAllDesc')}</p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline">{t('common.cancel')}</Button>
                <Button className="bg-gray-900 hover:bg-gray-800">{t('showcase.logoutAll')}</Button>
              </div>
            </div>
          </Card>

          {/* 3. Session Detail Dialog */}
          <Card className="bg-white p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Session Detail Dialog</h3>
            </div>
            <div className="space-y-4">
              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><User size={14} /> {t('showcase.user')}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-gray-400 text-xs mb-0.5">Username</p><p className="font-mono">{user?.username || sampleSession.username}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">{t('showcase.fullName')}</p><p>{user?.fullname || '--'}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">{t('showcase.role')}</p><p>{user?.role || 'Student'}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">{t('showcase.department')}</p><p>{user?.department || 'Khoa CNTT'}</p></div>
                </div>
              </div>

              {/* Time Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><Clock size={14} /> {t('showcase.time')}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-gray-400 text-xs mb-0.5">{t('history.startTime')}</p><p>{formatDateTime(sampleSession.acctstarttime)}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">{t('history.endTime')}</p><p><span className="text-green-600 font-medium">{t('history.online')}</span></p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">{t('history.duration')}</p><p>{formatDurationShort(activeDuration)}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">{t('history.terminateReason')}</p><p>{getTerminateCauseLabel(sampleSession.acctterminatecause)}</p></div>
                </div>
              </div>

              {/* Device Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><Laptop size={14} /> {t('showcase.device')}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-gray-400 text-xs mb-0.5">{t('history.name')}</p><p>{sampleSession.device_name}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">{t('history.type')}</p><p>{sampleSession.device_type}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">Vendor</p><p>{sampleSession.device_vendor || '--'}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">MAC</p><p className="font-mono text-xs">{sampleSession.mac_address}</p></div>
                </div>
              </div>

              {/* Network Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><Network size={14} /> {t('showcase.network')}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-gray-400 text-xs mb-0.5">SSID</p><p>{sampleSession.ssid}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">IP</p><p className="font-mono text-xs">{sampleSession.ip_address}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">Gateway</p><p className="font-mono text-xs">{sampleSession.ip_address.replace(/\.\d+$/, '.1')}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">VLAN</p><p>{sampleSession.vlan_id}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">AP</p><p>{sampleSession.ap_name}</p></div>
                  <div><p className="text-gray-400 text-xs mb-0.5">{t('showcase.location')}</p><p>{sampleSession.ap_location}</p></div>
                </div>
              </div>

              {/* Traffic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><Package size={14} /> {t('showcase.traffic')}</p>
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
                  <div className="text-center p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <Activity size={16} className="mx-auto text-indigo-500 mb-1" />
                    <p className="text-xs text-gray-500">{t('common.total')}</p>
                    <p className="text-sm font-semibold text-indigo-600">{formatBytes(sampleSession.acctinputoctets + sampleSession.acctoutputoctets)}</p>
                  </div>
                </div>
              </div>

              {/* QoS Policy */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><Gauge size={14} /> QoS Policy</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1.5"><Gauge size={14} className="text-gray-400" /> {sampleSession.bandwidth_limit} Mbps</span>
                  <span className="flex items-center gap-1.5"><Timer size={14} className="text-gray-400" /> {sampleSession.session_timeout / 3600}h</span>
                  <span className="flex items-center gap-1.5"><HardDrive size={14} className="text-gray-400" /> {formatBytes(sampleSession.quota_daily)}{t('showcase.perDay')}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* 4. Change Password Dialog */}
          <Card className="bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Change Password Dialog</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">{t('showcase.currentPasswordLabel')}</Label>
                <div className="relative">
                  <Input type={showCurrentPassword ? 'text' : 'password'} placeholder={t('showcase.currentPasswordPlaceholder')} className="pr-10 h-10" />
                  <button onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">{t('showcase.newPasswordLabel')}</Label>
                <div className="relative">
                  <Input type={showNewPassword ? 'text' : 'password'} placeholder={t('showcase.newPasswordPlaceholder')} className="pr-10 h-10" />
                  <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">{t('showcase.confirmNewPassLabel')}</Label>
                <Input type="password" placeholder={t('showcase.confirmNewPassPlaceholder')} className="h-10" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline">{t('common.cancel')}</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">{t('showcase.changePassword')}</Button>
              </div>
            </div>
          </Card>

          {/* 5. Terms Modal */}
          <Card className="bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Terms Modal (Preview)</h3>
            </div>
            <div className="space-y-3 text-sm">
              <section>
                <h4 className="font-semibold text-gray-900 mb-1">{t('showcase.termsGeneral')}</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 text-xs">
                  <li>{t('showcase.termsFreeWifi')}</li>
                  <li>{t('showcase.termsOwnerOnly')}</li>
                </ul>
              </section>
              <section>
                <h4 className="font-semibold text-gray-900 mb-1">{t('showcase.termsLimits')}</h4>
                <div className="bg-blue-50 rounded-lg p-3 space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-gray-600">{t('showcase.sessionDuration')}</span><span className="font-semibold">12 {t('terms.hoursUnit')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">{t('showcase.bandwidth')}</span><span className="font-semibold">50-200 Mbps</span></div>
                </div>
              </section>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-3">{t('showcase.agreeContinue')}</Button>
            </div>
          </Card>

          {/* 6. Registration - Step 1: Form */}
          <Card className="bg-white p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Registration - Step 1: Form ({t('showcase.newWithPassword')})</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email Method */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                  <Mail size={16} className="text-blue-500" />
                  {t('showcase.registerByEmailLabel')}
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Email <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input placeholder="email@example.com" className="pl-10 h-11" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t('register.passwordLabel')} <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input type={showGuestPassword ? 'text' : 'password'} placeholder={t('showcase.passwordRules')} className="pl-10 pr-10 h-11" />
                      <button onClick={() => setShowGuestPassword(!showGuestPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showGuestPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t('register.confirmPasswordLabel')} <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input type={showGuestPassword ? 'text' : 'password'} placeholder={t('register.confirmPasswordPlaceholder')} className="pl-10 h-11" />
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    {t('common.sendOtp')}
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>

              {/* Zalo Method */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                  <MessageCircle size={16} className="text-blue-500" />
                  {t('showcase.registerByZaloLabel')}
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t('showcase.zaloPhone')} <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input placeholder="0901234567" className="pl-10 h-11" />
                    </div>
                    <p className="text-xs text-gray-500">{t('showcase.otpSentViaZalo')}</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t('register.passwordLabel')} <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input type="password" placeholder={t('showcase.passwordRules')} className="pl-10 h-11" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t('register.confirmPasswordLabel')} <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input type="password" placeholder={t('register.confirmPasswordPlaceholder')} className="pl-10 h-11" />
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    {t('common.sendOtp')}
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* 7. Registration - Step 2: OTP */}
          <Card className="bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <ArrowLeft size={16} className="text-gray-600 cursor-pointer" />
              <UserPlus size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Registration - Step 2: OTP</h3>
            </div>
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail size={28} className="text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">{t('showcase.otpSentTo')}</p>
                <p className="font-medium text-gray-900">test@example.com</p>
              </div>
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    className="w-11 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                ))}
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">{t('register.verifyOtp')}</Button>
              <div className="text-center">
                <button className="text-sm text-blue-600 hover:underline">{t('common.resendOtp')}</button>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900">
                <strong>💡 Auto-login:</strong> {t('showcase.autoLogin')}
              </div>
            </div>
          </Card>

          {/* 8. Forgot Password - Step 1 */}
          <Card className="bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Forgot Password - Step 1</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">{t('showcase.authMethod')}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-blue-500 bg-blue-50 text-blue-700">
                    <Mail size={18} />
                    <span className="font-medium text-sm">Email</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-gray-200 text-gray-600">
                    <MessageCircle size={18} />
                    <span className="font-medium text-sm">Zalo</span>
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Email</Label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input placeholder="email@example.com" className="pl-10 h-11" />
                </div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                {t('common.continue')}
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </Card>

          {/* 9. Forgot Password - Success */}
          <Card className="bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Forgot Password - Success</h3>
            </div>
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{t('showcase.resetSuccess')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('showcase.resetSuccessDesc')}</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-6">{t('common.close')}</Button>
            </div>
          </Card>

          {/* 10. All Dropdown & Select Components (Expanded) */}
          <Card className="bg-white p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">{t('showcase.allDropdowns')}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Device Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">{t('showcase.deviceType')}</Label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle size={14} className="text-blue-500" />
                      {t('common.all')}
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
                <Label className="text-sm font-semibold text-gray-700">{t('showcase.sessionStatus')}</Label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle size={14} className="text-blue-500" />
                      {t('common.all')}
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
                      {t('common.ended')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Auth Method */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">{t('showcase.authType')}</Label>
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
                      {t('showcase.zaloOtp')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-900">
                <strong>📌 Dropdown Options:</strong> {t('showcase.dropdownHint')}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
