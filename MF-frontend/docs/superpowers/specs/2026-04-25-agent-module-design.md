# Agent Module — Design Spec
**Project:** Guru Kripa Connect  
**Date:** 2026-04-25  
**Status:** Approved  

---

## 1. Goal

Replace the current single-file `AgentDashboard.tsx` (no navigation, hardcoded agent) with a full Agent module: a dedicated layout with bottom navigation and five feature pages, built using the project's established feature-based architecture (`src/feature/admin/udhar-khata/` is the reference implementation).

---

## 2. Scope

**In scope:**
- `AgentLayout` with 5-tab bottom navigation
- 5 pages: Dashboard, Customers, Collect, History, Profile
- Feature folder `src/feature/agent/` (types → service → hooks → components)
- Auth store update to carry `agentId`
- Route update in `App.tsx`

**Out of scope:**
- Real API integration (all data stays in localStorage + demoData)
- Push notifications
- Multi-agent login (single demo agent: Suresh Yadav, `a1`)

---

## 3. Auth Change

### `src/store/authStore.ts`
Add optional `agentId` to `AuthUser`:

```typescript
export interface AuthUser {
  name: string;
  email: string;
  agentId?: string;   // ← new
}
```

### `src/pages/LoginPage.tsx`
Agent login passes `agentId: 'a1'`:

```typescript
login('agent', { name: 'Suresh Yadav', email: 'suresh@gurukripa.com', agentId: 'a1' })
```

---

## 4. Folder Structure

```
src/
  feature/
    agent/
      types.ts
      services/
        agentService.ts
      hooks/
        useAgentDashboard.ts
        useAgentCollect.ts
        useAgentHistory.ts
      components/
        SummaryCard.tsx
        PendingEmiCard.tsx
        ProgressBar.tsx
        CustomerSearchCard.tsx
        CollectModal.tsx
        ReceiptToast.tsx
        HistoryRow.tsx
      index.ts

  layouts/
    AgentLayout.tsx

  pages/
    agent/
      AgentDashboard.tsx
      AgentCustomers.tsx
      AgentCollect.tsx
      AgentHistory.tsx
      AgentProfile.tsx
```

---

## 5. Types (`types.ts`)

```typescript
// Derived from demoData.Customer — agent-specific view
export interface AgentCustomer {
  id: string;
  name: string;
  phone: string;
  accountNo: string;
  emi: number | null;
  emiStatus: 'green' | 'yellow' | 'orange' | 'red';
  emiLabel: string;
  diaryBalance: number;
  risk: 'Low' | 'Medium' | 'High';
}

// Pending EMI computed from customer emiStatus
export interface PendingEmi {
  id: string;           // customerId
  customerId: string;
  customerName: string;
  amount: number;
  status: 'due-soon' | 'overdue' | 'high-risk';
  daysLabel: string;    // e.g. "Due in 2 days", "8 days overdue"
}

// Written to localStorage after a collection
export interface CollectionRecord {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  mode: 'Cash' | 'UPI' | 'Cheque';
  usedDiary: boolean;
  receiptNo: string;
  date: string;         // ISO 'YYYY-MM-DD'
  agentId: string;
}

export interface CreateCollectionDto {
  customerId: string;
  customerName: string;
  amount: number;
  mode: 'Cash' | 'UPI' | 'Cheque';
  usedDiary: boolean;
  agentId: string;
}

export interface AgentStats {
  collectedToday: number;
  target: number;
  progressPct: number;
  pendingCount: number;
}
```

---

## 6. Service (`agentService.ts`)

One function — all others are pure derivations in the hook:

```typescript
// Simulated — returns Promise so swap to real fetch later without changing the hook
export function createCollection(dto: CreateCollectionDto): Promise<CollectionRecord>
```

Generates `id` (uid), `receiptNo` (RCP-{timestamp}), `date` (today ISO), merges with dto.

---

## 7. Hooks

### Shared localStorage key
All three hooks read/write `gk_agent_collections` — so a collection submitted on `/agent/collect` is immediately visible on `/agent` (Dashboard) and `/agent/history`.

### `useAgentDashboard(agentId)`

| | Detail |
|---|---|
| **State** | Reads `CollectionRecord[]` from localStorage (no dispatch — read-only) |
| **Derived (useMemo)** | `myCustomers`, `pendingEmis`, `stats: AgentStats` |
| **Returns** | `{ myCustomers, pendingEmis, stats }` |

EMI status → pending status mapping:
- `yellow` → `due-soon`
- `orange` → `overdue`
- `red` → `high-risk`
- `green` → excluded

### `useAgentCollect(agentId)`

| | Detail |
|---|---|
| **State** | `CollectionRecord[]` via useReducer + localStorage, `searchQuery` |
| **Derived** | `filteredCustomers` (by name/phone/accountNo) |
| **Actions** | `submitCollection(dto)` — calls service, dispatches `ADD_COLLECTION` |
| **Returns** | `{ filteredCustomers, searchQuery, setSearchQuery, submitCollection }` |

### `useAgentHistory(agentId)`

| | Detail |
|---|---|
| **State** | Reads `CollectionRecord[]` from localStorage (read-only), `dateFilter: 'today' \| 'week' \| 'all'` |
| **Derived** | `filteredHistory`, `totalFiltered` |
| **Returns** | `{ filteredHistory, totalFiltered, dateFilter, setDateFilter }` |

### Reducer (used only in `useAgentCollect`)

```
Action: ADD_COLLECTION → [...state, payload]
```

Single action — no deletion needed in this scope.

---

## 8. Components

All list-rendered components use `React.memo`. All callbacks come from hooks via `useCallback`.

| Component | Props | Notes |
|-----------|-------|-------|
| `SummaryCard` | `label, value, icon, gradient` | Reuses visual style of existing `StatCard` |
| `PendingEmiCard` | `emi: PendingEmi, onClick` | Color-coded by status; active:scale feedback |
| `ProgressBar` | `collected, target` | Shows ₹ values + % bar |
| `CustomerSearchCard` | `customer: AgentCustomer, onCollect` | Shows EMI status badge + collect button |
| `CollectModal` | `customer, onSubmit, onClose` | Amount input, mode select, diary checkbox |
| `ReceiptToast` | `receiptNo, onDismiss` | Auto-dismiss after 4s, matches existing toast style |
| `HistoryRow` | `record: CollectionRecord` | Date, name, mode, amount |

---

## 9. Pages (thin orchestrators)

### `AgentDashboard.tsx`
```
useAgentDashboard(agentId)
├── SummaryCard ×4 (customers, collected, target, pending)
├── ProgressBar
├── PendingEmiCard list  → navigate('/agent/collect', { state: { customerId } })
└── "Collect Payment" button → navigate('/agent/collect')
```

### `AgentCustomers.tsx`
```
useAgentCollect(agentId)   ← reuses filteredCustomers + submitCollection
├── SearchBar (inline input)
├── CustomerSearchCard list
└── CollectModal (when customer selected)
   └── ReceiptToast on success
```

### `AgentCollect.tsx`
```
useAgentCollect(agentId)
├── SearchBar
├── CustomerSearchCard list (filtered)
└── CollectModal (when customer selected)
   └── ReceiptToast on success
```
Pre-selects customer from `location.state.customerId` if navigated from Dashboard.

### `AgentHistory.tsx`
```
useAgentHistory(agentId)
├── Date filter tabs (Today / This Week / All)
├── Total collected (for filtered range)
└── HistoryRow list
```

### `AgentProfile.tsx`
```
Static display — reads agent record from demoData by agentId
├── Avatar + name + area
├── Monthly performance bar (matches Dashboard's existing design)
├── Stats: customers, defaulters, monthly collected / target
└── Logout button → authStore.logout() + navigate('/')
```

---

## 10. Layout (`AgentLayout.tsx`)

```tsx
<div className="min-h-screen bg-[#f8f9ff] flex flex-col">
  <div className="flex-1 max-w-3xl mx-auto w-full pb-20">
    <Outlet />       {/* renders the active page */}
  </div>

  {/* Bottom Navigation — fixed, 5 tabs */}
  <nav className="fixed bottom-0 inset-x-0 bg-white border-t ...">
    <NavTab icon={Home}       label="Home"      to="/agent" />
    <NavTab icon={Users}      label="Customers" to="/agent/customers" />
    <NavTab icon={CirclePlus} label="Collect"   to="/agent/collect" highlight />
    <NavTab icon={History}    label="History"   to="/agent/history" />
    <NavTab icon={UserCircle} label="Profile"   to="/agent/profile" />
  </nav>
</div>
```

"Collect" tab renders as a larger primary-colored circle button (FAB style) to draw attention.

Active tab uses `useMatch` to highlight current route.

---

## 11. Routing (`App.tsx`)

Replace the flat `/agent` route with nested routes:

```tsx
<Route
  path="/agent"
  element={
    <ProtectedRoute allowedRoles={['agent']}>
      <AgentLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<AgentDashboard />} />
  <Route path="customers" element={<AgentCustomers />} />
  <Route path="collect" element={<AgentCollect />} />
  <Route path="history" element={<AgentHistory />} />
  <Route path="profile" element={<AgentProfile />} />
</Route>
```

The old `AgentDashboard.tsx` at `src/pages/AgentDashboard.tsx` is deleted once the new pages are wired.

---

## 12. Data Flow

```
Login (agent role)
  → authStore: { role: 'agent', user: { name: 'Suresh Yadav', agentId: 'a1' } }
  → navigate('/agent')

AgentLayout renders → Outlet shows AgentDashboard

useAgentDashboard('a1')
  → reads customers[] from demoData, filters by agentId
  → reads CollectionRecord[] from localStorage('gk_agent_collections')
  → derives: pendingEmis, stats
  → Dashboard renders: KPI cards, progress bar, pending list

User clicks pending EMI card
  → navigate('/agent/collect', { state: { customerId: 'X' } })

AgentCollect mounts
  → useAgentCollect pre-selects customer from location.state
  → CollectModal opens

User submits collection
  → agentService.createCollection(dto) → CollectionRecord
  → dispatch(ADD_COLLECTION) → new state
  → useEffect → localStorage.setItem('gk_agent_collections', ...)
  → ReceiptToast shown, modal closed

User navigates to Dashboard
  → useAgentDashboard re-reads localStorage → updated stats
```

---

## 13. Architecture Checklist

- [ ] No business logic in components (all derivations in hooks)
- [ ] All action dispatchers wrapped in `useCallback`
- [ ] All list-rendered components wrapped in `React.memo`
- [ ] Derived data in `useMemo`, not in JSX
- [ ] Reducer is pure (no side effects)
- [ ] Service returns `Promise<T>` (simulated via `Promise.resolve`)
- [ ] `index.ts` is the only import surface for pages
- [ ] `npx tsc --noEmit` passes with zero errors

---

## 14. Files Created / Modified

| Action | Path |
|--------|------|
| Modified | `src/store/authStore.ts` |
| Modified | `src/pages/LoginPage.tsx` |
| Modified | `src/App.tsx` |
| Deleted | `src/pages/AgentDashboard.tsx` |
| Created | `src/layouts/AgentLayout.tsx` |
| Created | `src/feature/agent/types.ts` |
| Created | `src/feature/agent/services/agentService.ts` |
| Created | `src/feature/agent/hooks/useAgentDashboard.ts` |
| Created | `src/feature/agent/hooks/useAgentCollect.ts` |
| Created | `src/feature/agent/hooks/useAgentHistory.ts` |
| Created | `src/feature/agent/components/SummaryCard.tsx` |
| Created | `src/feature/agent/components/PendingEmiCard.tsx` |
| Created | `src/feature/agent/components/ProgressBar.tsx` |
| Created | `src/feature/agent/components/CustomerSearchCard.tsx` |
| Created | `src/feature/agent/components/CollectModal.tsx` |
| Created | `src/feature/agent/components/ReceiptToast.tsx` |
| Created | `src/feature/agent/components/HistoryRow.tsx` |
| Created | `src/feature/agent/index.ts` |
| Created | `src/pages/agent/AgentDashboard.tsx` |
| Created | `src/pages/agent/AgentCustomers.tsx` |
| Created | `src/pages/agent/AgentCollect.tsx` |
| Created | `src/pages/agent/AgentHistory.tsx` |
| Created | `src/pages/agent/AgentProfile.tsx` |
