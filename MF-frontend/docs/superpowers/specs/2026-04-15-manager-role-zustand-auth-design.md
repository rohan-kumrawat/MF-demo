# Manager Role + Zustand Auth — Design Spec

**Date:** 2026-04-15  
**Status:** Approved

---

## Overview

Add a `manager` role that shares the `AdminLayout` shell but only has access to `DaybookPage` and `UdharKhataPage`. Replace the existing React Context auth with a Zustand store. Harden protected routing so cross-role URL access is prevented.

---

## 1. Zustand Auth Store

**File:** `src/store/authStore.ts`

- Replaces `AuthContext.tsx` entirely.
- State shape:
  ```ts
  interface AuthState {
    role: Role | null;
    user: { name: string; email: string } | null;
    login: (role: Role, user: { name: string; email: string }) => void;
    logout: () => void;
  }
  ```
- Uses Zustand `persist` middleware to sync `role` and `user` to `localStorage` under key `gk_auth`.
- Exports `useAuthStore()` hook consumed directly by all components.
- `AuthContext.tsx` is deleted; `AuthProvider` wrapper is removed from `App.tsx`.

---

## 2. Role Type

**File:** `src/store/authStore.ts` (or a shared `src/types/auth.ts`)

```ts
export type Role = 'admin' | 'manager' | 'agent' | 'customer';
```

`manager` is a first-class role alongside the existing three.

---

## 3. ProtectedRoute

**File:** `src/components/ProtectedRoute.tsx` (extracted from `AuthContext.tsx`)

- Signature: `allowedRoles: Role[]`
- Redirects to `/` if `useAuthStore().role` is not in `allowedRoles`.
- Any role accessing a route not in their `allowedRoles` is sent back to `/`.

---

## 4. Manager Routes (`App.tsx`)

```
/manager                  → redirect to /manager/daybook
/manager/daybook          → DaybookPage
/manager/udhar-khata      → UdharKhataPage
```

Wrapped in `<ProtectedRoute allowedRoles={['manager']}>` inside `AdminLayout`.  
Admin routes remain under `/admin/*` with `allowedRoles={['admin']}`.

---

## 5. Role-Aware Nav (Approach B)

**Files touched:** `AdminLayout.tsx`, `DesktopSidebar.tsx`, `MobileDrawer.tsx`, `MobileBottomNav.tsx`, `constants.ts`

- `constants.ts` exports a `managerNavItems` array with only Daybook and Udhar Khata entries.
- `AdminLayout` reads `role` from `useAuthStore()` and derives `visibleNavItems`:
  - `admin` → full `navItems` (10 items)
  - `manager` → `managerNavItems` (2 items)
- `visibleNavItems` is passed as a prop to `DesktopSidebar`, `MobileDrawer`, and `MobileBottomNav`.
- Keyboard shortcuts in `AdminLayout` are also gated by role (manager only gets shortcuts for their 2 pages).
- Sidebar footer shows the correct role label and initials (`MG` for manager).

---

## 6. Login Page

**File:** `src/pages/LoginPage.tsx`

- Add `manager` as a 4th role card in the role selector grid (change to 4-column or 2×2 grid).
- On submit, calls `useAuthStore().login(role, { name, email })` — user info is placeholder for now (demo mode).
- Routes manager to `/manager/daybook` after login.
- Demo credentials section gains a Manager row.

---

## 7. Cross-Role Route Protection

- `/admin/*` → `allowedRoles={['admin']}` — manager, agent, customer all redirected to `/`
- `/manager/*` → `allowedRoles={['manager']}` — admin, agent, customer all redirected to `/`
- `/agent` → `allowedRoles={['agent']}`
- `/customer` → `allowedRoles={['customer']}`

No role can access another role's routes. All redirects go to `/` (login).

---

## Files Changed

| File | Action |
|------|--------|
| `src/store/authStore.ts` | **Create** — Zustand store |
| `src/context/AuthContext.tsx` | **Delete** (logic moved to store + ProtectedRoute) |
| `src/components/ProtectedRoute.tsx` | **Create** — extracted + updated to `allowedRoles[]` |
| `src/App.tsx` | **Modify** — add manager routes, remove AuthProvider, use ProtectedRoute |
| `src/components/AdminLayout.tsx` | **Modify** — role-aware navItems, pass as props |
| `src/components/admin/layout/constants.ts` | **Modify** — add `managerNavItems` |
| `src/components/admin/layout/DesktopSidebar.tsx` | **Modify** — accept `navItems` as prop |
| `src/components/admin/layout/MobileDrawer.tsx` | **Modify** — accept `navItems` as prop |
| `src/components/admin/layout/MobileBottomNav.tsx` | **Modify** — accept `navItems` as prop |
| `src/pages/LoginPage.tsx` | **Modify** — add manager role card + demo credentials |
