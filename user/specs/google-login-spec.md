# Đặc Tả Chức Năng Đăng Nhập Google

## 1. Tổng quan

- Tính năng: Đăng nhập bằng Google (OAuth2)
- Hệ thống: HCMUS WiFi Management (cổng người dùng Frontend)
- Phân hệ: Xác thực (Authentication)
- Mục tiêu: Cho phép người dùng đăng nhập nhanh bằng Google, sau đó vào trang home (`/session`).

## 2. Các endpoint hiện tại

- Endpoint FE dùng để khởi tạo đăng nhập (redirect):
  - `GET {API_BASE_URL}/api/v1/oauth2/google`
- Endpoint callback của backend (Google redirect về backend):
  - `/login/oauth2/code/google`
- Endpoint backend redirect ngược về FE sau khi thành công (hiện tại):
  - `http://localhost:3003/auth/success?access_token=...`

## 3. Luồng chức năng

1. Người dùng bấm nút `Google` tại màn hình Login.
2. FE redirect trình duyệt đến endpoint khởi tạo OAuth2 của backend.
3. Backend redirect sang màn hình consent của Google.
4. Sau khi người dùng đồng ý, Google callback về backend qua `/login/oauth2/code/google`.
5. Backend xác thực thành công và redirect về FE route `/auth/success`.
6. FE route `/auth/success` xử lý kết quả và điều hướng vào `/session`.

## 4. Phạm vi triển khai FE

### 4.1 Kích hoạt đăng nhập

- File: `src/features/auth/api/authApi.ts`
- Hàm: `startOAuth2Login(provider)`
- Logic:
  - Nếu provider là `google` thì redirect bằng `window.location.href`.
  - Không dùng fetch/axios cho bước authorize.

### 4.2 Xử lý callback

- File: `src/pages/OAuthSuccess.tsx`
- Route: `/auth/success`
- Logic hiện tại:
  - Đọc query `access_token`.
  - Đặt trạng thái app đã đăng nhập (`portalLoggedIn`).
  - Xóa token khỏi URL bằng `history.replaceState`.
  - Redirect đến `/session` (hoặc `oauth2_redirect_back` nếu có).

### 4.3 Khai báo route

- File: `src/App.tsx`
- Đã đăng ký route `/auth/success`.

## 5. Yêu cầu bảo mật (bắt buộc)

### 5.1 Nguyên tắc HttpOnly Cookie

- FE KHÔNG thể tự tạo cookie `HttpOnly` bằng JavaScript.
- Cookie `HttpOnly` bắt buộc do backend set qua header `Set-Cookie`.
- FE chỉ chịu trách nhiệm điều hướng và cập nhật UI.

### 5.2 Luồng khuyến nghị cho production

1. Backend OAuth2 success:
  - Set cookie access token: `HttpOnly`, `Secure`, `SameSite` phù hợp.
  - (Tùy chọn) set refresh token cookie riêng.
2. Backend redirect FE về `/auth/success` KHÔNG kèm `access_token` trên query.
3. FE gọi endpoint profile (ví dụ `/api/v1/auth/me`) bằng cookie để lấy thông tin người dùng.
4. Nếu profile hợp lệ thì vào `/session`; ngược lại quay về `/login`.

## 6. Xử lý lỗi

### 6.1 Lỗi OAuth

- Nếu người dùng hủy consent hoặc backend trả lỗi:
  - Redirect về `/login`
  - Hiển thị thông báo thân thiện: `Đăng nhập Google thất bại. Vui lòng thử lại.`

### 6.2 Callback không hợp lệ

- Nếu `/auth/success` không có thông tin hợp lệ:
  - Không set trạng thái đăng nhập
  - Redirect về `/login`

## 7. Data contract

### 7.1 Success redirect hiện tại (tạm thời)

`/auth/success?access_token=<jwt>`

### 7.2 Success redirect mục tiêu (khuyến nghị)

`/auth/success`

Cookie đã được backend set sẵn:

- `access_token` (HttpOnly)
- `refresh_token` (HttpOnly, tùy chọn)

## 8. Test case QA

1. Luồng thành công:
  - Bấm Google -> consent -> vào `/session`.
2. Người dùng từ chối consent:
  - Phải quay lại `/login`, hiển thị thông báo lỗi.
3. Callback không hợp lệ:
  - Truy cập trực tiếp `/auth/success` không có ngữ cảnh -> quay lại `/login`.
4. Vệ sinh URL:
  - Sau khi thành công, không còn token trên thanh địa chỉ.
5. Duy trì phiên:
  - Refresh trang `/session` vẫn giữ trạng thái đăng nhập theo policy auth hiện hành.

## 9. Ghi chú cho backend team

- Nếu mục tiêu bảo mật là `HttpOnly cookie`, backend cần chuyển sang mode cookie-based auth thống nhất.
- Không nên trả access token qua query string trong production.
- Cần whitelist đúng origin FE và đúng redirect URI cho từng môi trường (local, staging, production).

---

Phiên bản: 1.0
Cập nhật: 2026-04-01
Chủ sở hữu: Frontend Auth Module
