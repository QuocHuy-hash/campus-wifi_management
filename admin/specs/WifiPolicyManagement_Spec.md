# SPECIFICATION DOCUMENT: WiFi Policy Management (Bandwidth Tab)
**System Name:** HCMUS WiFi Management  
**Module:** Policy Management  
**Date:** 2026-04-01  
**Version:** 1.0

---

## TABLE OF CONTENTS

1. [Title & Overview](#1-title--overview)
2. [Screen Layout](#2-screen-layout)
3. [Sequence Diagram](#3-sequence-diagram)
4. [Screen Items](#4-screen-items)
5. [Data Input Checking](#5-data-input-checking)
6. [Data Items](#6-data-items)
7. [Function Describe](#7-function-describe)
8. [Implementation Notes](#8-implementation-notes)

---

## 1. TITLE & OVERVIEW

### 1.1 System Information

| Field | Value |
|-------|-------|
| **System Name** | HCMUS WiFi Management |
| **Module** | Policy Management |
| **Feature** | WiFi Policy Management |
| **Scope** | Bandwidth tab and related CRUD dialogs |
| **Create Date** | 2026-04-01 |
| **Create By** | Development Team |

### 1.2 Function Summary

| Function ID | Function Name | Form ID | Form Name |
|-------------|---------------|---------|-----------|
| **WP001** | List Policies in Bandwidth Tab | POLICY-S1 | Băng thông - Danh sách chính sách |
| **WP002** | Create Bandwidth Policy | POLICY-S2 | Thêm chính sách |
| **WP003** | Update Bandwidth Policy | POLICY-S3 | Chỉnh sửa chính sách |
| **WP004** | Delete Policy | POLICY-S4 | Xác nhận xóa chính sách |

### 1.3 Purpose

- Cho phép quản trị viên xem danh sách chính sách WiFi trên tab Băng thông.
- Cho phép thêm mới, chỉnh sửa, xóa chính sách bằng dialog dùng chung của module Policy.
- Quản lý các thông tin chính của chính sách băng thông: tên, mô tả, giới hạn tải xuống/tải lên, phạm vi áp dụng theo vai trò/khu vực/thời gian.
- Đồng bộ dữ liệu với backend thông qua API wifi-policies.

---

## 2. SCREEN LAYOUT

### 2.1 Bandwidth Policy Tab Screen (POLICY-S1)

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ [Header] Quản trị Chính sách                                                           │
│ [Filter Bar] Vai trò | Khu vực | Thời gian | Controller | Tìm kiếm | Đặt lại          │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ [Tabs] Băng thông | Xác thực | Kiểm toán | Bảo mật | Cấp quyền                         │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ [Section] Chính sách Băng thông                                         [+ Thêm chính sách]
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ [Table]                                                                                 │
│ ┌──────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Tên chính sách | Mô tả | Tải xuống | Tải lên | Áp dụng cho | Hành động            │ │
│ │--------------------------------------------------------------------------------------│ │
│ │ Băng thông Sinh viên | ... | 10 Mbps | 5 Mbps | [Sinh viên] | [Sửa] [Xóa]         │ │
│ └──────────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Add/Edit Policy Dialog (POLICY-S2/POLICY-S3)

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

### 2.3 Delete Confirmation Dialog (POLICY-S4)

```
┌───────────────────────────────────────────────────────┐
│ Xác nhận xóa chính sách                               │
├───────────────────────────────────────────────────────┤
│ Bạn có chắc chắn muốn xóa chính sách <Tên chính sách>?│
│ Các người dùng đang áp dụng chính sách này sẽ bị ảnh hưởng. │
│                                                       │
│ [Hủy]                                 [Xóa]           │
└───────────────────────────────────────────────────────┘
```

---

## 3. SEQUENCE DIAGRAM

### 3.1 Load Policies for Bandwidth Tab

```
User -> Frontend (PoliciesFeature): Open Policy page
Frontend -> Redux: dispatch(loadWifiPolicies)
Redux -> policiesApi: GET /wifi-policies
policiesApi -> Backend: Request policy list
Backend -> policiesApi: Policy[]
policiesApi -> Redux: normalize and return data
Redux -> Frontend: update state.policies.policies.data
Frontend -> BandwidthPolicyTab: render rows in table
```

### 3.2 Create Bandwidth Policy

```
User -> Frontend: Click "Thêm chính sách"
Frontend -> Redux: setPolicyForm({ type: 'bandwidth' }), setAddPolicyDialogOpen(true)
User -> Dialog: Fill form and click "Tạo chính sách"
Dialog -> Redux thunk: createWifiPolicyAsync(payload)
Redux thunk -> policiesApi: POST /wifi-policies
policiesApi -> Backend: create policy
Backend -> policiesApi: created policy
policiesApi -> Redux: return normalized policy
Redux -> Store: push new record, close add dialog, reset form
Frontend -> Table: re-render with new row
```

### 3.3 Update Policy

```
User -> Table: Click Edit
Table -> Redux: setSelectedPolicy + setPolicyForm + open edit dialog
User -> Dialog: Update fields and click "Lưu thay đổi"
Dialog -> Redux thunk: updateWifiPolicyAsync(policy)
Redux thunk -> policiesApi: PUT /wifi-policies/:id
Backend -> policiesApi: updated policy
policiesApi -> Redux: return normalized policy
Redux -> Store: replace row by id, close dialog, clear selection/form
```

### 3.4 Delete Policy

```
User -> Table: Click Delete
Table -> Redux: setSelectedPolicy + open delete dialog
User -> Dialog: Confirm delete
Dialog -> Redux thunk: deleteWifiPolicyAsync(id)
Redux thunk -> policiesApi: DELETE /wifi-policies/:id
Backend -> policiesApi: 200/204 success
Redux -> Store: remove row by id, close dialog, clear selection
Frontend -> Table: row disappears
```

---

## 4. SCREEN ITEMS

### 4.1 Bandwidth Tab Table (POLICY-S1)

| STT | Item Name | Field Name | I/O | Type | Data Format | Required | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|----------|-------------|-------|
| 1 | Policy Name | name | O | Text | String | - | WP001 | Hiển thị tên chính sách |
| 2 | Description | description | O | Text | String | - | WP001 | Cắt ngắn khi dài |
| 3 | Download Limit | downloadLimit | O | Badge | Number (Mbps) | - | WP001 | Mặc định 0 nếu null/undefined |
| 4 | Upload Limit | uploadLimit | O | Badge | Number (Mbps) | - | WP001 | Mặc định 0 nếu null/undefined |
| 5 | Apply Roles | applyToRoles | O | Tag List | String[] | - | WP001 | Hiển thị dạng badge theo vai trò |
| 6 | Edit Action | editBtn | I | Button | Icon | - | WP003 | Mở dialog chỉnh sửa |
| 7 | Delete Action | deleteBtn | I | Button | Icon | - | WP004 | Mở dialog xác nhận xóa |
| 8 | Empty State | emptyState | O | Text | String | - | WP001 | "Chưa có chính sách băng thông nào" |

### 4.2 Add/Edit Policy Dialog Inputs (POLICY-S2/POLICY-S3)

| STT | Item Name | Field Name | I/O | Type | Data Format | Required | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|----------|-------------|-------|
| 1 | Policy Name | name | I/O | Input | String | Khuyến nghị có | WP002/WP003 | Text tự do |
| 2 | Description | description | I/O | Input | String | Không | WP002/WP003 | Text ngắn |
| 3 | Download Limit | downloadLimit | I/O | Input number | Number | Không | WP002/WP003 | Đơn vị Mbps |
| 4 | Upload Limit | uploadLimit | I/O | Input number | Number | Không | WP002/WP003 | Đơn vị Mbps |
| 5 | Apply Roles | applyToRoles | I/O | Checkbox group | String[] | Không | WP002/WP003 | Sinh viên/Cán bộ/Khách |
| 6 | Apply Area | applyToArea | I/O | Select | String | Không | WP002/WP003 | Giá trị rỗng nghĩa là tất cả |
| 7 | Apply Time | applyByTime | I/O | Select | String | Không | WP002/WP003 | Giá trị rỗng nghĩa là 24/7 |
| 8 | Submit | submitBtn | I | Button | Action | - | WP002/WP003 | Tạo hoặc lưu thay đổi |
| 9 | Cancel | cancelBtn | I | Button | Action | - | WP002/WP003 | Đóng dialog |

### 4.3 Delete Dialog Items (POLICY-S4)

| STT | Item Name | Field Name | I/O | Type | Required | Function ID | Notes |
|-----|-----------|------------|-----|------|----------|-------------|-------|
| 1 | Confirmation Message | deleteMsg | O | Text | - | WP004 | Hiển thị tên policy được chọn |
| 2 | Cancel Button | cancelDeleteBtn | I | Button | - | WP004 | Đóng dialog |
| 3 | Confirm Button | confirmDeleteBtn | I | Button | - | WP004 | Gọi xóa policy |

---

## 5. DATA INPUT CHECKING

| System Name | HCMUS WiFi Management | CreateAt | 01/04/2026 |
|-------------|------------------------|----------|------------|
| Module | Policy Management (WiFi Policies) | Create By | Quốc Huy |
| Form ID | Policy Management Form | Update At | 01/04/2026 |
| Form Name | Quản lý Chính sách WiFi (Băng thông) | Update By | Quốc Huy |

Ký hiệu: `[(I/O)]:Input / O:Output / I/O:Input-Output` `[(Type)L:Label / T:Text / TA:TextArea / S:Select / C:Checkbox / R:Radio / B:Button / H:Hidden / I:Image / Ln:Link / O:Other]`

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

### Actual UI Behavior Note

- Hiện tại code chưa enforce đầy đủ các rule Required/Unique ở tầng UI cho `name`, `downloadLimit`, `uploadLimit`, `applyToRoles`.
- Các rule trên là chuẩn đặc tả để backend và UI thống nhất khi triển khai validation chính thức.

---

## 6. DATA ITEMS

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
| data | WifiPolicy | Output | Bản ghi chính sách vừa tạo |
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
| data | WifiPolicy | Output | Bản ghi chính sách sau cập nhật |
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

## 7. FUNCTION DESCRIBE

### 7.1 WP001 - Hiển thị danh sách policy ở tab Băng thông

- Đọc dữ liệu từ Redux store: state.policies.policies.data.
- Render dạng bảng với các cột cố định.
- Hỗ trợ trạng thái rỗng khi không có bản ghi.

### 7.2 WP002 - Thêm chính sách băng thông

- Nút "Thêm chính sách" khởi tạo policyForm với type = bandwidth.
- Dialog cho phép nhập các trường chính sách.
- Submit gọi createWifiPolicyAsync và đồng bộ lên backend.

### 7.3 WP003 - Chỉnh sửa chính sách

- Tại mỗi dòng, nút sửa gán selectedPolicy và policyForm theo policy hiện tại.
- Dialog edit cập nhật dữ liệu qua updateWifiPolicyAsync.
- Thành công thì cập nhật lại record trong store.

### 7.4 WP004 - Xóa chính sách

- Nút xóa mở dialog xác nhận theo selectedPolicy.
- Xác nhận xóa gọi deleteWifiPolicyAsync(policyId).
- Thành công thì xóa record khỏi danh sách.

---

## 8. IMPLEMENTATION NOTES

1. Tab băng thông hiện render toàn bộ mảng policies mà chưa lọc theo type = bandwidth.
2. Logic lọc theo filterRole/filterArea/filterTime/filterSearch đã có khung trong component nhưng đang được comment.
3. Filter Controller được lưu ở Redux nhưng chưa được áp dụng vào bảng tab băng thông.
4. Ánh xạ role API/UI đang được normalize tại tầng API:
   - API -> UI: user/student -> Sinh viên, staff/teacher/admin -> Cán bộ, guest -> Khách.
   - UI -> API: Sinh viên -> user, Cán bộ -> employee, Khách -> guest.

---

## Source Mapping (Code)

- Bandwidth tab UI: src/features/policies/components/tabs/BandwidthPolicyTab.tsx
- Feature container and tab actions: src/features/policies/components/PoliciesFeature.tsx
- Filter bar: src/features/policies/components/PoliciesFilterBar.tsx
- Add/Edit/Delete dialogs: src/features/policies/components/dialogs/PolicyDialogs.tsx
- Redux slice and async thunks: src/features/policies/slices/policiesSlice.ts
- API adapter: src/features/policies/api/policiesApi.ts
- Data model and sample policies: src/data/mockData.ts
