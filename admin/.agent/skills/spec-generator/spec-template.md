# Spec Template - Blank Template for New Features

> Copy this template and fill in for any new feature specification.

---

# SPECIFICATION DOCUMENT: {FEATURE_NAME}

**System Name:** HCMUS WiFi Management  
**Module:** {MODULE_NAME}  
**Date:** {YYYY-MM-DD}  
**Version:** 1.0  
**Author:** {Author Name}

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
| **Module** | {Module Name} |
| **Create Date** | {YYYY-MM-DD} |
| **Create By** | {Author} |

### 1.2 Function Summary

| Function ID | Function Name | Form ID | Form Name |
|-------------|---------------|---------|-----------|
| **{FUNC_ID}** | {Function Name} | {Form ID} | {Form Name} |

### 1.3 Purpose

**{Function Name}:**
- {Purpose 1}
- {Purpose 2}
- {Purpose 3}

### 1.4 Scope

**In Scope:**
- {Feature capability 1}
- {Feature capability 2}

**Out of Scope:**
- {Not included 1}
- {Not included 2}

---

## 2. SCREEN LAYOUT

### 2.1 {Screen Name} ({Screen ID})

```
┌─────────────────────────────────────────────────────────────────┐
│  [Header] {Screen Title}                          [Actions]     │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ [Content Area]                                            │  │
│  │ ┌──────┬────────────┬──────────┬────────┬───────────────┐ │  │
│  │ │ Col1 │ Col2       │ Col3     │ Col4   │ Col5          │ │  │
│  │ ├──────┼────────────┼──────────┼────────┼───────────────┤ │  │
│  │ │ Data │ Data       │ Data     │ Data   │ Data          │ │  │
│  │ └──────┴────────────┴──────────┴────────┴───────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 {Dialog Name} ({Dialog ID})

```
┌─────────────────────────────────────────────┐
│  {Dialog Title}                        [×]  │
├─────────────────────────────────────────────┤
│                                             │
│  {Field Label} *                            │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│           [{Cancel}]    [{Save}]            │
└─────────────────────────────────────────────┘
```

---

## 3. SEQUENCE DIAGRAM

### 3.1 {Flow Name} (e.g., Load Data, Create Item, Update Item, Delete Item)

```
┌────┐         ┌──────────┐         ┌──────┐         ┌─────────┐         ┌──────────┐
│User│         │Frontend  │         │ API  │         │Backend  │         │Database  │
└─┬──┘         └────┬─────┘         └──┬───┘         └────┬────┘         └────┬─────┘
  │                 │                   │                  │                   │
  │ {Action}        │                   │                  │                   │
  ├────────────────>│                   │                  │                   │
  │                 │                   │                  │                   │
  │                 │ dispatch          │                  │                   │
  │                 │ {actionName}()    │                  │                   │
  │                 ├────────┐          │                  │                   │
  │                 │        │          │                  │                   │
  │                 │◄───────┘          │                  │                   │
  │                 │                   │                  │                   │
  │                 │ {METHOD}          │                  │                   │
  │                 │ {endpoint}       >│                  │                   │
  │                 │                   │                  │                   │
  │                 │                   │  {Query Type}    │                   │
  │                 │                   ├─────────────────>│                   │
  │                 │                   │                  │                   │
  │                 │                   │                  │                   │
  │                 │                   │<─────────────────┤                   │
  │                 │                   │  {Data}          │                   │
  │                 │                   │                  │                   │
  │                 │<──────────────────┤                  │                   │
  │                 │  JSON Response    │                  │                   │
  │                 │                   │                  │                   │
  │                 │ Update State      │                  │                   │
  │                 ├────────┐          │                  │                   │
  │                 │        │          │                  │                   │
  │                 │◄───────┘          │                  │                   │
  │                 │                   │                  │                   │
  │                 │ Render            │                  │                   │
  │                 ├────────┐          │                  │                   │
  │                 │        │          │                  │                   │
  │                 │◄───────┘          │                  │                   │
  │<────────────────┤                   │                  │                   │
  │ Display         │                   │                  │                   │
  │                 │                   │                  │                   │
```

---

## 4. SCREEN ITEMS

### 4.1 {Screen Name} ({Screen ID})

| STT | Item Name | Field Name | I/O | Type | Data Format | Size | Required | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|------|----------|-------------|-------|
| 1 | {Item Name} | {fieldName} | {I/O} | {Type} | {Format} | {Size} | {Y/N} | {FuncID} | {Notes} |
| 2 | | | | | | | | | |

**Type Legend:**
- L = Label
- T = Text Input
- TA = Textarea
- S = Select Dropdown
- C = Checkbox
- R = Radio
- B = Button
- I = Icon/Image
- W = Widget/Table
- H = Hidden

### 4.2 {Dialog Name} ({Dialog ID})

| STT | Item Name | Field Name | I/O | Type | Data Format | Size | Required | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|------|----------|-------------|-------|
| 1 | Dialog Title | dialogTitle | O | L | Text | - | - | - | "{Title Text}" |
| 2 | Close Button | closeBtn | I | B | Button | - | - | {FuncID} | Đóng dialog |
| 3 | {Field} | {fieldName} | I/O | {Type} | {Format} | {Size} | {Y/N} | {FuncID} | {Notes} |

---

## 5. DATA INPUT CHECKING

### 5.1 {Entity Name} Validation

| NO | Label Name | Field Name | I/O | Type | Data Format | Size | Required | Rule | MessageId | Messages |
|----|------------|------------|-----|------|-------------|------|----------|------|-----------|----------|
| 1 | {Label} | {field} | I | T | {format} | {size} | {Y/N} | {rule} | {ERR_001} | "{Error message}" |
| 2 | | | | | | | | | | |

**Validation Rules:**
- Required: Field cannot be empty
- Unique: Value must be unique in database
- Format: Must match pattern (email, phone, MAC address, etc.)
- Min/Max: Numeric or length constraints

---

## 6. DATA ITEMS

### 6.1 API: {API Name}

**URI:** `{endpoint}`  
**Method:** `{GET|POST|PUT|DELETE}`  
**Auth Required:** {Yes/No}

#### {METHOD} {endpoint}

**Request:**

```http
{METHOD} {endpoint}
Content-Type: application/json
Authorization: Bearer {token}

{request_body}
```

**Request Body:**

```json
{
  "{field1}": "{value1}",
  "{field2}": "{value2}"
}
```

**Response (Success - HTTP {code}):**

```json
{
  "statusCode": {code},
  "data": {
    "{field1}": "{value1}",
    "{field2}": "{value2}"
  },
  "message": "{success_message}"
}
```

**Response (Error - HTTP {code}):**

```json
{
  "statusCode": {code},
  "message": "{error_message}",
  "error": "{error_type}"
}
```

### 6.2 Data Types

```typescript
/**
 * {Entity Name} Interface
 * {Description}
 */
export interface {EntityName} {
  id?: number;              // Primary key
  {field1}: string;         // {description}
  {field2}: string;         // {description}
  {field3}: number;         // {description}
  {field4}?: string;        // {description} (optional)
  createdAt?: string;       // ISO timestamp
  updatedAt?: string;       // ISO timestamp
}
```

---

## 7. FUNCTION DESCRIBE

### 7.1 Functions Table

| Function ID | Function Name | Description |
|-------------|---------------|-------------|
| **{FID}** | {Function Name} | {Description} |
| | | |

### 7.2 Detailed Descriptions

#### {FID} - {Function Name}

- **Trigger:** {What user action triggers this function}
- **Pre-conditions:** {What must be true before this can execute}
- **Action:**
  1. {Step 1}
  2. {Step 2}
  3. {Step 3}
- **Post-conditions:** {What is true after execution}
- **Error Handling:** {What happens on error}

---

## APPENDIX

### A. Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| {ERR_001} | {Message} | 400 |
| {ERR_002} | {Message} | 404 |
| {ERR_003} | {Message} | 500 |

### B. Status Definitions

| Status | Color | Description |
|--------|-------|-------------|
| {Status1} | Green | {Meaning} |
| {Status2} | Red | {Meaning} |
| {Status3} | Amber | {Meaning} |

### C. API Base URL

```
{API_BASE_URL}
```

### D. Related Features

| Feature | Description |
|---------|-------------|
| {Feature1} | {Description} |
| {Feature2} | {Description} |

---

## REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | {YYYY-MM-DD} | {Author} | Initial version |
| | | | |

---

**END OF DOCUMENT**
