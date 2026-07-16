# TÀI LIỆU ĐẶC TẢ: Quản lý Chính sách WiFi (Tab Băng thông)
**System Name:** HCMUS WiFi Management  
**Module:** Policy Management  
**Ngày tạo:** 2026-04-01  
**Version:** 2.0

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
| **Module** | Policy Management |
| **Feature** | WiFi Policy Management |
| **Phạm vi** | Tab Băng thông và các dialog CRUD liên quan |
| **Create Date** | 2026-04-01 |
| **Create By** | Development Team |

### 1.2 Danh sách chức năng

| Function ID | Tên chức năng | Form ID | Form Name |
|-------------|---------------|---------|-----------|
| **WP001** | Hiển thị danh sách policy trên tab Băng thông | POLICY-S1 | Băng thông - Danh sách chính sách |
| **WP002** | Tạo mới chính sách băng thông | POLICY-S2 | Thêm chính sách |
| **WP003** | Cập nhật chính sách băng thông | POLICY-S3 | Chỉnh sửa chính sách |
| **WP004** | Xóa chính sách | POLICY-S4 | Xác nhận xóa chính sách |

### 1.3 Mục tiêu nghiệp vụ

- Cho phép quản trị viên xem danh sách chính sách WiFi trên tab Băng thông.
- Cho phép tạo mới, cập nhật, xóa chính sách bằng dialog dùng chung của module Policy.
- Quản lý thông tin cốt lõi của policy băng thông: tên, mô tả, giới hạn download/upload, phạm vi áp dụng theo vai trò/khu vực/thời gian.
- Đồng bộ dữ liệu với backend thông qua API wifi-policies.

---

## 2. Bố cục màn hình

### 2.1 Màn hình tab Băng thông (POLICY-S1)

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ [Header] Quản trị Chính sách                                                           │
│ [Filter Bar] Vai trò | Khu vực | Thời gian | Controller | Tìm kiếm | Đặt lại          │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ [Tabs] Băng thông | Xác thực | Kiểm toán | Bảo mật | Cấp quyền                         │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ [Section] Chính sách Băng thông                                       [+ Thêm chính sách]│
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ [Table]                                                                                 │
│ ┌──────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Tên chính sách | Mô tả | Tải xuống | Tải lên | Áp dụng cho | Hành động            │ │
│ │--------------------------------------------------------------------------------------│ │
│ │ Băng thông Sinh viên | ... | 10 Mbps | 5 Mbps | [Sinh viên] | [Sửa] [Xóa]         │ │
│ └──────────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Dialog thêm/chỉnh sửa (POLICY-S2/POLICY-S3)

```
┌──────────────────────────────────────────────────────────────────┐
│ Thêm/Chỉnh sửa Chính sách                                  [×]  │
├──────────────────────────────────────────────────────────────────┤
│ Tên Chính sách                                                 │
│ Mô tả                                                          │
│                                                                 │
│ [Nếu type = bandwidth]                                          │
│ - Giới hạn Tải xuống (Mbps)                                     │
│ - Giới hạn Tải lên (Mbps)                                       │
│                                                                 │
│ Áp dụng cho Vai trò: [Sinh viên] [Cán bộ] [Khách]              │
│ Áp dụng theo Khu vực: [Select]                                 │
│ Áp dụng theo Thời gian: [Select]                               │
│                                                                 │
│ [Hủy]                                             [Tạo/Lưu]     │
└──────────────────────────────────────────────────────────────────┘
```

### 2.3 Dialog xác nhận xóa (POLICY-S4)

```
┌───────────────────────────────────────────────────────────────┐
│ Xác nhận xóa chính sách                                      │
├───────────────────────────────────────────────────────────────┤
│ Bạn có chắc chắn muốn xóa chính sách <Tên chính sách>?       │
│ Các người dùng đang áp dụng chính sách này sẽ bị ảnh hưởng.  │
│                                                               │
│ [Hủy]                                 [Xóa]                   │
└───────────────────────────────────────────────────────────────┘
```

---

## 3. Luồng xử lý (Sequence)

### 3.1 Tải danh sách policy cho tab Băng thông

```
User -> Frontend (PoliciesFeature): Mở trang Policy
Frontend -> Redux: dispatch(loadWifiPolicies)
Redux -> policiesApi: GET /wifi-policies
policiesApi -> Backend: Request policy list
Backend -> policiesApi: Policy[]
policiesApi -> Redux: normalize dữ liệu
Redux -> Frontend: update state.policies.policies.data
Frontend -> BandwidthPolicyTab: render table
```

### 3.2 Tạo mới chính sách băng thông

```
User -> Frontend: Click "Thêm chính sách"
Frontend -> Redux: setPolicyForm({ type: 'bandwidth' }), setAddPolicyDialogOpen(true)
User -> Dialog: Nhập dữ liệu và click "Tạo chính sách"
Dialog -> Redux thunk: createWifiPolicyAsync(payload)
Redux thunk -> policiesApi: POST /wifi-policies
policiesApi -> Backend: Tạo policy
Backend -> policiesApi: Trả về policy mới
policiesApi -> Redux: Normalize response
Redux -> Store: push record mới, đóng dialog, reset form
Frontend -> Table: render dòng mới
```

### 3.3 Cập nhật chính sách

```
User -> Table: Click Sửa
Table -> Redux: setSelectedPolicy + setPolicyForm + mở dialog edit
User -> Dialog: Cập nhật thông tin và click "Lưu thay đổi"
Dialog -> Redux thunk: updateWifiPolicyAsync(policy)
Redux thunk -> policiesApi: PUT /wifi-policies/:id
Backend -> policiesApi: Trả về bản ghi đã cập nhật
policiesApi -> Redux: Normalize response
Redux -> Store: replace row theo id, đóng dialog, clear selection/form
```

### 3.4 Xóa chính sách

```
User -> Table: Click Xóa
Table -> Redux: setSelectedPolicy + mở dialog xóa
User -> Dialog: Xác nhận xóa
Dialog -> Redux thunk: deleteWifiPolicyAsync(id)
Redux thunk -> policiesApi: DELETE /wifi-policies/:id
Backend -> policiesApi: 200/204
Redux -> Store: remove row, đóng dialog, clear selection
Frontend -> Table: dòng dữ liệu biến mất khỏi danh sách
```

---

## 4. Danh sách Screen Items

### 4.1 Bảng tab Băng thông (POLICY-S1)

| STT | Item Name | Field Name | I/O | Type | Data Format | Required | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|----------|-------------|-------|
| 1 | Policy Name | name | O | Text | String | - | WP001 | Hiển thị tên chính sách |
| 2 | Description | description | O | Text | String | - | WP001 | Cắt ngắn khi quá dài |
| 3 | Download Limit | downloadLimit | O | Badge | Number (Mbps) | - | WP001 | Mặc định 0 nếu null/undefined |
| 4 | Upload Limit | uploadLimit | O | Badge | Number (Mbps) | - | WP001 | Mặc định 0 nếu null/undefined |
| 5 | Apply Roles | applyToRoles | O | Tag List | String[] | - | WP001 | Badge theo vai trò |
| 6 | Edit Action | editBtn | I | Button | Icon | - | WP003 | Mở dialog chỉnh sửa |
| 7 | Delete Action | deleteBtn | I | Button | Icon | - | WP004 | Mở dialog xác nhận xóa |
| 8 | Empty State | emptyState | O | Text | String | - | WP001 | "Chưa có chính sách băng thông nào" |

### 4.2 Inputs dialog thêm/chỉnh sửa (POLICY-S2/POLICY-S3)

| STT | Item Name | Field Name | I/O | Type | Data Format | Required | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|----------|-------------|-------|
| 1 | Policy Name | name | I/O | Input | String | Khuyến nghị có | WP002/WP003 | Text tự do |
| 2 | Description | description | I/O | Input | String | Không | WP002/WP003 | Text ngắn |
| 3 | Download Limit | downloadLimit | I/O | Input number | Number | Không | WP002/WP003 | Đơn vị Mbps |
| 4 | Upload Limit | uploadLimit | I/O | Input number | Number | Không | WP002/WP003 | Đơn vị Mbps |
| 5 | Apply Roles | applyToRoles | I/O | Checkbox group | String[] | Không | WP002/WP003 | Sinh viên/Cán bộ/Khách |
| 6 | Apply Area | applyToArea | I/O | Select | String | Không | WP002/WP003 | Rỗng = tất cả |
| 7 | Apply Time | applyByTime | I/O | Select | String | Không | WP002/WP003 | Rỗng = 24/7 |
| 8 | Submit | submitBtn | I | Button | Action | - | WP002/WP003 | Tạo mới hoặc lưu thay đổi |
| 9 | Cancel | cancelBtn | I | Button | Action | - | WP002/WP003 | Đóng dialog |

### 4.3 Items dialog xóa (POLICY-S4)

| STT | Item Name | Field Name | I/O | Type | Required | Function ID | Notes |
|-----|-----------|------------|-----|------|----------|-------------|-------|
| 1 | Confirmation Message | deleteMsg | O | Text | - | WP004 | Hiển thị tên policy được chọn |
| 2 | Cancel Button | cancelDeleteBtn | I | Button | - | WP004 | Đóng dialog |
| 3 | Confirm Button | confirmDeleteBtn | I | Button | - | WP004 | Gọi xóa policy |

---

## 5. Data Input Checking

| System Name | HCMUS WiFi Management | CreateAt | 01/04/2026 |
|-------------|------------------------|----------|------------|
| Module | Policy Management (WiFi Policies) | Create By | Quốc Huy |
| Form ID | Policy Management Form | Update At | 01/04/2026 |
| Form Name | Quản lý Chính sách WiFi (Băng thông) | Update By | Quốc Huy |

Ký hiệu: [(I/O)]:Input / O:Output / I/O:Input-Output  
[(Type)L:Label / T:Text / TA:TextArea / S:Select / C:Checkbox / R:Radio / B:Button / H:Hidden / I:Image / Ln:Link / O:Other]

### Bandwidth Policy Input Validation

| NO | Label Name | Field Name | I/O | Type | Data Format | Size | Required | Characters | Rule | MessageId | Event | Messages |
|----|------------|------------|-----|------|-------------|------|----------|------------|------|-----------|-------|----------|
| 1 | Tên Chính sách | name | I | T | Text | 100 | X | UTF-8 | Required, Unique | ERR_WP001 | OnSubmit | Tên chính sách không được để trống |
| 2 | Mô tả | description | I | TA | Text | 255 |  | UTF-8 | Optional |  |  |  |
| 3 | Giới hạn Tải xuống (Mbps) | downloadLimit | I | T | Number | 5 | X | 0-99999 | Required, Min(0) | ERR_WP002 | OnSubmit | Tải xuống phải lớn hơn hoặc bằng 0 |
| 4 | Giới hạn Tải lên (Mbps) | uploadLimit | I | T | Number | 5 | X | 0-99999 | Required, Min(0) | ERR_WP003 | OnSubmit | Tải lên phải lớn hơn hoặc bằng 0 |
| 5 | Áp dụng cho Vai trò | applyToRoles | I | C | List | 3 | X | Predefined Enum | Required, MinSelection(1) | ERR_WP004 | OnSubmit | Vui lòng chọn ít nhất một vai trò |
| 6 | Áp dụng theo Khu vực | applyToArea | I | S | Text | 120 |  | UTF-8 | Optional |  |  |  |
| 7 | Áp dụng theo Thời gian | applyByTime | I | S | Text | 50 |  | UTF-8 | Optional |  |  |  |
| 8 | Tạo chính sách | createBtn | I | B | Action | - | - | - | Trigger create API |  | OnClick |  |
| 9 | Lưu thay đổi | updateBtn | I | B | Action | - | - | - | Trigger update API |  | OnClick |  |
| 10 | Xóa chính sách | deleteBtn | I | B | Action | - | - | - | Trigger delete confirmation |  | OnClick |  |

### Ghi chú hành vi UI thực tế

- Hiện tại code chưa enforce đầy đủ các rule Required/Unique ở tầng UI cho name, downloadLimit, uploadLimit, applyToRoles.
- Các rule trên là chuẩn đặc tả để backend và UI thống nhất khi triển khai validation chính thức.

---

## 6. Data Items (API Contract)

### 6.1 Endpoint: GET /api/v1/wifi-policies

| Property | Value |
|----------|-------|
| Label Name | Get WiFi Policies |
| Data Format | JSON |
| I/O | Output |
| Note | Lấy toàn bộ danh sách chính sách WiFi |

#### Params

- Path Params: Không có
- Query Params: Không có
- Body: Không có

#### Response data (JSON)

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "name": "Băng thông Sinh viên",
      "description": "Giới hạn băng thông cho sinh viên",
      "type": "BANDWIDTH",
      "downloadLimit": 10,
      "uploadLimit": 5,
      "applyToRoles": ["user"],
      "applyToArea": "",
      "applyByTime": ""
    }
  ],
  "message": "Success"
}
```

#### Response field description

| Field | Type | I/O | Note |
|-------|------|-----|------|
| statusCode | number | Output | Mã trạng thái response |
| data | WifiPolicy[] | Output | Danh sách chính sách |
| message | string | Output | Thông điệp kết quả |
| data[].id | number | Output | ID chính sách |
| data[].name | string | Output | Tên chính sách |
| data[].description | string | Output | Mô tả chính sách |
| data[].type | string | Output | Loại policy (BANDWIDTH/AUTH/...) |
| data[].downloadLimit | number | Output | Giới hạn tải xuống (Mbps) |
| data[].uploadLimit | number | Output | Giới hạn tải lên (Mbps) |
| data[].applyToRoles | string[] | Output | Danh sách role áp dụng |
| data[].applyToArea | string | Output | Khu vực áp dụng |
| data[].applyByTime | string | Output | Thời gian áp dụng |

### 6.2 Endpoint: POST /api/v1/wifi-policies

| Property | Value |
|----------|-------|
| Label Name | Create WiFi Policy |
| Data Format | JSON |
| I/O | Input/Output |
| Note | Tạo mới chính sách WiFi |

#### Params

- Path Params: Không có
- Query Params: Không có

#### Body parameters

| Tên trường | Loại dữ liệu | I/O | Ghi chú |
|------------|--------------|-----|---------|
| name | string | Input | Tên chính sách (required) |
| description | string | Input | Mô tả (optional) |
| type | string | Input | Loại chính sách, ví dụ BANDWIDTH (required) |
| downloadLimit | number | Input | Giới hạn tải xuống Mbps |
| uploadLimit | number | Input | Giới hạn tải lên Mbps |
| applyToRoles | string[] | Input | Danh sách role áp dụng |
| applyToArea | string | Input | Khu vực áp dụng |
| applyByTime | string | Input | Khung thời gian áp dụng |

#### Response data (JSON)

```json
{
  "statusCode": 201,
  "data": {
    "id": 13,
    "name": "Băng thông Khách",
    "description": "Giới hạn băng thông cho khách",
    "type": "BANDWIDTH",
    "downloadLimit": 5,
    "uploadLimit": 2,
    "applyToRoles": ["guest"],
    "applyToArea": "Cơ sở Dĩ An - Tòa nhà A",
    "applyByTime": "8:00-17:00"
  },
  "message": "Created"
}
```

#### Response field description

| Field | Type | I/O | Note |
|-------|------|-----|------|
| statusCode | number | Output | Mã trạng thái response |
| data | WifiPolicy | Output | Bản ghi vừa tạo |
| message | string | Output | Thông điệp kết quả |

### 6.3 Endpoint: PUT /api/v1/wifi-policies/:id

| Property | Value |
|----------|-------|
| Label Name | Update WiFi Policy |
| Data Format | JSON |
| I/O | Input/Output |
| Note | Cập nhật chính sách theo ID |

#### Params

##### Path Params

| Tên trường | Loại dữ liệu | I/O | Ghi chú |
|------------|--------------|-----|---------|
| id | number | Input | ID policy cần cập nhật (required) |

##### Query Params

- Không có

#### Body parameters

| Tên trường | Loại dữ liệu | I/O | Ghi chú |
|------------|--------------|-----|---------|
| name | string | Input | Tên chính sách |
| description | string | Input | Mô tả |
| type | string | Input | Loại chính sách |
| downloadLimit | number | Input | Giới hạn tải xuống Mbps |
| uploadLimit | number | Input | Giới hạn tải lên Mbps |
| applyToRoles | string[] | Input | Danh sách role áp dụng |
| applyToArea | string | Input | Khu vực áp dụng |
| applyByTime | string | Input | Khung thời gian áp dụng |

#### Response data (JSON)

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "name": "Băng thông Sinh viên",
    "description": "Giới hạn băng thông cho sinh viên năm nhất",
    "type": "BANDWIDTH",
    "downloadLimit": 15,
    "uploadLimit": 6,
    "applyToRoles": ["user"]
  },
  "message": "Updated"
}
```

#### Response field description

| Field | Type | I/O | Note |
|-------|------|-----|------|
| statusCode | number | Output | Mã trạng thái response |
| data | WifiPolicy | Output | Bản ghi sau cập nhật |
| message | string | Output | Thông điệp kết quả |

### 6.4 Endpoint: DELETE /api/v1/wifi-policies/:id

| Property | Value |
|----------|-------|
| Label Name | Delete WiFi Policy |
| Data Format | JSON |
| I/O | Input/Output |
| Note | Xóa chính sách theo ID |

#### Params

##### Path Params

| Tên trường | Loại dữ liệu | I/O | Ghi chú |
|------------|--------------|-----|---------|
| id | number | Input | ID policy cần xóa (required) |

##### Query Params

- Không có

##### Body

- Không có

#### Response data (JSON)

```json
{
  "statusCode": 200,
  "data": null,
  "message": "Deleted"
}
```

#### Response field description

| Field | Type | I/O | Note |
|-------|------|-----|------|
| statusCode | number | Output | Mã trạng thái response |
| data | null | Output | Không có dữ liệu trả về |
| message | string | Output | Thông điệp kết quả |

---

## 7. Mô tả chức năng

### 7.1 WP001 - Hiển thị danh sách policy tab Băng thông

- Đọc dữ liệu từ Redux store: state.policies.policies.data.
- Render bảng theo cột cố định.
- Có empty state nếu không có bản ghi.

### 7.2 WP002 - Tạo mới chính sách băng thông

- Nút Thêm chính sách khởi tạo policyForm với type = bandwidth.
- Dialog cho phép nhập các trường chính sách.
- Submit gọi createWifiPolicyAsync và đồng bộ backend.

### 7.3 WP003 - Chỉnh sửa chính sách

- Mỗi dòng có nút Sửa để set selectedPolicy và policyForm theo dữ liệu hiện tại.
- Dialog edit cập nhật dữ liệu qua updateWifiPolicyAsync.
- Thành công thì cập nhật lại bản ghi trong store.

### 7.4 WP004 - Xóa chính sách

- Nút Xóa mở dialog xác nhận theo selectedPolicy.
- Xác nhận xóa gọi deleteWifiPolicyAsync(policyId).
- Thành công thì remove bản ghi khỏi danh sách.

---

## 8. Ghi chú triển khai

1. Tab Băng thông hiện render toàn bộ mảng policies, chưa filter theo type = bandwidth.
2. Logic filter theo filterRole/filterArea/filterTime/filterSearch đã có khung nhưng đang comment.
3. Filter Controller được lưu ở Redux nhưng chưa áp dụng vào bảng tab Băng thông.
4. Ánh xạ role API/UI đang normalize tại tầng API:
   - API -> UI: user/student -> Sinh viên, staff/teacher/admin -> Cán bộ, guest -> Khách.
   - UI -> API: Sinh viên -> user, Cán bộ -> employee, Khách -> guest.

---

## 9. Ánh xạ source code

- Bandwidth tab UI: src/features/policies/components/tabs/BandwidthPolicyTab.tsx
- Feature container và tab actions: src/features/policies/components/PoliciesFeature.tsx
- Filter bar: src/features/policies/components/PoliciesFilterBar.tsx
- Add/Edit/Delete dialogs: src/features/policies/components/dialogs/PolicyDialogs.tsx
- Redux slice và async thunks: src/features/policies/slices/policiesSlice.ts
- API adapter: src/features/policies/api/policiesApi.ts
- Data model và sample policies: src/data/mockData.ts
