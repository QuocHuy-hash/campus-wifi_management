# TAI LIEU DAC TA: Quan ly Chinh sach WiFi (Tab Bang thong)
**System Name:** HCMUS WiFi Management  
**Module:** Policy Management  
**Ngay tao:** 2026-04-01  
**Version:** 2.0

---

## MUC LUC

1. [Tong quan](#1-tong-quan)
2. [Bo cuc man hinh](#2-bo-cuc-man-hinh)
3. [Luong xu ly (Sequence)](#3-luong-xu-ly-sequence)
4. [Danh sach Screen Items](#4-danh-sach-screen-items)
5. [Data Input Checking](#5-data-input-checking)
6. [Data Items (API Contract)](#6-data-items-api-contract)
7. [Mo ta chuc nang](#7-mo-ta-chuc-nang)
8. [Ghi chu trien khai](#8-ghi-chu-trien-khai)
9. [Anh xa source code](#9-anh-xa-source-code)

---

## 1. Tong quan

### 1.1 Thong tin he thong

| Truong | Gia tri |
|-------|--------|
| **System Name** | HCMUS WiFi Management |
| **Module** | Policy Management |
| **Feature** | WiFi Policy Management |
| **Pham vi** | Tab Bang thong va cac dialog CRUD lien quan |
| **Create Date** | 2026-04-01 |
| **Create By** | Development Team |

### 1.2 Danh sach chuc nang

| Function ID | Ten chuc nang | Form ID | Form Name |
|-------------|---------------|---------|-----------|
| **WP001** | Hien thi danh sach policy tren tab Bang thong | POLICY-S1 | Bang thong - Danh sach chinh sach |
| **WP002** | Tao moi chinh sach bang thong | POLICY-S2 | Them chinh sach |
| **WP003** | Cap nhat chinh sach bang thong | POLICY-S3 | Chinh sua chinh sach |
| **WP004** | Xoa chinh sach | POLICY-S4 | Xac nhan xoa chinh sach |

### 1.3 Muc tieu nghiep vu

- Cho phep quan tri vien xem danh sach chinh sach WiFi tren tab Bang thong.
- Cho phep tao moi, cap nhat, xoa chinh sach bang dialog dung chung cua module Policy.
- Quan ly thong tin cot loi cua policy bang thong: ten, mo ta, gioi han download/upload, pham vi ap dung theo vai tro/khu vuc/thoi gian.
- Dong bo du lieu voi backend thong qua API wifi-policies.

---

## 2. Bo cuc man hinh

### 2.1 Man hinh tab Bang thong (POLICY-S1)

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ [Header] Quan tri Chinh sach                                                           │
│ [Filter Bar] Vai tro | Khu vuc | Thoi gian | Controller | Tim kiem | Dat lai          │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ [Tabs] Bang thong | Xac thuc | Kiem toan | Bao mat | Cap quyen                         │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ [Section] Chinh sach Bang thong                                       [+ Them chinh sach]│
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ [Table]                                                                                 │
│ ┌──────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Ten chinh sach | Mo ta | Tai xuong | Tai len | Ap dung cho | Hanh dong            │ │
│ │--------------------------------------------------------------------------------------│ │
│ │ Bang thong Sinh vien | ... | 10 Mbps | 5 Mbps | [Sinh vien] | [Sua] [Xoa]         │ │
│ └──────────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Dialog them/chinh sua (POLICY-S2/POLICY-S3)

```
┌──────────────────────────────────────────────────────────────────┐
│ Them/Chinh sua Chinh sach                                  [×]  │
├──────────────────────────────────────────────────────────────────┤
│ Ten Chinh sach                                                 │
│ Mo ta                                                          │
│                                                                 │
│ [Neu type = bandwidth]                                          │
│ - Gioi han Tai xuong (Mbps)                                     │
│ - Gioi han Tai len (Mbps)                                       │
│                                                                 │
│ Ap dung cho Vai tro: [Sinh vien] [Can bo] [Khach]              │
│ Ap dung theo Khu vuc: [Select]                                 │
│ Ap dung theo Thoi gian: [Select]                               │
│                                                                 │
│ [Huy]                                             [Tao/Luu]     │
└──────────────────────────────────────────────────────────────────┘
```

### 2.3 Dialog xac nhan xoa (POLICY-S4)

```
┌───────────────────────────────────────────────────────────────┐
│ Xac nhan xoa chinh sach                                      │
├───────────────────────────────────────────────────────────────┤
│ Ban co chac chan muon xoa chinh sach <Ten chinh sach>?       │
│ Cac nguoi dung dang ap dung chinh sach nay se bi anh huong.  │
│                                                               │
│ [Huy]                                 [Xoa]                   │
└───────────────────────────────────────────────────────────────┘
```

---

## 3. Luong xu ly (Sequence)

### 3.1 Tai danh sach policy cho tab Bang thong

```
User -> Frontend (PoliciesFeature): Mo trang Policy
Frontend -> Redux: dispatch(loadWifiPolicies)
Redux -> policiesApi: GET /wifi-policies
policiesApi -> Backend: Request policy list
Backend -> policiesApi: Policy[]
policiesApi -> Redux: normalize du lieu
Redux -> Frontend: update state.policies.policies.data
Frontend -> BandwidthPolicyTab: render table
```

### 3.2 Tao moi chinh sach bang thong

```
User -> Frontend: Click "Them chinh sach"
Frontend -> Redux: setPolicyForm({ type: 'bandwidth' }), setAddPolicyDialogOpen(true)
User -> Dialog: Nhap du lieu va click "Tao chinh sach"
Dialog -> Redux thunk: createWifiPolicyAsync(payload)
Redux thunk -> policiesApi: POST /wifi-policies
policiesApi -> Backend: Tao policy
Backend -> policiesApi: Tra ve policy moi
policiesApi -> Redux: Normalize response
Redux -> Store: push record moi, dong dialog, reset form
Frontend -> Table: render dong moi
```

### 3.3 Cap nhat chinh sach

```
User -> Table: Click Sua
Table -> Redux: setSelectedPolicy + setPolicyForm + mo dialog edit
User -> Dialog: Cap nhat thong tin va click "Luu thay doi"
Dialog -> Redux thunk: updateWifiPolicyAsync(policy)
Redux thunk -> policiesApi: PUT /wifi-policies/:id
Backend -> policiesApi: Tra ve ban ghi da cap nhat
policiesApi -> Redux: Normalize response
Redux -> Store: replace row theo id, dong dialog, clear selection/form
```

### 3.4 Xoa chinh sach

```
User -> Table: Click Xoa
Table -> Redux: setSelectedPolicy + mo dialog xoa
User -> Dialog: Xac nhan xoa
Dialog -> Redux thunk: deleteWifiPolicyAsync(id)
Redux thunk -> policiesApi: DELETE /wifi-policies/:id
Backend -> policiesApi: 200/204
Redux -> Store: remove row, dong dialog, clear selection
Frontend -> Table: dong du lieu bien mat khoi danh sach
```

---

## 4. Danh sach Screen Items

### 4.1 Bang tab Bang thong (POLICY-S1)

| STT | Item Name | Field Name | I/O | Type | Data Format | Required | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|----------|-------------|-------|
| 1 | Policy Name | name | O | Text | String | - | WP001 | Hien thi ten chinh sach |
| 2 | Description | description | O | Text | String | - | WP001 | Cat ngan khi qua dai |
| 3 | Download Limit | downloadLimit | O | Badge | Number (Mbps) | - | WP001 | Mac dinh 0 neu null/undefined |
| 4 | Upload Limit | uploadLimit | O | Badge | Number (Mbps) | - | WP001 | Mac dinh 0 neu null/undefined |
| 5 | Apply Roles | applyToRoles | O | Tag List | String[] | - | WP001 | Badge theo vai tro |
| 6 | Edit Action | editBtn | I | Button | Icon | - | WP003 | Mo dialog chinh sua |
| 7 | Delete Action | deleteBtn | I | Button | Icon | - | WP004 | Mo dialog xac nhan xoa |
| 8 | Empty State | emptyState | O | Text | String | - | WP001 | "Chua co chinh sach bang thong nao" |

### 4.2 Inputs dialog them/chinh sua (POLICY-S2/POLICY-S3)

| STT | Item Name | Field Name | I/O | Type | Data Format | Required | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|----------|-------------|-------|
| 1 | Policy Name | name | I/O | Input | String | Khuyen nghi co | WP002/WP003 | Text tu do |
| 2 | Description | description | I/O | Input | String | Khong | WP002/WP003 | Text ngan |
| 3 | Download Limit | downloadLimit | I/O | Input number | Number | Khong | WP002/WP003 | Don vi Mbps |
| 4 | Upload Limit | uploadLimit | I/O | Input number | Number | Khong | WP002/WP003 | Don vi Mbps |
| 5 | Apply Roles | applyToRoles | I/O | Checkbox group | String[] | Khong | WP002/WP003 | Sinh vien/Can bo/Khach |
| 6 | Apply Area | applyToArea | I/O | Select | String | Khong | WP002/WP003 | Rong = tat ca |
| 7 | Apply Time | applyByTime | I/O | Select | String | Khong | WP002/WP003 | Rong = 24/7 |
| 8 | Submit | submitBtn | I | Button | Action | - | WP002/WP003 | Tao moi hoac luu thay doi |
| 9 | Cancel | cancelBtn | I | Button | Action | - | WP002/WP003 | Dong dialog |

### 4.3 Items dialog xoa (POLICY-S4)

| STT | Item Name | Field Name | I/O | Type | Required | Function ID | Notes |
|-----|-----------|------------|-----|------|----------|-------------|-------|
| 1 | Confirmation Message | deleteMsg | O | Text | - | WP004 | Hien thi ten policy duoc chon |
| 2 | Cancel Button | cancelDeleteBtn | I | Button | - | WP004 | Dong dialog |
| 3 | Confirm Button | confirmDeleteBtn | I | Button | - | WP004 | Goi xoa policy |

---

## 5. Data Input Checking

| System Name | HCMUS WiFi Management | CreateAt | 01/04/2026 |
|-------------|------------------------|----------|------------|
| Module | Policy Management (WiFi Policies) | Create By | Quoc Huy |
| Form ID | Policy Management Form | Update At | 01/04/2026 |
| Form Name | Quan ly Chinh sach WiFi (Bang thong) | Update By | Quoc Huy |

Ky hieu: [(I/O)]:Input / O:Output / I/O:Input-Output  
[(Type)L:Label / T:Text / TA:TextArea / S:Select / C:Checkbox / R:Radio / B:Button / H:Hidden / I:Image / Ln:Link / O:Other]

### Bandwidth Policy Input Validation

| NO | Label Name | Field Name | I/O | Type | Data Format | Size | Required | Characters | Rule | MessageId | Event | Messages |
|----|------------|------------|-----|------|-------------|------|----------|------------|------|-----------|-------|----------|
| 1 | Ten Chinh sach | name | I | T | Text | 100 | X | UTF-8 | Required, Unique | ERR_WP001 | OnSubmit | Ten chinh sach khong duoc de trong |
| 2 | Mo ta | description | I | TA | Text | 255 |  | UTF-8 | Optional |  |  |  |
| 3 | Gioi han Tai xuong (Mbps) | downloadLimit | I | T | Number | 5 | X | 0-99999 | Required, Min(0) | ERR_WP002 | OnSubmit | Tai xuong phai lon hon hoac bang 0 |
| 4 | Gioi han Tai len (Mbps) | uploadLimit | I | T | Number | 5 | X | 0-99999 | Required, Min(0) | ERR_WP003 | OnSubmit | Tai len phai lon hon hoac bang 0 |
| 5 | Ap dung cho Vai tro | applyToRoles | I | C | List | 3 | X | Predefined Enum | Required, MinSelection(1) | ERR_WP004 | OnSubmit | Vui long chon it nhat mot vai tro |
| 6 | Ap dung theo Khu vuc | applyToArea | I | S | Text | 120 |  | UTF-8 | Optional |  |  |  |
| 7 | Ap dung theo Thoi gian | applyByTime | I | S | Text | 50 |  | UTF-8 | Optional |  |  |  |
| 8 | Tao chinh sach | createBtn | I | B | Action | - | - | - | Trigger create API |  | OnClick |  |
| 9 | Luu thay doi | updateBtn | I | B | Action | - | - | - | Trigger update API |  | OnClick |  |
| 10 | Xoa chinh sach | deleteBtn | I | B | Action | - | - | - | Trigger delete confirmation |  | OnClick |  |

### Ghi chu hanh vi UI thuc te

- Hien tai code chua enforce day du cac rule Required/Unique o tang UI cho name, downloadLimit, uploadLimit, applyToRoles.
- Cac rule tren la chuan dac ta de backend va UI thong nhat khi trien khai validation chinh thuc.

---

## 6. Data Items (API Contract)

### 6.1 Endpoint: GET /api/v1/wifi-policies

| Property | Value |
|----------|-------|
| Label Name | Get WiFi Policies |
| Data Format | JSON |
| I/O | Output |
| Note | Lay toan bo danh sach chinh sach WiFi |

#### Params

- Path Params: Khong co
- Query Params: Khong co
- Body: Khong co

#### Response data (JSON)

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "name": "Bang thong Sinh vien",
      "description": "Gioi han bang thong cho sinh vien",
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
| statusCode | number | Output | Ma trang thai response |
| data | WifiPolicy[] | Output | Danh sach chinh sach |
| message | string | Output | Thong diep ket qua |
| data[].id | number | Output | ID chinh sach |
| data[].name | string | Output | Ten chinh sach |
| data[].description | string | Output | Mo ta chinh sach |
| data[].type | string | Output | Loai policy (BANDWIDTH/AUTH/...) |
| data[].downloadLimit | number | Output | Gioi han tai xuong (Mbps) |
| data[].uploadLimit | number | Output | Gioi han tai len (Mbps) |
| data[].applyToRoles | string[] | Output | Danh sach role ap dung |
| data[].applyToArea | string | Output | Khu vuc ap dung |
| data[].applyByTime | string | Output | Thoi gian ap dung |

### 6.2 Endpoint: POST /api/v1/wifi-policies

| Property | Value |
|----------|-------|
| Label Name | Create WiFi Policy |
| Data Format | JSON |
| I/O | Input/Output |
| Note | Tao moi chinh sach WiFi |

#### Params

- Path Params: Khong co
- Query Params: Khong co

#### Body parameters

| Ten truong | Loai du lieu | I/O | Ghi chu |
|------------|--------------|-----|---------|
| name | string | Input | Ten chinh sach (required) |
| description | string | Input | Mo ta (optional) |
| type | string | Input | Loai chinh sach, vi du BANDWIDTH (required) |
| downloadLimit | number | Input | Gioi han tai xuong Mbps |
| uploadLimit | number | Input | Gioi han tai len Mbps |
| applyToRoles | string[] | Input | Danh sach role ap dung |
| applyToArea | string | Input | Khu vuc ap dung |
| applyByTime | string | Input | Khung thoi gian ap dung |

#### Response data (JSON)

```json
{
  "statusCode": 201,
  "data": {
    "id": 13,
    "name": "Bang thong Khach",
    "description": "Gioi han bang thong cho khach",
    "type": "BANDWIDTH",
    "downloadLimit": 5,
    "uploadLimit": 2,
    "applyToRoles": ["guest"],
    "applyToArea": "Co so Di An - Toa nha A",
    "applyByTime": "8:00-17:00"
  },
  "message": "Created"
}
```

#### Response field description

| Field | Type | I/O | Note |
|-------|------|-----|------|
| statusCode | number | Output | Ma trang thai response |
| data | WifiPolicy | Output | Ban ghi vua tao |
| message | string | Output | Thong diep ket qua |

### 6.3 Endpoint: PUT /api/v1/wifi-policies/:id

| Property | Value |
|----------|-------|
| Label Name | Update WiFi Policy |
| Data Format | JSON |
| I/O | Input/Output |
| Note | Cap nhat chinh sach theo ID |

#### Params

##### Path Params

| Ten truong | Loai du lieu | I/O | Ghi chu |
|------------|--------------|-----|---------|
| id | number | Input | ID policy can cap nhat (required) |

##### Query Params

- Khong co

#### Body parameters

| Ten truong | Loai du lieu | I/O | Ghi chu |
|------------|--------------|-----|---------|
| name | string | Input | Ten chinh sach |
| description | string | Input | Mo ta |
| type | string | Input | Loai chinh sach |
| downloadLimit | number | Input | Gioi han tai xuong Mbps |
| uploadLimit | number | Input | Gioi han tai len Mbps |
| applyToRoles | string[] | Input | Danh sach role ap dung |
| applyToArea | string | Input | Khu vuc ap dung |
| applyByTime | string | Input | Khung thoi gian ap dung |

#### Response data (JSON)

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "name": "Bang thong Sinh vien",
    "description": "Gioi han bang thong cho sinh vien nam nhat",
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
| statusCode | number | Output | Ma trang thai response |
| data | WifiPolicy | Output | Ban ghi sau cap nhat |
| message | string | Output | Thong diep ket qua |

### 6.4 Endpoint: DELETE /api/v1/wifi-policies/:id

| Property | Value |
|----------|-------|
| Label Name | Delete WiFi Policy |
| Data Format | JSON |
| I/O | Input/Output |
| Note | Xoa chinh sach theo ID |

#### Params

##### Path Params

| Ten truong | Loai du lieu | I/O | Ghi chu |
|------------|--------------|-----|---------|
| id | number | Input | ID policy can xoa (required) |

##### Query Params

- Khong co

##### Body

- Khong co

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
| statusCode | number | Output | Ma trang thai response |
| data | null | Output | Khong co du lieu tra ve |
| message | string | Output | Thong diep ket qua |

---

## 7. Mo ta chuc nang

### 7.1 WP001 - Hien thi danh sach policy tab Bang thong

- Doc du lieu tu Redux store: state.policies.policies.data.
- Render bang theo cot co dinh.
- Co empty state neu khong co ban ghi.

### 7.2 WP002 - Tao moi chinh sach bang thong

- Nut Them chinh sach khoi tao policyForm voi type = bandwidth.
- Dialog cho phep nhap cac truong chinh sach.
- Submit goi createWifiPolicyAsync va dong bo backend.

### 7.3 WP003 - Chinh sua chinh sach

- Moi dong co nut Sua de set selectedPolicy va policyForm theo du lieu hien tai.
- Dialog edit cap nhat du lieu qua updateWifiPolicyAsync.
- Thanh cong thi cap nhat lai ban ghi trong store.

### 7.4 WP004 - Xoa chinh sach

- Nut Xoa mo dialog xac nhan theo selectedPolicy.
- Xac nhan xoa goi deleteWifiPolicyAsync(policyId).
- Thanh cong thi remove ban ghi khoi danh sach.

---

## 8. Ghi chu trien khai

1. Tab Bang thong hien render toan bo mang policies, chua filter theo type = bandwidth.
2. Logic filter theo filterRole/filterArea/filterTime/filterSearch da co khung nhung dang comment.
3. Filter Controller duoc luu o Redux nhung chua ap dung vao bang tab Bang thong.
4. Anh xa role API/UI dang normalize tai tang API:
   - API -> UI: user/student -> Sinh vien, staff/teacher/admin -> Can bo, guest -> Khach.
   - UI -> API: Sinh vien -> user, Can bo -> employee, Khach -> guest.

---

## 9. Anh xa source code

- Bandwidth tab UI: src/features/policies/components/tabs/BandwidthPolicyTab.tsx
- Feature container va tab actions: src/features/policies/components/PoliciesFeature.tsx
- Filter bar: src/features/policies/components/PoliciesFilterBar.tsx
- Add/Edit/Delete dialogs: src/features/policies/components/dialogs/PolicyDialogs.tsx
- Redux slice va async thunks: src/features/policies/slices/policiesSlice.ts
- API adapter: src/features/policies/api/policiesApi.ts
- Data model va sample policies: src/data/mockData.ts
