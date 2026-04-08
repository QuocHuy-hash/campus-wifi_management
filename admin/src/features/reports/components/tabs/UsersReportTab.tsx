import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Download, RefreshCw, Eye, Ban, Wifi, Laptop, Smartphone, Monitor, Power, Tag, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { RootState, AppDispatch } from '@/stores/store';
import { UserSession } from '../../types';
import { 
  fetchUsersReport, fetchSessionsReport,
  setUserSearchTerm, setUserGroupFilter, setUserRoleFilter, toggleWifiUserStatus, setUserCurrentPage,
  setSessionTimeRange, setSessionUsernameFilter, setSessionIpFilter, setSessionMacFilter, 
  setSessionSsidFilter, setSessionStatusFilter, setSessionTerminateFilter, setSessionCurrentPage,
  setSessionCampusFilter, setSessionBuildingFilter, setSessionIdentityFilter,
  setSelectedUserForSessions, resetUserFilters, resetSessionFilters, resetSidebarSessionFilters
} from '../../slices/usersReportSlice';
import { AddDeviceDialog } from '../dialogs/AddDeviceDialog';
import { formatDate, formatDateTime } from '@/utils/dateTimeFormat';

const userItemsPerPage = 5;
const sessionsItemsPerPage = 5;

const initialCampuses = [
  { id: 1, name: 'Cơ sở Dĩ An' },
  { id: 2, name: 'Cơ sở 227 NVC' },
  { id: 3, name: 'Cơ sở Thủ Đức' },
];

export const UsersReportTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [userManagementTab, setUserManagementTab] = useState('wifi-users');
  const [confirmToggleUser, setConfirmToggleUser] = useState<{ id: number; username: string; status: 'active' | 'blocked' } | null>(null);
  const [selectedSessionForDeviceForm, setSelectedSessionForDeviceForm] = useState<UserSession | null>(null);

  const {
    users: mockWifiUsers, sessions: mockUserSessions, status,
    userSearchTerm, userGroupFilter, userRoleFilter, userCurrentPage,
    sessionTimeRange, sessionUsernameFilter, sessionIpFilter, sessionMacFilter,
    sessionSsidFilter, sessionStatusFilter, sessionTerminateFilter, sessionCurrentPage,
    sessionCampusFilter, sessionBuildingFilter, sessionIdentityFilter,
    selectedUserForSessions
  } = useSelector((state: RootState) => state.reports.users);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchUsersReport());
      dispatch(fetchSessionsReport());
    }
  }, [status, dispatch]);

  const handleExport = (format: 'pdf' | 'excel', type: string) => {
    console.log(`Exporting ${type} as ${format}...`);
  };

  const filteredBuildings: { id: number, name: string }[] = []; // Mô phỏng danh sách tòa nhà theo cơ sở
  const sessionStartDate = ''; 
  const sessionEndDate = '';
  // Removed setSessionStartDate, setSessionEndDate since they aren't fully implemented in mock

  // userId lấy thẳng từ session (được map từ deviceUserInfo.userId của backend)
  const selectedDeviceUserId = selectedSessionForDeviceForm?.userId ?? null;

  return (
    <div className="space-y-4">
      {/* 1. Kpis for Users Tab (Optional / Not implemented in original) */}
      
      {/* 2. Main content */}
      <Tabs value={userManagementTab} onValueChange={setUserManagementTab}>
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger value="wifi-users" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
            Người dùng thiết bị
          </TabsTrigger>
          <TabsTrigger value="sessions" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
            Phiên đang hoạt động
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {/* Tab 1: Danh sách người dùng */}
          <TabsContent value="wifi-users" className="m-0">
            <div className="space-y-4">
              {/* Filter Bar */}
              <Card className="p-4 bg-gray-50">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      placeholder="Tìm theo Username, tên, MSSV..."
                      value={userSearchTerm}
                      onChange={(e) => dispatch(setUserSearchTerm(e.target.value))}
                      className="pl-9"
                    />
                  </div>
                  <Select value={userGroupFilter} onValueChange={(v) => dispatch(setUserGroupFilter(v))}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Nhóm người dùng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả nhóm</SelectItem>
                      <SelectItem value="Sinh viên">Sinh viên</SelectItem>
                      <SelectItem value="Giảng viên">Giảng viên/Cán bộ</SelectItem>
                      <SelectItem value="Khách">Khách truy cập</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={userRoleFilter} onValueChange={(v) => dispatch(setUserRoleFilter(v))}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả vai trò</SelectItem>
                      <SelectItem value="User">User</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                      <SelectItem value="Guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="outline" onClick={() => dispatch(resetUserFilters())}>
                    <RefreshCw size={16} />
                  </Button>
                  <Button variant="outline" onClick={() => handleExport('excel', 'users-csv')}>
                    <Download size={16} className="mr-2" />
                    Export CSV
                  </Button>
                </div>
              </Card>

              {/* Users Table */}
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Họ tên</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Thiết bị online</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Phiên (Ngày/Tuần/Tháng)</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Upload/Download (Gb)</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Trạng thái</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {mockWifiUsers
                        .filter(user => {
                          const matchSearch = userSearchTerm === '' || 
                            user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                            user.mssv.toLowerCase().includes(userSearchTerm.toLowerCase());
                          const matchGroup = userGroupFilter === 'all' || user.group === userGroupFilter;
                          const matchRole = userRoleFilter === 'all' || user.role === userRoleFilter;
                          return matchSearch && matchGroup && matchRole;
                        })
                        .slice((userCurrentPage - 1) * userItemsPerPage, userCurrentPage * userItemsPerPage)
                        .map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.username}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm text-gray-900">{user.fullName}</p>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                                user.group === 'Sinh viên' ? 'bg-blue-100 text-blue-700' :
                                user.group === 'Giảng viên' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {user.group}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              user.devicesOnline > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              <Wifi size={14} />
                              {user.devicesOnline}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="text-xs">
                              <span className="text-blue-600 font-medium">{user.sessionsToday}</span>
                              <span className="text-gray-400 mx-1">/</span>
                              <span className="text-green-600">{user.sessionsWeek}</span>
                              <span className="text-gray-400 mx-1">/</span>
                              <span className="text-purple-600">{user.sessionsMonth}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="text-sm">
                              <span className="text-cyan-600">↓ {user.trafficIn}</span>
                              <span className="text-gray-400 mx-1">/</span>
                              <span className="text-orange-600">↑ {user.trafficOut}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Xem chi tiết phiên"
                                onClick={() => {
                                  dispatch(setSelectedUserForSessions(user.username));
                                  setUserManagementTab('sessions');
                                }}
                              >
                                <Eye size={16} className="text-blue-600" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title={user.status === 'active' ? 'Tạm khóa truy cập' : 'Mở khóa truy cập'}
                                onClick={() => setConfirmToggleUser({ id: user.id, username: user.username, status: user.status })}
                              >
                                <Ban size={16} className={user.status === 'active' ? 'text-red-600' : 'text-green-600'} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Hiển thị {Math.min((userCurrentPage - 1) * userItemsPerPage + 1, mockWifiUsers.length)} - {Math.min(userCurrentPage * userItemsPerPage, mockWifiUsers.length)} / {mockWifiUsers.length} người dùng
                  </p>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={userCurrentPage === 1}
                      onClick={() => dispatch(setUserCurrentPage(userCurrentPage - 1))}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <span className="px-3 py-1 bg-[#1e3a5f] text-white rounded text-sm font-medium">
                      {userCurrentPage}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={userCurrentPage * userItemsPerPage >= mockWifiUsers.length}
                      onClick={() => dispatch(setUserCurrentPage(userCurrentPage + 1))}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 2: Phiên truy cập (Sessions) */}
          <TabsContent value="sessions" className="m-0 mt-4">
            <div className="space-y-4">
              {/* Filter Bar */}
              <Card className="p-4 bg-gray-50">
                <div className="space-y-3">
                  {/* Row 1 */}
                  <div className="flex flex-wrap items-center gap-3">
                    <Select value={sessionTimeRange} onValueChange={(v) => dispatch(setSessionTimeRange(v))}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Thời gian" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Hôm nay</SelectItem>
                        <SelectItem value="7days">7 ngày</SelectItem>
                        <SelectItem value="30days">30 ngày</SelectItem>
                        <SelectItem value="custom">Tùy chỉnh</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input 
                        placeholder="Username"
                        value={selectedUserForSessions || sessionUsernameFilter}
                        onChange={(e) => {
                          dispatch(setSessionUsernameFilter(e.target.value));
                          dispatch(setSelectedUserForSessions(null));
                        }}
                        className="pl-7 w-[130px]"
                      />
                    </div>
                    <Input 
                      placeholder="IP Address"
                      value={sessionIpFilter}
                      onChange={(e) => dispatch(setSessionIpFilter(e.target.value))}
                      className="w-[130px]"
                    />
                    <Input 
                      placeholder="MAC Address"
                      value={sessionMacFilter}
                      onChange={(e) => dispatch(setSessionMacFilter(e.target.value))}
                      className="w-[150px]"
                    />
                  </div>
                  {/* Row 2 */}
                  <div className="flex flex-wrap items-center gap-3">
                    <Select value={sessionSsidFilter} onValueChange={(v) => dispatch(setSessionSsidFilter(v))}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="SSID" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả SSID</SelectItem>
                        <SelectItem value="HCMUS-Student">HCMUS-Student</SelectItem>
                        <SelectItem value="HCMUS-Staff">HCMUS-Staff</SelectItem>
                        <SelectItem value="HCMUS-Guest">HCMUS-Guest</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sessionCampusFilter} onValueChange={(v) => dispatch(setSessionCampusFilter(v))}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Khu vực" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả khu vực</SelectItem>
                        {initialCampuses.map((campus) => (
                          <SelectItem key={campus.id} value={campus.id.toString()}>
                            {campus.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={sessionStatusFilter} onValueChange={(v) => dispatch(setSessionStatusFilter(v))}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="active">Đang hoạt động</SelectItem>
                        <SelectItem value="completed">Đã kết thúc</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sessionTerminateFilter} onValueChange={(v) => dispatch(setSessionTerminateFilter(v))}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Nguyên nhân KT" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="user-request">User Request</SelectItem>
                        <SelectItem value="idle-timeout">Idle Timeout</SelectItem>
                        <SelectItem value="hard-timeout">Hard Timeout</SelectItem>
                        <SelectItem value="quota-exceeded">Quota Exceeded</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={() => dispatch(resetSessionFilters())}>
                      <RefreshCw size={14} />
                    </Button>
                    <div className="ml-auto">
                      <Button size="sm" variant="outline" onClick={() => handleExport('excel', 'sessions-csv')}>
                        <Download size={14} className="mr-1" />
                        Export CSV 
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {selectedUserForSessions && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-sm text-blue-700">
                    Đang lọc phiên của user: <strong>{selectedUserForSessions}</strong>
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => dispatch(setSelectedUserForSessions(null))}>
                    Xóa bộ lọc
                  </Button>
                </div>
              )}

              {/* Sessions Table */}
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left font-semibold text-gray-700">Session ID</th>
                        <th className="px-3 py-3 text-left font-semibold text-gray-700">User</th>
                        <th className="px-3 py-3 text-left font-semibold text-gray-700">Thiết bị</th>
                        <th className="px-3 py-3 text-left font-semibold text-gray-700">IP</th>
                        <th className="px-3 py-3 text-left font-semibold text-gray-700">SSID/VLAN</th>
                        <th className="px-3 py-3 text-left font-semibold text-gray-700">AP/Site</th>
                        <th className="px-3 py-3 text-left font-semibold text-gray-700">Start/Stop</th>
                        <th className="px-3 py-3 text-right font-semibold text-gray-700">Duration</th>
                        <th className="px-3 py-3 text-right font-semibold text-gray-700">DL/UL/Total</th>
                        <th className="px-3 py-3 text-center font-semibold text-gray-700">Terminate</th>
                        <th className="px-3 py-3 text-center font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {mockUserSessions
                        .filter(session => {
                          const matchUser = !selectedUserForSessions || session.username === selectedUserForSessions;
                          const matchUsername = sessionUsernameFilter === '' || session.username.toLowerCase().includes(sessionUsernameFilter.toLowerCase());
                          const matchIp = sessionIpFilter === '' || session.ip.includes(sessionIpFilter);
                          const matchMac = sessionMacFilter === '' || session.mac.toLowerCase().includes(sessionMacFilter.toLowerCase());
                          const matchSsid = sessionSsidFilter === 'all' || session.ssid === sessionSsidFilter;
                          const matchStatus = sessionStatusFilter === 'all' || session.status === sessionStatusFilter;
                          const matchTerminate = sessionTerminateFilter === 'all' || session.terminateCause === sessionTerminateFilter;
                          return matchUser && matchUsername && matchIp && matchMac && matchSsid && matchStatus && matchTerminate;
                        })
                        .slice((sessionCurrentPage - 1) * sessionsItemsPerPage, sessionCurrentPage * sessionsItemsPerPage)
                        .map((session) => (
                        <tr key={session.sessionId} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <p className="font-mono text-xs text-gray-600">{session.sessionId}</p>
                            {session.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {session.tags.map((tag, idx) => (
                                  <span key={idx} className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <p className="font-medium text-gray-900">{session.username}</p>
                            <p className="text-xs text-gray-500">{session.fullName}</p>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              {session.deviceType === 'Laptop' && <Laptop size={14} className="text-gray-500" />}
                              {session.deviceType === 'Smartphone' && <Smartphone size={14} className="text-gray-500" />}
                              {session.deviceType === 'Monitor' && <Monitor size={14} className="text-gray-500" />}
                              <span className="text-xs">{session.deviceName}</span>
                            </div>
                            <p className="font-mono text-xs text-gray-400">{session.mac}</p>
                          </td>
                          <td className="px-3 py-2 font-mono text-xs text-gray-600">{session.ip}</td>
                          <td className="px-3 py-2">
                            <p className="text-xs font-medium">{session.ssid}</p>
                            <p className="text-xs text-gray-500">{session.vlan}</p>
                          </td>
                          <td className="px-3 py-2">
                            <p className="text-xs font-medium">{session.ap}</p>
                            <p className="text-xs text-gray-500">{session.site}</p>
                          </td>
                          <td className="px-3 py-2">
                            <p className="text-xs">{formatDateTime(session.startTime)}</p>
                            <p className="text-xs text-gray-500">{formatDateTime(session.stopTime)}</p>
                          </td>
                          <td className="px-3 py-2 text-right font-medium">{session.duration}</td>
                          <td className="px-3 py-2 text-right">
                            <p className="text-xs"><span className="text-cyan-600">↓{session.download}</span></p>
                            <p className="text-xs"><span className="text-orange-600">↑{session.upload}</span></p>
                            <p className="text-xs font-bold">{session.total}</p>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                              session.terminateCause === 'normal' ? 'bg-green-100 text-green-700' :
                              session.terminateCause === 'user-request' ? 'bg-blue-100 text-blue-700' :
                              session.terminateCause === 'idle-timeout' ? 'bg-yellow-100 text-yellow-700' :
                              session.terminateCause === 'hard-timeout' ? 'bg-orange-100 text-orange-700' :
                              session.terminateCause === 'quota-exceeded' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {session.terminateCause}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Thêm thiết bị"
                                onClick={() => setSelectedSessionForDeviceForm(session)}
                                className="h-8 px-2  border-emerald-200 hover:bg-emerald-50"
                              >
                                <Plus size={14} className="text-emerald-600" />
                                {/* <span className="ml-1 text-xs">Thêm</span> */}
                              </Button>
                              <Button variant="ghost" size="sm" title="Force Disconnect">
                                <Power size={14} className="text-red-600" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Gắn tag">
                                <Tag size={14} className="text-amber-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Hiển thị {Math.min((sessionCurrentPage - 1) * sessionsItemsPerPage + 1, mockUserSessions.length)} - {Math.min(sessionCurrentPage * sessionsItemsPerPage, mockUserSessions.length)} / {mockUserSessions.length} phiên
                  </p>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={sessionCurrentPage === 1}
                      onClick={() => dispatch(setSessionCurrentPage(sessionCurrentPage - 1))}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <span className="px-3 py-1 bg-[#1e3a5f] text-white rounded text-sm font-medium">
                      {sessionCurrentPage}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={sessionCurrentPage * sessionsItemsPerPage >= mockUserSessions.length}
                      onClick={() => dispatch(setSessionCurrentPage(sessionCurrentPage + 1))}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              </Card>

              <AddDeviceDialog
                session={selectedSessionForDeviceForm}
                userId={selectedDeviceUserId}
                onClose={() => setSelectedSessionForDeviceForm(null)}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <AlertDialog open={!!confirmToggleUser} onOpenChange={(open) => !open && setConfirmToggleUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmToggleUser?.status === 'active' ? 'Xác nhận tạm khóa truy cập' : 'Xác nhận mở khóa truy cập'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmToggleUser?.status === 'active'
                ? `Bạn có chắc muốn tạm khóa truy cập của user ${confirmToggleUser.username}?`
                : `Bạn có chắc muốn mở khóa truy cập của user ${confirmToggleUser?.username}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!confirmToggleUser) return;
                dispatch(toggleWifiUserStatus(confirmToggleUser.id));
                setConfirmToggleUser(null);
              }}
              className={confirmToggleUser?.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {confirmToggleUser?.status === 'active' ? 'Tạm khóa' : 'Mở khóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
