import { Checkbox } from '@/components/ui/checkbox';
import GuestLoginTab from '@/components/GuestLoginTab';
import InternalLoginTab from '@/components/InternalLoginTab';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

export type AuthTab = 'internal' | 'guest';

interface AuthLoginCardProps {
  activeTab: AuthTab;
  agreeTerms: boolean;
  isLoading: boolean;
  loginUsername: string;
  loginPassword: string;
  showLoginPassword: boolean;
  loginError: string;
  onTabChange: (tab: AuthTab) => void;
  onAgreeTermsChange: (checked: boolean) => void;
  onSSOLogin: (provider: string) => void;
  onOpenGuestModal: () => void;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onLogin: () => void;
  onOpenForgotModal: () => void;
  onOpenTermsModal: () => void;
}

export default function AuthLoginCard({
  activeTab,
  agreeTerms,
  isLoading,
  loginUsername,
  loginPassword,
  showLoginPassword,
  loginError,
  onTabChange,
  onAgreeTermsChange,
  onSSOLogin,
  onOpenGuestModal,
  onUsernameChange,
  onPasswordChange,
  onTogglePassword,
  onLogin,
  onOpenForgotModal,
  onOpenTermsModal,
}: AuthLoginCardProps) {
  const { t } = useTranslation();

  return (
    <section className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="p-6">
        <div className="flex p-1 bg-gray-100 rounded-xl">
          <AuthTabButton
            active={activeTab === 'internal'}
            onClick={() => onTabChange('internal')}
          >
            {t('auth.tabStaff')}
          </AuthTabButton>
          <AuthTabButton
            active={activeTab === 'guest'}
            onClick={() => onTabChange('guest')}
          >
            {t('auth.tabGuest')}
          </AuthTabButton>
        </div>

        {activeTab === 'internal' ? (
          <InternalLoginTab isLoading={isLoading} onSSOLogin={onSSOLogin} />
        ) : (
          <GuestLoginTab
            isLoading={isLoading}
            onSSOLogin={onSSOLogin}
            onOpenGuestModal={onOpenGuestModal}
            username={loginUsername}
            onUsernameChange={onUsernameChange}
            password={loginPassword}
            onPasswordChange={onPasswordChange}
            showPassword={showLoginPassword}
            onTogglePassword={onTogglePassword}
            onLogin={onLogin}
            onOpenForgotModal={onOpenForgotModal}
            loginError={loginError}
          />
        )}

        <div className="flex items-start space-x-3 pt-4 border-t border-gray-100 mt-2">
          <Checkbox
            id="terms"
            checked={agreeTerms}
            onCheckedChange={(checked) => onAgreeTermsChange(checked === true)}
            className="mt-0.5 rounded"
          />
          <Label
            htmlFor="terms"
            className="text-sm text-gray-600 cursor-pointer leading-relaxed"
          >
            {t('auth.agreePrefix')}{' '}
            <button
              type="button"
              onClick={onOpenTermsModal}
              className="text-blue-600 hover:underline font-medium"
            >
              {t('auth.termsOfService')}
            </button>
          </Label>
        </div>
      </div>
    </section>
  );
}

interface AuthTabButtonProps {
  active: boolean;
  children: string;
  onClick: () => void;
}

function AuthTabButton({ active, children, onClick }: AuthTabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
        active
          ? 'bg-white text-blue-600 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}
