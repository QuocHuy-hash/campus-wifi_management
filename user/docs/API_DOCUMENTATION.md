# WiFi User Backend — API Integration Guide for Frontend

> Tài liệu tổng hợp toàn bộ API của backend `wifi-user` (Spring Boot) để tích hợp Frontend.
> Dựa trên mã nguồn hiện tại: `AuthController`, `OAuth2Controller`, `UserController`, `UserSessionController`, `SettingController`.

---

## 1. Thông tin chung

### 1.1 Base URL

Controller trong mã nguồn được định nghĩa với prefix `/{version}`.

```text
Local dev:  http://localhost:8080/{version}
Ví dụ:      http://localhost:8080/v1/auth/login
```

> **Lưu ý triển khai:** Khi đứng sau API Gateway / Reverse Proxy, URL thực tế có thể có thêm prefix, ví dụ `/api/user/{version}` (cấu hình Swagger sử dụng `/api/user/v3/api-docs`).
> FE nên lấy base URL từ biến môi trường (`VITE_API_BASE_URL`, `.env`...) thay vì hard-code.

### 1.2 Phiên bản API

Các controller sử dụng path variable `{version}`. Hiện tại dùng `v1`.

### 1.3 Định dạng JSON

- Tất cả request/response body đều là **JSON**.
- Backend cấu hình Jackson `property-naming-strategy: SNAKE_CASE`, nên mọi field JSON đều ở dạng `snake_case`:
  - `deviceId` → `device_id`
  - `deviceMac` → `device_mac`
  - `refreshToken` → `refresh_token`
  - `apMac` → `ap_mac`

### 1.4 Response wrapper

Mọi API đều trả về wrapper `ApiResponse<T>`:

```json
{
  "code": 200,
  "message": "Thành công",
  "data": { ... }
}
```

- `code`: HTTP status code (200, 400, 401, 403, 500...).
- `message`: Mô tả kết quả bằng tiếng Việt.
- `data`: Dữ liệu trả về. Nếu API không có dữ liệu thì field này có thể bị bỏ (`@JsonInclude(NON_NULL)`).

### 1.5 Error response

Khi xảy ra lỗi, response có dạng:

```json
{
  "code": 401,
  "message": "Token không hợp lệ",
  "error": "Unauthorized",
  "path": "/v1/auth/me",
  "timestamp": 1695000000000
}
```

- `code`: mã lỗi/business code.
- `message`: mô tả lỗi.
- `error`: loại lỗi.
- `path`: endpoint bị lỗi.
- `timestamp`: thời điểm xảy ra lỗi (epoch milliseconds).

### 1.6 Cơ chế xác thực

Backend sử dụng **stateless JWT Bearer token**.

- Các endpoint public: không cần token.
- Các endpoint protected: yêu cầu header:

```http
Authorization: Bearer <dynamic_token>
```

Luồng token:

1. `POST /v1/auth/init-session` → trả về `login_token` (ngắn hạn).
2. `POST /v1/auth/login` → gửi kèm `Authorization: Bearer <login_token>` → trả về `dynamic_token`.
3. Các request sau đó dùng `Authorization: Bearer <dynamic_token>`.
4. Khi `dynamic_token` hết hạn: `POST /v1/auth/refresh-token` để lấy token mới.

---

## 2. Danh sách endpoint theo nhóm

### 2.1 Authentication — `/{version}/auth`

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/{version}/auth/init-session` | Public | Khởi tạo phiên, nhận login token |
| POST | `/{version}/auth/login` | Public + login token header | Đăng nhập username/password |
| POST | `/{version}/auth/register` | Public | Đăng ký tài khoản mới |
| POST | `/{version}/auth/verify-otp` | Public | Xác thực OTP kích hoạt tài khoản |
| POST | `/{version}/auth/resend-otp` | Public | Gửi lại OTP |
| POST | `/{version}/auth/forgot-password` | Public | Quên mật khẩu — gửi OTP |
| POST | `/{version}/auth/verify-reset-otp` | Public | Xác thực OTP reset mật khẩu |
| POST | `/{version}/auth/reset-password` | Public | Đặt lại mật khẩu |
| POST | `/{version}/auth/telegram/callback` | Public | Đăng nhập bằng Telegram Widget |
| POST | `/{version}/auth/refresh-token` | Public | Làm mới dynamic token |
| POST | `/{version}/auth/logout` | Bearer | Đăng xuất, huỷ token |
| GET | `/{version}/auth/me` | Bearer | Lấy thông tin user hiện tại |
| PUT | `/{version}/auth/me` | Bearer | Cập nhật hồ sơ user |
| POST | `/{version}/auth/change-password` | Bearer | Đổi mật khẩu |
| POST | `/{version}/auth/link-provider` | Bearer | Liên kết OAuth2 provider |

### 2.2 OAuth2 — `/{version}/oauth2`

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/{version}/oauth2/initialize` | Public | Khởi tạo OAuth2 state, set cookie |
| GET | `/{version}/oauth2/authorize/{provider}` | Public | Redirect sang trang login OAuth2 provider |

### 2.3 Users — `/{version}/users`

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| PUT | `/{version}/users/authorize-device` | Bearer | Đăng ký/authorize thiết bị WiFi từ UniFi |
| DELETE | `/{version}/users/unauthorize-device` | Bearer | Huỷ đăng ký thiết bị trên UniFi |

### 2.4 User Sessions — `/{version}/user-sessions`

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/{version}/user-sessions` | Bearer | Danh sách tất cả session (admin/filter) |
| GET | `/{version}/user-sessions/me` | Bearer | Danh sách session của user hiện tại |

### 2.5 Settings — `/{version}/settings`

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/{version}/settings` | Bearer | Danh sách cấu hình hệ thống |
| GET | `/{version}/settings/{fieldName}` | Bearer | Chi tiết cấu hình theo field name |

---

## 3. Chi tiết từng endpoint

### 3.1 Auth

#### POST `/{version}/auth/init-session`

Khởi tạo phiên thiết bị, nhận `login_token` ngắn hạn để dùng cho `/login`.

**Request:**

```json
{
  "device_id": "device-001"
}
```

**Response (data là object tuỳ core trả về, ví dụ):**

```json
{
  "code": 200,
  "message": "Khởi tạo phiên thành công",
  "data": {
    "login_token": "eyJ...",
    "expires_in": 30
  }
}
```

---

#### POST `/{version}/auth/login`

Đăng nhập bằng username/password.

**Headers:**

```http
Authorization: Bearer <login_token>
Content-Type: application/json
```

**Request:**

```json
{
  "identifier": "john.doe@example.com",
  "password": "Str0ngP@ss!",
  "device_id": "device-001"
}
```

- `identifier`: email hoặc số điện thoại.
- `device_id`: phải trùng với `device_id` đã dùng ở `init-session`.

**Response:**

```json
{
  "code": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "role": "CAN_BO"
  }
}
```

- `token`: dynamic token dùng cho các request được bảo vệ.
- `role`: role của user.

---

#### POST `/{version}/auth/register`

Đăng ký tài khoản mới. Hệ thống sẽ gửi OTP để xác thực.

**Request:**

```json
{
  "identifier": "john.doe@example.com",
  "password": "Str0ngP@ss!"
}
```

- `password`: tối thiểu 8 ký tự.

**Response:**

```json
{
  "code": 200,
  "message": "Đăng ký thành công. Vui lòng xác thực tài khoản bằng OTP",
  "data": {
    "id": 1,
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "status": "PENDING",
    "email_verified": false,
    "created_date": "2026-09-04T00:00:00Z",
    "notice": "OTP đã được gửi"
  }
}
```

---

#### POST `/{version}/auth/verify-otp`

Xác thực OTP để kích hoạt tài khoản.

**Request:**

```json
{
  "identifier": "john.doe@example.com",
  "otp": "123456"
}
```

**Response:**

```json
{
  "code": 200,
  "message": "Xác thực tài khoản thành công",
  "data": {
    "identifier": "john.doe@example.com",
    "status": "ACTIVE",
    "verified": true
  }
}
```

---

#### POST `/{version}/auth/resend-otp`

Gửi lại OTP cho tài khoản chưa xác thực.

**Request:**

```json
{
  "identifier": "john.doe@example.com"
}
```

**Response:**

```json
{
  "code": 200,
  "message": "Gửi lại OTP thành công",
  "data": {
    "identifier": "john.doe@example.com",
    "message": "OTP đã được gửi lại"
  }
}
```

---

#### POST `/{version}/auth/forgot-password`

Bước 1 quên mật khẩu — gửi OTP đến email/SĐT.

**Request:**

```json
{
  "identifier": "john.doe@example.com"
}
```

**Response:**

```json
{
  "code": 200,
  "message": "OTP đặt lại mật khẩu đã được gửi đến email/SĐT của bạn"
}
```

---

#### POST `/{version}/auth/verify-reset-otp`

Bước 2 — xác thực OTP và nhận reset token (UUID, TTL 30 phút).

**Request:**

```json
{
  "identifier": "john.doe@example.com",
  "otp": "123456"
}
```

**Response:**

```json
{
  "code": 200,
  "message": "Xác thực OTP thành công",
  "data": "reset-token-uuid-abc123"
}
```

---

#### POST `/{version}/auth/reset-password`

Bước 3 — đặt lại mật khẩu bằng reset token.

**Request:**

```json
{
  "token": "reset-token-uuid-abc123",
  "new_password": "NewPass123"
}
```

- `new_password`: tối thiểu 8 ký tự, phải chứa ít nhất 1 chữ số.

**Response:**

```json
{
  "code": 200,
  "message": "Đặt lại mật khẩu thành công"
}
```

---

#### POST `/{version}/auth/telegram/callback`

Đăng nhập bằng Telegram Widget.

**Cookie (tuỳ chọn):**

```http
Cookie: portal_state=<state>
```

**Request:**

```json
{
  "id": 123456789,
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "photo_url": "https://t.me/i/userpic/...",
  "auth_date": 1695000000,
  "hash": "..."
}
```

**Response:** giống `POST /login` (ApiResponse<LoginResponse>).

---

#### POST `/{version}/auth/refresh-token`

Làm mới dynamic token.

**Request:**

```json
{
  "refresh_token": "<OLD_DYNAMIC_TOKEN>"
}
```

**Response:**

```json
{
  "code": 200,
  "message": "Làm mới token thành công",
  "data": {
    "token": "<NEW_DYNAMIC_TOKEN>"
  }
}
```

---

#### POST `/{version}/auth/logout`

Đăng xuất. Backend tự decode dynamic token để lấy refresh token và blacklist.

**Headers:**

```http
Authorization: Bearer <dynamic_token>
```

**Request (body tuỳ chọn):**

```json
{
  "device_mac": "aa:bb:cc:dd:ee:ff"
}
```

- `device_mac`: nếu truyền, backend sẽ deauthorize thiết bị trên UniFi.

**Response:**

```json
{
  "code": 200,
  "message": "Đăng xuất thành công"
}
```

---

#### GET `/{version}/auth/me`

Lấy thông tin hồ sơ user đang đăng nhập.

**Headers:**

```http
Authorization: Bearer <dynamic_token>
```

**Response:**

```json
{
  "code": 200,
  "message": "Thành công",
  "data": {
    "id": 1,
    "username": "john.doe@example.com",
    "email": "john.doe@example.com",
    "phone": "+84901234567",
    "full_name": "John Doe",
    "identity_code": "21120001",
    "avatar_url": "https://example.com/avatar.jpg",
    "status": "ACTIVE",
    "email_verified": true,
    "phone_verified": false,
    "last_login_at": "2026-09-04T00:00:00Z",
    "created_date": "2026-09-01T00:00:00Z",
    "user_type": "STUDENT",
    "roles": ["CAN_BO"],
    "groups": [
      {
        "id": 1,
        "name": "Cán bộ",
        "role_name": "CAN_BO"
      }
    ],
    "policies": [
      {
        "id": 1,
        "policy_code": "STUDENT_POLICY",
        "policy_name": "Student WiFi Policy",
        "policy_type": "HYBRID",
        "is_active": true,
        "default_action": "ALLOW",
        "priority": 100
      }
    ],
    "linked_providers": [
      {
        "provider": "google",
        "provider_email": "user@gmail.com",
        "avatar_url": "https://...",
        "is_active": true,
        "linked_at": "2026-09-01T00:00:00Z",
        "last_used_at": "2026-09-04T00:00:00Z"
      }
    ]
  }
}
```

---

#### PUT `/{version}/auth/me`

Cập nhật hồ sơ user hiện tại. Chỉ cho phép cập nhật `full_name`, `phone`, `avatar_url`.

**Headers:**

```http
Authorization: Bearer <dynamic_token>
```

**Request:**

```json
{
  "full_name": "John Updated",
  "phone": "+84987654321",
  "avatar_url": "https://example.com/new-avatar.jpg"
}
```

**Response:** trả về `UserMeResponse` giống `GET /me`.

---

#### POST `/{version}/auth/change-password`

Đổi mật khẩu cho user đang đăng nhập.

**Headers:**

```http
Authorization: Bearer <dynamic_token>
```

**Request:**

```json
{
  "current_password": "OldP@ss123",
  "new_password": "NewP@ss456",
  "confirm_password": "NewP@ss456"
}
```

**Response:**

```json
{
  "code": 200,
  "message": "Đổi mật khẩu thành công"
}
```

---

#### POST `/{version}/auth/link-provider`

Liên kết tài khoản OAuth2 provider (Google, Azure...) với tài khoản hiện tại.

**Headers:**

```http
Authorization: Bearer <dynamic_token>
```

**Request:**

```json
{
  "provider": "google",
  "provider_user_id": "1234567890",
  "provider_email": "user@gmail.com",
  "avatar_url": "https://example.com/avatar.jpg",
  "access_token": "ya29.a0..."
}
```

**Response:**

```json
{
  "code": 200,
  "message": "Liên kết provider thành công"
}
```

---

### 3.2 OAuth2

#### POST `/{version}/oauth2/initialize`

Khởi tạo OAuth2 state. Backend set cookie `portal_state` (HttpOnly, 5 phút) và trả về URL để redirect.

**Request:**

```json
{
  "device_mac": "aa:bb:cc:dd:ee:ff",
  "ap_mac": "78:8a:20:66:11:7c",
  "ssid": "HCMUS-I85",
  "redirect_url": "https://portal.example.com/callback",
  "provider": "google",
  "device_type": "LAPTOP",
  "device_name": "MacBook Pro"
}
```

- `device_mac`, `redirect_url`, `provider`: bắt buộc.

**Response:**

```json
{
  "code": 200,
  "message": "Khởi tạo OAuth2 thành công",
  "data": {
    "state": "uuid-state-abc123",
    "provider": "google",
    "authorize_url": "/oauth2/authorization/google?portal_state=uuid-state-abc123"
  }
}
```

> Frontend sau đó redirect user đến `authorize_url` (hoặc gọi `GET /oauth2/authorize/{provider}`).

---

#### GET `/{version}/oauth2/authorize/{provider}`

Redirect sang trang đăng nhập của OAuth2 provider.

**Path params:**

- `provider`: `google`, `azure`, v.v.

**Query params (tuỳ chọn):**

- `portal_state`: state từ bước initialize.

**Response:** HTTP 302 redirect sang `/oauth2/authorization/{provider}`.

---

### 3.3 Users

#### PUT `/{version}/users/authorize-device`

Đăng ký và authorize thiết bị WiFi từ UniFi Controller.

**Headers:**

```http
Authorization: Bearer <dynamic_token>
Content-Type: application/json
```

**Request (snake_case, có annotation `@SnakeCaseModel`):**

```json
{
  "device_mac": "aa:bb:cc:dd:ee:ff",
  "ap_mac": "78:8a:20:66:11:7c",
  "device_client_id": "6736d12e-8521-3554-a0f9-e01d93852c91",
  "ssid": "HCMUS-I85",
  "device_type": "LAPTOP",
  "device_name": "MacBook Pro",
  "operating_system": "Windows 11",
  "manufacturer": "Dell",
  "user_ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "duration": 480,
  "data_limit": 2048,
  "up_bandwidth": 1024,
  "down_bandwidth": 2048
}
```

- `device_mac`: bắt buộc.
- `duration`, `data_limit`, `up_bandwidth`, `down_bandwidth`: tuỳ chọn, ghi đè policy.

**Response:**

```json
{
  "code": 200,
  "message": "Đăng ký thiết bị từ UniFi thành công"
}
```

---

#### DELETE `/{version}/users/unauthorize-device`

Huỷ đăng ký thiết bị trên UniFi Controller.

**Headers:**

```http
Authorization: Bearer <dynamic_token>
Content-Type: application/json
```

**Request:**

```json
{
  "device_mac": "aa:bb:cc:dd:ee:ff"
}
```

**Response:**

```json
{
  "code": 200,
  "message": "Huỷ đăng ký thiết bị thành công"
}
```

---

### 3.4 User Sessions

#### GET `/{version}/user-sessions`

Lấy danh sách session với bộ lọc và phân trang (admin/query).

**Headers:**

```http
Authorization: Bearer <dynamic_token>
```

**Query params:**

| Param | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `user_id` | Long | Không | Lọc theo user ID |
| `status` | String | Không | `ACTIVE`, `ENDED`, `EXPIRED` |
| `ssid` | String | Không | Lọc theo SSID |
| `start_date` | String | Không | Định dạng `yyyy-MM-dd` |
| `end_date` | String | Không | Định dạng `yyyy-MM-dd` |
| `page` | int | Không | Mặc định `1` |
| `size` | int | Không | Mặc định `10` |

**Response:**

```json
{
  "code": 200,
  "message": "Thành công",
  "data": {
    "current": 1,
    "size": 10,
    "total": 100,
    "pages": 10,
    "records": [
      {
        "session_id": "sess_abc123",
        "ip_address": "192.168.1.100",
        "start_time": "2026-09-04T08:00:00",
        "end_time": "2026-09-04T16:00:00",
        "status": "ACTIVE",
        "created_at": "2026-09-04T08:00:00",
        "ssid": "Campus-WiFi",
        "vlan": "VLAN10",
        "ap_mac": "00:11:22:33:44:55",
        "download_bytes": 1024000,
        "upload_bytes": 512000,
        "terminate_cause": "USER_LOGOUT",
        "device_user_info": {
          "device_id": 1,
          "mac_address": "AA:BB:CC:DD:EE:FF",
          "device_type": "LAPTOP",
          "device_name": "MacBook Pro",
          "user_id": 1,
          "user_name": "Nguyễn Văn A",
          "user_group": "Cán bộ cấp cao"
        }
      }
    ],
    "orders": []
  }
}
```

---

#### GET `/{version}/user-sessions/me`

Lấy danh sách session của user đang đăng nhập.

**Headers:**

```http
Authorization: Bearer <dynamic_token>
```

**Query params:**

| Param | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `start_date` | String | Không | `yyyy-MM-dd` |
| `end_date` | String | Không | `yyyy-MM-dd` |
| `page` | int | Không | Mặc định `1` |
| `size` | int | Không | Mặc định `10` |

**Response:** giống `GET /user-sessions`.

---

### 3.5 Settings

#### GET `/{version}/settings`

Lấy danh sách tất cả cấu hình hệ thống (`core_settings`).

**Headers:**

```http
Authorization: Bearer <dynamic_token>
```

**Response:**

```json
{
  "code": 200,
  "message": "Thành công",
  "data": [
    {
      "field_name": "PORTAL_TITLE",
      "field_value": "WiFi Portal",
      "field_type": 1,
      "note": "Tiêu đề portal",
      "created_by": 1,
      "created_date": "2026-09-01T00:00:00",
      "updated_by": 1,
      "updated_date": "2026-09-04T00:00:00"
    }
  ]
}
```

---

#### GET `/{version}/settings/{fieldName}`

Lấy chi tiết cấu hình theo `field_name`.

**Path params:**

- `fieldName`: tên field cấu hình.

**Response:**

```json
{
  "code": 200,
  "message": "Thành công",
  "data": {
    "field_name": "PORTAL_TITLE",
    "field_value": "WiFi Portal",
    "field_type": 1,
    "note": "Tiêu đề portal",
    "created_by": 1,
    "created_date": "2026-09-01T00:00:00",
    "updated_by": 1,
    "updated_date": "2026-09-04T00:00:00"
  }
}
```

---

## 4. Các enum và giá trị thường gặp

### 4.1 UserStatus

- `PENDING` — Tài khoản vừa đăng ký, chờ xác thực OTP.
- `ACTIVE` — Tài khoản đang hoạt động.
- `INACTIVE` — Tài khoản bị khoá.

### 4.2 UserType

- `STUDENT`
- `LECTURER`
- `STAFF`
- `GUEST`
- `SYSTEM`

### 4.3 SessionStatus

- `ACTIVE`
- `ENDED`
- `EXPIRED`

### 4.4 OAuth2 providers

- `google`
- `azure`

### 4.5 Roles ví dụ

- `STUDENT`
- `LECTURER`
- `STAFF`
- `GUEST`
- `SYSTEM`
- `CAN_BO`

---

## 5. Ghi chú tích hợp Frontend

### 5.1 Luồng đăng nhập thông thường

```
1. POST /v1/auth/init-session
   → nhận login_token

2. POST /v1/auth/login
   Header: Authorization: Bearer <login_token>
   → nhận dynamic_token

3. Các request sau:
   Header: Authorization: Bearer <dynamic_token>

4. Khi token hết hạn:
   POST /v1/auth/refresh-token
   Body: { "refresh_token": "<OLD_DYNAMIC_TOKEN>" }
   → nhận dynamic_token mới

5. Đăng xuất:
   POST /v1/auth/logout
   Header: Authorization: Bearer <dynamic_token>
```

### 5.2 Luồng đăng nhập OAuth2

```
1. POST /v1/oauth2/initialize
   → backend set cookie portal_state
   → nhận authorize_url

2. Redirect user đến authorize_url
   hoặc GET /v1/oauth2/authorize/{provider}

3. User đăng nhập Google/Azure → callback về backend

4. Backend redirect về frontend với token trong URL
   (tuỳ cấu hình OAuth2SuccessHandler)

5. FE lấy token và gọi GET /v1/auth/me
```

### 5.3 Luồng kết nối WiFi (captive portal)

```
1. User đăng nhập thành công (login hoặc OAuth2)
   → có dynamic_token

2. GET /v1/auth/me
   → lấy thông tin user

3. PUT /v1/users/authorize-device
   → gửi thông tin thiết bị từ UniFi (device_mac, ap_mac, ssid...)
   → backend authorize thiết bị qua ads-core

4. Thiết bị được kết nối WiFi
```

### 5.4 CORS và cookie

- Backend đã bật CORS (`CustomCORSConfiguration`). FE cần đảm bảo domain được allow.
- Cookie `portal_state` là HttpOnly, frontend không thể đọc trực tiếp bằng JavaScript.
- Khi triển khai HTTPS, cần đảm bảo cookie `secure=true`.

### 5.5 Swagger / OpenAPI

- Local: `http://localhost:8080/swagger-ui.html`
- API docs: `/v3/api-docs`

> Ghi chú: tùy cấu hình reverse proxy, Swagger UI có thể ở `/api/user/swagger-ui.html`.

### 5.6 Public endpoints (không cần token)

- `POST /{version}/auth/init-session`
- `POST /{version}/auth/login`
- `POST /{version}/auth/register`
- `POST /{version}/auth/verify-otp`
- `POST /{version}/auth/resend-otp`
- `POST /{version}/auth/forgot-password`
- `POST /{version}/auth/verify-reset-otp`
- `POST /{version}/auth/reset-password`
- `POST /{version}/auth/telegram/callback`
- `POST /{version}/auth/refresh-token`
- `GET /{version}/auth/me` (được đặt public để FE kiểm tra trạng thái)
- `POST /{version}/oauth2/initialize`
- `GET /{version}/oauth2/authorize/{provider}`
- `/oauth2/authorization/**`
- `/login/oauth2/**`
- `/swagger-ui/**`, `/v3/api-docs/**`
- `/actuator/health`

Tất cả endpoint còn lại yêu cầu Bearer token.

---

## 6. Ví dụ cURL

### Đăng nhập

```bash
curl -X POST "http://localhost:8080/v1/auth/init-session" \
  -H "Content-Type: application/json" \
  -d '{"device_id":"device-001"}'

curl -X POST "http://localhost:8080/v1/auth/login" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <LOGIN_TOKEN>" \
  -d '{"identifier":"john.doe@example.com","password":"Str0ngP@ss!","device_id":"device-001"}'
```

### Lấy hồ sơ

```bash
curl -X GET "http://localhost:8080/v1/auth/me" \
  -H "Authorization: Bearer <DYNAMIC_TOKEN>"
```

### Authorize thiết bị

```bash
curl -X PUT "http://localhost:8080/v1/users/authorize-device" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <DYNAMIC_TOKEN>" \
  -d '{
    "device_mac": "aa:bb:cc:dd:ee:ff",
    "ap_mac": "78:8a:20:66:11:7c",
    "ssid": "HCMUS-I85"
  }'
```

---

*Cập nhật: 2026-09-04*
