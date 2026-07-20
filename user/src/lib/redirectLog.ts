// Ghi log mỗi lần điều hướng (redirect) để debug luồng captive portal trên thiết bị thật.
// Khác với logger thường: hàm này LUÔN in ra console kể cả ở production, và lưu lại
// một "vết" trong localStorage để xem lại sau khi trang đã redirect (console bị mất).

const REDIRECT_TRAIL_KEY = "captiveRedirectTrail";
const MAX_TRAIL_ENTRIES = 30;

export interface RedirectLogEntry {
  at: string; // ISO time
  from: string; // URL hiện tại trước khi redirect
  to: string; // Đích redirect
  reason: string; // Mô tả ngắn vì sao redirect
}

export function logRedirect(to: string, reason: string): void {
  const from = typeof window !== "undefined" ? window.location.href : "(no-window)";
  const at = new Date().toISOString();

  // Luôn in ra console (production vẫn thấy nếu cắm remote devtools).
  console.log(`🔀 [REDIRECT] ${reason}\n   from: ${from}\n   to:   ${to}`);

  try {
    const raw = localStorage.getItem(REDIRECT_TRAIL_KEY);
    const trail: RedirectLogEntry[] = raw ? JSON.parse(raw) : [];
    trail.push({ at, from, to, reason });
    // Giữ tối đa MAX_TRAIL_ENTRIES bản ghi gần nhất.
    const trimmed = trail.slice(-MAX_TRAIL_ENTRIES);
    localStorage.setItem(REDIRECT_TRAIL_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage không khả dụng — bỏ qua, đã có console.log.
  }
}

export function getRedirectTrail(): RedirectLogEntry[] {
  try {
    const raw = localStorage.getItem(REDIRECT_TRAIL_KEY);
    return raw ? (JSON.parse(raw) as RedirectLogEntry[]) : [];
  } catch {
    return [];
  }
}

export function clearRedirectTrail(): void {
  try {
    localStorage.removeItem(REDIRECT_TRAIL_KEY);
  } catch {
    // best-effort
  }
}
