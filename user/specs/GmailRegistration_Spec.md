# TÀI LIỆU ĐẶC TẢ: Đăng ký bằng Tài khoản/Mật khẩu
**System Name:** HCMUS WiFi Management  
**Module:** Authentication  
**Ngày tạo:** 2026-04-01  
**Version:** 1.0

---

## MỤC LỤC

1. [Tổng quan](#1-tong-quan)
2. [Bố cục màn hình](#2-bo-cuc-man-hinh)
3. [Luồng xử lý (Sequence)](#3-luong-xu-ly-sequence)
4. [Danh sách Screen Items](#4-danh-sach-screen-items)
5. [Data Input Checking](#5-data-input-checking)
6. [Data Items (API Contract)](#6-data-items-api-contract)
7. [Mô tả chức năng](#7-mo-ta-chuc-nang)
8. [Ghi chú triển khai](#8-ghi-chu-trien-khai)
9. [Ánh xạ source code](#9-anh-xa-source-code)

---

## 1. Tổng quan

### 1.1 Thông tin hệ thống

| Trường | Giá trị |
|-------|--------|
| **System Name** | HCMUS WiFi Management |
| **Module** | Authentication |
| **Feature** | Đăng ký bằng tài khoản/mật khẩu |
| **Phạm vi** | Dialog đăng ký khách (Guest Registration) và luồng OTP xác thực |
| **Create Date** | 2026-04-01 |
| **Create By** | Development Team |

### 1.2 Danh sách chức năng

| Function ID | Tên chức năng | Form ID | Form Name |
|-------------|---------------|---------|-----------|
| **AR001** | Mở dialog đăng ký tài khoản | AUTH-S1 | Guest Registration Dialog |
| **AR002** | Đóng dialog đăng ký (nút X) | AUTH-S1 | Guest Registration Dialog |
| **AR003** | Hủy đăng ký (nút Hủy) | AUTH-S1 | Guest Registration Dialog |
| **AR004** | Gửi mã OTP (nút Gửi mã OTP) | AUTH-S2 | Register Form Actions |
| **AR005** | Quay lại bước trước (nút ←) | AUTH-S3 | OTP Form Actions |
| **AR006** | Xác nhận OTP (nút Xác nhận OTP) | AUTH-S3 | OTP Form Actions |
| **AR007** | Gửi lại OTP (nút Gửi lại mã OTP) | AUTH-S3 | OTP Form Actions |
| **AR008** | Đăng nhập ngay (nút Đăng nhập ngay) | AUTH-S4 | Registration Success |

### 1.3 Mục tiêu nghiệp vụ

- Cho phép người dùng đăng ký bằng email/mật khẩu hoặc số điện thoại/mật khẩu.
- Với email: đăng ký qua backend API, sau đó xác thực OTP email.
- Với số điện thoại: hiện tại dùng luồng OTP mô phỏng ở frontend (chưa gọi backend thực).
- Sau khi xác thực thành công, người dùng có thể đăng nhập ngay vào `/session`.

---

## 2. Bố cục màn hình

### 2.1 Dialog đăng ký (AUTH-S1)

```
┌──────────────────────────────────────────────────────────────────┐
│ Đăng ký tài khoản                                          [×]  │
├──────────────────────────────────────────────────────────────────┤
│ Phương thức xác thực: [Email] [Zalo/SĐT]                        │
│                                                                  │
│ Email hoặc Số điện thoại                                         │
│ Mật khẩu                                                         │
│ Xác nhận mật khẩu                                                │
│                                                                  │
│ [Hủy]                                            [Gửi mã OTP]    │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 Dialog xác thực OTP (AUTH-S3)

```
┌──────────────────────────────────────────────────────────────────┐
│ Xác thực OTP                                               [←]  │
├──────────────────────────────────────────────────────────────────┤
│ Nhập mã OTP 6 số đã gửi đến email/số điện thoại                │
│ [ _ ] [ _ ] [ _ ] [ _ ] [ _ ] [ _ ]                             │
│                                                                  │
│ [Xác nhận OTP]                                                   │
│ [Gửi lại mã OTP]                                                 │
└──────────────────────────────────────────────────────────────────┘
```

### 2.3 Màn hình thành công (AUTH-S4)

```
┌──────────────────────────────────────────────────────────────────┐
│ Đăng ký thành công!                                              │
│ Tài khoản WiFi tạm thời đã sẵn sàng                              │
│                                                                  │
│ Tên đăng nhập: <email hoặc số điện thoại>                        │
│                                                                  │
│ [Đăng nhập ngay]                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Luồng xử lý (Sequence)

### 3.1 Luồng đăng ký qua email

```
User -> Frontend (AuthFeature): Mở dialog đăng ký
User -> Dialog: Nhập email + mật khẩu + xác nhận mật khẩu
Dialog -> Frontend: Click "Gửi mã OTP"
Frontend -> Redux thunk: registerWithOtp(payload)
Redux thunk -> authApi: POST /api/v1/auth/register
Backend -> authApi: Trả thông tin user + notice gửi OTP
Frontend -> Dialog: Chuyển sang bước OTP
User -> Dialog: Nhập OTP 6 số
Dialog -> Redux thunk: verifyEmailOtp(payload)
Redux thunk -> authApi: POST /api/v1/auth/verify-email
Backend -> authApi: Trả trạng thái emailVerified=true
Frontend -> Dialog: Hiển thị Đăng ký thành công
User -> Dialog: Click "Đăng nhập ngay"
Frontend -> Router: Điều hướng /session
```

### 3.2 Luồng đăng ký qua số điện thoại (mô phỏng)

```
User -> Dialog: Chọn phương thức SĐT/Zalo
User -> Dialog: Nhập số điện thoại + mật khẩu
Dialog -> Frontend: Click "Gửi mã OTP"
Frontend: Chuyển bước OTP bằng timer mô phỏng
User -> Dialog: Nhập OTP 6 số
Frontend: Verify OTP bằng timer mô phỏng
Frontend -> Router: Điều hướng /session
```

### 3.3 Gửi lại OTP email

```
User -> Dialog OTP: Click "Gửi lại mã OTP"
Dialog -> Redux thunk: resendEmailOtp({email})
Redux thunk -> authApi: POST /api/v1/auth/resend-otp
Backend -> authApi: 200 OK
Frontend -> UI: Giữ ở bước OTP, cho phép nhập mã mới
```

---

## 4. Danh sách Screen Items

### 4.1 Form đăng ký (AUTH-S1)

| STT | Item Name | Field Name | I/O | Type | Data Format | Required | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|----------|-------------|-------|
| 1 | Nút đóng dialog (X) | closeRegisterDialogBtn | I | Button | Action | - | AR002 | Đóng dialog đăng ký |
| 2 | Nút hủy | cancelRegisterBtn | I | Button | Action | - | AR003 | Đóng dialog và hủy thao tác |
| 3 | Phương thức xác thực | guestAuthMethod | I/O | Radio | `email`/`phone` | X | AR001 | Mặc định `email` |
| 4 | Email | guestForm.email | I/O | Input | Email | Có điều kiện | AR001 | Bắt buộc khi chọn `email` |
| 5 | Số điện thoại | guestForm.phone | I/O | Input | String | Có điều kiện | AR001 | Bắt buộc khi chọn `phone` |
| 6 | Mật khẩu | guestForm.password | I/O | Input password | String | X | AR001 | Tối thiểu 8 ký tự |
| 7 | Xác nhận mật khẩu | guestForm.confirmPassword | I/O | Input password | String | X | AR001 | Phải trùng mật khẩu |
| 8 | Nút gửi mã OTP | sendOtpBtn | I | Button | Action | - | AR004 | Gửi yêu cầu OTP |

### 4.2 Form OTP (AUTH-S3)

| STT | Item Name | Field Name | I/O | Type | Data Format | Required | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|----------|-------------|-------|
| 1 | Nút quay lại (←) | backStepBtn | I | Button | Action | - | AR005 | Quay lại bước form đăng ký |
| 2 | OTP digit 1..6 | otpCode[] | I/O | Input | Number char | X | AR001 | Tổng 6 ký tự số |
| 3 | Nút xác nhận OTP | verifyOtpBtn | I | Button | Action | - | AR006 | Gọi verify OTP |
| 4 | Nút gửi lại OTP | resendOtpBtn | I | Button | Action | - | AR007 | Gửi lại mã OTP |
| 5 | OTP error message | otpError | O | Text | String | - | AR001 | Hiển thị lỗi validation/API |

### 4.3 Bước thành công (AUTH-S4)

| STT | Item Name | Field Name | I/O | Type | Data Format | Required | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|----------|-------------|-------|
| 1 | Success title | successTitle | O | Text | String | - | AR001 | "Đăng ký thành công!" |
| 2 | Tên đăng nhập hiển thị | guestUsername | O | Text | Email/Phone | - | AR001 | Lấy theo phương thức đã chọn |
| 3 | Nút đăng nhập ngay | useCredentialsBtn | I | Button | Action | - | AR008 | Điều hướng vào `/session` |

---

## 5. Data Input Checking

| System Name | HCMUS WiFi Management | CreateAt | 01/04/2026 |
|-------------|------------------------|----------|------------|
| Module | Authentication (Account/Password Registration) | Create By | Quốc Huy |
| Form ID | Account Registration Form | Update At | 01/04/2026 |
| Form Name | Đăng ký bằng tài khoản/mật khẩu | Update By | Quốc Huy |

Ký hiệu: [(I/O)]:Input / O:Output / I/O:Input-Output  
[(Type)L:Label / T:Text / TA:TextArea / S:Select / C:Checkbox / R:Radio / B:Button / H:Hidden / I:Image / Ln:Link / O:Other]

### Account Registration Input Validation

| NO | Label Name | Field Name | I/O | Type | Data Format | Size | Required | Characters | Rule | MessageId | Event | Messages |
|----|------------|------------|-----|------|-------------|------|----------|------------|------|-----------|-------|----------|
| 1 | Phương thức xác thực | guestAuthMethod | I/O | R | Enum | 10 | X | `email`/`phone` | Must be one of enum | ERR_AR001 | OnSubmit | Phương thức xác thực không hợp lệ |
| 2 | Email | guestForm.email | I | T | Email | 120 | Có điều kiện | UTF-8 | Required khi method=email; đúng định dạng email | ERR_AR002 | OnSubmit | Email không hợp lệ hoặc đang trống |
| 3 | Số điện thoại | guestForm.phone | I | T | String | 20 | Có điều kiện | 0-9,+ | Required khi method=phone | ERR_AR003 | OnSubmit | Số điện thoại không hợp lệ hoặc đang trống |
| 4 | Mật khẩu | guestForm.password | I | T | String | 128 | X | UTF-8 | MinLength(8) | ERR_AR004 | OnSubmit | Mật khẩu phải có ít nhất 8 ký tự |
| 5 | Xác nhận mật khẩu | guestForm.confirmPassword | I | T | String | 128 | X | UTF-8 | MustEqual(password) | ERR_AR005 | OnSubmit | Xác nhận mật khẩu không khớp |
| 6 | OTP | otpCode | I | T | Number String | 6 | X | 0-9 | Required, Length(6) | ERR_AR006 | OnSubmit | Vui lòng nhập đủ 6 số OTP |
| 7 | Gửi OTP | sendOtpBtn | I | B | Action | - | - | - | Trigger register API (email) / mock flow (phone) | INF_AR001 | OnClick | Đang gửi OTP... |
| 8 | Xác nhận OTP | verifyOtpBtn | I | B | Action | - | - | - | Trigger verify API (email) / mock flow (phone) | INF_AR002 | OnClick | Đang xác thực OTP... |
| 9 | Gửi lại OTP | resendOtpBtn | I | B | Action | - | - | - | Trigger resend OTP API (email) | INF_AR003 | OnClick | Đang gửi lại OTP... |

### Ghi chú hành vi UI thực tế

- Mật khẩu ở bước form chỉ enforce tối thiểu 8 ký tự và so khớp xác nhận.
- Rule mạnh (chữ hoa, chữ thường, số, ký tự đặc biệt) hiện nằm ở bước `newpass` và chưa đi vào luồng email backend chuẩn.
- Luồng `phone` hiện tại là mô phỏng frontend, chưa tích hợp API backend.

---

## 6. Data Items (API Contract)

### 6.1 Endpoint: POST /api/v1/auth/register

| Property | Value |
|----------|-------|
| Label Name | Register Account |
| Data Format | JSON |
| I/O | Input/Output |
| Note | Tạo tài khoản bằng email/mật khẩu và phát OTP qua email |

#### Params

- Path Params: Không có
- Query Params: Không có

#### Body parameters

| Tên trường | Loại dữ liệu | I/O | Ghi chú |
|------------|--------------|-----|---------|
| email | string | Input | Email đăng ký (required) |
| password | string | Input | Mật khẩu (required) |
| fullName | string | Input | Tên hiển thị (required) |

#### Response data (JSON)

```json
{
  "code": 201,
  "message": "Created",
  "data": {
    "id": 101,
    "email": "user@example.com",
    "fullName": "user",
    "status": "PENDING_VERIFICATION",
    "emailVerified": false,
    "createdAt": "2026-04-01T10:30:00Z",
    "notice": "OTP has been sent to email"
  }
}
```

#### Response field description

| Field | Type | I/O | Note |
|-------|------|-----|------|
| code | number | Output | Mã trạng thái |
| message | string | Output | Thông điệp API |
| data | object | Output | Thông tin user mới |
| data.id | number | Output | ID người dùng |
| data.email | string | Output | Email đăng ký |
| data.status | string | Output | Trạng thái tài khoản |
| data.emailVerified | boolean | Output | Đã xác thực email hay chưa |
| data.notice | string | Output | Thông báo OTP |

### 6.2 Endpoint: POST /api/v1/auth/verify-email

| Property | Value |
|----------|-------|
| Label Name | Verify Email OTP |
| Data Format | JSON |
| I/O | Input/Output |
| Note | Xác thực OTP email sau đăng ký |

#### Params

- Path Params: Không có
- Query Params: Không có

#### Body parameters

| Tên trường | Loại dữ liệu | I/O | Ghi chú |
|------------|--------------|-----|---------|
| email | string | Input | Email đã đăng ký |
| otp | string | Input | Mã OTP 6 số |

#### Response data (JSON)

```json
{
  "code": 200,
  "message": "Verified",
  "data": {
    "email": "user@example.com",
    "status": "ACTIVE",
    "emailVerified": true,
    "notice": "Email verified successfully"
  }
}
```

#### Response field description

| Field | Type | I/O | Note |
|-------|------|-----|------|
| code | number | Output | Mã trạng thái |
| message | string | Output | Thông điệp API |
| data.email | string | Output | Email đã xác thực |
| data.status | string | Output | Trạng thái sau xác thực |
| data.emailVerified | boolean | Output | Kết quả xác thực |
| data.notice | string | Output | Thông báo nghiệp vụ |

### 6.3 Endpoint: POST /api/v1/auth/resend-otp

| Property | Value |
|----------|-------|
| Label Name | Resend Email OTP |
| Data Format | JSON |
| I/O | Input/Output |
| Note | Gửi lại OTP email cho luồng đăng ký |

#### Params

- Path Params: Không có
- Query Params: Không có

#### Body parameters

| Tên trường | Loại dữ liệu | I/O | Ghi chú |
|------------|--------------|-----|---------|
| email | string | Input | Email cần gửi lại OTP |

#### Response data (JSON)

```json
{
  "code": 200,
  "message": "OTP resent",
  "data": null
}
```

#### Response field description

| Field | Type | I/O | Note |
|-------|------|-----|------|
| code | number | Output | Mã trạng thái |
| message | string | Output | Kết quả gửi lại OTP |
| data | null | Output | Không có payload |

---

## 7. Mô tả chức năng

### 7.1 AR001 - Mở dialog đăng ký

- Người dùng nhấn nút "Đăng ký tài khoản" ở màn login guest.
- Hệ thống mở dialog và khởi tạo form rỗng với phương thức mặc định `email`.

### 7.2 AR002 - Gửi OTP đăng ký

- Validate dữ liệu bắt buộc (contact + password + confirmPassword).
- Với `email`: gọi `registerWithOtp` để backend tạo tài khoản và gửi OTP.
- Với `phone`: chạy luồng mô phỏng gửi OTP bằng timer.

### 7.3 AR003 - Xác thực OTP

- OTP phải đủ 6 ký tự số.
- Với `email`: gọi `verifyEmailOtp`.
- Với `phone`: mô phỏng xác thực thành công tại frontend.

### 7.4 AR004 - Đăng nhập ngay sau đăng ký

- Sau khi đăng ký thành công, cho phép người dùng bấm "Đăng nhập ngay".
- FE set trạng thái đăng nhập cục bộ và điều hướng `/session`.

### 7.5 AR005 - Gửi lại OTP

- Xóa OTP cũ trên form và gửi lại OTP mới.
- Với `email`: gọi `resendEmailOtp`.

---

## 8. Ghi chú triển khai

1. Luồng email là luồng chính đã tích hợp backend API.
2. Luồng số điện thoại/Zalo hiện vẫn là mock, cần API thật để production.
3. Cần thống nhất password policy giữa bước đăng ký và các bước đổi mật khẩu.
4. Cần bổ sung thông báo lỗi theo chuẩn API error body để UX rõ ràng hơn.
5. Nên đổi tên file spec hiện tại sang `AccountPasswordRegistration_Spec.md` để tránh nhầm với Gmail.

---

## 9. Ánh xạ source code

- API auth: src/features/auth/api/authApi.ts
- Redux thunks: src/features/auth/slices/authSlice.ts
- Container xử lý luồng: src/features/auth/components/AuthFeature.tsx
- UI dialog đăng ký: src/features/auth/components/dialogs/GuestRegistrationDialog.tsx
- Kiểu dữ liệu auth: src/features/auth/types/index.ts

---

Phiên bản: 1.0  
Cập nhật: 2026-04-01  
Chủ sở hữu: Frontend Auth Module
