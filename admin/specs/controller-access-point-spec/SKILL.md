---
name: controller-access-point-spec
description: Specification for Controller & Access Point Management. CP001 (WiFi Controllers) and CP002 (Access Points) CRUD operations, API endpoints, validation rules, and UI components.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Controller & Access Point Management Specification

> Functional specification for WiFi device management module. Covers Controllers (CP001) and Access Points (CP002) with full CRUD operations, API patterns, and UI components.

## 🎯 Selective Reading Rule

**Read ONLY files relevant to the request!** Check the content map, find what you need.

---

## 📑 Content Map

| File | Description | When to Read |
|------|-------------|--------------|
| `screen-layout.md` | UI wireframes, screen structures | Building UI components |
| `sequence-diagrams.md` | Data flow, API call sequences | Understanding interactions |
| Sections below | Quick reference | Implementation details |

---

## 📋 Overview

### System Information

| Field | Value |
|-------|-------|
| **System** | HCMUS WiFi Management |
| **Module** | Device Management |
| **Functions** | CP001 (Controller), CP002 (Access Point) |
| **API Base** | `https://user-6240.nport.link/api/v1` |

### Function Summary

| ID | Name | Form | Description |
|----|------|------|-------------|
| **CP001** | Controller Management | Controller Management Form | Quản lý WiFi Controllers |
| **CP002** | Access Point Management | AP Management Form | Quản lý Access Points |

### Purpose

**CP001 - Controller Management:**
- Thêm mới, chỉnh sửa, xóa WiFi Controllers
- Theo dõi trạng thái: Online/Offline/Warning
- Quản lý: NAS Identifier, IP, MAC, Version, Location
- Xem số lượng AP và Clients

**CP002 - Access Point Management:**
- Thêm mới, chỉnh sửa, xóa Access Points
- Quản lý: AP Name, MAC, Model, Description
- Tìm kiếm và lọc theo Building
- Theo dõi trạng thái kết nối

---

## 🗂️ Data Models

### Controller Interface

```typescript
interface Controller {
  id?: number;
  nasIdentifier: string;        // Unique identifier
  macAddress: string;           // XX:XX:XX:XX:XX:XX
  ipAddress: string;            // IPv4 address
  version: string;              // Firmware version
  status: "Online" | "Offline" | "Warning";
  locationName?: string;        // Physical location
  campusId?: number;
  apCount?: number;             // Computed
  totalClients?: number;        // Computed
}
```

### Access Point Interface

```typescript
interface AP {
  id?: number;
  apName: string;               // Unique name
  macAddress: string;           // XX:XX:XX:XX:XX:XX
  modelName: string;            // Device model
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  building?: string;
  campusId?: number;
  buildingId?: number;
  locationId?: number;
  controller?: string;
  clients?: number;
  usage?: number;
  status?: "Online" | "Offline" | "Warning";
}
```

---

## 🔌 API Endpoints

### Controllers API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wifi-controllers` | Get all controllers |
| POST | `/wifi-controllers` | Create controller |
| PUT | `/wifi-controllers/:id` | Update controller |
| DELETE | `/wifi-controllers/:id` | Delete controller |

### Access Points API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/access-points` | Get all APs |
| POST | `/access-points` | Create AP |
| PUT | `/access-points/:id` | Update AP |
| DELETE | `/access-points/:id` | Delete AP |

---

## ✅ Validation Rules

### Controller Validation

| Field | Rule | Error Code | Message |
|-------|------|------------|---------|
| nasIdentifier | Required, Unique | ERR_CP001 | "NAS Identifier không được để trống" |
| macAddress | Required, Format XX:XX:XX:XX:XX:XX | ERR_CP002 | "MAC Address không hợp lệ" |
| ipAddress | Required, Valid IPv4 | ERR_CP003 | "IP Address không hợp lệ" |
| version | Optional | - | - |
| locationName | Optional | - | - |

### Access Point Validation

| Field | Rule | Error Code | Message |
|-------|------|------------|---------|
| apName | Required, Unique | ERR_CP004 | "Tên AP không được để trống" |
| macAddress | Required, Format XX:XX:XX:XX:XX:XX | ERR_CP005 | "MAC Address không hợp lệ" |
| modelName | Required | ERR_CP006 | "Model không được để trống" |
| description | Optional | - | - |

### Data Input Checking Format (MANDATORY)

Khi tạo tài liệu spec, phần **5. Data Input Checking** phải dùng đúng format ma trận kiểm tra input kiểu Excel với:

1. Bảng metadata 4 dòng: `System Name`, `Module`, `Form ID`, `Form Name` + `CreateAt/Create By/Update At/Update By`.
2. Dòng ký hiệu I/O và Type:
  - `[(I/O)]:Input / O:Output / I/O:Input-Output`
  - `[(Type)L:Label / T:Text / TA:TextArea / S:Select / C:Checkbox / R:Radio / B:Button / H:Hidden / I:Image / Ln:Link / O:Other]`
3. Bảng validation bắt buộc đủ cột sau:
  - `NO | Label Name | Field Name | I/O | Type | Data Format | Size | Required | Characters | Rule | MessageId | Event | Messages`
4. Mỗi field quan trọng phải có `Rule`, `MessageId`, `Messages` rõ ràng; nếu optional thì ghi `Optional`.
5. Nếu có nhiều nhóm form, tách thành nhiều block bảng (ví dụ: `Controller Input Validation`, `Access Point Input Validation`, `Bandwidth Policy Input Validation`).

### Data Items Format (MANDATORY)

Khi tạo phần **6. Data Items**, bắt buộc mô tả theo từng endpoint API với cấu trúc giống mẫu đặc tả tích hợp:

1. Block endpoint rõ ràng:
  - `Endpoint: METHOD /path`
  - Bảng Property gồm: `Label Name`, `Data Format`, `I/O`, `Note`.
2. Bắt buộc có mục Params:
  - `Path Params` (nếu không có thì ghi rõ Không có)
  - `Query Params` (nếu không có thì ghi rõ Không có)
3. Bắt buộc có mục Body parameters cho API có request body (POST/PUT/PATCH):
  - Cột chuẩn: `Tên trường | Loại dữ liệu | I/O | Ghi chú`.
4. Bắt buộc có mục Response data (JSON):
  - Ví dụ response hoàn chỉnh theo envelope thực tế (`statusCode`, `data`, `message`).
5. Bắt buộc có mục Response field description:
  - Cột chuẩn: `Field | Type | I/O | Note`.
  - Mô tả cả field cấp cao và field quan trọng trong `data`.
6. Nếu endpoint không có body hoặc không có params, phải ghi rõ `Không có`, không được bỏ trống.

---

## 🎨 UI Components

### Controller Management Screen

| Component | Type | Purpose |
|-----------|------|---------|
| Page Title | Label | "Danh sách WiFi Controllers" |
| Add Button | Button | Open add dialog |
| Controller Table | Table | Display list |
| Status Badge | Badge | Online/Offline/Warning |
| AP Count | Number | Number of managed APs |
| Clients Count | Number | Total connected clients |

### Access Point Management Screen

| Component | Type | Purpose |
|-----------|------|---------|
| Page Title | Label | "Danh sách Access Points" |
| Search Input | Text | Filter by name/MAC/description |
| Building Filter | Select | Filter by building |
| AP Table | Table | Display list |
| Status Indicator | Circle | Green/Red status dot |

---

## 🔧 Functions Reference

### Controller Functions (CP101-CP113)

| ID | Function | Description |
|----|----------|-------------|
| CP101 | Add Controller | Open add dialog |
| CP102 | Close Dialog | Close add/edit dialog |
| CP103-CP107 | Input Fields | NAS, MAC, IP, Version, Location |
| CP108 | Cancel | Cancel operation |
| CP109 | Submit | Save controller |
| CP110 | Get Controllers | Fetch from API |
| CP111 | Update Controller | Update existing |
| CP112 | Delete Controller | Remove controller |
| CP113 | Filter by Controller | Filter APs by controller |

### Access Point Functions (CP201-CP212)

| ID | Function | Description |
|----|----------|-------------|
| CP201 | Search AP | Filter by keyword |
| CP202 | Filter by Building | Filter by building |
| CP203 | Close Dialog | Close add/edit dialog |
| CP204-CP207 | Input Fields | AP Name, MAC, Model, Description |
| CP208 | Cancel | Cancel operation |
| CP209 | Submit | Save AP |
| CP210 | Get APs | Fetch from API |
| CP211 | Update AP | Update existing |
| CP212 | Delete AP | Remove AP |

---

## 📡 API Request/Response Examples

### Create Controller

**Request:**
```http
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

**Response:**
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
    "locationName": "Building B"
  },
  "message": "Controller created successfully"
}
```

### Create Access Point

**Request:**
```http
POST /api/v1/access-points
Content-Type: application/json

{
  "apName": "AP-Building-B-Floor-2",
  "macAddress": "11:22:33:44:55:02",
  "modelName": "UniFi AP AC Pro",
  "description": "Second floor access point"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "id": 2,
    "apName": "AP-Building-B-Floor-2",
    "macAddress": "11:22:33:44:55:02",
    "modelName": "UniFi AP AC Pro",
    "description": "Second floor access point",
    "createdAt": "2026-03-30T08:00:00Z"
  },
  "message": "Access Point created successfully"
}
```

---

## 🔗 Related Skills

| Need | Skill |
|------|-------|
| API implementation | `@[api-patterns]` |
| Frontend components | `@[frontend-specialist]` |
| State management | `@[redux-toolkit]` |
| Form validation | `@[react-hook-form]` |

---

## 📁 Related Files

| File Path | Description |
|-----------|-------------|
| `src/features/access-points/api/accessPointsApi.ts` | API calls |
| `src/features/access-points/types/index.ts` | TypeScript types |
| `src/features/access-points/slices/accessPointsSlice.ts` | Redux state |
| `src/features/access-points/components/ControllersTable.tsx` | Controller table |
| `src/features/access-points/components/APsTable.tsx` | AP table |
| `src/features/settings/api/devicesApi.ts` | Device management API |

---

## ❌ Anti-Patterns

**DON'T:**
- Skip MAC address validation
- Allow duplicate NAS Identifiers
- Use invalid IP formats
- Delete controllers with active APs without warning
- Skip error handling on API calls

**DO:**
- Validate all inputs before API calls
- Show loading states during API calls
- Display clear error messages
- Confirm before delete operations
- Refresh lists after CRUD operations

---

## ✅ Implementation Checklist

Before implementing:

- [ ] **Read existing types** from `access-points/types/index.ts`
- [ ] **Check API base URL** from `config/api.ts`
- [ ] **Review Redux slice** for state structure
- [ ] **Understand existing components** (ControllersTable, APsTable)
- [ ] **Plan validation logic** for forms
- [ ] **Handle loading/error states**
- [ ] **Add success/error toasts**

---

## 🎯 Status Definitions

| Status | Color | Meaning |
|--------|-------|---------|
| Online | Green | Device connected and responding |
| Offline | Red | Device not responding |
| Warning | Amber | High load, packet loss, or issues |

---

## 📝 Notes

- All API responses follow envelope pattern: `{ statusCode, data, message }`
- MAC Address format: `XX:XX:XX:XX:XX:XX` (uppercase with colons)
- Controller filtering is done by `nasIdentifier`
- AP search filters by: `apName`, `macAddress`, `description`
- Building filter uses `buildingId` from locations API

---

**Version:** 1.0 | **Last Updated:** 2026-03-30
