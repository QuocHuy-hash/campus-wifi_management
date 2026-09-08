"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function CaptivePortalHandler() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const search = window.location.search;
    router.replace(`/login${search}`);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center text-sm text-gray-600">{t("redirect.redirectingToLogin")}</div>
    </div>
  );
}
