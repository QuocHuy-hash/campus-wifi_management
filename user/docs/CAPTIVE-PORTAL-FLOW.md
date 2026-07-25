# 🔐 Captive Portal Flow (Hợp nhất — không phân biệt CNA/Browser)

## Tổng quan

Luồng captive portal xử lý thiết bị khi người dùng kết nối WiFi và bị controller (UniFi) intercept trước khi được cấp quyền truy cập Internet.

```mermaid
flowchart TD
    START([User connects WiFi]) --> PROBE{OS sends probe?}
    PROBE --> |Yes| CTL[Controller intercepts probe]
    PROBE --> |No - browser| CTL2[Controller intercepts browser request]
    CTL --> REDIRECT[Redirect to /guest/{mac}?id=...&ap=...&ssid=...&url=...]
    CTL2 --> REDIRECT
    REDIRECT --> MID{Next.js Middleware}
    MID -->|/guest/* → /login| LOGIN_PAGE[/login page loads]
    LOGIN_PAGE --> EXTRACT{extractCaptivePortalContext}
    EXTRACT -->|Thiếu tham số| NORMAL[Luồng web thông thường<br/>/session hoặc /login]
    EXTRACT -->|Đủ id, ap, ssid, url| SAVE[Lưu captive context vào<br/>localStorage + sessionStorage]
    SAVE --> CHECK_AUTH{Có session?}
    CHECK_AUTH -->|Có + token| AUTO_AUTH[Auto authorizeDevice]
    CHECK_AUTH -->|Không| SHOW_LOGIN[Hiển thị form login]
    SHOW_LOGIN --> LOGIN_OK[User đăng nhập thành công]
    LOGIN_OK --> AUTH_DEVICE[authorizeDevice]
    AUTO_AUTH --> AUTH_DEVICE
    AUTH_DEVICE -->|Thất bại| ERROR[Toast lỗi + giữ context cho retry]
    AUTH_DEVICE -->|Thành công| NET_CONNECT[/network-connecting]
    NET_CONNECT --> POLL[Poll internet every 2s]
    POLL -->|Có Internet| SUCCESS["Kết nối mạng thành công!"]
    SUCCESS --> WAIT1s[Chờ 1 giây]
    WAIT1s --> NAV[navigateOrFallback]
    NAV -->|url là probe OS| SESSION[/session]
    NAV -->|url là trang thật| DEST[Redirect đến URL đích]
    NAV -->|Navigation bị chặn (CNA)| FALLBACK[Fallback 3s → /session]
```

---

## Chi tiết luồng

### 1. Nhận request tại portal

Controller intercept request HTTP đầu tiên và redirect về:
```
/guest/{clientMac}?id={deviceMac}&ap={apMac}&ssid={ssid}&url={originalUrl}
```

| Tham số | Bắt buộc | Mô tả |
|---------|----------|-------|
| `id` | ✅ | MAC thiết bị (deviceMac) |
| `ap` | ✅ | MAC Access Point |
| `ssid` | ✅ | Tên WiFi |
| `url` | ✅ | URL gốc (probe OS hoặc trang đích) |
| `t` | ❌ | Timestamp (từ controller) |

> Nếu thiếu bất kỳ tham số nào trong 4 tham số bắt buộc → xem như truy cập trực tiếp, không phải captive redirect.

### 2. Middleware (`middleware.ts`)

```
/guest/* → redirect đến /login?<params>
/login (có token, không returnUrl) → redirect đến /session?<params>
/login (không token) → next(), hiển thị form login
/auth/success, /api/* → public, next()
Các route khác (chưa auth) → redirect đến /login?returnUrl=...
```

### 3. Providers — Auto-authorize (`providers.tsx`)

Chạy trên **mọi page navigation**:
1. `extractCaptivePortalContext(searchParams.toString())` — kiểm tra đủ 4 params
2. Nếu đủ → `saveCaptivePortalContext(context)`:
   - `localStorage.portalCaptiveContext` — full context
   - `sessionStorage.portalRedirectUrl` — chỉ `url` (dùng cho redirect cuối)
3. Kiểm tra `AUTH_COOKIE_KEY` + `accessToken` trong localStorage
4. Nếu có session → auto `authorizeDevice()`:
   - **Thành công** → `router.replace('/network-connecting')`
   - **Thất bại** → toast lỗi + `clearRedirectUrl()`, giữ nguyên captive context

### 4. Form Login (`AuthFeature.tsx`)

Nếu chưa có session → hiển thị form đăng nhập.

**Khi mount:**
- `extractCaptivePortalContext(window.location.search)` — lưu captive context trước khi URL thay đổi
- `handleRedirectWithSession` — nếu có session + captive context → auto authorize → `/network-connecting`

**Sau đăng nhập thành công:**
```typescript
redirectAfterDeviceAuthorization()
  → authorizeDeviceInBackground()  // authorize device
  → Thành công: window.location.href = '/network-connecting'
  → Thất bại: set error + stay on page
```

### 5. Màn hình Network Connecting (`NetworkConnectingScreen.tsx`)

1. Hiển thị spinner + "Xác thực thành công! Đang thiết lập đường truyền..."
2. Poll internet mỗi 2 giây (Image ping đến `https://www.google.com/favicon.ico`)
3. Khi có Internet → UI chuyển sang "Kết nối mạng thành công!"
4. Chờ 1 giây → gọi `onComplete()`

### 6. Redirect cuối — `navigateOrFallback()` (`captivePortal.ts`)

```typescript
navigateOrFallback(url, fallbackUrl = "/session")
```

Cơ chế:
1. Gọi `window.location.href = url` — redirect đến URL đích
2. Đồng thời đặt timer **3 giây**
3. Nếu navigation bị chặn (CNA WKWebView không cho điều hướng cross-origin) → timer redirect về `/session`

| Kịch bản | Hành vi |
|----------|---------|
| CNA + probe URL | Redirect đến probe → OS nhận response → Done button → CNA dismiss |
| CNA + probe URL (bị chặn) | Timer fallback 3s → `/session` → OS probe background → Done |
| Browser + real URL | Redirect đến URL đích |
| Browser + probe URL | Timer fallback 3s → `/session` |

---

## Captive Context (`captivePortal.ts`)

### Storage keys

| Key | Storage | Mục đích |
|-----|---------|----------|
| `portalCaptiveContext` | localStorage | Full context `{id, ap, ssid, url, t}` |
| `portalRedirectUrl` | sessionStorage | Chỉ `url` dùng cho redirect cuối |

### Functions

| Function | Input | Output |
|----------|-------|--------|
| `extractCaptivePortalContext(search)` | Query string | `CaptivePortalContext \| null` |
| `saveCaptivePortalContext(context)` | Context | Lưu vào localStorage + sessionStorage |
| `getCaptivePortalContext(search)` | Query string | Từ localStorage trước, fallback URL |
| `getRedirectUrl()` | — | URL từ sessionStorage |
| `clearRedirectUrl()` | — | Xoá sessionStorage |
| `navigateOrFallback(url, fallback?)` | URL | Redirect + fallback timer 3s |
| `buildAuthorizeDevicePayload(ctx, opts?)` | Context | Payload cho API authorize-device |

### Probe URL detection

```typescript
const PROBE_HOSTS = [
  "connectivitycheck.gstatic.com",   // Android, Chrome
  "captive.apple.com",               // iOS, macOS
  "www.msftconnecttest.com",         // Windows
  "www.msftncsi.com",                // Windows
  "clients3.google.com",             // Chrome
  "www.gstatic.com",                 // Various
  "connectivitycheck.android.com",   // Android
  "nmcheck.gnome.org",               // Linux/GNOME
  "detectportal.firefox.com",        // Firefox
];
```

---

## API Endpoints

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `{API_BASE_URL}/auth/login` | POST | Đăng nhập |
| `{API_BASE_URL}/users/authorize-device` | PUT | Cấp quyền thiết bị |
| `{API_BASE_URL}/auth/me` | GET | Lấy profile |
| `/api/auth/session` | POST | Set httpOnly cookie |
| `/api/auth/logout` | POST | Xoá httpOnly cookie |

### Authorize Device Payload

```typescript
interface AuthorizeDevicePayload {
  deviceMac: string;      // MAC thiết bị (id từ context)
  apMac: string;          // MAC access point
  ssid: string;           // Tên WiFi
  deviceType: string;     // LAPTOP | MOBILE | TABLET | OTHER
  deviceName: string;     // Từ User-Agent
  userIpAddress: string;  // "0.0.0.0" (lấy từ controller)
  userAgent: string;      // navigator.userAgent
  duration: number;       // 480 seconds (8 phút)
  manufacturer: string;   // Apple, Samsung, Dell, ...
  operatingSystem: string; // Windows 10/11, macOS 14, iOS 17, ...
}
```

---

## Key files map

| File | Vai trò |
|------|---------|
| `src/lib/captivePortal.ts` | Core: extract/save/build/navigate |
| `src/app/providers.tsx` | Auto-authorize trên mọi page |
| `src/middleware.ts` | Edge middleware: routing + auth guard |
| `src/features/auth/components/AuthFeature.tsx` | Login form + redirect handling |
| `src/features/auth/api/authApi.ts` | API calls (login, authorizeDevice) |
| `src/components/NetworkConnectingScreen.tsx` | Màn hình chờ kết nối |
| `src/app/network-connecting/page.tsx` | Route /network-connecting |
| `src/app/auth/success/page.tsx` | OAuth2 callback |
| `src/constants/appKeys.ts` | Storage keys |
