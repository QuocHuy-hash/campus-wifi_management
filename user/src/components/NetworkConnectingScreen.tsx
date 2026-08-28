import { useEffect, useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { logger } from '@/lib/logger';

interface NetworkConnectingScreenProps {
  onComplete: () => void;
}

// 1. Hàm kiểm tra mạng thực tế (Ping ẩn) / Function to check real internet connectivity (hidden ping)
const checkActualInternet = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    // Gắn thêm số ngẫu nhiên để tránh bị trình duyệt cache file ảnh
    // Append a random query to prevent the browser from caching the image
    img.src = `https://www.google.com/favicon.ico?rand=${Math.random()}`;
    
    // Nếu mạng thông, Google trả về ảnh -> Thành công
    // If the network is up, Google returns the image -> Success
    img.onload = () => resolve(true);
    
    // Nếu UniFi chưa mở mạng, request sẽ bị chặn -> Thất bại
    // If UniFi hasn't opened the network, the request is blocked -> Failure
    img.onerror = () => resolve(false);
  });
};

export default function NetworkConnectingScreen({ onComplete }: NetworkConnectingScreenProps) {
  const { t } = useTranslation();
  const [isConnecting, setIsConnecting] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // Để lưu trữ các ID của interval/timeout phục vụ cho việc cleanup
    // Store interval/timeout IDs for cleanup
    let pollingInterval: ReturnType<typeof setInterval>;
    let completeTimeout: ReturnType<typeof setInterval>;

    // Bộ đếm thời gian đã trôi qua (cập nhật UI mỗi giây)
    // Elapsed time counter (updates the UI every second)
    const timeInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    // Bắt đầu tiến trình Ping kiểm tra mạng
    // Start the internet check ping process
    const startPolling = () => {
      // Cứ mỗi 2 giây gửi 1 request ping kiểm tra
      // Send a ping request every 2 seconds
      pollingInterval = setInterval(async () => {
        logger.debug('Đang ping kiểm tra kết nối internet... / Pinging internet connectivity...');
        const hasInternet = await checkActualInternet();

        if (hasInternet) {
          logger.debug('Đã có Internet thực sự! / Real internet available!');
          
          // 1. Dừng ping và đếm thời gian / Stop ping and timer
          clearInterval(pollingInterval);
          clearInterval(timeInterval);
          
          // 2. Chuyển UI sang trạng thái Success / Switch UI to Success state
          setIsConnecting(false);

          // 3. Chờ 1 giây để người dùng kịp nhìn thấy trạng thái thành công
          // Wait 1 second so the user sees the success state
          completeTimeout = setTimeout(() => {
            logger.debug('Chuyển sang màn hình Session / Navigating to Session screen');
            onComplete();
          }, 1000);
        }
      }, 2000);
    };

    // Khởi chạy ping / Start pinging
    startPolling();

    // Cleanup function: Chống memory leak khi component bị huỷ (unmount)
    // Prevent memory leaks when the component unmounts
    return () => {
      clearInterval(pollingInterval);
      clearInterval(timeInterval);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

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
            {isConnecting ? t('networkConnecting.authSuccess') : t('networkConnecting.networkSuccess')}
          </h1>

          {/* Sub Text */}
          <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed px-4">
            {isConnecting
              ? t('networkConnecting.connecting')
              : t('networkConnecting.connected')
            }
          </p>
        </div>

        {/* Trạng thái Loading vô định hình thay vì đếm lùi / Indeterminate loading state instead of a countdown */}
        {isConnecting && (
          <div className="w-64 mx-auto mt-6">
            <div className="h-1 w-full bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full w-1/2 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            </div>
            <p className="text-sm text-gray-400 mt-3 font-medium">
              {t('networkConnecting.waited', { seconds: elapsedTime })}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}