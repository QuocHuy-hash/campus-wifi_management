---
name: spec-generator
description: Generate functional specification documents for any feature/module following the Controller001.xlsx format. Creates comprehensive specs with Title, Screen Layout, Sequence Diagram, Screen Items, Data Validation, Data Items, and Function Description.
allowed-tools: Read, Write, Edit, Glob, Grep, AskUserQuestion
---

# Spec Generator - Functional Specification Template

> Generate comprehensive functional specification documents for any feature following the standard format (based on Controller001.xlsx template).

---

## 🎯 How to Use

**When user wants to create spec for a feature:**

1. **Ask clarifying questions** (see Question Framework below)
2. **Read existing code** (API, types, components)
3. **Generate spec** following the 7-section structure

---

## 📑 Spec Structure (7 Sections)

Every spec document MUST have these sections:

| Section | Content | Purpose |
|---------|---------|---------|
| **1. Title & Overview** | System info, Function ID, Purpose | High-level summary |
| **2. Screen Layout** | ASCII wireframes, UI structure | Visual layout |
| **3. Sequence Diagram** | Data flow, API interactions | Process flow |
| **4. Screen Items** | UI components table | Implementation details |
| **5. Data Input Checking** | Validation rules, error codes | Form validation |
| **6. Data Items** | API request/response structures | Data contracts |
| **7. Function Describe** | Function IDs and descriptions | Feature documentation |

---

## 🔧 Step-by-Step Process

### Step 1: Gather Information

**Ask the user:**

```markdown
## 📋 Information Needed

Please provide:

1. **Feature Name**: What is this feature called?
2. **Function ID**: e.g., CP003, AS006, etc. (or I can suggest one)
3. **Module/Folder**: Where is this feature located in the codebase?
4. **API Endpoints**: What APIs does this feature use?
5. **Main Actions**: What can users do? (CRUD, view, filter, etc.)
6. **Special Requirements**: Any specific validation, business rules?
```

### Step 2: Read Existing Code

**Files to read:**

| File Type | Pattern | Purpose |
|-----------|---------|---------|
| API | `**/api/*Api.ts` | Get endpoints, request/response types |
| Types | `**/types/index.ts` | Get data models |
| Components | `**/components/*.tsx` | Get UI structure |
| Slice | `**/slices/*Slice.ts` | Get state, actions |

### Step 3: Generate Spec Document

**Create file at:** `specs/{FeatureName}_Spec.md`

**Use this template structure:**

```markdown
# SPECIFICATION DOCUMENT: {Feature Name}
**System Name:** HCMUS WiFi Management  
**Module:** {Module Name}  
**Date:** {Current Date}  
**Version:** 1.0

---

## 1. TITLE & OVERVIEW

### 1.1 System Information

| Field | Value |
|-------|-------|
| **System Name** | HCMUS WiFi Management |
| **Module** | {Module Name} |
| **Create Date** | {Date} |
| **Create By** | {Author} |

### 1.2 Function Summary

| Function ID | Function Name | Form ID | Form Name |
|-------------|---------------|---------|-----------|
| **{FUNC_ID}** | {Function Name} | {Form ID} | {Form Name} |

### 1.3 Purpose

{Describe what this feature does in 2-3 paragraphs}

---

## 2. SCREEN LAYOUT

{ASCII wireframes for each screen}

### 2.1 {Screen Name} ({Screen ID})

```
┌─────────────────────────────────────────┐
│  [Screen wireframe here]                │
└─────────────────────────────────────────┘
```

---

## 3. SEQUENCE DIAGRAM

{Sequence diagrams for main flows}

### 3.1 {Flow Name}

```
User → Frontend → API → Backend → Database
 │        │         │       │         │
 └─Action─▶         │       │         │
        │           │       │         │
        └─dispatch──▶       │         │
        │           │       │         │
        │           ├─HTTP──▶         │
        │           │       │         │
        │           │       ├─Query───▶
        │           │       │         │
        │           │       │◀────────┘
        │           │◀──────┤         │
        │◀──────────┤       │         │
        │  Render   │       │         │
```

---

## 4. SCREEN ITEMS

| STT | Item Name | Field Name | I/O | Type | Data Format | Size | Required | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|------|----------|-------------|-------|
| 1 | {Name} | {fieldName} | {I/O} | {Type} | {Format} | {Size} | {Y/N} | {FuncID} | {Notes} |

**Type Legend:**
- L = Label
- T = Text Input
- TA = Textarea
- S = Select Dropdown
- B = Button
- C = Checkbox
- R = Radio
- I = Icon/Image
- W = Widget/Table

---

## 5. DATA INPUT CHECKING

| NO | Label Name | Field Name | I/O | Type | Data Format | Size | Required | Rule | MessageId | Messages |
|----|------------|------------|-----|------|-------------|------|----------|------|-----------|----------|
| 1 | {Label} | {field} | I | T | {format} | {size} | {Y/N} | {rule} | {ERR_CODE} | "{Error message}" |

---

## 6. DATA ITEMS

### 6.1 API: {API Name}

**URI:** `{endpoint}`  
**Method:** `{GET|POST|PUT|DELETE}`

#### Request

```http
{METHOD} {endpoint}
Content-Type: application/json

{request_body}
```

#### Response (Success - HTTP {code})

```json
{
  "statusCode": {code},
  "data": {
    {response_structure}
  },
  "message": "{success_message}"
}
```

### 6.2 Data Types

```typescript
interface {TypeName} {
  {fields}
}
```

---

## 7. FUNCTION DESCRIBE

### 7.1 Functions Table

| Function ID | Function Name | Description |
|-------------|---------------|-------------|
| **{FID}** | {Name} | {Description} |

### 7.2 Detailed Descriptions

#### {FID} - {Function Name}
- **Trigger:** {What triggers this function}
- **Action:**
  1. {Step 1}
  2. {Step 2}
  3. {Step 3}

---

## APPENDIX

### A. Error Codes

| Code | Description |
|------|-------------|
| {ERR_001} | {Message} |

### B. Status Definitions

| Status | Color | Description |
|--------|-------|-------------|
| {Status} | {Color} | {Meaning} |

---

**END OF DOCUMENT**
```

---

## ❓ Question Framework

**When user asks to create a spec, ask these questions:**

### For NEW Features (not yet implemented):

```markdown
## 📋 Spec Creation Questions

1. **Feature Overview:**
   - What is the feature name?
   - What problem does it solve?
   - Who are the users?

2. **Function ID & Naming:**
   - Suggested Function ID? (e.g., CP003, US001, etc.)
   - Module prefix? (CP=Controller/AP, US=User, AS=Active SIM, etc.)

3. **Screens:**
   - How many screens/dialogs?
   - What are the main actions on each screen?

4. **Data & API:**
   - What data entities are involved?
   - API endpoints (if known)?
   - CRUD operations needed?

5. **Validation:**
   - Required fields?
   - Format requirements?
   - Business rules?

6. **Special Requirements:**
   - Any specific workflows?
   - Integration with other features?
   - Permission/role requirements?
```

### For EXISTING Features (documenting what exists):

```markdown
## 📋 Spec Extraction Questions

1. **Feature Location:**
   - Which folder contains this feature?
   - What's the main component file?

2. **Scope:**
   - Document all sub-features or just main flow?
   - Include error states and edge cases?

3. **Level of Detail:**
   - High-level overview or detailed spec?
   - Include code snippets in spec?

4. **Output Format:**
   - Markdown file in `/specs`?
   - Skill file in `/.agent/skills`?
   - Both?
```

---

## 🔗 Related Skills

| Need | Skill |
|------|-------|
| API patterns | `@[api-patterns]` |
| Screen layouts | `@[controller-access-point-spec]` (for reference) |
| Documentation writing | `@[documentation-writer]` |

---

## ✅ Quality Checklist

Before delivering the spec:

- [ ] **All 7 sections** are complete
- [ ] **Function IDs** follow naming convention
- [ ] **API endpoints** match actual implementation
- [ ] **Validation rules** are accurate
- [ ] **Error messages** are user-friendly
- [ ] **Sequence diagrams** show complete flow
- [ ] **Screen Items** table has all UI elements
- [ ] **Data types** match TypeScript interfaces
- [ ] **ASCII wireframes** are clear and readable

---

## 📝 Naming Conventions

### Function ID Prefixes

| Prefix | Module | Example |
|--------|--------|---------|
| **CP** | Controller/Access Point | CP001, CP002 |
| **AS** | Active SIM | AS004, AS005 |
| **US** | User Management | US001, US002 |
| **PO** | Policy | PO001, PO002 |
| **RE** | Reports | RE001, RE002 |
| **SE** | Settings | SE001, SE002 |
| **IN** | Integrations | IN001, IN002 |

### Screen IDs

Format: `{FunctionID}-S{Number}`

- `CP001-S1` - Main list screen
- `CP001-S2` - Add/Edit dialog
- `CP001-S3` - Detail view
- `CP001-S4` - Confirmation dialog

---

## 🎯 Example Usage

### User Request:
> "Tạo spec cho chức năng User Management"

### Your Response Process:

1. **Ask clarifying questions** (use Question Framework)
2. **Read existing code:**
   ```bash
   # Find files
   Glob: **/features/users/**/*.{ts,tsx}
   Read: src/features/users/api/usersApi.ts
   Read: src/features/users/types/index.ts
   Read: src/features/users/components/*.tsx
   ```
3. **Generate spec** at `specs/UserManagement_Spec.md`
4. **Optionally create skill** at `.agent/skills/user-management-spec/SKILL.md`

---

## 📁 File Locations

**Specs generated:**
- Main spec: `/specs/{FeatureName}_Spec.md`
- Skill (optional): `/.agent/skills/{feature}-spec/SKILL.md`

**Reference existing specs:**
- `/specs/ControllerAccessPoint_Spec.md`
- `/specs/Controller001.xlsx` (Excel source)

---

**Version:** 1.0 | **Last Updated:** 2026-03-30
