"use client";

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const HCMUS_LOGO = '/logo_hcmus.png';

interface AuthPageLayoutProps {
  children: ReactNode;
}

export default function AuthPageLayout({ children }: AuthPageLayoutProps) {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="flex justify-end mb-2">
          <LanguageSwitcher />
        </div>
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img
              src={HCMUS_LOGO}
              alt="HCMUS Logo"
              className="w-14 h-14 object-contain"
            />
            <p className="text-gray-600 font-sans">
              {t('auth.university')}
            </p>
          </div>
        </header>

        {children}

        <footer className="text-center text-gray-400 text-xs mt-6">
          {t('auth.footer')}
        </footer>
      </div>
    </main>
  );
}