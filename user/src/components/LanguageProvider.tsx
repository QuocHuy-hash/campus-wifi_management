"use client";

import { useEffect } from "react";
import { getStoredLanguage, setLanguage } from "@/i18n";

export default function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    setLanguage(getStoredLanguage());
  }, []);

  return <>{children}</>;
}