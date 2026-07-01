# Forgot / Reset Password Flow - Tài liệu tích hợp FE

> **Base URL:** `http://{host}:3030`
> **API Version:** `/api/v1`

---

## Common Response Wrapper

Mọi response đều được bọc trong format chuẩn:

```json
{
  "code": 200,
  "message": "...",
  "data": { ... }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `code` | int | HTTP status code (200 = success) |
| `message` | string | Status message |
| `data` | T | Response payload (có thể null) |

---

## 1. Gửi OTP đặt lại mật khẩu

Gửi mã OTP 6 chữ số đến email / SĐT của user. Nếu identifier không tồn tại, API vẫn trả về 200 (không tiết lộ user có tồn tại hay không).

> **OTP TTL:** 15 phút
> **Cooldown:** 60 giây giữa các lần gửi
> **Giới hạn:** tối đa 5 lần gửi trong 15 phút

**Endpoint:** `POST /api/v1/auth/forgot-password`

**Auth:** PUBLIC (không cần Bearer token)

### Request

```json
{
  "identifier": "user@example.com"
}
```

| Field | Type | Rules | Description |
|-------|------|-------|-------------|
| `identifier` | string | required, not blank | Email hoặc số điện thoại |

### Response (success)

```json
{
  "code": 200,
  "message": "Password reset OTP sent to your email/phone",
  "data": null
}
```

### Response (rate limited)

```json
{
  "code": 429,
  "message": "OTP_RESEND_RATE_LIMITED",
  "data": null
}
```

---

## 2. Xác thực OTP + lấy temporary token

**Endpoint:** `POST /api/v1/auth/verify-reset-otp`

**Auth:** PUBLIC

### Request

```json
{
  "identifier": "user@example.com",
  "otp": "123456"
}
```

| Field | Type | Rules | Description |
|-------|------|-------|-------------|
| `identifier` | string | required, not blank | Email hoặc SĐT |
| `otp` | string | required, 6 digits | Mã OTP user nhập |

### Response (success)

```json
{
  "code": 200,
  "message": "OTP verified successfully",
  "data": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

`data` chứa **temporary token** (UUID string). Token có TTL = **30 phút**. Token này dùng để thực hiện reset password ở bước 3.

### Response (OTP sai/hết hạn)

```json
{
  "code": 400,
  "message": "OTP_INVALID_OR_EXPIRED",
  "data": null
}
```

### Response (user không tồn tại)

```json
{
  "code": 404,
  "message": "USER_NOT_FOUND",
  "data": null
}
```

---

## 3. Đặt lại mật khẩu mới

Dùng temporary token từ bước 2 để đặt password mới. Khi thành công, hệ thống tự động:
- Thu hồi tất cả refresh tokens → logout mọi thiết bị
- Gửi email thông báo "password has been changed" (nếu user có email)
- Xoá OTP data và temporary token

**Endpoint:** `POST /api/v1/auth/reset-password`

**Auth:** PUBLIC

### Request

```json
{
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "newPassword": "NewPass123"
}
```

| Field | Type | Rules | Description |
|-------|------|-------|-------------|
| `token` | string | required, not blank | Temporary token từ bước 2 |
| `newPassword` | string | required, min 8 ký tự, phải có ≥1 chữ số | Mật khẩu mới |

> **FE validation:** `password.length >= 8 && /\d/.test(password)`

### Response (success)

```json
{
  "code": 200,
  "message": "Password reset successfully",
  "data": null
}
```

### Response (token không hợp lệ/hết hạn)

```json
{
  "code": 400,
  "message": "TOKEN_INVALID",
  "data": null
}
```

---

## Error Codes Reference

| HTTP Code | `message` | Xảy ra khi |
|-----------|-----------|------------|
| 400 | `OTP_INVALID_OR_EXPIRED` | OTP sai hoặc hết hạn (15 phút) |
| 400 | `TOKEN_INVALID` | Temporary token sai hoặc hết hạn (30 phút) |
| 404 | `USER_NOT_FOUND` | Identifier không tồn tại (step 2, 3) |
| 429 | `OTP_RESEND_RATE_LIMITED` | Gửi OTP quá nhanh (60s cooldown) hoặc >5 lần/15ph |

---

## Flow Sequence

```
[Forgot Password Page]                  [ Email/SĐT ]                 [ Server ]
         |                                    |                          |
         |  1. POST /forgot-password          |                          |
         |  { identifier }                    |                          |
         |------------------------------------|------------------------->|
         |                                    |       Gửi OTP            |
         |                                    |<-------------------------|
         |  < 200 "OTP sent"                  |                          |
         |<-----------------------------------|--------------------------|
         |                                    |                          |
   [User nhập OTP]                            |                          |
         |                                    |                          |
         |  2. POST /verify-reset-otp         |                          |
         |  { identifier, otp }               |                          |
         |------------------------------------|------------------------->|
         |  < 200 + token                     |                          |
         |<-----------------------------------|--------------------------|
         |                                    |                          |
   [User nhập password mới]                   |                          |
         |                                    |                          |
         |  3. POST /reset-password           |                          |
         |  { token, newPassword }            |                          |
         |------------------------------------|------------------------->|
         |                                    |  - Xoá sessions cũ       |
         |                                    |  - Gửi email notify      |
         |                                    |  - Xoá OTP + token       |
         |  < 200 "Password reset"            |                          |
         |<-----------------------------------|--------------------------|
         |                                    |                          |
   [Chuyển đến Login page]                    |                          |
```

---

## Related APIs

### Resend OTP (dùng cho flow đăng ký tài khoản)

> **Note:** Với forgot-password flow, FE có thể gọi lại `POST /forgot-password` để resend OTP — không cần endpoint riêng.

**Endpoint:** `POST /api/v1/auth/resend-otp`

**Auth:** PUBLIC

**Request:**
```json
{ "identifier": "user@example.com" }
```

**Response:**
```json
{
  "code": 200,
  "message": "OTP resent successfully",
  "data": {
    "identifier": "user@example.com",
    "message": "OTP has been resent. Please check your email."
  }
}
```
