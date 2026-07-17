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

Sau khi internet được xác nhận (Google respond), điều hướng CNA webview tới một **URL thực tế trên internet** thành công → iOS phát hiện mạng đã mở → tự động cập nhật nút.

Cụ thể, ưu tiên điều hướng tới **URL gốc** người dùng định truy cập trước khi bị redirect vào portal (tham số `url` trong captive context). Đây là URL do UniFi Controller cung cấp khi chuyển hướng thiết bị vào portal.

### Luồng xử lý chi tiết

```

Request WiFi → iOS mở CNA (WKWebView)
       ↓
UniFi redirect → /login?id=<mac>&ap=<ap>&ssid=<ssid>&url=<original_url>
       ↓
Lưu captive context (gồm originalUrl) vào localStorage + sessionStorage
       ↓
Người dùng đăng nhập (Guest / SSO)
       ↓
Authorize device (whitelist MAC/IP qua API)
       ↓
Chuyển hướng → /network-connecting
       ↓
Poll https://www.google.com/favicon.ico mỗi 2 giây
       ↓
Có internet?
  ├── NO  → tiếp tục poll
  └── YES → kiểm tra originalUrl
              ├── CÓ originalUrl → window.location.href = originalUrl
              │                    ├── Trong CNA: iOS detect → đổi "X" → "Done" ✓
              │                    └── Browser: vào đúng trang người dùng muốn ✓
              │
              └── KHÔNG → kiểm tra platform
                           ├── iOS → redirect http://captive.apple.com/hotspot-detect.html
                           │         → iOS detect → đổi "X" → "Done" ✓
                           │
                           └── Android → vào /session (quản lý phiên) ✓
```

### Components tham gia

| Component | Vai trò |
|-----------|---------|
| `saveCaptivePortalContext()` | Lưu captive context vào localStorage + sessionStorage (bao gồm originalUrl) |
| `/network-connecting` page | Poll Google, quyết định redirect target dựa trên originalUrl & platform |
| `NetworkConnectingScreen` | UI polling, hiển thị trạng thái kết nối |
| `captiveOriginalUrl` (sessionStorage) | Lưu originalUrl xuyên suốt flow, không bị ảnh hưởng bởi việc xóa localStorage |

### Xử lý theo từng scenario

| Scenario | originalUrl | Platform | Redirect target | Kết quả |
|----------|-------------|----------|-----------------|---------|
| User trong CNA, đang truy cập Google | `http://google.com` | iOS | `http://google.com` | CNA load Google thành công → iOS detect → "Done" |
| User trong CNA, CNA tự động mở (không có URL cụ thể) | Apple detection URL hoặc empty | iOS | `http://captive.apple.com/hotspot-detect.html` | CNA load Apple → iOS detect → "Done" |
| User dùng Safari mở portal (browser) | URL gốc user định vào | iOS/Android | URL gốc | User vào đúng trang mong muốn |
| User dùng browser, không có URL gốc | empty | Android | `/session` | Vào session quản lý phiên |
| User dùng browser, không có URL gốc | empty | iOS | `/session` hoặc Apple URL | Vào session (không cần CNA) |

### Lưu ý quan trọng

1. **originalUrl luôn tồn tại khi có captive context**: UniFi Controller luôn gửi tham số `url` khi redirect. `extractCaptivePortalContext()` yêu cầu field này (validate trong code).

2. **sessionStorage giữ originalUrl an toàn**: `saveCaptivePortalContext` lưu originalUrl vào cả localStorage và sessionStorage. Quá trình authorize device chỉ xóa localStorage, không ảnh hưởng sessionStorage → URL luôn có mặt khi `/network-connecting` cần.

3. **Không cần phân biệt CNA vs Browser**: Giải pháp dùng originalUrl làm mục tiêu redirect giải quyết đồng thời cả hai trường hợp:
   - Trong CNA: load URL thành công → iOS detect → đổi nút
   - Trong browser: user vào được trang họ muốn truy cập

4. **Fallback an toàn**: Khi không có originalUrl (edge case hiếm), dùng Apple URL cho iOS và /session cho Android.

### So sánh với giải pháp cũ

| Khía cạnh | Giải pháp cũ (chỉ redirect Apple) | Giải pháp mới (originalUrl ưu tiên) |
|-----------|-----------------------------------|-------------------------------------|
| CNA iOS | Redirect Apple → detect OK | Redirect originalUrl → detect OK, tốt hơn (user vào đúng trang) |
| Browser iOS | Redirect Apple → UX tệ (Success page) | Redirect originalUrl → user vào trang mong muốn |
| Browser Android | Vào /session | Vào /session (giống) |
| Phụ thuộc state | sessionStorage flag | sessionStorage lưu originalUrl |
| Độ phức tạp | Hook riêng + flag | Logic trực tiếp tại /network-connecting |

---

## Quy trình kiểm thử trên thiết bị thật

### iOS (CNA)

1. Forget WiFi HCMUS, reconnect
2. Đợi CNA mở portal
3. Đăng nhập guest (hoặc SSO)
4. Quan sát màn hình `/network-connecting` hiển thị
5. Khi polling hoàn tất (chữ xanh "Kết nối mạng thành công!")
6. **Xác nhận**: Trình duyệt CNA tự động chuyển hướng đến URL gốc (hoặc Apple URL)
7. **Xác nhận**: Nút "X" tự động chuyển thành "Done" (có thể mất 1-3 giây sau redirect)
8. Tap "Done" → CNA đóng → user có internet

### Browser (Safari / Chrome)

1. Mở Safari, vào portal (https://guest.hcmus.edu.vn/login)
2. Đăng nhập guest
3. Quan sát `/network-connecting` hiển thị
4. Khi hoàn tất → redirect đến URL gốc hoặc `/session`
5. **Xác nhận**: User vào đúng trang mong muốn, không bị redirect tới Apple

### Android

1. Kết nối WiFi → portal mở trong browser
2. Đăng nhập guest
3. Quan sát `/network-connecting` hiển thị
4. Khi hoàn tất → redirect đến URL gốc hoặc `/session`
5. **Xác nhận**: User vào đúng trang, không có CNA button issue

---

## Kiến trúc dữ liệu

### Captive Context (từ UniFi Controller)

```
Query params from UniFi redirect:
  id    = MAC của thiết bị (device)
  ap    = MAC của Access Point
  ssid  = Tên WiFi (ví dụ: "HCMUS-Student")
  url   = URL gốc người dùng muốn truy cập
  t     = Timestamp (optional)
```

### Lưu trữ

| Key | Storage | Mục đích | Vòng đời |
|-----|---------|----------|----------|
| `portalCaptiveContext` | localStorage | Device authorization payload | Tạo khi vào portal, xóa sau authorize |
| `captiveOriginalUrl` | sessionStorage | Redirect target sau khi có internet | Tạo khi vào portal, xóa sau khi redirect |

sessionStorage được ưu tiên cho `originalUrl` vì nó sống cùng tab và không bị ảnh hưởng bởi các thao tác xóa localStorage trong flow authorize.
