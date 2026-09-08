"use client";

import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";

export default function OAuthErrorPage() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const rawError = searchParams?.get("error");
  const errorMessage = rawError
    ? decodeURIComponent(rawError)
    : t("oauthError.unknown");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-5">
        <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-600" />
        </div>

        <h1 className="text-xl font-semibold text-gray-900">
          {t("oauthError.title")}
        </h1>

        <p className="text-sm text-gray-600 break-words">{errorMessage}</p>

        <div className="pt-2">
          <a
            href="/login"
            className="inline-flex items-center justify-center w-full h-11 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            {t("oauthError.backToLogin")}
          </a>
        </div>
      </div>
    </div>
  );
}
