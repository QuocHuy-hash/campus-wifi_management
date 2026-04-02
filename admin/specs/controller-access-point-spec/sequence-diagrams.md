# Sequence Diagrams - Controller & Access Point Management

> Data flow and interaction sequences for CP001 and CP002 functions.

---

## SEQ-CP001: Load Controllers List

```
┌────┐         ┌──────────┐         ┌──────┐         ┌─────────┐         ┌──────────┐
│User│         │Frontend  │         │ API  │         │Backend  │         │Database  │
└─┬──┘         └────┬─────┘         └──┬───┘         └────┬────┘         └────┬─────┘
  │                 │                   │                  │                   │
  │ Click Refresh   │                   │                  │                   │
  ├────────────────>│                   │                  │                   │
  │                 │                   │                  │                   │
  │                 │ dispatch          │                  │                   │
  │                 │ getControllers()  │                  │                   │
  │                 ├────────┐          │                  │                   │
  │                 │        │          │                  │                   │
  │                 │◄───────┘          │                  │                   │
  │                 │                   │                  │                   │
  │                 │ GET               │                  │                   │
  │                 │ /wifi-controllers>│                  │                   │
  │                 │                   │                  │                   │
  │                 │                   │  Query Controllers                   │
  │                 │                   ├─────────────────>│                   │
  │                 │                   │                  │                   │
  │                 │                   │                  │                   │
  │                 │                   │<─────────────────┤                   │
  │                 │                   │  Controller[]    │                   │
  │                 │                   │                  │                   │
  │                 │<──────────────────┤                  │                   │
  │                 │  JSON Response    │                  │                   │
  │                 │                   │                  │                   │
  │                 │ Update State      │                  │                   │
  │                 ├────────┐          │                  │                   │
  │                 │        │          │                  │                   │
  │                 │◄───────┘          │                  │                   │
  │                 │                   │                  │                   │
  │                 │ Render Table      │                  │                   │
  │                 ├────────┐          │                  │                   │
  │                 │        │          │                  │                   │
  │                 │◄───────┘          │                  │                   │
  │<────────────────┤                   │                  │                   │
  │ Display List    │                   │                  │                   │
  │                 │                   │                  │                   │
```

### Steps

| Step | Action | Component | Details |
|------|--------|-----------|---------|
| 1 | User clicks refresh | UI | Trigger data reload |
| 2 | Dispatch action | Redux | `getControllers()` thunk |
| 3 | API call | accessPointsApi | `GET /wifi-controllers` |
| 4 | Query database | Backend | SELECT * FROM wifi_controllers |
| 5 | Return data | Database | Controller array |
| 6 | Update state | Redux | Store controllers in slice |
| 7 | Render | React | ControllersTable component |

---

## SEQ-CP002: Create New Controller

```
┌────┐         ┌──────────┐         ┌──────┐         ┌─────────┐         ┌──────────┐
│User│         │Frontend  │         │ API  │         │Backend  │         │Database  │
└─┬──┘         └────┬─────┘         └──┬───┘         └────┬────┘         └────┬─────┘
  │                 │                   │                  │                   │
  │ Click "Thêm"    │                   │                  │                   │
  ├────────────────>│                   │                  │                   │
  │                 │                   │                  │                   │
  │                 │ Open Dialog       │                  │                   │
  │                 ├────────┐          │                  │                   │
  │                 │        │          │                  │                   │
  │                 │◄───────┘          │                  │                   │
  │                 │                   │                  │                   │
  │ Fill Form       │                   │                  │                   │
  ├────────────────>│                   │                  │                   │
  │                 │                   │                  │                   │
  │ Click "Lưu"     │                   │                  │                   │
  ├────────────────>│                   │                  │                   │
  │                 │                   │                  │                   │
  │                 │ Validate Form     │                  │                   │
  │                 ├────────┐          │                  │                   │
  │                 │        │          │                  │                   │
  │                 │◄───────┘          │                  │                   │
  │                 │                   │                  │                   │
  │                 │ dispatch          │                  │                   │
  │                 │ createController()│                  │                   │
  │                 ├────────┐          │                  │                   │
  │                 │        │          │                  │                   │
  │                 │◄───────┘          │                  │                   │
  │                 │                   │                  │                   │
  │                 │ POST              │                  │                   │
  │                 │ /wifi-controllers>│                  │                   │
  │                 │ {data}            │                  │                   │
  │                 │                   │                  │                   │
  │                 │                   │  INSERT Controller                   │
  │                 │                   ├─────────────────>│                   │
  │                 │                   │                  │                   │
  │                 │                   │                  │                   │
  │                 │                   │<─────────────────┤                   │
  │                 │                   │  New ID          │                   │
  │                 │                   │                  │                   │
  │                 │<──────────────────┤                  │                   │
  │                 │  {id, ...data}    │                  │                   │
  │                 │                   │                  │                   │
  │                 │ Update State      │                  │                   │
  │                 ├────────┐          │                  │                   │
  │                 │        │          │                  │                   │
  │                 │◄───────┘          │                  │                   │
  │                 │                   │                  │                   │
  │                 │ Close Dialog      │                  │                   │
  │                 ├────────┐          │                  │                   │
  │                 │        │          │                  │                   │
  │                 │◄───────┘          │                  │                   │
  │                 │                   │                  │                   │
  │                 │ Show Toast        │                  │                   │
  │                 ├────────┐          │                  │                   │
  │                 │        │          │                  │                   │
  │                 │◄───────┘          │                  │                   │
  │<────────────────┤                   │                  │                   │
  │ Success Message │                   │                  │                   │
  │                 │                   │                  │                   │
```

### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| nasIdentifier | Required, max 50 | "NAS Identifier không được để trống" |
| macAddress | Required, format XX:XX:XX:XX:XX:XX | "MAC Address không hợp lệ" |
| ipAddress | Required, valid IPv4 | "IP Address không hợp lệ" |

### API Payload

```json
{
  "nasIdentifier": "Controller-02",
  "macAddress": "AA:BB:CC:DD:EE:02",
  "ipAddress": "192.168.1.11",
  "version": "2.4.1",
  "locationName": "Building B"
}
```

---

## SEQ-CP003: Delete Controller

```
┌────┐         ┌──────────┐         ┌──────┐         ┌─────────┐         ┌──────────┐
│User│         │Frontend  │         │ API  │         │Backend  │         │Database  │
└─┬──┘         └────┬─────┘         └──┬───┘         └────┬────┘         └────┬─────┘
  │                 │                   │                  │                   │
  │ Click Delete    │                   │                  │                   │
  ├────────────────>│                   │                  │                   │
  │                 │                   │                  │                   │
  │                 │ Show Confirm      │                  │                   │
  │                 ├────────┐          │                  │                   │
  │                 │        │          │                  │                   │
  │                 │◄───────┘          │                  │                   │
  │                 │                   │                  │                   │
  │ Confirm Delete  │                   │                  │                   │
  ├────────────────>│                   │                  │                   │
  │                 │                   │                  │                   │
  │                 │ dispatch          │                  │                   │
  │                 │ deleteController()│                  │                   │
  │                 ├────────┐          │                  │                   │
  │                 │        │          │                  │                   │
  │                 │◄───────┘          │                  │                   │
  │                 │                   │                  │                   │
  │                 │ DELETE            │                  │                   │
  │                 │ /wifi-controllers/:id>               │                   │
  │                 │                   │                  │                   │
  │                 │                   │  DELETE Controller                   │
  │                 │                   ├─────────────────>│                   │
  │                 │                   │                  │                   │
  │                 │                   │                  │                   │
  │                 │                   │<─────────────────┤                   │
  │                 │                   │  Success         │                   │
  │                 │                   │                  │                   │
  │                 │<──────────────────┤                  │                   │
  │                 │  200 OK           │                  │                   │
  │                 │                   │                  │                   │
  │                 │ Update State      │                  │                   │
  │                 │ (remove from list)│                  │                   │
  │                 ├────────┐          │                  │                   │
  │                 │        │          │                  │                   │
  │                 │◄───────┘          │                  │                   │
  │                 │                   │                  │                   │
  │                 │ Show Toast        │                  │                   │
  │                 ├────────┐          │                  │                   │
  │                 │        │          │                  │                   │
  │                 │◄───────┘          │                  │                   │
  │<────────────────┤                   │                  │                   │
  │ Success Message │                   │                  │                   │
  │                 │                   │                  │                   │
```

---

## SEQ-CP004: Search & Filter APs

```
┌────┐         ┌──────────┐         ┌──────────┐
│User│         │Frontend  │         │Redux State│
└─┬──┘         └────┬─────┘         └─────┬─────┘
  │                 │                     │
  │ Type in Search  │                     │
  ├────────────────>│                     │
  │                 │                     │
  │                 │ dispatch            │
  │                 │ setSearchTerm(term) │
  │                 ├────────────────────>│
  │                 │                     │
  │                 │                     │ Update searchTerm
  │                 │                     ├────────┐
  │                 │                     │        │
  │                 │                     │◄───────┘
  │                 │                     │
  │                 │ Select Building     │
  │                 ├────────────────────>│
  │                 │                     │
  │                 │                     │ Update selectedBuilding
  │                 │                     ├────────┐
  │                 │                     │        │
  │                 │                     │◄───────┘
  │                 │                     │
  │                 │ Filter APs          │
  │                 │ (useMemo)           │
  │                 ├────────┐            │
  │                 │        │            │
  │                 │◄───────┘            │
  │                 │                     │
  │                 │ Render Filtered List│
  │                 ├────────┐            │
  │                 │        │            │
  │                 │◄───────┘            │
  │<────────────────┤                     │
  │ Display Results │                     │
  │                 │                     │
```

### Filter Logic

```typescript
const filteredAPs = useMemo(() => {
  return aps.filter(ap => {
    // Search filter
    const matchesSearch = 
      ap.apName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ap.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ap.macAddress.toLowerCase().includes(searchTerm.toLowerCase());

    // Building filter
    const matchesBuilding = 
      selectedBuilding === 'all' || 
      ap.buildingId?.toString() === selectedBuilding;

    return matchesSearch && matchesBuilding;
  });
}, [aps, searchTerm, selectedBuilding]);
```

---

## Error Handling Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│Frontend  │         │ API      │         │Backend   │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │
     │ API Request        │                    │
     ├───────────────────>│                    │
     │                    │                    │
     │                    │ Process Request    │
     │                    ├───────────────────>│
     │                    │                    │
     │                    │                    │ Error occurs
     │                    │                    ├────────┐
     │                    │                    │        │
     │                    │                    │◄───────┘
     │                    │                    │
     │                    │ Return Error       │
     │                    │<───────────────────┤
     │                    │                    │
     │<───────────────────┤                    │
     │ Error Response     │                    │
     │ {statusCode,       │                    │
     │  message}          │                    │
     │                    │                    │
     │ Show Error Toast   │                    │
     ├────────┐           │                    │
     │        │           │                    │
     │◄───────┘           │                    │
     │                    │                    │
```

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed: MAC Address is required",
  "error": "Bad Request"
}
```

---

## State Management Flow

```
┌─────────────────────────────────────────────────────┐
│                 AccessPointsSlice                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  State:                                             │
│  - aps: AP[]                                        │
│  - controllers: Controller[]                        │
│  - campuses: Campus[]                               │
│  - buildings: Building[]                            │
│  - apsLoading: boolean                              │
│  - controllersLoading: boolean                      │
│  - error: string | null                             │
│  - searchTerm: string                               │
│  - selectedBuilding: string                         │
│  - selectedControllerFilter: string | null          │
│                                                      │
│  Actions:                                           │
│  - getAPs (async thunk)                             │
│  - getControllers (async thunk)                     │
│  - getCampuses (async thunk)                        │
│  - getBuildings (async thunk)                       │
│  - setSearchTerm (reducer)                          │
│  - setSelectedBuilding (reducer)                    │
│  - setSelectedControllerFilter (reducer)            │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Performance Considerations

| Optimization | Description | Implementation |
|-------------|-------------|----------------|
| Memoization | Cache filtered results | `useMemo` for filtered APs |
| Debouncing | Limit API calls on search | 300ms debounce on search input |
| Lazy Loading | Load data on demand | Load controllers only when needed |
| Caching | Reduce redundant API calls | React Query or RTK Query cache |
| Pagination | Handle large datasets | Server-side pagination for 100+ items |
