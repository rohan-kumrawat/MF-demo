# Feature Architecture Pattern
**Project:** Guru Kripa Connect  
**Reference implementation:** `src/feature/admin/udhar-khata/`

---

## What is this pattern?

This is a **feature-based architecture** with a **custom hook + useReducer** state layer and a **thin page orchestrator**. It is designed for:

- Features that manage non-trivial local state
- UI that will eventually connect to a real API
- Teams that want to avoid prop drilling without reaching for a global store

---

## Folder Structure

```
src/
  feature/
    admin/
      <feature-name>/
        components/       ← Dumb UI components (React.memo)
        hooks/            ← useReducer-based state hook
        services/         ← API simulation / real API calls later
        types.ts          ← Feature-local TypeScript types
        index.ts          ← Barrel export (only public surface)
  pages/
    admin/
      <FeaturePage>.tsx   ← Thin orchestrator, no business logic
```

### Why this structure?

| Decision | Reason |
|----------|--------|
| Feature folder separate from `pages/` | Pages are routing concerns. Features are business concerns. Keeping them separate lets you move, reuse, or delete a feature without touching the router. |
| `index.ts` barrel | The page imports from one place. Internal file renames or moves don't break the page. You control what is "public" to the outside world. |
| Components in `components/`, not inline | Each component has one job. Easier to test, reason about, and replace. |
| Hook in `hooks/`, service in `services/` | Forces you to keep business logic out of components. The hook owns state transitions; the service owns data construction and API shape. |

---

## The Three-Layer Architecture

```
Page (orchestrator)
   ↓ calls
useXxx Hook  (state + derived data)
   ↓ calls
xxxService   (data construction / API calls)
```

### Layer 1 — Service (`khataService.ts`)

**What it does:** Constructs new data objects and owns ID generation. Currently simulates API calls via `Promise.resolve()`.

**Why a separate service?**  
When you add a real backend, you change only the service function bodies — not the hook, not the components. The hook calls `await khataService.createKhatedar(dto)` whether the backend is fake or real.

```typescript
// SIMULATED (today)
export function createKhatedar(dto: CreateKhatedarDto): Promise<Khatedar> {
  return Promise.resolve({ id: uid(), ...dto, entries: [], netBalance: 0 });
}

// REAL (future — only this changes)
export async function createKhatedar(dto: CreateKhatedarDto): Promise<Khatedar> {
  const res = await fetch('/api/khatedars', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  return res.json();
}
```

**The hook and components never change when you swap this.**

---

### Layer 2 — Hook (`useUdharKhata.ts`)

This is the core of the pattern. It has four responsibilities:

#### 1. State via `useReducer`

```typescript
const [state, dispatch] = useReducer(reducer, undefined, initFn);
```

`useReducer` is preferred over `useState` when:
- Multiple related pieces of state change together (e.g., adding an entry updates both `entries[]` and `netBalance`)
- State transitions have rules (e.g., balance must always be recalculated after entry changes)
- You want testable, pure state logic (the reducer is a plain function)

**Why not `useState`?**  
With `useState` you'd have separate `setKhatedars`, `setEntries`, etc. calls scattered across handlers. It's easy to forget one and end up with inconsistent state. The reducer makes every transition explicit and atomic.

#### 2. Persistence via `useEffect`

```typescript
useEffect(() => {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}, [state]);
```

Simple one-way sync: every time state changes, write to localStorage. On mount, the `initFn` reads it back. No manual save buttons, no sync bugs.

**Initialization pattern:**
```typescript
// Third argument to useReducer = lazy initializer (runs once, not on re-renders)
const [state, dispatch] = useReducer(reducer, undefined, loadFromStorage);
```

Using the lazy initializer (`undefined` + init function) means `localStorage.getItem()` only runs once at mount — not on every render.

#### 3. Derived data via `useMemo`

```typescript
const summary = useMemo(() => computeSummary(state), [state]);
const filteredList = useMemo(() => filterAndSort(state, searchQuery), [state, searchQuery]);
```

**Rule:** Never compute derived data in the component. Always compute it in the hook with `useMemo`. This means:
- Components receive ready-to-render data, not raw state
- The component never re-renders just because a memo result is the same
- You can change the derivation logic without touching any component

#### 4. Stable callbacks via `useCallback`

```typescript
const addKhatedar = useCallback(async (dto) => {
  const result = await khataService.createKhatedar(dto);
  dispatch({ type: 'ADD_KHATEDAR', payload: result });
}, []);  // ← empty deps: dispatch is stable, service is a module import
```

**Why `useCallback`?**  
These callbacks are passed as props to `React.memo` components. Without `useCallback`, a new function reference is created on every render, causing every `React.memo` child to re-render even if nothing changed.

**The hook's public interface:**
```typescript
return {
  filteredKhatedars,   // derived — ready to render
  summary,             // derived — ready to render
  searchQuery,         // controlled input value
  setSearchQuery,      // stable setter
  addKhatedar,         // stable async action
  removeKhatedar,      // stable async action
  addEntry,            // stable async action
  removeEntry,         // stable async action
};
```

---

### Layer 3 — Components

#### Dumb components with `React.memo`

```typescript
export const KhatedarCard = React.memo(function KhatedarCard({ khatedar, onAddEntry, ... }: Props) {
  // ...
});
```

**What "dumb" means here:** The component receives data and callbacks as props. It has no idea where data comes from or what happens when a button is clicked. This makes it:
- Easy to test in isolation
- Easy to reuse (just pass different props)
- Safe to memoize (no hidden dependencies)

**When to use `React.memo`:**
- The component is a pure function of its props
- It receives stable callback references (guaranteed by `useCallback` in the hook)
- It renders in a list or is a child of something that re-renders frequently

**When NOT to use `React.memo`:**
- The component always receives new props on every render anyway
- The component is cheap to render (e.g., a single `<p>` tag)

#### Local UI state stays in the component

Components can have their own `useState` for UI-only state — things that don't belong in the hook:

```typescript
// In KhatedarCard — this is UI state, not business state
const [pendingDeleteEntryId, setPendingDeleteEntryId] = useState<string | null>(null);
const [khatedarDeleteOpen, setKhatedarDeleteOpen] = useState(false);
```

**Rule:** If the state only matters for "is this dialog open" or "what is hovered", keep it local to the component. Only state that affects the data model goes in the hook/reducer.

#### Page as thin orchestrator

```typescript
export default function UdharKhataPage() {
  const { filteredKhatedars, summary, ... } = useUdharKhata();
  const [addPersonOpen, setAddPersonOpen] = useState(false);

  return (
    <div>
      <SummaryCards summary={summary} />
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      {filteredKhatedars.map(k => <KhatedarCard key={k.id} khatedar={k} ... />)}
      <AddKhatedarModal open={addPersonOpen} ... />
    </div>
  );
}
```

The page's job is to:
1. Call the hook
2. Manage which modals are open
3. Wire components together

**Nothing else.** No business logic, no balance calculations, no filtering.

---

## The Reducer Pattern

```typescript
type Action =
  | { type: 'ADD_KHATEDAR'; payload: Khatedar }
  | { type: 'DELETE_KHATEDAR'; payload: string }
  | { type: 'ADD_ENTRY'; payload: { khatedarId: string; entry: ... } }
  | { type: 'DELETE_ENTRY'; payload: { khatedarId: string; entryId: string } };

function reducer(state: Khatedar[], action: Action): Khatedar[] {
  switch (action.type) {
    case 'ADD_KHATEDAR':
      return [...state, action.payload];         // immutable — new array
    case 'ADD_ENTRY':
      return state.map(k => {
        if (k.id !== action.payload.khatedarId) return k;  // untouched khatedars pass through
        const newEntries = recalcBalances([...k.entries, action.payload.entry]);
        return { ...k, entries: newEntries, netBalance: lastBalance(newEntries) };
      });
    // ...
  }
}
```

**Rules for writing reducers:**
1. **Always return a new reference** — never mutate `state` directly. React uses reference equality (`===`) to detect changes.
2. **Keep it pure** — no side effects (no `localStorage.setItem`, no API calls) inside the reducer. Those live in the hook.
3. **One transition per action** — each `case` handles exactly one state change. If two things always change together, they go in the same case.
4. **Derived values belong in the reducer** — `netBalance` is derived from `entries`, so the reducer recomputes it on every entry change. This keeps state consistent.

---

## Data Flow Diagram

```
User clicks "Add Entry"
        ↓
  AddEntryModal (local state: form fields, validation error)
        ↓ validates locally, calls onSave(khatedarId, dto)
  UdharKhataPage.handleAddEntry
        ↓ calls
  useUdharKhata.addEntry(khatedarId, dto)
        ↓ calls
  khataService.createEntry(dto) → returns { id, date, liye, diye, remark }
        ↓
  dispatch({ type: 'ADD_ENTRY', payload: { khatedarId, entry } })
        ↓
  reducer → new state (with recalculated balances)
        ↓
  useEffect → localStorage.setItem(...)
        ↓
  useMemo re-runs → new filteredKhatedars, new summary
        ↓
  React re-renders only the affected KhatedarCard (React.memo)
```

---

## When to Use This Pattern vs Alternatives

| Situation | Recommended approach |
|-----------|----------------------|
| Simple page, 1-3 pieces of state, no derived data | `useState` directly in the page — this pattern is overkill |
| Complex local state with rules (balances, running totals, dependent fields) | **This pattern** — `useReducer` hook |
| State shared across many unrelated pages | Zustand or React Context |
| Server state (loading, error, cache, refetch) | React Query (`@tanstack/react-query`) — already installed |
| Form with validation only | `react-hook-form` + `zod` — already installed |

---

## Replicating This Pattern for a New Feature

1. **Create the folder:** `src/feature/admin/<feature-name>/`

2. **Write `types.ts` first** — define your entities and DTOs before writing any logic.

3. **Write `services/<feature>Service.ts`** — one function per API endpoint. Use `Promise.resolve()` for simulation.

4. **Write `hooks/use<Feature>.ts`**:
   - Define `Action` union type
   - Write pure `reducer` function
   - Write `useReducer` + `useEffect` for persistence
   - Write `useMemo` for derived data
   - Write `useCallback` for every action dispatcher
   - Return a typed interface

5. **Write components** — one file per component, `React.memo` on all list items and frequently-rendered components. Local `useState` only for UI state.

6. **Write `index.ts`** — export only what the page needs.

7. **Write the page** — it should only call the hook, hold modal-open state, and wire components.

---

## Checklist Before Shipping a New Feature

- [ ] No business logic in components (balance calc, filtering, ID generation)
- [ ] All action dispatchers wrapped in `useCallback`
- [ ] All list-rendered components wrapped in `React.memo`
- [ ] Derived data computed in `useMemo`, not in JSX
- [ ] Reducer is a pure function (no side effects)
- [ ] Service functions return `Promise<T>` (even if simulated)
- [ ] `index.ts` is the only import surface for the page
- [ ] TypeScript: `npx tsc --noEmit` passes with zero errors
