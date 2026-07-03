# Luồng Captive Portal & Đăng ký Thiết bị

## 1. Tổng quan

Khi người dùng kết nối vào WiFi trường (HCMUS), WiFi controller (UniFi/MikroTik) chặn HTTP request và redirect về User Portal kèm query parameters chứa thông tin thiết bị.

## 2. Redirect URL từ Controller

Controller redirect browser về:

```
https://portal.hcmus.edu.vn/guest/redirect?id=<DEVICE_MAC>&ap=<AP_MAC>&ssid=<SSID>&url=<ORIGINAL_URL>&t=<TIMESTAMP>
```

| Param | Ý nghĩa |
|---|---|
| `id` | MAC address của thiết bị người dùng |
| `ap` | MAC address của Access Point |
| `ssid` | Tên WiFi (VD: `HCMUS-Student`) |
| `url` | URL gốc người dùng muốn truy cập |
| `t` | Timestamp (không bắt buộc) |

---

## 3. Luồng Xử Lý Khi Vào Trang

### 3.1 Bước 1: Catch-all route `/guest/*`

**File:** `src/app/guest/[...slug]/page.tsx`

```typescript
// Bắt toàn bộ request tới /guest/*
// Redirect về /login kèm toàn bộ query params
router.replace(`/login${search}`);
```

### 3.2 Bước 2: Root page `/` (page.tsx)

**File:** `src/app/page.tsx`

Kiểm tra `localStorage.getItem("portalLoggedIn")`:

```
                    ┌─────────────────────────────┐
                    │     Vào trang web           │
                    │  (redirect từ controller)   │
                    └──────────┬──────────────────┘
                               │
                    ┌──────────▼──────────────────┐
                    │  Kiểm tra portalLoggedIn    │
                    │    trong localStorage       │
                    └──────────┬──────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                                 │
     ┌────────▼────────┐              ┌─────────▼─────────┐
     │  Đã login       │              │  Chưa login       │
     │                 │              │                    │
     │ Redirect →      │              │ Redirect →         │
     │ /session        │              │ /login + query     │
     └─────────────────┘              └────────────────────┘
```

### 3.3 Bước 3: Trang `/login` - Trích xuất Captive Context

**File:** `src/features/auth/components/AuthFeature.tsx` (lines 93-118)

```typescript
// Trích xuất query params từ URL
const captiveContext = extractCaptivePortalContext(currentSearch);

// Lưu vào localStorage với key "portalCaptiveContext"
saveCaptivePortalContext(captiveContext);
```

**File:** `src/lib/captivePortal.ts`

```typescript
export function extractCaptivePortalContext(search: string): CaptivePortalContext | null {
  const params = new URLSearchParams(search);
  // Lấy: id, ap, ssid, url, t
  if (!id || !ap || !ssid || !url) return null; // Nếu thiếu params => không phải captive portal
  return { id, ap, ssid, url, t };
}
```

**Cấu trúc dữ liệu lưu trong localStorage:**

```typescript
// Key: "portalCaptiveContext"
{
  "id": "AA:BB:CC:DD:EE:FF",     // MAC thiết bị
  "ap": "11:22:33:44:55:66",     // MAC AP
  "ssid": "HCMUS-Student",       // Tên WiFi
  "url": "http://example.com",   // URL gốc
  "t": "1712345678"              // Timestamp
}
```

---

## 4. Luồng Khi Đã Login

### 4.1 Auto-authorize thiết bị

**File:** `src/features/auth/components/AuthFeature.tsx` (lines 121-167)

Khi phát hiện user đã có session hợp lệ (`portalLoggedIn === true`) VÀ có captive context trong localStorage:

```typescript
useEffect(() => {
  const handleRedirectWithSession = async () => {
    const isLoggedIn = localStorage.getItem('portalLoggedIn') === 'true';
    const hasToken = !!localStorage.getItem('accessToken');
    const captiveContext = getCaptivePortalContext('');

    if (isLoggedIn && hasToken && captiveContext) {
      // 1. Build payload từ captive context
      const payload = buildAuthorizeDevicePayload(captiveContext);

      // 2. Gọi API authorize device
      await authorizeDevice(payload);

      // 3. Xóa captive context khỏi localStorage
      localStorage.removeItem('portalCaptiveContext');

      // 4. Redirect đến màn hình kiểm tra kết nối
      router.push('/network-connecting');
    }
  };

  const timer = setTimeout(handleRedirectWithSession, 100);
  return () => clearTimeout(timer);
}, []);
```

> **Lưu ý:** Nếu API authorize device thất bại (lỗi), vẫn redirect sang `/network-connecting` để không block user.

### 4.2 Kết quả (Đã login + có captive context)

```
┌──────────────┐
│  /login      │
│  (đã login)  │
└──────┬───────┘
       │
       ├── Có captive context?
       │   ├── CÓ: Gọi authorizeDevice → /network-connecting
       │   └── KHÔNG: Ở lại trang login (trường hợp normal visit)
       │
       └── Hết phiên? → Axios interceptor bắt 401 → redirect /login?returnUrl=...
```

---

## 5. Luồng Khi Chưa Login

### 5.1 Các phương thức đăng nhập

Trang `/login` hiển thị 2 tab:

```
┌─────────────────────────────────────┐
│  [Cán bộ / Sinh viên]  [Khách]     │
├─────────────────────────────────────┤
│                                     │
│  Tab 1: SSO                        │
│    - Đăng nhập với Google          │
│    - Đăng nhập với Microsoft       │
│                                     │
│  Tab 2: Guest                      │
│    - Form username + password      │
│    - Đăng ký tài khoản mới         │
│    - Quên mật khẩu                 │
│    - Social login (Google, MS, FB) │
└─────────────────────────────────────┘
```

### 5.2 Luồng đăng nhập bằng mật khẩu

**File:** `src/features/auth/components/AuthFeature.tsx` (lines 516-553)

```typescript
const handleStandardLogin = async () => {
  // 1. Gọi API POST /auth/login
  //    Body: { identifier, password }
  //    Response: { accessToken, refreshToken, roles[] }
  const result = await loginWithPassword({ identifier, password });

  // 2. Lưu tokens vào localStorage
  localStorage.setItem('accessToken', result.accessToken);
  localStorage.setItem('refreshToken', result.refreshToken);

  // 3. Fetch profile + persist session
  //    Lưu portalLoggedIn = true vào localStorage
  await persistSession(loginUsername);

  // 4. Gọi authorize device nếu có captive context
  await authorizeDeviceInBackground();

  // 5. Redirect
  //    - Có captive context → /network-connecting
  //    - Không có captive context → /session
  if (hasCaptiveContext) {
    router.push('/network-connecting');
  } else {
    router.push('/session');
  }
};
```

### 5.3 Luồng SSO (Google / Microsoft)

**File:** `src/components/InternalLoginTab.tsx`

```typescript
const handleSSOLogin = async (provider: string) => {
  // 1. Kiểm tra đã đồng ý điều khoản WiFi chưa
  if (!agreeTerms) { setError('Vui lòng đồng ý với Điều khoản'); return; }

  // 2. Lưu provider vào sessionStorage
  sessionStorage.setItem('oauthProvider', provider);
  sessionStorage.setItem('oauth2_redirect_back', '/session');

  // 3. Redirect đến backend OAuth2 endpoint
  window.location.href = `/api/v1/oauth2/authorize/${provider}`;
};
```

Backend xử lý OAuth2 handshake, redirect về:

```
/auth/success?access_token=<JWT_TOKEN>
```

**Xử lý callback:** `src/app/auth/success/page.tsx`

```typescript
// 1. Lấy access_token từ URL params
const accessToken = searchParams.get('access_token');

// 2. Lưu token vào localStorage
localStorage.setItem('accessToken', accessToken);

// 3. Fetch profile (GET /auth/me) → lưu portalLoggedIn = true
const profile = await getMeProfile();
localStorage.setItem('portalLoggedIn', 'true');

// 4. Kiểm tra captive context
const captiveContext = getCaptivePortalContext(window.location.search);
if (captiveContext) {
  // Có: authorize device → /network-connecting
  const payload = buildAuthorizeDevicePayload(captiveContext);
  await authorizeDevice(payload);
  localStorage.removeItem('portalCaptiveContext');
  setShowNetworkConnecting(true);
} else {
  // Không: redirect về /session
  router.replace('/session');
}
```

### 5.4 Luồng đăng ký tài khoản Guest

**File:** `src/features/auth/components/dialogs/GuestRegistrationDialog.tsx`

```
┌──────────────────────┐
│  Nhập email/phone    │
│  + password          │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Gửi OTP             │
│  POST /auth/register │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Nhập mã OTP (6 số)  │
│  POST /auth/verify-otp│
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Thành công          │
│  → Dùng credentials  │
│  → loginWithPassword │
│  → (luồng login)     │
└──────────────────────┘
```

---

## 6. Gọi Đăng Ký Thiết Bị (Authorize Device)

### 6.1 API Endpoint

```
PUT /users/authorize-device
Authorization: Bearer <accessToken>
```

### 6.2 Payload

**File:** `src/lib/captivePortal.ts` - `buildAuthorizeDevicePayload()`

```typescript
{
  "deviceMac": "AA:BB:CC:DD:EE:FF",    // Từ context.id
  "apMac": "11:22:33:44:55:66",        // Từ context.ap
  "ssid": "HCMUS-Student",             // Từ context.ssid
  "deviceType": "Windows",             // Tự động detect từ User-Agent
  "deviceName": "MacBook Pro",         // Tự động detect từ User-Agent
  "userIpAddress": "0.0.0.0",         // Hardcode (backend sẽ ghi đè)
  "userAgent": "Mozilla/5.0 ...",     // navigator.userAgent
  "duration": 480                      // Mặc định 480 phút (8 tiếng)
}
```

### 6.3 Các thời điểm gọi authorize device

| Phương thức đăng nhập | Vị trí gọi | Có block không? |
|---|---|---|
| Auto-authorize (đã login sẵn) | AuthFeature.tsx:146 | Blocking |
| Login mật khẩu | AuthFeature.tsx:541 (`authorizeDeviceInBackground`) | Non-blocking |
| SSO Google/Microsoft | AuthFeature.tsx:341 (`authorizeDeviceInBackground`) | Non-blocking |
| OAuth2 callback | `auth/success/page.tsx:60` | Blocking |

### 6.4 Hàm `authorizeDeviceInBackground`

```typescript
const authorizeDeviceInBackground = async (): Promise<void> => {
  try {
    const captiveContext = getCaptivePortalContext('');
    if (!captiveContext) return; // Không có context → skip

    const payload = buildAuthorizeDevicePayload(captiveContext);
    await authorizeDevice(payload);

    // Thành công: xóa context khỏi localStorage
    localStorage.removeItem('portalCaptiveContext');
  } catch (error) {
    // Thất bại: vẫn cho user đi tiếp (non-blocking)
    console.error('Device authorization failed:', error);
  }
};
```

> **Important:** Việc gọi authorize device ở dạng non-blocking (trừ auto-authorize và OAuth2 callback) vì API này có thể fail tạm thời nhưng vẫn không nên chặn user.

---

## 7. Sau Khi Đăng Ký Thiết Bị Thành Công

### 7.1 Màn hình Network Connecting

**File:** `src/components/NetworkConnectingScreen.tsx`

```typescript
// 1. Hiển thị "Xác thực thành công! Đang thiết lập đường truyền thực tế..."
// 2. Polling mỗi 2 giây: kiểm tra internet thực tế
//    - Tải ảnh favicon từ https://www.google.com/favicon.ico
//    - onload = có internet
//    - onerror = chưa có internet (controller chưa mở)
// 3. Khi có internet → hiển thị "Kết nối mạng thành công!"
// 4. User bấm "Xong" → redirect /session
```

**Trạng thái:**

| State | UI | Mô tả |
|---|---|---|
| `isConnecting = true` | Spinner + "Đang thiết lập đường truyền..." | Đang poll internet |
| `isConnecting = false` | Green checkmark + "Kết nối mạng thành công!" | Đã có internet |
| Bấm "Xong" | Redirect `/session` | Kết thúc |

### 7.2 Trang Session (`/session`)

**File:** `src/features/session/index.tsx`

Hiển thị:
- **Thông tin kết nối:** SSID, IP, MAC, thời gian online
- **Thiết bị:** Tên thiết bị, vị trí (AP)
- **Lưu lượng:** Download (input octets), Upload (output octets), Total
- **Daily quota:** Thanh tiến trình dung lượng đã dùng (xanh → vàng → đỏ)
- **QoS Policy:** Bandwidth limit, session timeout, daily quota
- **Hành động:** Đăng xuất WiFi, Lịch sử, Đăng xuất tất cả

### 7.3 Tổng quan toàn bộ flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                       CAPTIVE PORTAL FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

WiFi Controller
      │
      ▼
Redirect: /guest/redirect?id=...&ap=...&ssid=...&url=...
      │
      ▼
/guest/[...slug] → redirect → /login?<query>
      │
      ▼
/ (root page)
      │
      ├── portalLoggedIn === true ────┬─── Có captive context?
      │                               │     ├── YES → authorizeDevice → /network-connecting
      │                               │     └── NO  → /session
      │
      ├── portalLoggedIn !== true ────┬─── /login
      │                               │
      │                               ├── Password Login → lưu token → persist session
      │                               │   → authorizeDeviceInBackground (non-blocking)
      │                               │   → /network-connecting hoặc /session
      │                               │
      │                               ├── SSO Login → redirect OAuth2 → callback
      │                               │   → lưu token → persist session
      │                               │   → authorizeDevice (blocking nếu có context)
      │                               │   → /network-connecting hoặc /session
      │                               │
      │                               └── Guest Register → OTP → verify → auto login
      │                                   → (giống password login)
      │
      ▼
/network-connecting
      │
      ├── Poll internet (2s/lần)
      │   ├── Có internet → "Kết nối thành công!" → bấm "Xong" → /session
      │   └── Chưa có internet → tiếp tục poll
      │
      ▼
/session (trang chính)
      │
      ├── Xem thông tin session
      ├── Xem lưu lượng / quota
      ├── Đăng xuất WiFi
      ├── Lịch sử kết nối (/history)
      └── Quản lý tài khoản (/account)

─────────────────────────────────────────────────────────────────────
```

---

## 8. Xử Lý Lỗi & Edge Cases

### 8.1 Token hết hạn (401)

**File:** `src/config/axios.ts`

```typescript
// Axios response interceptor
// Nếu nhận 401:
//   1. Xóa toàn bộ localStorage (tokens, portalLoggedIn, portalUser)
//   2. Redirect về /login?returnUrl=...
```

### 8.2 Authorize device thất bại

- **Luồng auto-authorize:** Vẫn redirect `/network-connecting` (không block)
- **Luồng login:** `authorizeDeviceInBackground` catch error, user vẫn vào được `/session`
- **Luồng SSO callback:** Authorize blocking, nếu fail vẫn redirect `/network-connecting`

### 8.3 Thiếu captive context

- Nếu user vào thẳng `/login` hoặc `/` mà không qua redirect từ controller → không có captive context → không gọi authorize device → vào thẳng `/session` sau login
- Nếu lưu captive context cũ (từ lần trước) → được kiểm tra và dùng lại (nếu chưa bị xóa)

### 8.4 Logout

```typescript
const handleLogout = () => {
  localStorage.removeItem('portalLoggedIn');
  localStorage.removeItem('portalUser');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // Redirect về trang chủ
  window.location.href = '/';
};
```

Sau logout, nếu user lại truy cập trang, root page kiểm tra `portalLoggedIn` = false → redirect `/login`.

---

## 9. File Liên Quan

| File | Vai trò |
|---|---|
| `src/app/page.tsx` | Root page, quyết định redirect dựa trên trạng thái login |
| `src/app/guest/[...slug]/page.tsx` | Catch-all cho redirect từ controller |
| `src/app/login/page.tsx` | Trang đăng nhập |
| `src/app/auth/success/page.tsx` | OAuth2 callback handler |
| `src/app/network-connecting/page.tsx` | Màn hình kiểm tra kết nối sau auth |
| `src/features/auth/components/AuthFeature.tsx` | Component login chính, orchestration toàn bộ flow |
| `src/lib/captivePortal.ts` | Extract/save/build captive portal context |
| `src/features/auth/api/authApi.ts` | API calls (login, register, verify-otp, authorize-device, me) |
| `src/components/NetworkConnectingScreen.tsx` | Poll internet, hiển thị trạng thái kết nối |
| `src/config/axios.ts` | Axios interceptor, 401 handling |
| `src/components/InternalLoginTab.tsx` | Tab SSO (Google, Microsoft) |
| `src/components/GuestLoginTab.tsx` | Tab Guest (password + social + register) |
| `src/features/auth/components/dialogs/GuestRegistrationDialog.tsx` | Đăng ký guest với OTP |
