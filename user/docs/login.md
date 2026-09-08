# API Xác thực (wifi-user)

Đường dẫn gốc: `/{version}/auth` (ví dụ: `/v1/auth`)

Tài liệu này mô tả các endpoint trong `AuthController` và thứ tự frontend nên gọi khi xử lý xác thực người dùng.

**Tóm tắt luồng**

- Bước 1: `POST /init-session` — khởi tạo thiết bị/phiên và nhận `login_token` ngắn hạn.
- Bước 2: `POST /login` — gửi kèm header `Authorization: Bearer <login_token>` cùng thông tin đăng nhập để nhận `dynamic token` của ứng dụng.
- Bước 3: Dùng `dynamic token` trong header `Authorization: Bearer <token>` để gọi các endpoint bảo vệ (vd. `/me`).
- Bước 4: Khi cần làm mới token, `POST /refresh-token` để nhận token mới.
- Bước 5: `POST /logout` để kết thúc phiên (body tùy chọn `device_mac` để huỷ ủy quyền thiết bị).

**Ghi chú về token**

- `init-session` trả về một _login token_ ngắn hạn do core phát; đưa token này vào header `Authorization` khi gọi `/login`.
- `/login` trả về một _dynamic token_ (JWT ứng dụng). Dùng token này cho các request được bảo vệ.
- Dynamic token chứa bên trong core `access_token`/`refresh_token` — frontend không cần quản lý core token trực tiếp.
- `/refresh-token` nhận dynamic token cũ (xem ví dụ) và trả về dynamic token mới.

---

## 1) Khởi tạo phiên (init-session)

- URL: `POST /{version}/auth/init-session`
- Auth: không
- Mục đích: đăng ký `deviceId` và nhận `login_token` ngắn hạn để dùng cho `/login`.

Request Body (JSON):

```json
{
  "deviceId": "device-001"
}
```

Response (200) - ApiResponse với phần `data` chứa kết quả từ core:

Ví dụ:

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

Frontend: lấy `data.login_token` và chèn vào header `Authorization` khi gọi `/login`.

---

## 2) Đăng nhập (login)

- URL: `POST https://dev.wifi.adstechnology.vn/api/user/v1/auth/login`
- Auth: header `Authorization: Bearer <login_token>` (login token từ bước 1)
- Mục đích: xác thực thông tin đăng nhập qua ads-core và nhận `dynamic token` ứng dụng.

Request Body (JSON):

```json
{
  "identifier": "john.doe@example.com",
  "password": "correct-horse-battery",
  "deviceId": "device-001"
}
```

Ghi chú:

- `deviceId` phải trùng với deviceId đã dùng ở `init-session`.

Response (200) - ApiResponse<LoginResponse>, phần `data` ví dụ:

```json
{
  "code": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "role": "CAN_BO"
  }
}
```

Frontend: lưu `data.token` (dynamic token) và dùng `Authorization: Bearer <token>` cho các request tiếp theo.

---

## 3) Lấy thông tin user hiện tại (`/me`)

- URL: `GET https://dev.wifi.adstechnology.vn/api/user/v1/auth/me`
- Auth: bắt buộc — `Authorization: Bearer <dynamic_token>`
- Mục đích: trả về hồ sơ đầy đủ của user, bao gồm nhóm, role, policy và các provider đã liên kết.

Response (200) - ApiResponse<UserMeResponse>

Ví dụ:

```json
{
  "code": 200,
  "message": "Thành công",
  "data": {
    "id": 1,
    "username": "john.doe@example.com",
    "email": "john.doe@example.com",
    "phone": "+84901234567",
    "fullName": "John Doe",
    "status": "ACTIVE",
    "roles": ["CAN_BO"],
    "groups": [{ "id": 1, "name": "Cán bộ", "roleName": "CAN_BO" }],
    "policies": [],
    "linkedProviders": []
  }
}
```

---

## 4) Làm mới token (refresh-token)

- URL: `POST /{version}/auth/refresh-token`
- Auth: header không bắt buộc; endpoint này nhận **dynamic token cũ** trong body trường `refresh_token` (tên legacy trong DTO).
- Mục đích: đổi dynamic token cũ lấy dynamic token mới (server sẽ lấy `refresh_token` thực từ trong dynamic token và gọi ads-core để refresh).

Request Body (JSON):

```json
{
  "refresh_token": "<OLD_DYNAMIC_TOKEN>"
}
```

Response (200) - ApiResponse<WifiLoginResponse>

Ví dụ:

```json
{
  "code": 200,
  "message": "Làm mới token thành công",
  "data": {
    "token": "<NEW_DYNAMIC_TOKEN>"
  }
}
```

Ghi chú / phương án khác:

- Controller nhận xét rằng có thể hỗ trợ gửi `refresh_token` qua cookie HttpOnly tên `refresh_token`. Nếu frontend lưu cookie đó, server có thể dùng nó. Tuy nhiên cách an toàn và tương thích nhất là gửi dynamic token cũ trong body như ví dụ trên (theo DTO của controller).

Frontend: khi nhận token mới, thay thế token cũ và tiếp tục hoạt động.

---

## 5) Đăng xuất (logout)

- URL: `POST /{version}/auth/logout`
- Auth: bắt buộc — `Authorization: Bearer <dynamic_token>`
- Mục đích: thu hồi refresh token trên server, đưa dynamic token vào blacklist, và (tuỳ chọn) deauthorize thiết bị trên UniFi.

Request Body (JSON) — tùy chọn:

```json
{
  "device_mac": "aa:bb:cc:dd:ee:ff"
}
```

Response (200):

```json
{
  "code": 200,
  "message": "Đăng xuất thành công"
}
```

Ghi chú:

- Client KHÔNG cần gửi `refresh_token` của core; backend sẽ giải mã dynamic token để lấy và xoá refresh token từ Redis.
- Backend cũng sẽ cố gắng gọi core logout và deauthorize thiết bị (best-effort).

---

## Ví dụ cURL

Khởi tạo phiên:

```bash
curl -X POST "https://api.example.com/v1/auth/init-session" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"device-001"}'
```

Đăng nhập (dùng login_token từ bước trước):

```bash
curl -X POST "https://api.example.com/v1/auth/login" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <LOGIN_TOKEN>" \
  -d '{"identifier":"john.doe@example.com","password":"secret123","deviceId":"device-001"}'
```

Lấy hồ sơ:

```bash
curl -X GET "https://api.example.com/v1/auth/me" \
  -H "Authorization: Bearer <DYNAMIC_TOKEN>"
```

Làm mới token:

```bash
curl -X POST "https://api.example.com/v1/auth/refresh-token" \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"<OLD_DYNAMIC_TOKEN>"}'
```

Đăng xuất:

```bash
curl -X POST "https://api.example.com/v1/auth/logout" \
  -H "Authorization: Bearer <DYNAMIC_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"device_mac":"aa:bb:cc:dd:ee:ff"}'
```

---

## Checklist cho frontend

- Gọi `POST /init-session` trước với `deviceId`.
- Dùng `login_token` trả về làm header khi gọi `POST /login`.
- Lưu `dynamic token` trả về và dùng `Authorization: Bearer <token>` cho các endpoint được bảo vệ.
- Khi cần làm mới token, gọi `POST /refresh-token` với dynamic token cũ trong trường `refresh_token` của body (hoặc dùng cookie HttpOnly nếu triển khai cookie).
- Gọi `POST /logout` với header `Authorization` để kết thúc phiên; có thể gửi `device_mac` nếu muốn deauthorize thiết bị.

Nếu bạn muốn, tôi có thể tạo bộ Postman hoặc sơ đồ trình tự cho luồng này.
