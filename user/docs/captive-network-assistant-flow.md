# Xử lý Captive Network Assistant (CNA) trên iOS

## Vấn đề

### Mô tả

Khi người dùng kết nối vào WiFi HCMUS, thiết bị iOS sẽ mở Captive Network Assistant (CNA) — một WKWebView hệ thống hiển thị portal đăng nhập. Sau khi người dùng:

1. Đăng nhập thành công (Guest login hoặc SSO)
2. Thiết bị được authorize (whitelist MAC/IP)
3. Internet đã hoạt động (Google respond)

Thì trên thanh công cụ của CNA vẫn hiển thị nút **"X" (Cancel)** thay vì chuyển thành **"Done" (Xong)**. Người dùng phải **refresh thủ công** trang portal thì nút mới chuyển sang "Done".

### Nguyên nhân gốc

iOS CNA hoạt động theo cơ chế:

1. Khi phát hiện captive network, iOS mở CNA và hiển thị portal
2. iOS **định kỳ thực hiện probe hệ thống** tới URL:
   - `http://captive.apple.com/hotspot-detect.html` (kỳ vọng HTTP 200 + body "Success")
   - `http://captive.apple.com/generate_204` (kỳ vọng HTTP 204 No Content)
3. Nếu probe trả về thành công (không bị chặn/redirect), iOS xác định mạng đã mở
4. iOS tự động đổi nút **"X" (Cancel) → "Done" (Xong)** trên thanh CNA

Vấn đề xảy ra vì:

- Sau khi authorize thiết bị, backend whitelist traffic nhưng probe của iOS tới `captive.apple.com` chưa được trigger lại
- iOS chỉ probe theo chu kỳ (có thể lên đến 30-60 giây) nếu không có sự kiện điều hướng
- Portal chuyển hướng tới `/network-connecting` (internal page) chứ không phải một URL thực tế trên internet → iOS không có cơ hội detect connectivity mới

---

## Giải pháp

### Chiến lược tổng thể

Sau khi internet được xác nhận (Google respond), điều hướng webview (CNA hoặc browser) tới một **URL thực tế trên internet** thành công. Cụ thể:

- **Ưu tiên 1:** URL gốc người dùng định truy cập (tham số `url` từ captive context) — hoạt động cho cả CNA và browser
- **Fallback iOS:** `http://captive.apple.com/hotspot-detect.html` — trigger CNA detect nếu không có URL gốc
- **Fallback Android:** `/session` — vào trang quản lý phiên

### Flow tổng quát

```
                         ┌─────────────────────────────┐
                         │  Kết nối WiFi HCMUS           │
                         │  (CNA iOS / Browser Android)  │
                         └──────────────┬──────────────┘
                                        ↓
                         ┌─────────────────────────────┐
                         │  UniFi redirect → /login     │
                         │  ?id=MAC&ap=AP&ssid=HCMUS   │
                         │  &url=http://original-site   │
                         └──────────────┬──────────────┘
                                        ↓
                         ┌─────────────────────────────┐
                         │ Captive context được lưu     │
                         │ └─ localStorage: portalCaptiveContext │
                         │ └─ sessionStorage: captiveOriginalUrl │
                         └──────────────┬──────────────┘
                                        ↓
                         ┌─────────────────────────────┐
                         │ Đăng nhập                    │
                         │ (Guest / Google SSO / Azure) │
                         └──────────────┬──────────────┘
                                        ↓
                         ┌─────────────────────────────┐
                         │ Authorize device (API)       │
                         │ └─ Xóa localStorage context  │
                         └──────────────┬──────────────┘
                                        ↓
                         ┌─────────────────────────────┐
                         │ /network-connecting          │
                         │ Poll Google favicon (2s)     │
                         └──────────────┬──────────────┘
                                        ↓
                         ┌─────────────────────────────┐
                         │   Có internet?              │
                         └──────────────┬──────────────┘
                                        ↓
                    ┌───────────────────┴───────────────────┐
                    │                                       │
                    │           YES (internet OK)           │
                    │                                       │
           ┌────────┴────────┐                              │
           │ originalUrl     │                              │
           │ (sessionStorage)│                              │
           └────────┬────────┘                              │
                    ↓                                       │
       ┌────────────┴────────────┐                          │
       │                         │                          │
       │    CÓ originalUrl       │      KHÔNG originalUrl   │
       │                         │                          │
       ↓                         ↓                          │
┌─────────────────┐   ┌──────────────────────┐            NO
│ Redirect tới     │   │ Kiểm tra platform   │             │
│ original URL     │   └──────────┬───────────┘             │
│ (CNA & Browser)  │              ↓                        │
└────────┬─────────┘   ┌──────────┴──────────┐              │
         │             │                     │              │
         │        iOS (CNA)             Android             │
         │             ↓                     ↓              │
         │   ┌─────────────────┐   ┌─────────────────┐     │
         │   │ Redirect tới    │   │ router.replace   │     │
         │   │ captive.apple.  │   │ ("/session")     │     │
         │   │ com/hotspot-    │   └────────┬─────────┘     │
         │   │ detect.html     │            │              │
         │   └────────┬────────┘            │              │
         │            ↓                     ↓              │
         │   ┌─────────────────┐   ┌─────────────────┐     │
         │   │ iOS detect OK   │   │ Vào session     │     │
         │   │ "X" → "Done"    │   │ quản lý phiên   │     │
         │   └─────────────────┘   └─────────────────┘     │
         │                                                 │
         └─────────────────────────────────────────────────┘
```

---

## Chi tiết theo từng luồng

### 1. Guest login (email/password)

**Mô tả:** User nhập email + password trên tab Guest, submit form.

**Luồng:**

```
/login?id=MAC&ap=AP&ssid=HCMUS&url=http://example.com
  ↓ 1. Mount AuthFeature → URL có captive params
  ↓    extractCaptivePortalContext() → lưu context:
  ↓      localStorage.portalCaptiveContext = {...}
  ↓      sessionStorage.captiveOriginalUrl = "http://example.com"
  ↓
  ↓ 2. User nhập email + password → handleStandardLogin()
  ↓    loginWithPassword() → POST /api/v1/auth/login
  ↓    establishPasswordSession() → lưu token, set cookie
  ↓
  ↓ 3. redirectAfterDeviceAuthorization()
  ↓    getCaptivePortalContext() → true (có context)
  ↓    authorizeDeviceInBackground() → PUT /api/v1/users/authorize-device
  ↓      → Xóa localStorage.portalCaptiveContext
  ↓      → sessionStorage.captiveOriginalUrl vẫn còn
  ↓
  ↓ 4. window.location.href = '/network-connecting'
  ↓
  ↓ 5. NetworkConnectingScreen polling Google (2s)
  ↓
  ↓ 6. Có internet → setIsConnecting(false) → set timeout 1s
  ↓
  ↓ 7. completeTimeout fires → onComplete()
  ↓    sessionStorage.getItem('captiveOriginalUrl') = "http://example.com"
  ↓    sessionStorage.removeItem('captiveOriginalUrl')
  ↓
  ↓    if (originalUrl) → window.location.href = "http://example.com"
  ↓
  ↓ 8. Kết quả:
  │     ┌── Trong CNA (iOS): load http://example.com → iOS detect
  │     │   → đổi "X" → "Done" → user tap → CNA đóng
  │     │
  │     └── Trong browser: vào http://example.com (user dùng internet)
  │
  │     Nếu KHÔNG có originalUrl (edge case):
  │       ├── iOS → http://captive.apple.com/hotspot-detect.html → "Done"
  │       └── Android → router.replace("/session")
```

### 2. OAuth SSO (Google / Azure)

**Mô tả:** User chọn đăng nhập qua Google Workspace hoặc Microsoft Azure.

**Luồng:**

```
/login?id=MAC&ap=AP&ssid=HCMUS&url=http://example.com
  ↓ 1. Lưu captive context (như flow guest)
  ↓
  ↓ 2. User chọn "Đăng nhập Google"
  ↓    startOAuth2Login("google")
  ↓    sessionStorage.oauthProvider = "google"
  ↓    sessionStorage.oauth2_redirect_back = "/session"
  ↓
  ↓ 3. Redirect → Google OAuth → User xác thực
  ↓
  ↓ 4. Google callback → /auth/success?access_token=...
  ↓
  ↓ 5. completeOAuthFlow():
  ↓    Lưu token, set cookie
  ↓    getMeProfile() → lưu thông tin user
  ↓
  ↓ 6. getCaptivePortalContext(window.location.search)
  ↓    → search chỉ có access_token, không có captive params
  ↓    → getStoredCaptivePortalContext() từ localStorage → null (đã bị xóa)
  ↓    → Nhưng vì URL gốc không mang captive params, context = null
  ↓    → Bỏ qua authorize device, về thẳng /session
  │
  │    ⚠️ Vấn đề: captive context bị mất sau OAuth redirect
  │    → authorize device không được gọi
  │    → Chưa có originalUrl → vào /session
  │    → Cần cải thiện: restore context từ sessionStorage trước OAuth
```

### 3. Provider tự động redirect (khi user đã login sẵn)

**Mô tả:** User đã có token hợp lệ, khi vào portal từ captive redirect.

**Luồng:**

```
/guest/... → middleware redirect → /login?captive_params
  ↓
AuthFeature mount:
  ↓ handleRedirectWithSession():
  ↓   hasToken = true, hasAuthCookie = true
  ↓   captiveContext = getCaptivePortalContext('') → có từ URL
  ↓   → authorizeDevice() tự động
  ↓   → localStorage.removeItem('portalCaptiveContext')
  ↓   → router.push('/network-connecting')
  ↓
  → Tiếp tục flow như guest login từ bước 5
```

### 4. Vào portal trực tiếp (không qua captive redirect)

**Mô tả:** User mở browser, vào thẳng URL portal (không phải lúc kết nối WiFi).

**Luồng:**

```
https://guest.hcmus.edu.vn/login
  ↓
Không có captive params trên URL
  ↓
Không lưu context, không có originalUrl
  ↓
Login thành công → window.location.href = '/session'
  ↓
Vào session, không qua /network-connecting
```

---

## Chi tiết kỹ thuật

### Captive Context (từ UniFi Controller)

```
Query params từ UniFi redirect:
  id    = MAC của thiết bị (device)
  ap    = MAC của Access Point
  ssid  = Tên WiFi (vd: "HCMUS-Student")
  url   = URL gốc người dùng muốn truy cập (bắt buộc)
  t     = Timestamp (optional)
```

### Lưu trữ

| Key | Storage | Mục đích | Set tại | Xóa tại |
|-----|---------|----------|---------|---------|
| `portalCaptiveContext` | localStorage | Payload cho authorize device | `saveCaptivePortalContext()` (khi vào portal) | `authorizeDeviceInBackground()` (sau auth) |
| `captiveOriginalUrl` | sessionStorage | Redirect target sau khi có internet | `saveCaptivePortalContext()` (khi vào portal) | `onComplete` callback (khi redirect) |

**Tại sao dùng sessionStorage cho originalUrl?**

- sessionStorage sống cùng tab, không bị ảnh hưởng bởi `localStorage.removeItem` trong `authorizeDeviceInBackground`
- Xóa tự động khi tab/trình duyệt đóng — không lo rò rỉ dữ liệu
- Giữ được xuyên suốt vòng đời: lưu context → authorize → /network-connecting → redirect

### Các component tham gia

| Component/File | Vai trò | Ghi chú |
|----------------|---------|---------|
| `src/lib/captivePortal.ts:saveCaptivePortalContext()` | Lưu context vào localStorage + sessionStorage | Gọi khi phát hiện captive params trên URL |
| `src/lib/captivePortal.ts:extractCaptivePortalContext()` | Parse captive params từ URL | Validate: cần id, ap, ssid, url |
| `src/lib/captivePortal.ts:getStoredCaptivePortalContext()` | Đọc context từ localStorage | Dùng cho authorize device |
| `src/app/network-connecting/page.tsx` | Poll Google, quyết định redirect target | Dùng `useCallback` để ổn định `onComplete` reference, tránh race condition với re-render |
| `src/components/NetworkConnectingScreen.tsx` | UI polling + hiển thị trạng thái | Phụ thuộc `[onComplete]` — cần parent stabilize reference |
| `src/app/auth/success/page.tsx` | Xử lý OAuth callback + NetworkConnectingScreen | `onNetworkComplete` dùng `useCallback` |
| `src/features/auth/components/AuthFeature.tsx` | Login orchestrator | Chứa `redirectAfterDeviceAuthorization()` |
| `src/app/providers.tsx` | Auto-authorize khi user có sẵn session | Chạy ở mount, detect captive params |

### Stabilize onComplete reference

**Vấn đề:** `NetworkConnectingScreen` có `useEffect` phụ thuộc `[onComplete]`. Nếu `onComplete` là inline arrow function, mỗi lần component re-render (`setElapsedTime` mỗi 1s) → tham chiếu mới → effect cleanup chạy → `clearTimeout(completeTimeout)` → hủy navigation.

**Giải pháp:** Dùng `useCallback` ở parent component:

```typescript
// ✅ Ổn định: useCallback
const onComplete = useCallback(() => {
  // logic redirect
}, [originalUrl, router]);
```

```typescript
// ❌ Không ổn định: inline arrow → mới mỗi render
<NetworkConnectingScreen onComplete={() => { ... }} />
```

---

## So sánh platform

### iOS (CNA)

| Giai đoạn | UX |
|-----------|----|
| Kết nối WiFi | CNA tự động mở (WKWebView hệ thống) |
| Portal hiển thị | Trong CNA, không có address bar, chỉ có nút "X" |
| Login + authorize | User thấy UI portal bình thường |
| /network-connecting | User thấy spinner + "Đang thiết lập..." |
| Internet confirmed | Chữ xanh "Kết nối mạng thành công!" |
| Redirect originalUrl | CNA load URL gốc → iOS detect → **"X" tự chuyển "Done"** |
| User tap "Done" | CNA đóng, user về app/settings, có internet |

### iOS (Safari browser)

| Giai đoạn | UX |
|-----------|----|
| Mở portal | User tự mở Safari, vào portal URL |
| Login + authorize | UX web bình thường |
| Internet confirmed | Redirect tới URL gốc hoặc /session |
| Kết quả | User vào trang mong muốn, không có CNA button |

### Android

| Giai đoạn | UX |
|-----------|----|
| Kết nối WiFi | Portal mở trong Chrome Custom Tab hoặc browser |
| Login + authorize | UX web bình thường |
| Internet confirmed | Redirect tới URL gốc hoặc /session |
| Kết quả | User vào trang mong muốn, không có CNA button issue |

---

## Testing guide

### iOS (CNA) — test đầy đủ

```
1. Settings → WiFi → chọn HCMUS-Student → Forget This Network
2. Kết nối lại HCMUS-Student
3. Đợi CNA tự động mở (1-3s)
4. Quan sát: portal hiển thị trong CNA (không có address bar)
5. Chọn tab Guest, nhập email + password
6. Đồng ý điều khoản → Đăng nhập
7. Quan sát: chuyển sang /network-connecting (spinner)
8. Đợi polling hoàn tất (tối đa 30s)
9. ✅ Màn hình hiện "Kết nối mạng thành công!" (chữ xanh)
10. ✅ CNA tự động chuyển hướng đến URL gốc (hoặc Apple URL)
11. ✅ Sau 1-3s, nút "X" tự chuyển thành "Done"
12. Tap "Done" → CNA đóng → kiểm tra internet hoạt động
```

### Browser (Safari/Chrome) — test đầy đủ

```
1. Mở Safari, vào https://guest.hcmus.edu.vn/login
2. Đăng nhập guest
3. Quan sát: /network-connecting hiển thị
4. Đợi polling hoàn tất
5. ✅ Redirect tới URL gốc (hoặc /session)
6. ✅ Không bị redirect tới Apple
```

### Android — test đầy đủ

```
1. Settings → WiFi → kết nối HCMUS-Student
2. Portal mở trong Chrome
3. Đăng nhập guest
4. /network-connecting hiển thị
5. ✅ Redirect tới URL gốc (hoặc /session)
6. ✅ Internet hoạt động
```

### Edge cases cần test

| Case | Mô tả | Expected |
|------|-------|----------|
| Guest login sai password | User nhập sai mật khẩu | Hiển thị lỗi, không redirect |
| Guest login đúng → vào CNA | Luồng chuẩn | iOS detect → "Done" |
| Google SSO → vào CNA | OAuth callback | authorize device → /network-connecting → detect |
| User đã login → reconnect WiFi | Auto-authorize (providers.tsx) | Vào thẳng /network-connecting |
| Mất mạng trong lúc polling | Google không respond | Poll tiếp tục, timeout message |
| Safari browser (không CNA) | User tự mở portal | Vào URL gốc hoặc /session |

---

## Xử lý sự cố thường gặp

### "X" không chuyển thành "Done" sau redirect

1. Kiểm tra backend đã whitelist thiết bị (MAC/IP) chưa
2. Kiểm tra traffic tới `captive.apple.com` có bị chặn không
3. Kiểm tra UniFi controller có allow Apple domains không
4. Thử redirect tới `http://www.google.com` thay vì URL gốc

### /network-connecting không redirect (browser)

1. Kiểm tra `sessionStorage.getItem('captiveOriginalUrl')` có giá trị không
2. Kiểm tra console browser có lỗi không
3. Kiểm tra `onComplete` có được gọi không (log "Chuyển sang màn hình Session")
4. Nếu dính ở màn hình success, nguyên nhân: `onComplete` bị clear timeout do re-render → cần `useCallback`

### OAuth không authorize device

Sau OAuth callback, captive params mất trên URL. Cần:

- Giải pháp hiện tại: authorize device dựa vào `getStoredCaptivePortalContext()` từ localStorage (đã lưu trước OAuth)
- Nếu localStorage bị xóa (privacy settings): cần lưu context vào sessionStorage hoặc truyền qua state
