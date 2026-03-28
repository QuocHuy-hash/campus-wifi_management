import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/stores/store';
import { fetchBandwidthData } from '../../slices/bandwidthReportSlice';

export const BandwidthReportTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: mockBandwidthData, status } = useSelector((state: RootState) => state.reports.bandwidth);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchBandwidthData());
    }
  }, [status, dispatch]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Sử dụng băng thông theo thời gian</h3>
      
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-600">216.2 GB</p>
          <p className="text-sm text-gray-600">Tổng Download</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-600">54.5 GB</p>
          <p className="text-sm text-gray-600">Tổng Upload</p>
        </div>
        <div className="p-4 bg-amber-50 rounded-lg text-center">
          <p className="text-2xl font-bold text-amber-600">14:30</p>
          <p className="text-sm text-gray-600">Giờ cao điểm</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg text-center">
          <p className="text-2xl font-bold text-purple-600">119 Mbps</p>
          <p className="text-sm text-gray-600">Tốc độ TB</p>
        </div>
      </div>
      
      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ngày</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Download</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Upload</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Cao điểm</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Tốc độ TB</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockBandwidthData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{row.date}</td>
                <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">{row.download}</td>
                <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">{row.upload}</td>
                <td className="px-4 py-3 text-sm text-right">{row.peak}</td>
                <td className="px-4 py-3 text-sm text-right font-medium">{row.avgSpeed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
