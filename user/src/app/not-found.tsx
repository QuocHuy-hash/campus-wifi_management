"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="text-gray-600">{t("notFound.title")}</p>
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          {t("notFound.backHome")}
        </Link>
      </div>
    </div>
  );
}