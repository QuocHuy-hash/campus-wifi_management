"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Menu, X, Wifi, Activity, History, User, HelpCircle, LogOut } from "lucide-react";
import { performLogout } from "@/lib/auth";

type ActivePage = "session" | "history" | "account";

const navItems: { href: string; label: string; icon: typeof Activity; page: ActivePage }[] = [
  { href: "/session", label: "Phiên hiện tại", icon: Activity, page: "session" },
  { href: "/history", label: "Lịch sử đăng nhập", icon: History, page: "history" },
  { href: "/account", label: "Thông tin tài khoản", icon: User, page: "account" },
];

export default function AppLayout({
  activePage,
  headerRight,
  children,
}: {
  activePage: ActivePage;
  headerRight?: ReactNode;
  children: ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <Wifi size={20} className="text-gray-700" />
              <span className="font-semibold text-gray-900 hidden sm:inline">Campus WiFi</span>
            </div>
          </div>
          {headerRight}
        </div>
      </header>

      <div className="flex">
        <aside
          className={`fixed md:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-60 bg-white border-r border-gray-200 transform transition-transform duration-300 z-30 flex flex-col ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.page;
              return (
                <Link
                  key={item.page}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm ${
                    isActive
                      ? "bg-blue-100 text-blue-900 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              <HelpCircle size={18} />
              Trợ giúp
            </a>
          </nav>
          <div className="px-4 pb-4">
            <button
              onClick={() => performLogout()}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              Đăng xuất
            </button>
          </div>
        </aside>

        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <main className="flex-1 p-4 md:p-6 w-full">{children}</main>
      </div>
    </div>
  );
}
