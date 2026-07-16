import type { ReactNode } from 'react';

const HCMUS_LOGO = '/logo_hcmus.png';

interface AuthPageLayoutProps {
  children: ReactNode;
}

export default function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img
              src={HCMUS_LOGO}
              alt="HCMUS Logo"
              className="w-14 h-14 object-contain"
            />
            <p className="text-gray-600 font-sans">
              Trường Đại học KHTN - ĐHQG HCM
            </p>
          </div>
        </header>

        {children}

        <footer className="text-center text-gray-400 text-xs mt-6">
          © 2026 HCMUS - Trường Đại học Khoa học Tự nhiên
        </footer>
      </div>
    </main>
  );
}
