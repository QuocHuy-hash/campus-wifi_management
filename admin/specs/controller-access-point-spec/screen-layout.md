# Controller & Access Point Screen Layouts

> Visual layout and structure for CP001 and CP002 screens.

---

## CP001-S1: Controller Management Screen

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

### Components

| Position | Component | Type | Props/Actions |
|----------|-----------|------|---------------|
| Header | PageTitle | Label | "Danh sách WiFi Controllers" |
| Header Right | AddButton | Button | onClick → Open Add Dialog |
| Main | ControllerTable | Table | Row click → Select controller |
| Row | StatusBadge | Badge | Color: Green/Red/Amber |
| Row | APCount | Number | With Wifi icon |
| Row | ClientsCount | Number | With Activity icon |

---

## CP001-S2: Add/Edit Controller Dialog

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

### Form Fields

| Field | Type | Required | Validation | Placeholder |
|-------|------|----------|------------|-------------|
| NAS Identifier | Text | Yes | Max 50 chars | "Nhập NAS Identifier" |
| MAC Address | Text | Yes | XX:XX:XX:XX:XX:XX | "AA:BB:CC:DD:EE:FF" |
| IP Address | Text | Yes | IPv4 format | "192.168.1.1" |
| Version | Text | No | Max 20 chars | "2.4.1" |
| Location Name | Text | No | Max 100 chars | "Building A, Floor 3" |

---

## CP002-S1: Access Point Management Screen

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

### Components

| Position | Component | Type | Props/Actions |
|----------|-----------|------|---------------|
| Header | PageTitle | Label | "Danh sách Access Points" |
| Header Right | SearchInput | Text | onChange → Filter |
| Header Right | BuildingFilter | Select | onChange → Filter by building |
| Main | APTable | Table | Display AP list |
| Row | StatusIndicator | Circle | Green/Red dot |
| Row | APName | Text | Font weight: medium |
| Row | MACAddress | Text | Font: monospace |
| Row | ModelName | Text | - |
| Row | Description | Text | Truncate if long |
| Row | CreatedDate | Date | Format: DD/MM/YYYY |

---

## CP002-S2: Add/Edit Access Point Dialog

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

### Form Fields

| Field | Type | Required | Validation | Placeholder |
|-------|------|----------|------------|-------------|
| AP Name | Text | Yes | Max 100 chars | "AP-Building-A-Floor-1" |
| MAC Address | Text | Yes | XX:XX:XX:XX:XX:XX | "AA:BB:CC:DD:EE:FF" |
| Model Name | Text | Yes | Max 50 chars | "UniFi AP AC Pro" |
| Description | Textarea | No | Max 200 chars | "Mô tả vị trí AP" |

---

## Responsive Considerations

### Desktop (≥1024px)
- Full table with all columns visible
- Dialog centered, max-width 500px

### Tablet (768px - 1023px)
- Hide less important columns (Description, Date)
- Dialog full-width with padding

### Mobile (<768px)
- Card layout instead of table
- Stack form fields vertically in dialog
- Action buttons full-width

---

## Color Scheme

| Element | Color | Usage |
|---------|-------|-------|
| Status Online | `bg-green-100 text-green-800` | Badge, indicator |
| Status Offline | `bg-red-100 text-red-800` | Badge, indicator |
| Status Warning | `bg-amber-100 text-amber-800` | Badge, indicator |
| Primary Action | `bg-[#1e3a5f] text-white` | Save buttons |
| Secondary Action | `border-[#1e3a5f] text-[#1e3a5f]` | Outline buttons |
| Table Header | `bg-gray-50 text-gray-700` | Table headers |
| Row Hover | `hover:bg-gray-50` | Interactive rows |

---

## Accessibility Notes

- All input fields must have associated labels
- Status indicators need text alternatives (aria-label)
- Keyboard navigation support for tables
- Focus states for all interactive elements
- Color contrast ratio ≥ 4.5:1 for text
