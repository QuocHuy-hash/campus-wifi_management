import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RootState, AppDispatch } from '@/stores/store';
import { fetchSessionData, setSessionCurrentPage } from '../../slices/sessionsReportSlice';
import { formatDateTime } from '@/utils/dateTimeFormat';

const sessionItemsPerPage = 5;

export const SessionsReportTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: sessionData, sessionCurrentPage, status } = useSelector((state: RootState) => state.reports.sessions);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSessionData());
    }
  }, [status, dispatch]);

  const paginatedSessions = sessionData.slice(
    (sessionCurrentPage - 1) * sessionItemsPerPage,
    sessionCurrentPage * sessionItemsPerPage,
  );
  const from = sessionData.length === 0 ? 0 : (sessionCurrentPage - 1) * sessionItemsPerPage + 1;
  const to = Math.min(sessionCurrentPage * sessionItemsPerPage, sessionData.length);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1e3a5f]">Nhật ký Phiên truy cập WIFI</h2>
        <p className="text-sm text-gray-500 mt-1">Theo dõi và kiểm toán chi tiết các phiên kết nối của người dùng</p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-lg font-semibold text-gray-700 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Session</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Thiết bị</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Mạng</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Bắt đầu</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Kết thúc</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Thời lượng</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Lưu lượng</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedSessions.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={9}>
                    Chưa có dữ liệu phiên truy cập.
                  </td>
                </tr>
              )}
              {paginatedSessions.map((row) => (
                <tr key={row.sessionId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-xs font-mono text-gray-900">{row.sessionId}</p>
                      <p className="text-xs text-gray-500">{row.userAgent || '-'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{row.username || '-'}</p>
                    <p className="text-xs text-gray-500">{row.identity || '-'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900">{row.deviceName || '-'}</p>
                    <p className="text-xs text-gray-500">{row.deviceType} • {row.mac || '-'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-gray-700">{row.ip || '-'}</p>
                    <p className="text-xs text-gray-500">SSID: {row.ssid || '-'}</p>
                    <p className="text-xs text-gray-500">VLAN: {row.vlan || '-'} • AP: {row.ap || '-'}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(row.startTime)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(row.stopTime)}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{row.duration}</td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-xs text-cyan-700">↓ {row.download}</p>
                    <p className="text-xs text-orange-700">↑ {row.upload}</p>
                    <p className="text-xs font-semibold text-[#1e3a5f]">Tổng {row.total}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {row.status === 'active' ? 'ACTIVE' : 'COMPLETED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Hiển thị {from} - {to} / {sessionData.length} phiên
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
              disabled={sessionCurrentPage * sessionItemsPerPage >= sessionData.length}
              onClick={() => dispatch(setSessionCurrentPage(sessionCurrentPage + 1))}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
