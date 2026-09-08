import { STORAGE_KEYS } from "@/constants/appKeys";

export async function establishSessionCookie(accessToken: string): Promise<void> {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken }),
  });

  if (!response.ok) {
    throw new Error("Không thể thiết lập cookie phiên");
  }
}

export async function clearSessionCookie(): Promise<void> {
  const response = await fetch("/api/auth/logout", { method: "POST" });

  if (!response.ok) {
    throw new Error("Không thể xóa cookie phiên");
  }
}

export function clearStoredAuthSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.portalLoggedIn);
  localStorage.removeItem(STORAGE_KEYS.portalUser);
}
