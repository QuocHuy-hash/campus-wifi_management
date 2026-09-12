import { headers } from "next/headers";
import CnaBrowserPageClient from "./CnaBrowserPageClient";
import type { CaptivePortalContext } from "@/features/auth/types";
import type { BrowserPlatform } from "@/features/auth/components/CnaBrowserHandoff";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function detectPlatform(userAgent: string): BrowserPlatform {
  if (/android/i.test(userAgent)) return "android";
  if (/iPad|iPhone|iPod/i.test(userAgent)) return "ios";
  if (/Windows/i.test(userAgent)) return "windows";
  return "other";
}

export default async function CnaBrowserPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const id = firstValue(params.id).trim();
  const ap = firstValue(params.ap).trim();
  const ssid = firstValue(params.ssid).trim();
  const url = firstValue(params.url).trim();
  const sessionCode = firstValue(params.session_code).trim();
  const parsedReloadAttempt = Number.parseInt(firstValue(params.cna_reload) || "0", 10);
  const reloadAttempt = Number.isFinite(parsedReloadAttempt) && parsedReloadAttempt >= 0
    ? parsedReloadAttempt
    : 0;

  const initialContext: CaptivePortalContext | null = id && ap && ssid && url
    ? {
        id,
        ap,
        ssid,
        url,
        t: firstValue(params.t).trim() || undefined,
        siteId: firstValue(params.site_id).trim() || undefined,
      }
    : null;

  const requestHeaders = await headers();
  const initialPlatform = detectPlatform(requestHeaders.get("user-agent") || "");
  const protocol = requestHeaders.get("x-forwarded-proto") || "http";
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
  const initialLoginUrl = sessionCode
    ? `${protocol}://${host}/s/${encodeURIComponent(sessionCode)}`
    : "";

  return (
    <CnaBrowserPageClient
      initialContext={initialContext}
      initialSessionCode={sessionCode}
      initialLoginUrl={initialLoginUrl}
      initialReloadAttempt={reloadAttempt}
      initialPlatform={initialPlatform}
    />
  );
}
