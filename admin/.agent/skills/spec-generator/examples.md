# Spec Generator - Examples

> Real examples of how to use the spec-generator skill for different features.

---

## Example 1: User Management Feature

### User Request:
> "Tạo tài liệu spec cho chức năng User Management"

### Skill Response Process:

**Step 1: Ask Clarifying Questions**

```markdown
## 📋 Spec Creation Questions

Để tạo tài liệu spec cho User Management, tôi cần biết:

1. **Feature Overview:**
   - Chức năng này quản lý người dùng trong hệ thống?
   - Có những action nào? (Create, Read, Update, Delete, Lock/Unlock)

2. **Screens:**
   - Có bao nhiêu màn hình? (List, Add/Edit, Detail, Confirm)
   - Có dialog đổi password không?

3. **Data & API:**
   - API endpoints hiện có là gì?
   - User model có những fields nào?

4. **Validation:**
   - Username/email có unique không?
   - Password requirements?
   - Role assignment?
```

**Step 2: Read Existing Code**

```bash
# Find files
Glob: **/features/users/**/*.{ts,tsx}
Read: src/features/users/api/usersApi.ts
Read: src/features/users/types/index.ts
Read: src/features/users/components/UsersTable.tsx
Read: src/features/users/components/AddUserDialog.tsx
```

**Step 3: Generate Spec**

Create: `specs/UserManagement_Spec.md`

With Function IDs:
- `US001` - User Management (main)
- `US001-S1` - User List Screen
- `US001-S2` - Add/Edit User Dialog
- `US002` - Change Password
- `US003` - Lock/Unlock User

---

## Example 2: Policy Management Feature

### User Request:
> "Viết spec cho Bandwidth Policy"

### Skill Response Process:

**Step 1: Ask Clarifying Questions**

```markdown
## 📋 Spec Creation Questions

Để tạo tài liệu spec cho Bandwidth Policy:

1. **Feature Overview:**
   - Policy có những loại nào? (Bandwidth, Time-based, Content filtering)
   - Policy áp dụng cho đối tượng nào? (User, Group, Area, Time)

2. **Screens:**
   - List policies
   - Add/Edit policy form
   - Policy detail view
   - Apply policy to users/areas

3. **Data & API:**
   - Policy model có fields gì?
   - API endpoints?

4. **Validation:**
   - Bandwidth limits (min/max)?
   - Time format?
   - Conflict detection?
```

**Step 2: Read Existing Code**

```bash
Glob: **/features/policies/**/*.{ts,tsx}
Read: src/features/policies/api/policiesApi.ts
Read: src/features/policies/types/index.ts
Read: src/features/policies/components/tabs/BandwidthPolicyTab.tsx
```

**Step 3: Generate Spec**

Create: `specs/PolicyManagement_Spec.md`

With Function IDs:
- `PO001` - Bandwidth Policy
- `PO002` - Time-based Policy
- `PO003` - Apply Policy
- `PO004` - Policy Priority

---

## Example 3: SIM Activation Feature

### User Request:
> "Tạo spec cho chức năng kích hoạt SIM"

### Skill Response Process:

**Step 1: Ask Clarifying Questions**

```markdown
## 📋 Spec Creation Questions

Để tạo tài liệu spec cho SIM Activation:

1. **Feature Overview:**
   - Quy trình kích hoạt SIM gồm những bước nào?
   - Có QR code scanning không?
   - Có payment integration không?

2. **Screens:**
   - Add SIM form
   - Barcode scanner modal
   - Package selection
   - QR payment display
   - Success confirmation

3. **Data & API:**
   - SIM model fields?
   - Package model?
   - Payment API?

4. **Validation:**
   - Serial number format?
   - Phone number validation?
   - Package selection required?
```

**Step 2: Read Existing Code**

```bash
# Check if feature exists
Glob: **/features/sim-activation/**/*.{ts,tsx}
# Or reference from Controller001.xlsx
```

**Step 3: Generate Spec**

Create: `specs/SIMActivation_Spec.md`

With Function IDs:
- `AS004` - Add SIM Feature
- `AS005` - SIM Activation Flow
- `AS005-S1` - Add SIM Input
- `AS005-S2` - Barcode Scanner
- `AS005-S3` - Package Selection
- `AS005-S4` - QR Payment

---

## Example 4: Reports Feature

### User Request:
> "Viết spec cho Reports module"

### Skill Response Process:

**Step 1: Ask Clarifying Questions**

```markdown
## 📋 Spec Creation Questions

Để tạo tài liệu spec cho Reports:

1. **Feature Overview:**
   - Loại report nào? (Usage, Traffic, User Activity, Revenue)
   - Time range options? (Daily, Weekly, Monthly, Custom)

2. **Screens:**
   - Report dashboard
   - Report detail view
   - Export options (PDF, Excel, CSV)
   - Filter controls

3. **Data & API:**
   - Report data structure?
   - Aggregation API?
   - Export API?

4. **Special Requirements:**
   - Real-time updates?
   - Scheduled reports?
   - Email delivery?
```

**Step 2: Read Existing Code**

```bash
Glob: **/features/reports/**/*.{ts,tsx}
Read: src/features/reports/api/reportsApi.ts
Read: src/features/reports/types/index.ts
```

**Step 3: Generate Spec**

Create: `specs/Reports_Spec.md`

With Function IDs:
- `RE001` - Usage Report
- `RE002` - Traffic Report
- `RE003` - User Activity Report
- `RE004` - Export Report
- `RE005` - Scheduled Reports

---

## Example 5: Settings Feature

### User Request:
> "Tạo spec cho Settings - Areas Management"

### Skill Response Process:

**Step 1: Ask Clarifying Questions**

```markdown
## 📋 Spec Creation Questions

Để tạo tài liệu spec cho Areas Management:

1. **Feature Overview:**
   - Area hierarchy? (Campus → Building → Location/Floor)
   - CRUD operations?

2. **Screens:**
   - Campus list
   - Building list (filtered by campus)
   - Location list (filtered by building)
   - Add/Edit dialogs

3. **Data & API:**
   - Campus, Building, Location models?
   - Hierarchical API?

4. **Validation:**
   - Code uniqueness?
   - Required fields?
```

**Step 2: Read Existing Code**

```bash
Glob: **/features/settings/**/*.{ts,tsx}
Read: src/features/settings/api/areasApi.ts
Read: src/features/settings/types/index.ts
```

**Step 3: Generate Spec**

Create: `specs/AreasManagement_Spec.md`

With Function IDs:
- `SE001` - Campus Management
- `SE002` - Building Management
- `SE003` - Location Management
- `SE004` - Area Hierarchy View

---

## Quick Reference: Function ID Prefixes

| Prefix | Module | Example Functions |
|--------|--------|-------------------|
| **CP** | Controller/AP | CP001 (Controller Mgmt), CP002 (AP Mgmt) |
| **AS** | Active SIM | AS004 (Add SIM), AS005 (Activation Flow) |
| **US** | User Management | US001 (User CRUD), US002 (Change Password) |
| **PO** | Policy | PO001 (Bandwidth), PO002 (Time-based) |
| **RE** | Reports | RE001 (Usage), RE002 (Traffic) |
| **SE** | Settings | SE001 (Campus), SE002 (Building) |
| **IN** | Integrations | IN001 (IAM), IN002 (Radius) |

---

## Output File Structure

```
admin/
├── specs/
│   ├── ControllerAccessPoint_Spec.md    ← Generated spec
│   ├── UserManagement_Spec.md           ← Generated spec
│   ├── PolicyManagement_Spec.md         ← Generated spec
│   └── ...
└── .agent/skills/
    ├── spec-generator/
    │   ├── SKILL.md                     ← This skill
    │   ├── spec-template.md             ← Blank template
    │   └── examples.md                  ← This file
    └── ...
```

---

## Tips for Better Specs

1. **Be Specific:** Include actual field names, API endpoints, error messages
2. **Use Consistent IDs:** Follow naming convention for Function IDs
3. **Include Edge Cases:** Error states, empty states, loading states
4. **Add Visual References:** ASCII wireframes help developers understand layout
5. **Keep Updated:** Update spec when feature changes

---

**Version:** 1.0 | **Last Updated:** 2026-03-30
