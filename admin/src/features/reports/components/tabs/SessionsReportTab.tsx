import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RootState, AppDispatch } from '@/stores/store';
import { fetchSessionData, setSessionCurrentPage } from '../../slices/sessionsReportSlice';

const sessionItemsPerPage = 5;

export const SessionsReportTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: mockSessionData, sessionCurrentPage, status } = useSelector((state: RootState) => state.reports.sessions);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSessionData());
    }
  }, [status, dispatch]);

  return (
    <div className="space-y-6">
      {/* A. Header */}
      <div>
        <h2 className="text-xl font-bold text-[#1e3a5f]">Nhật ký Phiên truy cập WIFI</h2>
        <p className="text-sm text-gray-500 mt-1">Theo dõi và kiểm toán chi tiết các phiên kết nối của người dùng</p>
      </div>
      
      {/* C. Bảng Dữ liệu (Data Table) */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-lg font-semibold text-gray-700 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Username</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Vai trò</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">MAC Address</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">IP Address</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Bắt đầu</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Kết thúc</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Thời lượng</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Data (GB)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockSessionData
                .slice((sessionCurrentPage - 1) * sessionItemsPerPage, sessionCurrentPage * sessionItemsPerPage)
                .map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{row.username}</p>
                      <p className="text-xs text-gray-500">{row.ap}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.role === 'Sinh viên' ? 'bg-blue-100 text-blue-700' :
                      row.role === 'Cán bộ' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {row.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{row.macAddress}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{row.ipAddress}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.startTime}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.endTime}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{row.duration}</td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-[#1e3a5f]">{row.dataUsed.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Hiển thị {Math.min((sessionCurrentPage - 1) * sessionItemsPerPage + 1, mockSessionData.length)} - {Math.min(sessionCurrentPage * sessionItemsPerPage, mockSessionData.length)} / {mockSessionData.length} phiên
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
              disabled={sessionCurrentPage * sessionItemsPerPage >= mockSessionData.length}
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
