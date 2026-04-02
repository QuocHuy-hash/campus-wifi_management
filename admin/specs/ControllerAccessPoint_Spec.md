# SPECIFICATION DOCUMENT: Controller & Access Point Management
**System Name:** HCMUS WiFi Management  
**Module:** Device Management  
**Date:** 2026-03-30  
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

---

## 1. TITLE & OVERVIEW

### 1.1 System Information

| Field | Value |
|-------|-------|
| **System Name** | HCMUS WiFi Management |
| **Module** | Device Management (Controllers & Access Points) |
| **Create Date** | 2026-03-30 |
| **Create By** | Development Team |

### 1.2 Function Summary

| Function ID | Function Name | Form ID | Form Name |
|-------------|---------------|---------|-----------|
| **CP001** | Controller Management | Controller Management Form | Quản lý Controller |
| **CP002** | Access Point Management | AP Management Form | Quản lý Access Point |

### 1.3 Purpose

**CP001 - Controller Management:**
- Cho phép quản trị viên thêm mới, chỉnh sửa, xóa và xem danh sách các WiFi Controllers
- Theo dõi trạng thái hoạt động của từng Controller (Online/Offline/Warning)
- Quản lý thông tin cấu hình: NAS Identifier, IP Address, MAC Address, Version
- Xem số lượng AP và Clients đang kết nối với mỗi Controller

**CP002 - Access Point Management:**
- Cho phép quản trị viên thêm mới, chỉnh sửa, xóa và xem danh sách các Access Points
- Quản lý thông tin AP: Tên, MAC Address, Model, Mô tả
- Theo dõi trạng thái và vị trí của từng AP
- Liên kết AP với Controller quản lý

---

## 2. SCREEN LAYOUT

### 2.1 Controller Management Screen (CP001-S1)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Header] Danh sách WiFi Controllers                    [+ Thêm]│
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ [Table: Controllers List]                                 │  │
│  │ ┌──────┬────────────┬──────────┬────────┬───────────────┐ │  │
│  │ │ Icon │ Tên        │ IP       │ Status │ AP  │ Clients │ │  │
│  │ ├──────┼────────────┼──────────┼────────┼───────────────┤ │  │
│  │ │ 🖥️   │ Controller1│ 192.168.1│ Online │ 12  │ 45      │ │  │
│  │ └──────┴────────────┴──────────┴────────┴───────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Access Point Management Screen (CP002-S1)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Header] Danh sách Access Points        [Search] [Building ▼] │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ [Table: AP List]                                          │  │
│  │ ┌────┬──────────┬─────────────┬────────┬────────┬────────┐│  │
│  │ │ ●  │ AP Name  │ MAC Address │ Model  │ Desc   │ Date   ││  │
│  │ ├────┼──────────┼─────────────┼────────┼────────┼────────┤│  │
│  │ │ 🟢 │ AP-001   │ AA:BB:CC... │ UniFi  │ Room 1 │ 2025   ││  │
│  │ └────┴──────────┴─────────────┴────────┴────────┴────────┘│  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Add/Edit Controller Dialog (CP001-S2)

```
┌─────────────────────────────────────────────────────┐
│  Thêm mới Controller                           [×]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  NAS Identifier *                                   │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  MAC Address *                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  IP Address *                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Version                                            │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Location Name                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│           [Hủy]              [Lưu]                  │
└─────────────────────────────────────────────────────┘
```

### 2.4 Add/Edit Access Point Dialog (CP002-S2)

```
┌─────────────────────────────────────────────────────┐
│  Thêm mới Access Point                         [×]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  AP Name *                                          │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  MAC Address *                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Model Name *                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Description                                        │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│           [Hủy]              [Lưu]                  │
└─────────────────────────────────────────────────────┘
```

---

## 3. SEQUENCE DIAGRAM

### 3.1 Load Controllers List

```
User → Frontend → API → Backend → Database
 │        │         │       │         │
 │        │         │       │         │
 └─Click──▶         │       │         │
        │           │       │         │
        └─dispatch──▶       │         │
        │  getControllers() │         │
        │           │       │         │
        │           ├─GET───▶         │
        │           │       │         │
        │           │       ├─Query───▶
        │           │       │         │
        │           │       │◀────────┘
        │           │       │  Data   │
        │           │◀──────┤         │
        │           │  JSON │         │
        │◀──────────┤       │         │
        │  Update   │       │         │
        │  State    │       │         │
        │           │       │         │
        └───────────Render Table──────▶
```

### 3.2 Create New Controller

```
User → Frontend → API → Backend → Database
 │        │         │       │         │
 │        │         │       │         │
 └─Fill──▶         │       │         │
        │  Form    │       │         │
        │           │       │         │
 └─Click──▶         │       │         │
        │  Save    │       │         │
        │           │       │         │
        └─dispatch──▶       │         │
        │  createController │         │
        │           │       │         │
        │           ├─POST──▶         │
        │           │       │         │
        │           │       ├─Insert──▶
        │           │       │         │
        │           │       │◀────────┘
        │           │       │  ID     │
        │           │◀──────┤         │
        │           │  JSON │         │
        │◀──────────┤       │         │
        │  Success │       │         │
        │           │       │         │
        └───────────Refresh List──────▶
```

---

## 4. SCREEN ITEMS

### 4.1 Controller Management Screen (CP001-S1)

| STT | Item Name | Field Name | I/O | Type | Data Format | Size | Required | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|------|----------|-------------|-------|
| 1 | Page Title | pageTitle | O | L | Text | - | - | - | "Danh sách WiFi Controllers" |
| 2 | Add Button | addBtn | I | B | Button | - | - | CP101 | "Thêm Controller" |
| 3 | Controller Table | controllerTable | O | W | Table | - | - | - | Hiển thị danh sách controllers |
| 4 | Controller Icon | controllerIcon | O | I | Icon | - | - | - | Server icon với màu theo status |
| 5 | NAS Identifier | nasIdentifier | O | T | Text | 50 | - | - | Tên định danh controller |
| 6 | IP Address | ipAddress | O | T | Text | 15 | - | - | Địa chỉ IP |
| 7 | Status Badge | statusBadge | O | L | Badge | - | - | - | Online/Offline/Warning |
| 8 | AP Count | apCount | O | N | Number | - | - | - | Số lượng AP quản lý |
| 9 | Total Clients | totalClients | O | N | Number | - | - | - | Tổng số clients |

### 4.2 Add/Edit Controller Dialog (CP001-S2)

| STT | Item Name | Field Name | I/O | Type | Data Format | Size | Required | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|------|----------|-------------|-------|
| 1 | Dialog Title | dialogTitle | O | L | Text | - | - | - | "Thêm mới Controller" / "Chỉnh sửa Controller" |
| 2 | Close Button | closeBtn | I | B | Button | - | - | CP102 | Đóng dialog |
| 3 | NAS Identifier Input | nasIdentifier | I/O | T | Text | 50 | X | CP103 | Required |
| 4 | MAC Address Input | macAddress | I/O | T | Text | 17 | X | CP104 | Format: XX:XX:XX:XX:XX:XX |
| 5 | IP Address Input | ipAddress | I/O | T | Text | 15 | X | CP105 | Valid IPv4 |
| 6 | Version Input | version | I/O | T | Text | 20 | - | CP106 | Phiên bản firmware |
| 7 | Location Input | locationName | I/O | T | Text | 100 | - | CP107 | Vị trí lắp đặt |
| 8 | Cancel Button | cancelBtn | I | B | Button | - | - | CP108 | Hủy thao tác |
| 9 | Submit Button | submitBtn | I | B | Button | - | - | CP109 | Lưu thông tin |

### 4.3 Access Point Management Screen (CP002-S1)

| STT | Item Name | Field Name | I/O | Type | Data Format | Size | Required | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|------|----------|-------------|-------|
| 1 | Page Title | pageTitle | O | L | Text | - | - | - | "Danh sách Access Points" |
| 2 | Search Input | searchTerm | I | T | Text | 100 | - | CP201 | Tìm kiếm AP |
| 3 | Building Filter | selectedBuilding | I | S | Select | - | - | CP202 | Lọc theo tòa nhà |
| 4 | AP Table | apTable | O | W | Table | - | - | - | Hiển thị danh sách AP |
| 5 | Status Indicator | statusIndicator | O | I | Circle | - | - | - | Màu xanh/đỏ theo status |
| 6 | AP Name | apName | O | T | Text | 100 | - | - | Tên access point |
| 7 | MAC Address | macAddress | O | T | Text | 17 | - | - | Địa chỉ MAC |
| 8 | Model Name | modelName | O | T | Text | 50 | - | - | Model thiết bị |
| 9 | Description | description | O | T | Text | 200 | - | - | Mô tả |
| 10 | Created Date | createdAt | O | T | Date | - | - | - | Ngày tạo |

### 4.4 Add/Edit Access Point Dialog (CP002-S2)

| STT | Item Name | Field Name | I/O | Type | Data Format | Size | Required | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|------|----------|-------------|-------|
| 1 | Dialog Title | dialogTitle | O | L | Text | - | - | - | "Thêm mới Access Point" |
| 2 | Close Button | closeBtn | I | B | Button | - | - | CP203 | Đóng dialog |
| 3 | AP Name Input | apName | I/O | T | Text | 100 | X | CP204 | Required |
| 4 | MAC Address Input | macAddress | I/O | T | Text | 17 | X | CP205 | Format: XX:XX:XX:XX:XX:XX |
| 5 | Model Input | modelName | I/O | T | Text | 50 | X | CP206 | Required |
| 6 | Description Textarea | description | I/O | TA | Text | 200 | - | CP207 | Optional |
| 7 | Cancel Button | cancelBtn | I | B | Button | - | - | CP208 | Hủy thao tác |
| 8 | Submit Button | submitBtn | I | B | Button | - | - | CP209 | Lưu thông tin |

---

## 5. DATA INPUT CHECKING

### 5.1 Controller Input Validation

| NO | Label Name | Field Name | I/O | Type | Data Format | Size | Required | Rule | MessageId | Messages |
|----|------------|------------|-----|------|-------------|------|----------|------|-----------|----------|
| 1 | NAS Identifier | nasIdentifier | I | T | Text | 50 | X | Required, Unique | ERR_CP001 | "NAS Identifier không được để trống" |
| 2 | MAC Address | macAddress | I | T | Text | 17 | X | Required, Format | ERR_CP002 | "MAC Address không hợp lệ (XX:XX:XX:XX:XX:XX)" |
| 3 | IP Address | ipAddress | I | T | Text | 15 | X | Required, IPv4 | ERR_CP003 | "IP Address không hợp lệ" |
| 4 | Version | version | I | T | Text | 20 | - | Optional | - | - | - |
| 5 | Location Name | locationName | I | T | Text | 100 | - | Optional | - | - | - |

### 5.2 Access Point Input Validation

| NO | Label Name | Field Name | I/O | Type | Data Format | Size | Required | Rule | MessageId | Messages |
|----|------------|------------|-----|------|-------------|------|----------|------|-----------|----------|
| 1 | AP Name | apName | I | T | Text | 100 | X | Required, Unique | ERR_CP004 | "Tên AP không được để trống" |
| 2 | MAC Address | macAddress | I | T | Text | 17 | X | Required, Format | ERR_CP005 | "MAC Address không hợp lệ" |
| 3 | Model Name | modelName | I | T | Text | 50 | X | Required | ERR_CP006 | "Model không được để trống" |
| 4 | Description | description | I | TA | Text | 200 | - | Optional | - | - | - |

---

## 6. DATA ITEMS

### 6.1 Controller API

**URI:** `/api/v1/wifi-controllers`  
**Method:** GET, POST, PUT, DELETE

#### 6.1.1 Get All Controllers

**Request:**
```
GET /api/v1/wifi-controllers
```

**Response (Success - HTTP 200):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "nasIdentifier": "Controller-01",
      "macAddress": "AA:BB:CC:DD:EE:01",
      "ipAddress": "192.168.1.10",
      "version": "2.4.1",
      "status": "Online",
      "locationName": "Building A",
      "campusId": 1,
      "apCount": 12,
      "totalClients": 45
    }
  ],
  "message": "Success"
}
```

#### 6.1.2 Create Controller

**Request:**
```
POST /api/v1/wifi-controllers
Content-Type: application/json

{
  "nasIdentifier": "Controller-02",
  "macAddress": "AA:BB:CC:DD:EE:02",
  "ipAddress": "192.168.1.11",
  "version": "2.4.1",
  "locationName": "Building B"
}
```

**Response (Success - HTTP 201):**
```json
{
  "statusCode": 201,
  "data": {
    "id": 2,
    "nasIdentifier": "Controller-02",
    "macAddress": "AA:BB:CC:DD:EE:02",
    "ipAddress": "192.168.1.11",
    "version": "2.4.1",
    "status": "Offline",
    "locationName": "Building B",
    "campusId": 1
  },
  "message": "Controller created successfully"
}
```

#### 6.1.3 Update Controller

**Request:**
```
PUT /api/v1/wifi-controllers/:id
Content-Type: application/json

{
  "nasIdentifier": "Controller-02-Updated",
  "macAddress": "AA:BB:CC:DD:EE:02",
  "ipAddress": "192.168.1.11",
  "version": "2.4.2",
  "locationName": "Building B - Floor 2"
}
```

**Response (Success - HTTP 200):**
```json
{
  "statusCode": 200,
  "data": {
    "id": 2,
    "nasIdentifier": "Controller-02-Updated",
    "macAddress": "AA:BB:CC:DD:EE:02",
    "ipAddress": "192.168.1.11",
    "version": "2.4.2",
    "status": "Online",
    "locationName": "Building B - Floor 2"
  },
  "message": "Controller updated successfully"
}
```

#### 6.1.4 Delete Controller

**Request:**
```
DELETE /api/v1/wifi-controllers/:id
```

**Response (Success - HTTP 200):**
```json
{
  "statusCode": 200,
  "message": "Controller deleted successfully"
}
```

### 6.2 Access Point API

**URI:** `/api/v1/access-points`  
**Method:** GET, POST, PUT, DELETE

#### 6.2.1 Get All Access Points

**Request:**
```
GET /api/v1/access-points
```

**Response (Success - HTTP 200):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "apName": "AP-Building-A-Floor-1",
      "macAddress": "11:22:33:44:55:01",
      "modelName": "UniFi AP AC Pro",
      "description": "Main lobby access point",
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-03-20T14:45:00Z",
      "building": "Building A",
      "campusId": 1,
      "buildingId": 1,
      "locationId": 1,
      "controller": "Controller-01",
      "clients": 25,
      "usage": 75,
      "status": "Online"
    }
  ],
  "message": "Success"
}
```

#### 6.2.2 Create Access Point

**Request:**
```
POST /api/v1/access-points
Content-Type: application/json

{
  "apName": "AP-Building-B-Floor-2",
  "macAddress": "11:22:33:44:55:02",
  "modelName": "UniFi AP AC Pro",
  "description": "Second floor access point"
}
```

**Response (Success - HTTP 201):**
```json
{
  "statusCode": 201,
  "data": {
    "id": 2,
    "apName": "AP-Building-B-Floor-2",
    "macAddress": "11:22:33:44:55:02",
    "modelName": "UniFi AP AC Pro",
    "description": "Second floor access point",
    "createdAt": "2026-03-30T08:00:00Z",
    "updatedAt": "2026-03-30T08:00:00Z"
  },
  "message": "Access Point created successfully"
}
```

#### 6.2.3 Update Access Point

**Request:**
```
PUT /api/v1/access-points/:id
Content-Type: application/json

{
  "apName": "AP-Building-B-Floor-2-Updated",
  "macAddress": "11:22:33:44:55:02",
  "modelName": "UniFi AP AC Pro",
  "description": "Updated description"
}
```

**Response (Success - HTTP 200):**
```json
{
  "statusCode": 200,
  "data": {
    "id": 2,
    "apName": "AP-Building-B-Floor-2-Updated",
    "macAddress": "11:22:33:44:55:02",
    "modelName": "UniFi AP AC Pro",
    "description": "Updated description",
    "updatedAt": "2026-03-30T09:15:00Z"
  },
  "message": "Access Point updated successfully"
}
```

#### 6.2.4 Delete Access Point

**Request:**
```
DELETE /api/v1/access-points/:id
```

**Response (Success - HTTP 200):**
```json
{
  "statusCode": 200,
  "message": "Access Point deleted successfully"
}
```

### 6.3 Data Types

#### Controller Interface
```typescript
interface Controller {
  id?: number;
  nasIdentifier: string;        // Unique identifier for NAS
  macAddress: string;           // Format: XX:XX:XX:XX:XX:XX
  ipAddress: string;            // IPv4 address
  version: string;              // Firmware version
  status: "Online" | "Offline" | "Warning";
  locationName?: string;        // Physical location
  campusId?: number;            // Campus reference
  apCount?: number;             // Computed: Number of managed APs
  totalClients?: number;        // Computed: Total connected clients
}
```

#### Access Point Interface
```typescript
interface AP {
  id?: number;
  apName: string;               // Unique AP name
  macAddress: string;           // Format: XX:XX:XX:XX:XX:XX
  modelName: string;            // Device model
  description?: string;         // Optional description
  createdAt?: string;           // ISO timestamp
  updatedAt?: string;           // ISO timestamp
  building?: string;            // Building name
  campusId?: number;            // Campus reference
  buildingId?: number;          // Building reference
  locationId?: number;          // Location reference
  controller?: string;          // Managing controller
  clients?: number;             // Connected clients count
  usage?: number;               // Usage percentage
  status?: "Online" | "Offline" | "Warning";
}
```

---

## 7. FUNCTION DESCRIBE

### 7.1 Controller Management Functions

| Function ID | Function Name | Description |
|-------------|---------------|-------------|
| **CP101** | Add Controller | Mở dialog thêm mới Controller |
| **CP102** | Close Dialog | Đóng dialog Add/Edit Controller |
| **CP103** | NAS Identifier Input | Nhập tên định danh controller |
| **CP104** | MAC Address Input | Nhập địa chỉ MAC |
| **CP105** | IP Address Input | Nhập địa chỉ IP |
| **CP106** | Version Input | Nhập phiên bản firmware |
| **CP107** | Location Input | Nhập vị trí lắp đặt |
| **CP108** | Cancel Button | Hủy thao tác |
| **CP109** | Submit Button | Lưu thông tin Controller |
| **CP110** | Get Controllers | Lấy danh sách controllers từ API |
| **CP111** | Update Controller | Cập nhật thông tin controller |
| **CP112** | Delete Controller | Xóa controller |
| **CP113** | Filter by Controller | Lọc AP theo controller đã chọn |

### 7.2 Access Point Management Functions

| Function ID | Function Name | Description |
|-------------|---------------|-------------|
| **CP201** | Search AP | Tìm kiếm AP theo tên/MAC/description |
| **CP202** | Filter by Building | Lọc AP theo tòa nhà |
| **CP203** | Close Dialog | Đóng dialog Add/Edit AP |
| **CP204** | AP Name Input | Nhập tên access point |
| **CP205** | MAC Address Input | Nhập địa chỉ MAC |
| **CP206** | Model Input | Nhập model thiết bị |
| **CP207** | Description Input | Nhập mô tả |
| **CP208** | Cancel Button | Hủy thao tác |
| **CP209** | Submit Button | Lưu thông tin AP |
| **CP210** | Get APs | Lấy danh sách AP từ API |
| **CP211** | Update AP | Cập nhật thông tin AP |
| **CP212** | Delete AP | Xóa AP |

### 7.3 Detailed Function Descriptions

#### CP101 - Add Controller Button
- **Trigger:** User click nút "Thêm Controller"
- **Action:** 
  1. Mở dialog "Thêm mới Controller"
  2. Reset form về trạng thái rỗng
  3. Focus vào trường NAS Identifier

#### CP109 - Submit Controller
- **Trigger:** User click nút "Lưu" trong dialog
- **Action:**
  1. Validate tất cả các trường required
  2. Nếu valid → Gọi API POST/PUT `/wifi-controllers`
  3. Nếu thành công → Đóng dialog, reload danh sách
  4. Nếu thất bại → Hiển thị lỗi

#### CP110 - Get Controllers List
- **Trigger:** Component mount hoặc refresh
- **Action:**
  1. Dispatch action `getControllers()`
  2. Gọi API GET `/wifi-controllers`
  3. Update Redux state với dữ liệu nhận được
  4. Render danh sách vào table

#### CP112 - Delete Controller
- **Trigger:** User click nút xóa trên controller row
- **Action:**
  1. Hiển thị confirmation dialog
  2. Nếu user xác nhận → Gọi API DELETE `/wifi-controllers/:id`
  3. Nếu thành công → Reload danh sách
  4. Hiển thị toast notification

#### CP201 - Search AP
- **Trigger:** User nhập vào ô search
- **Action:**
  1. Update `searchTerm` trong Redux state
  2. Filter danh sách AP theo:
     - `apName` contains searchTerm
     - `macAddress` contains searchTerm
     - `description` contains searchTerm
  3. Re-render table với kết quả lọc

#### CP202 - Filter by Building
- **Trigger:** User chọn building từ dropdown
- **Action:**
  1. Update `selectedBuilding` trong Redux state
  2. Filter danh sách AP theo `buildingId`
  3. Re-render table

#### CP209 - Submit AP
- **Trigger:** User click nút "Lưu" trong dialog Add/Edit AP
- **Action:**
  1. Validate các trường required (apName, macAddress, modelName)
  2. Nếu valid → Gọi API POST/PUT `/access-points`
  3. Nếu thành công → Đóng dialog, reload danh sách
  4. Hiển thị toast notification

---

## APPENDIX

### A. Error Codes

| Code | Description |
|------|-------------|
| ERR_CP001 | NAS Identifier không được để trống |
| ERR_CP002 | MAC Address không hợp lệ (XX:XX:XX:XX:XX:XX) |
| ERR_CP003 | IP Address không hợp lệ |
| ERR_CP004 | Tên AP không được để trống |
| ERR_CP005 | MAC Address không hợp lệ |
| ERR_CP006 | Model không được để trống |

### B. Status Definitions

| Status | Color | Description |
|--------|-------|-------------|
| Online | Green | Thiết bị đang hoạt động và kết nối |
| Offline | Red | Thiết bị không phản hồi |
| Warning | Amber | Thiết bị có vấn đề (high load, packet loss, etc.) |

### C. API Base URL

```
https://user-6240.nport.link/api/v1
```

---

**END OF DOCUMENT**
