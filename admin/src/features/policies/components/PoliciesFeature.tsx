import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, ShieldAlert, Cpu, Activity, UserCheck, KeySquare, Wifi, Key, FileText, Shield, CheckCircle } from "lucide-react";
import { useState, useEffect } from 'react';
import { useSearch } from "wouter";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/stores/store";

import { setAddPolicyDialogOpen, setPolicyForm } from "../slices/policiesSlice";
import { setAddAuthPolicyDialogOpen, setAuthPolicyForm, setValidationError } from "../slices/authPoliciesSlice";
import { loadWifiPolicies } from '../slices/policiesSlice';
import { loadAuthPolicies } from '../slices/authPoliciesSlice';
import { fetchDevices } from '@/features/settings/slices/devicesSlice';

import { PoliciesFilterBar } from "./PoliciesFilterBar";
import { PolicyDialogs } from "./dialogs/PolicyDialogs";
import { AuthPolicyDialogs } from "./dialogs/AuthPolicyDialogs";
import { BandwidthPolicyTab } from "./tabs/BandwidthPolicyTab";
import { AuthPolicyTab } from "./tabs/AuthPolicyTab";
import { AuditPolicyTab } from "./tabs/AuditPolicyTab";
import { SecurityPolicyTab } from "./tabs/SecurityPolicyTab";
import { AuthorizationPolicyTab } from "./tabs/AuthorizationPolicyTab";

export const PoliciesFeature = () => {
  const dispatch = useDispatch<AppDispatch>();
  const wifiPoliciesStatus = useSelector((state: RootState) => state.policies.policies.status);
  const authPoliciesStatus = useSelector((state: RootState) => state.policies.authPolicies.status);
  const devicesStatus = useSelector((state: RootState) => state.settings.devices.status);
  
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const tabFromUrl = urlParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'bandwidth');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newUrl = `${window.location.pathname}?tab=${value}`;
    window.history.replaceState(null, '', newUrl);
  };

  useEffect(() => {
    if (tabFromUrl && ['bandwidth', 'auth', 'audit', 'security', 'authorization'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
    if (activeTab === 'bandwidth' || activeTab === 'audit' || activeTab === 'security' || activeTab === 'authorization') {
      dispatch(loadWifiPolicies(activeTab));
    }
  }, [dispatch, activeTab]);

  useEffect(() => {
    dispatch(loadAuthPolicies());
  }, [dispatch]);

  useEffect(() => {
    if (devicesStatus === 'idle') {
      dispatch(fetchDevices());
    }
  }, [dispatch, devicesStatus]);

  const handleAddPolicy = (type: string) => {
    if (type === 'auth') {
      dispatch(setAuthPolicyForm({ isActive: true }));
      dispatch(setValidationError(null));
      dispatch(setAddAuthPolicyDialogOpen(true));
    } else {
      dispatch(setPolicyForm({ type: type as "auth" | "security" | "bandwidth" | "audit" | "authorization" }));
      dispatch(setAddPolicyDialogOpen(true));
    }
  };

  const isCurrentTabLoading =
    activeTab === 'auth' ? authPoliciesStatus === 'loading' : wifiPoliciesStatus === 'loading';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản trị Chính sách</h1>
        <p className="text-gray-600 mt-1">Quản lý các chính sách xác thực, băng thông, phiên truy cập, kiểm toán và bảo mật</p>
      </div>

      <PoliciesFilterBar />

      {isCurrentTabLoading ? (
        <Card className="bg-white shadow-sm p-10 text-center text-gray-600">
          Đang tải dữ liệu...
        </Card>
      ) : (
        <Card className="bg-white shadow-sm">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <div className="grid grid-cols-5 w-full">
              <TabsTrigger 
                value="bandwidth" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1e3a5f] data-[state=active]:bg-transparent data-[state=active]:text-[#1e3a5f] py-3 px-4 flex items-center gap-2"
              >
                <Wifi size={18} />
                Băng thông
              </TabsTrigger>
              <TabsTrigger 
                value="auth" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1e3a5f] data-[state=active]:bg-transparent data-[state=active]:text-[#1e3a5f] py-3 px-4 flex items-center gap-2"
              >
                <Key size={18} />
                Chính sách Xác thực
              </TabsTrigger>
              <TabsTrigger 
                value="audit" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1e3a5f] data-[state=active]:bg-transparent data-[state=active]:text-[#1e3a5f] py-3 px-4 flex items-center gap-2"
              >
                <FileText size={18} />
                Kiểm toán
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1e3a5f] data-[state=active]:bg-transparent data-[state=active]:text-[#1e3a5f] py-3 px-4 flex items-center gap-2"
              >
                <Shield size={18} />
                Bảo mật
              </TabsTrigger>
              <TabsTrigger 
                value="authorization" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1e3a5f] data-[state=active]:bg-transparent data-[state=active]:text-[#1e3a5f] py-3 px-4 flex items-center gap-2"
              >
                <CheckCircle size={18} />
                Cấp quyền (Phiên)
              </TabsTrigger>
            </div>
          </TabsList>

            <TabsContent value="bandwidth" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Chính sách Băng thông</h3>
                  <p className="text-sm text-gray-500">Giới hạn tốc độ tải xuống/tải lên theo nhóm người dùng</p>
                </div>
                <Button onClick={() => handleAddPolicy('bandwidth')} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                  <Plus size={18} className="mr-2" />
                  Thêm chính sách
                </Button>
              </div>
              <BandwidthPolicyTab />
            </TabsContent>

            <TabsContent value="auth" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Chính sách Xác thực</h3>
                  <p className="text-sm text-gray-500">Quản lý phương thức đăng nhập cho từng nhóm người dùng</p>
                </div>
                <Button onClick={() => handleAddPolicy('auth')} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                  <Plus size={18} className="mr-2" />
                  Thêm chính sách
                </Button>
              </div>
              <AuthPolicyTab />
            </TabsContent>

            <TabsContent value="audit" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Chính sách Kiểm toán</h3>
                  <p className="text-sm text-gray-500">Quản lý giới hạn phiên, dung lượng và lưu trữ logs hoạt động người dùng</p>
                </div>
                <Button onClick={() => handleAddPolicy('audit')} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                  <Plus size={18} className="mr-2" />
                  Thêm chính sách
                </Button>
              </div>
              <AuditPolicyTab />
            </TabsContent>

            <TabsContent value="security" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Chính sách Bảo mật</h3>
                  <p className="text-sm text-gray-500">Cấu hình các quy tắc bảo mật mạng</p>
                </div>
                <Button onClick={() => handleAddPolicy('security')} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                  <Plus size={18} className="mr-2" />
                  Thêm chính sách
                </Button>
              </div>
              <SecurityPolicyTab />
            </TabsContent>

            <TabsContent value="authorization" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Chính sách Cấp quyền</h3>
                  <p className="text-sm text-gray-500">Quản lý quyền truy cập danh cho người dùng</p>
                </div>
                <Button onClick={() => handleAddPolicy('authorization')} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                  <Plus size={18} className="mr-2" />
                  Thêm chính sách
                </Button>
              </div>
              <AuthorizationPolicyTab />
            </TabsContent>
          </Tabs>
        </Card>
      )}

        {/* Global Dialogs for Policies Feature */}
        <PolicyDialogs />
        <AuthPolicyDialogs />
    </div>
  );
};
