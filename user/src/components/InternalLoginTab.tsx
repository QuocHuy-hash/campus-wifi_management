import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SocialAuthButton from './SocialAuthButton';
import { useTranslation } from 'react-i18next';

interface InternalLoginTabProps {
  isLoading: boolean;
  onSSOLogin: (provider: string) => void;
}

export default function InternalLoginTab({ isLoading, onSSOLogin }: InternalLoginTabProps) {
  const { t } = useTranslation();
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  return (
    <div className="space-y-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
      <div className="text-center mb-4">
        <div className="relative inline-flex items-start">
          <p className="text-sm text-gray-500 mt-1 whitespace-nowrap">
            {t('internalLogin.subtitle')}
          </p>
          <span 
            className="text-red-500 font-bold animate-pulse cursor-pointer hover:text-red-600 text-lg leading-none absolute -right-3 top-0 block"
            onClick={() => setHelpModalOpen(true)}
            title={t('internalLogin.helpTitle')}
          >
            *
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SocialAuthButton 
          provider="Google"
          icon="/google.png"
          onClick={() => onSSOLogin('google')}
          disabled={isLoading}
          colorClass="text-red-600"
          bgClass="bg-red-100"
          hoverClass="hover:border-red-300 hover:bg-red-50"
          large
        />
        
        <SocialAuthButton 
          provider="Microsoft"
          icon="/microsoft.png"
          onClick={() => onSSOLogin('azure')}
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
              {t('internalLogin.helpTitle')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-2 text-gray-700 leading-relaxed text-[15px]">
            {t('internalLogin.helpText')}
            <a href="mailto:netadmin@hcmus.edu.vn" className="text-blue-600 hover:underline">
              {t('internalLogin.helpNetadmin')}
            </a>).
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
