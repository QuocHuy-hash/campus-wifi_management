import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import SocialAuthButton from './SocialAuthButton';

interface InternalLoginTabProps {
  isLoading: boolean;
  onSSOLogin: (provider: string) => void;
}

export default function InternalLoginTab({ isLoading, onSSOLogin }: InternalLoginTabProps) {
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  return (
    <div className="space-y-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
      <div className="text-center mb-4">
        <div className="relative inline-flex items-start">
          <p className="text-sm text-gray-500 mt-1 whitespace-nowrap">
            Sử dụng tài khoản email trường để đăng nhập
          </p>
          <span 
            className="text-red-500 font-bold animate-pulse cursor-pointer hover:text-red-600 text-lg leading-none absolute -right-3 top-0 block"
            onClick={() => setHelpModalOpen(true)}
            title="Hướng dẫn đăng nhập"
          >
            *
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SocialAuthButton 
          provider="Google"
          icon="/google.png"
          onClick={() => onSSOLogin('Gmail')}
          disabled={isLoading}
          colorClass="text-red-600"
          bgClass="bg-red-100"
          hoverClass="hover:border-red-300 hover:bg-red-50"
          large
        />
        
        <SocialAuthButton 
          provider="Microsoft"
          icon="/microsoft.png"
          onClick={() => onSSOLogin('Microsoft')}
          disabled={isLoading}
          colorClass="text-blue-600"
          bgClass="bg-blue-100"
          hoverClass="hover:border-blue-300 hover:bg-blue-50"
          large
        />
      </div>


      <Dialog open={helpModalOpen} onOpenChange={setHelpModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Hướng dẫn đăng nhập
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-2 text-gray-700 leading-relaxed text-[15px]">
            Quý Thầy Cô vui lòng đăng nhập với email chính thức của trường. 
            Trong trường hợp quý Thầy Cô quên mật khẩu email, vui lòng liên hệ 
            Ban quản lý Mạng (<a href="mailto:netadmin@hcmus.edu.vn" className="text-blue-600 hover:underline">netadmin@hcmus.edu.vn</a>).
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
