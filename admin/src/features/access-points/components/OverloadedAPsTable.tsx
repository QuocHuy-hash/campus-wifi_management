import { Card } from '@/components/ui/card';
import { useAppSelector } from '@/stores/hooks';
import { useMemo } from 'react';

export function OverloadedAPsTable() {
  const { aps } = useAppSelector(state => state.accessPoints);

  // Lọc các AP quá tải (usage >= 70%)
  const overloadedAPs = useMemo(() => {
    return aps
      .filter(ap => (ap.usage || 0) >= 70)
      .sort((a, b) => (b.usage || 0) - (a.usage || 0))
      .slice(0, 4);
  }, [aps]);

  return (
    <Card className="p-4 h-full">
      <h3 className="text-sm font-semibold text-[#1e3a5f] mb-3">AP quá tải</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 font-medium text-gray-600">Tên AP</th>
            <th className="text-right py-2 font-medium text-gray-600">Số client</th>
            <th className="text-right py-2 font-medium text-gray-600">% sử dụng</th>
          </tr>
        </thead>
        <tbody>
          {overloadedAPs.map((ap) => (
            <tr key={ap.macAddress} className="border-b last:border-0">
              <td className="py-2">{ap.apName}</td>
              <td className="py-2 text-right">{ap.clients || 0}</td>
              <td className="py-2 text-right">
                <span className={(ap.usage || 0) >= 90 ? 'text-red-600 font-medium' : 'text-amber-600'}>
                  {ap.usage || 0}%
                </span>
              </td>
            </tr>
          ))}
          {overloadedAPs.length === 0 && (
            <tr>
              <td colSpan={3} className="py-4 text-center text-gray-500">
                Không có AP nào đang quá tải
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}
