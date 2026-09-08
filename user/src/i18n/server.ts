import vi from "./locales/vi";
import en from "./locales/en";

export type ServerLanguage = "vi" | "en";

export function getI18nTranslationsForLanguage(lang: ServerLanguage) {
  return lang === "en" ? en : vi;
}