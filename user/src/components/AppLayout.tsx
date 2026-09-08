"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Menu, X, Wifi, Activity, History, User, HelpCircle, LogOut } from "lucide-react";
import { performLogout } from "@/lib/auth";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type ActivePage = "session" | "history" | "account";

const navItems: { href: string; labelKey: "app.navSession" | "app.navHistory" | "app.navAccount"; icon: typeof Activity; page: ActivePage }[] = [
  { href: "/session", labelKey: "app.navSession", icon: Activity, page: "session" },
  { href: "/history", labelKey: "app.navHistory", icon: History, page: "history" },
  { href: "/account", labelKey: "app.navAccount", icon: User, page: "account" },
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
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 hover:bg-accent rounded-lg text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <Wifi size={20} className="text-foreground" />
              <span className="font-semibold text-foreground hidden sm:inline">{t("app.campusWifi")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            {/* {headerRight} */}
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`fixed md:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-60 bg-card border-r border-border transform transition-transform duration-300 z-30 flex flex-col ${
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
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <Icon size={18} />
                  {t(item.labelKey)}
                </Link>
              );
            })}
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent"
            >
              <HelpCircle size={18} />
              {t("app.help")}
            </a>
          </nav>
          <div className="px-4 pb-4">
            <button
              onClick={() => performLogout()}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <LogOut size={18} />
              {t("app.logout")}
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
