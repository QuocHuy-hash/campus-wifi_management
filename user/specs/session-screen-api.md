# TÀI LIỆU ĐẶC TẢ: Màn hình Session (Phiên hoạt động)

**System Name:** HCMUS WiFi Management
**Module:** Session
**Ngày tạo:** 2026-07-01
**Version:** 1.0

---

## MỤC LỤC

1. [Tổng quan](#1-tong-quan)
2. [Bố cục màn hình](#2-bo-cuc-man-hinh)
3. [Danh sách API](#3-danh-sach-api)
4. [Data Model](#4-data-model)
5. [Ghi chú triển khai](#5-ghi-chu-trien-khai)
6. [Ánh xạ source code FE](#6-anh-xa-source-code-fe)

---

## 1. Tổng quan

### 1.1 Thông tin hệ thống

| Trường | Giá trị |
|--------|---------|
| **System Name** | HCMUS WiFi Management |
| **Module** | Session |
| **Feature** | Màn hình phiên hoạt động (Session), Lịch sử phiên (History) |
| **Create Date** | 2026-07-01 |
| **Base URL** | `http://{host}:3030/api/v1` |

### 1.2 Common Response Wrapper

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

### 1.3 Danh sách API

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/sessions/active` | Bearer Token | Lấy phiên đang hoạt động (nếu có) |
| GET | `/users/me/quota` | Bearer Token | Lấy hạn ngạch hôm nay + chính sách QoS |
| POST | `/sessions/logout` | Bearer Token | Đăng xuất phiên hiện tại |
| POST | `/sessions/logout-all` | Bearer Token | Đăng xuất tất cả thiết bị |

---

## 2. Bố cục màn hình

Màn hình Session gồm 2 phần chính:

### 2.1 Phần Active Session (nếu có phiên đang hoạt động)

Hiển thị thông tin phiên mạng đang hoạt động của user:

- **SSID** : Tên mạng WiFi
- **IP** : Địa chỉ IP được cấp
- **MAC** : Địa chỉ MAC thiết bị
- **Online** : Thời gian đã online (tính từ `acctstarttime` đến hiện tại)
- **Thiết bị** : Tên thiết bị
- **Vị trí** : Vị trí AP
- **Lưu lượng phiên**: Download, Upload, Tổng (từ `acctinputoctets` / `acctoutputoctets`)
- **Hạn ngạch hôm nay**: Thanh progress % đã dùng so với `quota_daily`
- **Nút "Đăng xuất WiFi"** : Gọi `POST /sessions/logout`
- **Nút "Lịch sử"** : Chuyển sang màn hình History

Nếu không có phiên hoạt động → hiển thị ảnh minh hoạ + "Không có phiên hoạt động" + nút "Xem lịch sử".

### 2.2 Phần Chính sách QoS

Hiển thị thông tin policy của user:

- **Băng thông** : `bandwidth_limit` Mbps
- **Thời gian phiên** : `session_timeout / 3600` h/phiên
- **Hạn ngạch** : `quota_daily` bytes/ngày

---

## 3. Danh sách API

### 3.1. Lấy phiên đang hoạt động

**Endpoint:** `GET /sessions/active`

**Auth:** Bearer Token

**Mô tả:** Trả về phiên RADIUS đang active của user, hoặc `data: null` nếu không có phiên nào.

**Response (success — có phiên):**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "session_id": "sess_1719878400000_001",
    "username": "21120001",
    "user_fullname": "Nguyễn Văn An",
    "user_role": "Student",
    "user_department": "Khoa Công nghệ Thông tin",
    "acctstarttime": "2026-07-01T08:00:00.000Z",
    "acctstoptime": null,
    "acctsessiontime": null,
    "acctterminatecause": null,
    "mac_address": "AA:BB:CC:DD:EE:01",
    "ip_address": "10.0.15.45",
    "ipv6_address": "2001:db8::1",
    "device_type": "Laptop",
    "device_name": "MacBook Pro 14\"",
    "device_vendor": "Apple",
    "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
    "ssid": "HCMUS-Student",
    "ap_name": "AP-Library-F1-01",
    "ap_location": "Thư viện - Tầng 1",
    "nas_ip": "10.0.0.1",
    "nas_identifier": "RADIUS-NAS-01",
    "acctinputoctets": 892000000,
    "acctoutputoctets": 156000000,
    "acctinputpackets": 650000,
    "acctoutputpackets": 180000,
    "acctinputgigawords": 0,
    "acctoutputgigawords": 0,
    "vlan_id": 100,
    "bandwidth_limit": 10,
    "quota_daily": 5368709120,
    "session_timeout": 14400
  }
}
```

**Response (không có phiên):**

```json
{
  "code": 200,
  "message": "No active session",
  "data": null
}
```

**Response (token hết hạn):**

```json
{
  "code": 401,
  "message": "Unauthorized",
  "data": null
}
```

---

### 3.2. Lấy hạn ngạch và chính sách

**Endpoint:** `GET /users/me/quota`

**Auth:** Bearer Token

**Mô tả:** Trả về thông tin chính sách QoS + lượng data đã dùng hôm nay của user.

**Response (success):**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "policy": {
      "session_timeout": 14400,
      "bandwidth_limit": 10,
      "quota_daily": 5368709120
    },
    "todayUsage": {
      "download": 524288000,
      "upload": 104857600,
      "total": 629145600
    }
  }
}
```

| Field | Type | Mô tả |
|-------|------|-------|
| `data.policy.session_timeout` | number | Thời gian tối đa một phiên (giây) |
| `data.policy.bandwidth_limit` | number | Băng thông tối đa (Mbps) |
| `data.policy.quota_daily` | number | Hạn ngạch dữ liệu mỗi ngày (bytes) |
| `data.todayUsage.download` | number | Dữ liệu đã tải hôm nay (bytes) |
| `data.todayUsage.upload` | number | Dữ liệu đã gửi hôm nay (bytes) |
| `data.todayUsage.total` | number | Tổng dữ liệu hôm nay (bytes) |

---

### 3.3. Đăng xuất phiên hiện tại

**Endpoint:** `POST /sessions/logout`

**Auth:** Bearer Token

**Request Body:**

```json
{
  "session_id": "sess_1719878400000_001"
}
```

| Field | Type | Rules | Mô tả |
|-------|------|-------|-------|
| `session_id` | string | required | ID của session cần logout |

**Response (success):**

```json
{
  "code": 200,
  "message": "Session logged out successfully",
  "data": null
}
```

---

### 3.4. Đăng xuất tất cả thiết bị

**Endpoint:** `POST /sessions/logout-all`

**Auth:** Bearer Token

**Mô tả:** Thu hồi tất cả phiên đang hoạt động của user. Không cần request body.

**Response (success):**

```json
{
  "code": 200,
  "message": "All sessions logged out successfully",
  "data": null
}
```

---

## 4. Data Model

### 4.1. RadiusSession (Session Object)

```typescript
interface RadiusSession {
  // Thông tin cơ bản
  session_id: string;
  username: string;
  user_fullname: string;
  user_role: 'Student' | 'Teacher' | 'Staff' | 'Guest';
  user_department?: string;

  // Thời gian phiên
  acctstarttime: string;          // ISO 8601 datetime
  acctstoptime: string | null;    // null nếu đang active
  acctsessiontime: number | null; // giây, null nếu đang active
  acctterminatecause: 'User-Request' | 'Session-Timeout' | 'Idle-Timeout' | 'Admin-Reset' | 'Lost-Carrier' | null;

  // Thông tin thiết bị
  mac_address: string;
  ip_address: string;
  ipv6_address?: string;
  device_type: 'Laptop' | 'Smartphone' | 'Tablet' | 'Desktop' | 'Other';
  device_name: string;
  device_vendor?: string;
  user_agent: string;

  // Thông tin mạng
  ssid: string;
  ap_name: string;
  ap_location: string;
  nas_ip: string;
  nas_identifier: string;

  // Lưu lượng
  acctinputoctets: number;    // download (bytes)
  acctoutputoctets: number;   // upload (bytes)
  acctinputpackets: number;
  acctoutputpackets: number;
  acctinputgigawords?: number; // hỗ trợ > 4GB download
  acctoutputgigawords?: number; // hỗ trợ > 4GB upload

  // QoS & Policy
  vlan_id: number;
  bandwidth_limit: number;  // Mbps
  quota_daily: number;      // bytes
  session_timeout: number;  // giây
}
```

### 4.2. UserPolicy (Policy Object)

```typescript
interface UserPolicy {
  session_timeout: number;  // giây
  bandwidth_limit: number;  // Mbps
  quota_daily: number;      // bytes
}
```

### 4.3. TodayUsage (Usage Object)

```typescript
interface TodayUsage {
  download: number;  // bytes
  upload: number;    // bytes
  total: number;     // bytes
}
```

---

## 5. Ghi chú triển khai

### 5.1. Tính thời gian Online

FE không cần backend tính `activeDuration`. FE tự tính từ `acctstarttime`:

```typescript
const activeDuration = Math.floor(
  (Date.now() - new Date(activeSession.acctstarttime).getTime()) / 1000
);
```

Cập nhật mỗi 60 giây qua `setInterval`.

### 5.2. Format dữ liệu

- Bytes → hiển thị: dùng `formatBytes()` (B, KB, MB, GB, TB)
- Giây → hiển thị: dùng `formatDurationShort()` (VD: "2h 30m")
- Thời gian → locale: `vi-VN`

### 5.3. Tính phần trăm hạn ngạch

```typescript
const quotaPercentage = Math.min(
  (todayUsage.total / policy.quota_daily) * 100,
  100
);
```

### 5.4. Lưu ý về `acctstoptime`

- `acctstoptime === null` → phiên đang active
- `acctstoptime !== null` → phiên đã kết thúc

### 5.5. Lưu ý về `session_id` khi logout

- `POST /sessions/logout` cần `session_id` của phiên hiện tại
- `POST /sessions/logout-all` không cần body

---

## 6. Ánh xạ source code FE

| File | Vai trò |
|------|---------|
| `src/features/session/index.tsx` | Màn hình Session chính |
| `src/features/history/index.tsx` | Màn hình Lịch sử phiên |
| `src/data/mockData.ts` | Mock data cho `RadiusSession`, `qosPolicies`, `getTodayUsage` |

### 6.1. Session page sử dụng:

- `RadiusSession` từ `mockData.ts` (toàn bộ fields)
- `qosPolicies` để hiển thị policy card
- `getTodayUsage()` để tính hạn ngạch hôm nay
- `formatBytes()`, `formatDurationShort()` để format hiển thị
