import { useEffect, useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';
import type { CaptiveEntryMode } from '@/features/auth/types';

interface NetworkConnectingScreenProps {
  mode: CaptiveEntryMode;
  onComplete: () => void;
}

// 1. Hàm kiểm tra mạng thực tế (Ping ẩn)
const checkActualInternet = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    // Gắn thêm số ngẫu nhiên để tránh bị trình duyệt cache file ảnh
    img.src = `https://www.google.com/favicon.ico?rand=${Math.random()}`;
    
    // Nếu mạng thông, Google trả về ảnh -> Thành công
    img.onload = () => resolve(true);
    
    // Nếu UniFi chưa mở mạng, request sẽ bị chặn -> Thất bại
    img.onerror = () => resolve(false);
  });
};

export default function NetworkConnectingScreen({ mode, onComplete }: NetworkConnectingScreenProps) {
  const [isConnecting, setIsConnecting] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // Để lưu trữ các ID của interval/timeout phục vụ cho việc cleanup
    let pollingInterval: ReturnType<typeof setInterval>;
    let completeTimeout: ReturnType<typeof setTimeout>;

    // Bộ đếm thời gian đã trôi qua (cập nhật UI mỗi giây)
    const timeInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    // Bắt đầu tiến trình Ping kiểm tra mạng
    const startPolling = () => {
      // Cứ mỗi 2 giây gửi 1 request ping kiểm tra
      pollingInterval = setInterval(async () => {
        logger.debug('Đang ping kiểm tra kết nối internet...');
        const hasInternet = await checkActualInternet();

        if (hasInternet) {
          logger.debug('Đã có Internet thực sự!');

          // 1. Dừng ping và đếm thời gian
          clearInterval(pollingInterval);
          clearInterval(timeInterval);

          // 2. Chuyển UI sang trạng thái Success
          setIsConnecting(false);

          // 3. Hành động phụ thuộc vào mode:
          // - browser: sau ~1s tự động gọi onComplete() để redirect đến URL đích
          // - cna: đứng lại hiển thị hướng dẫn, KHÔNG gọi onComplete (user tự bấm Done thoát CNA)
          if (mode === 'browser') {
            completeTimeout = setTimeout(() => {
              logger.debug('Browser mode — auto-redirecting to destination');
              onComplete();
            }, 1000);
          } else {
            logger.debug('CNA mode — waiting for user to tap Done button');
          }
        }
      }, 2000);
    };

    // Khởi chạy ping
    startPolling();

    // Cleanup function: Chống memory leak khi component bị huỷ (unmount)
    return () => {
      clearInterval(pollingInterval);
      clearInterval(timeInterval);
      if (completeTimeout) clearTimeout(completeTimeout);
    };
  }, [mode, onComplete]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center transition-all duration-500">
          {isConnecting ? (
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          ) : (
            <CheckCircle className="w-16 h-16 text-green-500 animate-[pulse_1s_ease-in-out]" />
          )}
        </div>

        {/* Main Text */}
        <div className="space-y-2">
          <h1 className={`text-2xl font-bold transition-colors duration-500 ${isConnecting ? 'text-blue-600' : 'text-green-600'}`}>
            {isConnecting ? 'Xác thực thành công!' : 'Kết nối mạng thành công!'}
          </h1>

          {/* Sub Text */}
          <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed px-4">
            {isConnecting
              ? 'Đang thiết lập đường truyền thực tế, vui lòng giữ nguyên màn hình trong giây lát...'
              : mode === 'cna'
              ? 'Bạn có thể sử dụng internet bình thường. Vui lòng bấm "Xong" ở góc màn hình để hoàn tất.'
              : 'Đang chuyển hướng đến trang của bạn...'
            }
          </p>
        </div>

        {/* Trạng thái Loading vô định hình thay vì đếm lùi */}
        {isConnecting && (
          <div className="w-64 mx-auto mt-6">
            <div className="h-1 w-full bg-blue-100 rounded-full overflow-hidden">
              {/* Hiệu ứng thanh chạy ngang liên tục */}
              <div className="h-full bg-blue-500 rounded-full w-1/2 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            </div>
            <p className="text-sm text-gray-400 mt-3 font-medium">
              Đã chờ {elapsedTime}s...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}