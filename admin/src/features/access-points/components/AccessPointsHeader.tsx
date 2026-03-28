import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useLocation } from 'wouter';

export function AccessPointsHeader() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Giám sát Điểm phát WiFi</h1>
        <p className="text-gray-600 text-sm">Theo dõi trạng thái AP và Controller trong hệ thống</p>
      </div>
      <Button 
        variant="outline" 
        className="text-[#1e3a5f] border-[#1e3a5f] hover:bg-[#1e3a5f]/10"
        onClick={() => setLocation('/settings?tab=devices')}
      >
        <Settings size={16} className="mr-2" />
        Quản lý thiết bị
      </Button>
    </div>
  );
}
