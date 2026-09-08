"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { setLanguage, DEFAULT_LANGUAGE } from "@/i18n";
import { Languages } from "lucide-react";

interface LanguageSwitcherProps {
  className?: string;
  light?: boolean;
}

export default function LanguageSwitcher({
  className = "",
  light = false,
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = mounted ? i18n.language : DEFAULT_LANGUAGE;
  const target = current === "vi" ? "en" : "vi";

  const baseClasses = light
    ? "text-white border-white/30 hover:bg-white/10"
    : "text-muted-foreground border-border hover:bg-accent hover:text-foreground";

  return (
    <button
      type="button"
      onClick={() => setLanguage(target)}
      aria-label={current === "vi" ? "Switch to English" : "Chuyển sang tiếng Việt"}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${baseClasses} ${className}`}
    >
      <Languages size={14} />
      {mounted ? target.toUpperCase() : "EN"}
    </button>
  );
}