import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import Providers from "./providers";
import "@/index.css";
import { getI18nTranslationsForLanguage } from "@/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("app-language")?.value || "vi") as "vi" | "en";
  const t = getI18nTranslationsForLanguage(lang);

  return {
    title: t.metadata.title,
    description: t.metadata.description,
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("app-language")?.value || "vi";

  return (
    <html lang={lang} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}