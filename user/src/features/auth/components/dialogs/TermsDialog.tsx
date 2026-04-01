import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText } from 'lucide-react';

interface TermsDialogProps {
  open: boolean;
  sessionTimeoutHours: number;
  bandwidthRange: string;
  dailyQuota: string;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

export default function TermsDialog({
  open,
  sessionTimeoutHours,
  bandwidthRange,
  dailyQuota,
  onOpenChange,
  onAccept,
}: TermsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            Điều khoản sử dụng WiFi
          </DialogTitle>
          <DialogDescription>Campus WiFi - Trường ĐHKHTN</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm text-gray-600">
          <section>
            <h4 className="font-semibold text-gray-900 mb-2">1. Quy định chung</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>WiFi miễn phí cho sinh viên, giảng viên và nhân viên</li>
              <li>Mỗi tài khoản chỉ được sử dụng bởi chủ sở hữu</li>
              <li>Không chia sẻ tài khoản cho người khác</li>
            </ul>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">2. Giới hạn sử dụng</h4>
            <div className="bg-blue-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Thời lượng phiên:</span>
                <span className="font-semibold text-gray-900">{sessionTimeoutHours} giờ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Băng thông:</span>
                <span className="font-semibold text-gray-900">{bandwidthRange} Mbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hạn ngạch hàng ngày:</span>
                <span className="font-semibold text-gray-900">{dailyQuota}</span>
              </div>
            </div>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">3. Hành vi bị cấm</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Truy cập nội dung bất hợp pháp, khiêu dâm</li>
              <li>Tấn công, phá hoại hệ thống mạng</li>
              <li>Vi phạm bản quyền, sử dụng P2P/torrent</li>
              <li>Spam, phishing, hoạt động lừa đảo</li>
            </ul>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">4. Xử lý vi phạm</h4>
            <div className="bg-red-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span>Cảnh cáo, khóa tài khoản 30 phút</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span>Khóa tài khoản 24 giờ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span>Khóa tài khoản vĩnh viễn</span>
              </div>
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button onClick={onAccept} className="bg-blue-600 hover:bg-blue-700">
            Đồng ý và tiếp tục
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
