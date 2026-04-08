# API Integration Inventory

Ngày cập nhật: 2026-04-07  
Phạm vi quét: toàn bộ `src/features/*/api`, `src/config/axios.ts` và các `slice/component` có `dispatch(...)`.

Ghi chú:
- `API_BASE_URL` mặc định: `/api/v1`
- `ADMIN_API_BASE_URL` mặc định: `/api/admin`

## 1) API backend thật (đã wire vào UI)

| # | Chức năng | Endpoint | Màn hình đang dùng | Real/Mock |
|---|---|---|---|---|
| 1 | Đăng nhập admin | `POST /api/admin/auth/login` | Login | Real |
| 2 | Lấy profile admin sau login | `GET /api/admin/auth/me` | Login flow (sau khi login) | Real |
| 3 | Đăng xuất admin | `POST /api/admin/auth/logout` | Dashboard layout (nút logout) | Real |
| 4 | Tự refresh token khi 401 | `POST /api/admin/auth/refresh-token` | Toàn app (Axios interceptor) | Real |
| 5 | Lấy danh sách users (có filter role) | `GET /api/v1/users?role=` | Users page + UsersFilter | Real |
| 6 | Tạo user | `POST /api/v1/users` | Users dialog thêm mới | Real |
| 7 | Cập nhật user | `PUT /api/v1/users/{userId}` | Users dialog chỉnh sửa | Real |
| 8 | Xóa user | `DELETE /api/v1/users/{userId}` | Users dialog xóa | Real |
| 9 | Gán policy cho user (update user) | `PUT /api/v1/users/{userId}` | Users policy dialog | Real |
| 10 | Lấy danh sách WiFi policy (cho Users) | `GET /api/v1/wifi-policies` | Users page (policy dropdown) | Real |
| 11 | Lấy danh sách WiFi policies | `GET /api/v1/wifi-policies?type=` | Policies page | Real |
| 12 | Tạo WiFi policy | `POST /api/v1/wifi-policies/{type}` | Policies dialogs | Real |
| 13 | Cập nhật WiFi policy | `PUT /api/v1/wifi-policies/{type}/{id}` | Policies dialogs | Real |
| 14 | Xóa WiFi policy | `DELETE /api/v1/wifi-policies/{id}` | Policies dialogs | Real |
| 15 | Lấy danh sách Auth policies | `GET /api/v1/auth-policies` | Policies page | Real |
| 16 | Tạo Auth policy | `POST /api/v1/auth-policies` | Auth policy dialogs | Real |
| 17 | Cập nhật Auth policy | `PUT /api/v1/auth-policies/{id}` | Auth policy dialogs | Real |
| 18 | Xóa Auth policy | `DELETE /api/v1/auth-policies/{id}` | Auth policy dialogs | Real |
| 19 | Lấy danh sách AP | `GET /api/v1/access-points` | Access Points page + Settings/Devices | Real |
| 20 | Lấy danh sách Controllers | `GET /api/v1/wifi-controllers` | Access Points page + Settings/Devices | Real |
| 21 | Tạo/Sửa/Xóa Controller | `POST/PUT/DELETE /api/v1/wifi-controllers` | Settings > Devices | Real |
| 22 | Tạo/Sửa/Xóa AP | `POST/PUT/DELETE /api/v1/access-points` | Settings > Devices | Real |
| 23 | Lấy/Tạo/Sửa/Xóa Campus | `GET/POST/PUT/DELETE /api/v1/campus` | Settings > Areas (+ Access Points filter) | Real |
| 24 | Lấy/Tạo/Sửa/Xóa Building | `GET/POST/PUT/DELETE /api/v1/buildings` | Settings > Areas (+ Access Points filter) | Real |
| 25 | Lấy/Tạo/Sửa/Xóa Location | `GET/POST/PUT/DELETE /api/v1/locations` | Settings > Areas | Real |

## 2) API mock/local (đã wire vào UI nhưng chưa gọi backend thật)

| # | Chức năng | Endpoint | Màn hình đang dùng | Real/Mock |
|---|---|---|---|---|
| 1 | Lấy admin users | `N/A (mock)` | Settings | Mock |
| 2 | Lấy system roles | `N/A (mock)` | Settings | Mock |
| 3 | Lấy user groups | `N/A (mock)` | Settings/Security | Mock |
| 4 | Lấy resources | `N/A (mock)` | Settings/Security | Mock |
| 5 | Lấy IAM connections | `N/A (mock)` | Settings/Integrations | Mock |
| 6 | Lấy RADIUS configs | `N/A (mock)` | Settings/Integrations | Mock |
| 7 | Lấy Captive Portal configs | `N/A (mock)` | Settings/Integrations | Mock |
| 8 | Lấy logs cài đặt | `N/A (mock)` | Settings/Logs | Mock |
| 9 | Reports - WiFi users | `N/A (mock)` | Reports/Overview, Users | Mock |
| 10 | Reports - User sessions | `N/A (mock)` | Reports/Overview, Users, User incidents | Mock |
| 11 | Reports - Bandwidth | `N/A (mock)` | Reports/Overview, Bandwidth | Mock |
| 12 | Reports - Controllers | `N/A (mock)` | Reports/Overview, Infrastructure | Mock |
| 13 | Reports - AP Access | `N/A (mock)` | Reports/Overview, Infrastructure | Mock |
| 14 | Reports - Violations | `N/A (mock)` | Reports/Overview, Violations, User incidents | Mock |
| 15 | Reports - Session timeline data | `N/A (mock)` | Reports/Overview, Sessions, Session Timeline | Mock |
| 16 | Reports - Incidents | `N/A (mock)` | Reports/Overview, Incidents, User incidents | Mock |
| 17 | Reports - System logs | `N/A (mock)` | Reports/Overview, Logs, User incidents | Mock |

## 3) Đã khai báo API nhưng chưa thấy gọi từ UI (chưa dispatch)

| # | Chức năng | Endpoint | Trạng thái |
|---|---|---|---|
| 1 | Lấy chi tiết user | `GET /api/v1/users/{userId}` | Chưa thấy dùng |
| 2 | Lấy groups của user | `GET /api/v1/users/{userId}/groups` | Chưa thấy dùng |
| 3 | Lấy policies của user | `GET /api/v1/users/{userId}/policies` | Chưa thấy dùng |
| 4 | Gán 1 policy cho user | `POST /api/v1/users/{userId}/policies` | Chưa thấy dùng |
| 5 | Gán nhiều policy cho user | `POST /api/v1/users/{userId}/policies/bulk` | Chưa thấy dùng |
| 6 | Gỡ 1 policy khỏi user | `DELETE /api/v1/users/{userId}/policies/{policyId}` | Chưa thấy dùng |
| 7 | Gỡ toàn bộ policy của user | `DELETE /api/v1/users/{userId}/policies` | Chưa thấy dùng |
| 8 | User self profile (usersSlice) | `GET /api/v1/auth/me` | API có, chưa thấy dispatch |
| 9 | Đổi mật khẩu (usersSlice) | `POST /api/v1/auth/change-password` | API có, chưa thấy dispatch |
| 10 | Link provider (usersSlice) | `POST /api/v1/auth/link-provider` | API có, chưa thấy dispatch |
| 11 | Lấy 1 WiFi policy theo id | `GET /api/v1/wifi-policies/{id}` | Chưa thấy dùng |
| 12 | Lấy 1 Auth policy theo id | `GET /api/v1/auth-policies/{id}` | Chưa thấy dùng |
| 13 | Lấy allowed IPs | `N/A (mock)` | Chưa thấy dùng |
| 14 | Reports user report data | `N/A (mock)` | Chưa thấy dùng |
