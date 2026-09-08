import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import vi from "./locales/vi";
import en from "./locales/en";

export const SUPPORTED_LANGUAGES = ["vi", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = "app-language";

export const DEFAULT_LANGUAGE: SupportedLanguage = "vi";

export function isSupportedLanguage(value: string | null | undefined): value is SupportedLanguage {
  return value === "vi" || value === "en";
}

export function getStoredLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupportedLanguage(stored)) return stored;
  } catch {
    // ignore storage access errors
  }
  return DEFAULT_LANGUAGE;
}

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi },
    en: { translation: en },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: [...SUPPORTED_LANGUAGES],
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

export function setLanguage(language: SupportedLanguage): void {
  void i18n.changeLanguage(language);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      window.document.cookie = `${LANGUAGE_STORAGE_KEY}=${language};path=/;max-age=31536000;samesite=lax`;
      window.document.documentElement.lang = language;
    } catch {
      // ignore storage access errors
    }
  }
}

export default i18n;