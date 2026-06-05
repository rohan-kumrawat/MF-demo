# Manager Role + Zustand Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `manager` role with its own `/manager/*` routes (Daybook + Udhar Khata only), replace the React Context auth with a Zustand store, and harden protected routing so every role is isolated.

**Architecture:** A Zustand `persist` store replaces `AuthContext` as the single source of auth truth. `AdminLayout` reads `role` from the store and filters `navItems` before passing them as props to sidebar/drawer/nav components. Manager routes live under `/manager/*` and reuse `AdminLayout` with the filtered nav.

**Tech Stack:** React 19, TypeScript, Zustand 5 (already installed), React Router DOM 7, Vite

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/store/authStore.ts` | **Create** | Zustand store — `role`, `user`, `login`, `logout` |
| `src/components/ProtectedRoute.tsx` | **Create** | `allowedRoles: Role[]` guard, redirects to `/` |
| `src/context/AuthContext.tsx` | **Delete** | Replaced by store + ProtectedRoute |
| `src/components/admin/layout/constants.ts` | **Modify** | Add `managerNavItems`, `managerPageTitles` |
| `src/components/admin/layout/DesktopSidebar.tsx` | **Modify** | Accept `navItems` + `role` as props |
| `src/components/admin/layout/MobileDrawer.tsx` | **Modify** | Accept `navItems` + `role` as props |
| `src/components/admin/layout/MobileBottomNav.tsx` | **Modify** | Accept `navItems` as prop |
| `src/components/AdminLayout.tsx` | **Modify** | Derive `visibleNavItems` from role, pass as props, use `useAuthStore` |
| `src/App.tsx` | **Modify** | Add `/manager/*` routes, remove `AuthProvider`, use new `ProtectedRoute` |
| `src/pages/LoginPage.tsx` | **Modify** | Add manager role card + demo row, use `useAuthStore` |
| `src/pages/AgentDashboard.tsx` | **Modify** | Switch `useAuth` → `useAuthStore` |
| `src/pages/CustomerDashboard.tsx` | **Modify** | Switch `useAuth` → `useAuthStore` |

---

## Task 1: Create Zustand Auth Store

**Files:**
- Create: `src/store/authStore.ts`

- [ ] **Step 1: Create the store file**

```ts
// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'admin' | 'manager' | 'agent' | 'customer';

export interface AuthUser {
  name: string;
  email: string;
}

interface AuthState {
  role: Role | null;
  user: AuthUser | null;
  login: (role: Role, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      user: null,
      login: (role, user) => set({ role, user }),
      logout: () => set({ role: null, user: null }),
    }),
    {
      name: 'gk_auth',
    }
  )
);
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd d:/nextjs/guru-kripa-micro-finance && npx tsc -b --noEmit 2>&1 | head -30`

Expected: errors only from files that still import from `AuthContext` (not from `authStore.ts` itself)

- [ ] **Step 3: Commit**

```bash
git add src/store/authStore.ts
git commit -m "feat: add zustand auth store with persist middleware"
```

---

## Task 2: Create ProtectedRoute Component

**Files:**
- Create: `src/components/ProtectedRoute.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { Role } from '../store/authStore';

interface Props {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const role = useAuthStore(s => s.role);
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc -b --noEmit 2>&1 | head -30`

Expected: no errors in `ProtectedRoute.tsx`

- [ ] **Step 3: Commit**

```bash
git add src/components/ProtectedRoute.tsx
git commit -m "feat: add ProtectedRoute with allowedRoles array"
```

---

## Task 3: Add Manager Nav Items to Constants

**Files:**
- Modify: `src/components/admin/layout/constants.ts`

- [ ] **Step 1: Replace the entire file content**

```ts
// src/components/admin/layout/constants.ts
import {
  LayoutDashboard, Users, BookOpen, CreditCard, Wallet,
  FileText, TableProperties, Receipt, UserCheck, BarChart3,
} from 'lucide-react';
import type { ElementType } from 'react';

export interface NavItem {
  icon: ElementType;
  label: string;
  sublabel: string;
  path: string;
}

export const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard',      sublabel: 'डैशबोर्ड',    path: '/admin' },
  { icon: Users,           label: 'Customers',       sublabel: 'ग्राहक',       path: '/admin/customers' },
  { icon: BookOpen,        label: 'Savings Diary',   sublabel: 'बचत डायरी',   path: '/admin/diary' },
  { icon: CreditCard,      label: 'Loans',           sublabel: 'ऋण',          path: '/admin/loans' },
  { icon: Wallet,          label: 'Collection',      sublabel: 'संग्रह',       path: '/admin/collection' },
  { icon: FileText,        label: 'Daybook',         sublabel: 'दैनिक बही',   path: '/admin/daybook' },
  { icon: TableProperties, label: 'Daily Register',  sublabel: 'रोज़नामचा',   path: '/admin/daily-register' },
  { icon: Receipt,         label: 'Udhar Khata',     sublabel: 'उधार खाता',   path: '/admin/udhar-khata' },
  { icon: UserCheck,       label: 'Agents',          sublabel: 'एजेंट',       path: '/admin/agents' },
  { icon: BarChart3,       label: 'Reports',         sublabel: 'रिपोर्ट',     path: '/admin/reports' },
];

export const managerNavItems: NavItem[] = [
  { icon: FileText, label: 'Daybook',     sublabel: 'दैनिक बही',  path: '/manager/daybook' },
  { icon: Receipt,  label: 'Udhar Khata', sublabel: 'उधार खाता', path: '/manager/udhar-khata' },
];

export const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/admin':                { title: 'Dashboard',     subtitle: 'Admin / डैशबोर्ड' },
  '/admin/customers':      { title: 'Customers',     subtitle: 'Admin / ग्राहक' },
  '/admin/diary':          { title: 'Savings Diary', subtitle: 'Admin / बचत डायरी' },
  '/admin/loans':          { title: 'Loans',         subtitle: 'Admin / ऋण' },
  '/admin/collection':     { title: 'Collection',    subtitle: 'Admin / संग्रह' },
  '/admin/daybook':        { title: 'Daybook',       subtitle: 'Admin / दैनिक बही' },
  '/admin/daily-register': { title: 'Daily Register',subtitle: 'Admin / रोज़नामचा' },
  '/admin/udhar-khata':    { title: 'Udhar Khata',   subtitle: 'Admin / उधार खाता' },
  '/admin/agents':         { title: 'Agents',        subtitle: 'Admin / एजेंट' },
  '/admin/reports':        { title: 'Reports',       subtitle: 'Admin / रिपोर्ट' },
  '/manager/daybook':      { title: 'Daybook',       subtitle: 'Manager / दैनिक बही' },
  '/manager/udhar-khata':  { title: 'Udhar Khata',   subtitle: 'Manager / उधार खाता' },
};

/** Returns the deepest matching key for nested routes. */
export function resolvePageKey(pathname: string): string {
  return (
    Object.keys(pageTitles)
      .filter(k => pathname === k || pathname.startsWith(k + '/'))
      .sort((a, b) => b.length - a.length)[0] ?? '/admin'
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/layout/constants.ts
git commit -m "feat: add managerNavItems and manager pageTitles to constants"
```

---

## Task 4: Update DesktopSidebar to Accept navItems + role Props

**Files:**
- Modify: `src/components/admin/layout/DesktopSidebar.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
// src/components/admin/layout/DesktopSidebar.tsx
import { NavLink, useLocation } from 'react-router-dom';
import { Shield, LogOut } from 'lucide-react';
import type { NavItem } from './constants';
import type { Role } from '../../../store/authStore';

interface Props {
  expanded: boolean;
  onLogout: () => void;
  navItems: NavItem[];
  role: Role;
}

const ROLE_LABEL: Record<Role, string> = {
  admin:    'Admin',
  manager:  'Manager',
  agent:    'Agent',
  customer: 'Customer',
};

const ROLE_INITIALS: Record<Role, string> = {
  admin:    'AD',
  manager:  'MG',
  agent:    'AG',
  customer: 'CU',
};

export function DesktopSidebar({ expanded, onLogout, navItems, role }: Props) {
  const location = useLocation();

  return (
    <aside
      className="hidden lg:flex flex-col shrink-0 transition-all duration-300 ease-in-out gradient-primary"
      style={{ width: expanded ? '280px' : '72px' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-[#4edea3] flex items-center justify-center shrink-0 shadow-ambient">
          <Shield className="w-5 h-5 text-[#001e40]" />
        </div>
        {expanded && (
          <div className="overflow-hidden">
            <p className="text-white text-sm font-bold leading-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Guru Kripa
            </p>
            <p className="text-white/50 text-[10px] leading-tight truncate">Connect</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(({ icon: Icon, label, sublabel, path }) => {
          const isActive = navItems.length === 1 || path === navItems[0]?.path
            ? location.pathname === path
            : location.pathname === path || location.pathname.startsWith(path + '/');

          return (
            <NavLink
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150 group relative
                ${isActive
                  ? 'sidebar-active text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/08'
                }`}
            >
              <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-[#4edea3]' : 'text-white/60 group-hover:text-white/90'}`} />
              {expanded && (
                <div className="overflow-hidden">
                  <p className="text-[13px] font-semibold leading-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {label}
                  </p>
                  <p className="text-[10px] text-white/40 leading-tight">{sublabel}</p>
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-white/10 shrink-0">
        {expanded ? (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/08">
            <div className="w-8 h-8 rounded-lg bg-[#4edea3] flex items-center justify-center shrink-0">
              <span className="text-[#001e40] text-xs font-bold">{ROLE_INITIALS[role]}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-white text-[12px] font-semibold leading-tight truncate">{ROLE_LABEL[role]}</p>
              <p className="text-white/40 text-[10px] leading-tight truncate">{role}@gurukripa.com</p>
            </div>
            <button
              onClick={onLogout}
              className="w-7 h-7 rounded-lg bg-white/08 hover:bg-white/15 flex items-center justify-center transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5 text-white/60" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center py-2 rounded-xl bg-white/08 hover:bg-white/15 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-white/60" />
          </button>
        )}
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc -b --noEmit 2>&1 | head -30`

Expected: error only in `AdminLayout.tsx` (hasn't been updated yet to pass new props)

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/layout/DesktopSidebar.tsx
git commit -m "feat: DesktopSidebar accepts navItems + role as props"
```

---

## Task 5: Update MobileDrawer to Accept navItems + role Props

**Files:**
- Modify: `src/components/admin/layout/MobileDrawer.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
// src/components/admin/layout/MobileDrawer.tsx
import { NavLink, useLocation } from 'react-router-dom';
import { Shield, X, LogOut } from 'lucide-react';
import type { NavItem } from './constants';
import type { Role } from '../../../store/authStore';

interface Props {
  onClose: () => void;
  onLogout: () => void;
  navItems: NavItem[];
  role: Role;
}

const ROLE_LABEL: Record<Role, string> = {
  admin:    'Admin',
  manager:  'Manager',
  agent:    'Agent',
  customer: 'Customer',
};

const ROLE_INITIALS: Record<Role, string> = {
  admin:    'AD',
  manager:  'MG',
  agent:    'AG',
  customer: 'CU',
};

export function MobileDrawer({ onClose, onLogout, navItems, role }: Props) {
  const location = useLocation();

  return (
    <div className="lg:hidden fixed inset-0 z-40 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#121c28]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="absolute left-0 top-0 bottom-0 w-72 gradient-primary flex flex-col animate-slide-in-right shadow-ambient-xl">
        {/* Logo + close */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4edea3] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#001e40]" />
            </div>
            <div>
              <p className="text-white text-sm font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Guru Kripa
              </p>
              <p className="text-white/50 text-[10px]">Connect</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {navItems.map(({ icon: Icon, label, sublabel, path }) => {
            const isActive = location.pathname === path || location.pathname.startsWith(path + '/');

            return (
              <NavLink
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 relative
                  ${isActive ? 'sidebar-active text-white' : 'text-white/60 hover:text-white hover:bg-white/08'}`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#4edea3]' : 'text-white/60'}`} />
                <div>
                  <p className="text-sm font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>{label}</p>
                  <p className="text-[11px] text-white/40">{sublabel}</p>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/08">
            <div className="w-9 h-9 rounded-lg bg-[#4edea3] flex items-center justify-center">
              <span className="text-[#001e40] text-xs font-bold">{ROLE_INITIALS[role]}</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">{ROLE_LABEL[role]}</p>
              <p className="text-white/40 text-xs">{role}@gurukripa.com</p>
            </div>
            <button onClick={onLogout} className="text-white/50 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/layout/MobileDrawer.tsx
git commit -m "feat: MobileDrawer accepts navItems + role as props"
```

---

## Task 6: Update MobileBottomNav to Accept navItems Prop

**Files:**
- Modify: `src/components/admin/layout/MobileBottomNav.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
// src/components/admin/layout/MobileBottomNav.tsx
import { NavLink, useLocation } from 'react-router-dom';
import type { NavItem } from './constants';

interface Props {
  navItems: NavItem[];
}

export function MobileBottomNav({ navItems }: Props) {
  const location = useLocation();

  // Show at most 5 tabs on mobile
  const tabs = navItems.slice(0, 5);

  return (
    <nav className="lg:hidden flex border-t border-[#c3c6d1]/20 bg-white/90 backdrop-blur-md shrink-0 safe-area-bottom">
      {tabs.map(({ icon: Icon, label, path }) => {
        const isActive = location.pathname === path || location.pathname.startsWith(path + '/');

        return (
          <NavLink
            key={path}
            to={path}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors
              ${isActive ? 'text-[#001e40]' : 'text-[#43474f]'}`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-[#001e40]' : 'text-[#737780]'}`} />
            <span className="text-[10px] font-semibold">{label}</span>
            {isActive && <div className="w-1 h-1 rounded-full bg-[#4edea3]" />}
          </NavLink>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/layout/MobileBottomNav.tsx
git commit -m "feat: MobileBottomNav accepts navItems as prop"
```

---

## Task 7: Update AdminLayout (Role-Aware, Use authStore)

**Files:**
- Modify: `src/components/AdminLayout.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
// src/components/AdminLayout.tsx
import { useState, useEffect, lazy, Suspense } from 'react';
import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

import { pageTitles, resolvePageKey, navItems, managerNavItems } from './admin/layout/constants';
import { DesktopSidebar } from './admin/layout/DesktopSidebar';
import { AdminHeader } from './admin/layout/AdminHeader';
import { MobileBottomNav } from './admin/layout/MobileBottomNav';
import { useGlobalShortcuts, useFocusOnNavigate } from '../hooks/useKeyboardShortcuts';

const MobileDrawer = lazy(() =>
  import('./admin/layout/MobileDrawer').then(m => ({ default: m.MobileDrawer }))
);

export function AdminLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, role } = useAuthStore();

  const visibleNavItems = role === 'manager' ? managerNavItems : navItems;

  function handleLogout() {
    logout();
    navigate('/');
  }

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarExpanded(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function handleHeaderToggle() {
    if (window.innerWidth < 1024) setMobileOpen(true);
    else setSidebarExpanded(prev => !prev);
  }

  useFocusOnNavigate();

  // Admin shortcuts (full set)
  const adminShortcuts = role === 'admin' ? [
    { key: '1', action: () => navigate('/admin'),                description: 'Dashboard' },
    { key: '2', action: () => navigate('/admin/customers'),      description: 'Customers' },
    { key: '3', action: () => navigate('/admin/loans'),          description: 'Loans' },
    { key: '4', action: () => navigate('/admin/diary'),          description: 'Savings Diary' },
    { key: '5', action: () => navigate('/admin/collection'),     description: 'Collection' },
    { key: '6', action: () => navigate('/admin/daybook'),        description: 'Daybook' },
    { key: '7', action: () => navigate('/admin/daily-register'), description: 'Daily Register' },
    { key: '8', action: () => navigate('/admin/udhar-khata'),    description: 'Udhar Khata' },
    { key: '9', action: () => navigate('/admin/agents'),         description: 'Agents' },
    { key: '0', action: () => navigate('/admin/reports'),        description: 'Reports' },
    { key: 'b', ctrlKey: true, action: handleHeaderToggle, description: 'Toggle Sidebar', allowInInput: true },
  ] : [
    // Manager shortcuts
    { key: '1', action: () => navigate('/manager/daybook'),      description: 'Daybook' },
    { key: '2', action: () => navigate('/manager/udhar-khata'),  description: 'Udhar Khata' },
    { key: 'b', ctrlKey: true, action: handleHeaderToggle, description: 'Toggle Sidebar', allowInInput: true },
  ];

  useGlobalShortcuts(adminShortcuts);

  const pageInfo = pageTitles[resolvePageKey(location.pathname)];

  return (
    <div className="flex h-screen bg-[#f8f9ff] overflow-hidden">
      <DesktopSidebar
        expanded={sidebarExpanded}
        onLogout={handleLogout}
        navItems={visibleNavItems}
        role={role ?? 'admin'}
      />

      {mobileOpen && (
        <Suspense fallback={null}>
          <MobileDrawer
            onClose={() => setMobileOpen(false)}
            onLogout={handleLogout}
            navItems={visibleNavItems}
            role={role ?? 'admin'}
          />
        </Suspense>
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminHeader
          title={pageInfo?.title ?? ''}
          subtitle={pageInfo?.subtitle ?? ''}
          sidebarExpanded={sidebarExpanded}
          onToggle={handleHeaderToggle}
        />

        <main className="flex-1 overflow-y-auto outline-none" data-focus-target="page" tabIndex={-1}>
          <Outlet />
        </main>

        <MobileBottomNav navItems={visibleNavItems} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc -b --noEmit 2>&1 | head -30`

Expected: errors only in `App.tsx` and `LoginPage.tsx` (not yet migrated)

- [ ] **Step 3: Commit**

```bash
git add src/components/AdminLayout.tsx
git commit -m "feat: AdminLayout is role-aware, passes navItems/role to sidebar components"
```

---

## Task 8: Update App.tsx — Manager Routes + Remove AuthProvider

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import NotFound from './pages/NotFound';
import AgentDashboard from './pages/AgentDashboard';
import CustomerDashboard from './pages/CustomerDashboard';

// Admin shell + pages
import { AdminLayout } from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomerListPage from './pages/admin/CustomerListPage';
import CustomerDetailPage from './pages/admin/CustomerDetailPage';
import SavingsDiaryPage from './pages/admin/SavingsDiaryPage';
import LoansPage from './pages/admin/LoansPage';
import CollectionPage from './pages/admin/CollectionPage';
import DaybookPage from './pages/admin/DaybookPage';
import DailyRegisterPage from './pages/admin/DailyRegisterPage';
import UdharKhataPage from './pages/admin/UdharKhataPage';
import AgentsPage from './pages/admin/AgentsPage';
import ReportsPage from './pages/admin/ReportsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LoginPage />} />

        {/* Admin — protected, nested inside layout shell */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="customers" element={<CustomerListPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="diary" element={<SavingsDiaryPage />} />
          <Route path="loans" element={<LoansPage />} />
          <Route path="collection" element={<CollectionPage />} />
          <Route path="daybook" element={<DaybookPage />} />
          <Route path="daily-register" element={<DailyRegisterPage />} />
          <Route path="udhar-khata" element={<UdharKhataPage />} />
          <Route path="agents" element={<AgentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        {/* Manager — protected, uses same AdminLayout shell (filtered nav) */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/manager/daybook" replace />} />
          <Route path="daybook" element={<DaybookPage />} />
          <Route path="udhar-khata" element={<UdharKhataPage />} />
        </Route>

        {/* Agent — protected, standalone (no sidebar) */}
        <Route
          path="/agent"
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Customer — protected, standalone */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc -b --noEmit 2>&1 | head -30`

Expected: errors only in `LoginPage.tsx`, `AgentDashboard.tsx`, `CustomerDashboard.tsx` (still using old `useAuth`)

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add /manager/* routes, remove AuthProvider, use new ProtectedRoute"
```

---

## Task 9: Update LoginPage — Add Manager Role + Use authStore

**Files:**
- Modify: `src/pages/LoginPage.tsx`

- [ ] **Step 1: Replace the imports and ROLES constant (top of file)**

Find this block at the top of `src/pages/LoginPage.tsx`:

```tsx
import { useAuth, type Role } from '../context/AuthContext';

type RoleKey = 'admin' | 'agent' | 'customer';

const ROLES: { key: RoleKey; label: string; icon: React.ElementType; path: string; role: Role }[] = [
  { key: 'admin',    label: 'Admin',    icon: Shield, path: '/admin',    role: 'admin' },
  { key: 'agent',    label: 'Agent',    icon: Users,  path: '/agent',    role: 'agent' },
  { key: 'customer', label: 'Customer', icon: User,   path: '/customer', role: 'customer' },
];
```

Replace with:

```tsx
import { useAuthStore, type Role } from '../store/authStore';
import { Briefcase } from 'lucide-react';

type RoleKey = 'admin' | 'manager' | 'agent' | 'customer';

const ROLES: { key: RoleKey; label: string; icon: React.ElementType; path: string; role: Role }[] = [
  { key: 'admin',    label: 'Admin',    icon: Shield,    path: '/admin',            role: 'admin' },
  { key: 'manager',  label: 'Manager',  icon: Briefcase, path: '/manager/daybook',  role: 'manager' },
  { key: 'agent',    label: 'Agent',    icon: Users,     path: '/agent',            role: 'agent' },
  { key: 'customer', label: 'Customer', icon: User,      path: '/customer',         role: 'customer' },
];
```

- [ ] **Step 2: Update the component body — replace `useAuth` with `useAuthStore` and update `handleSubmit`**

Find:

```tsx
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState<RoleKey>('admin');
```

Replace with:

```tsx
  const { login } = useAuthStore();

  const [selectedRole, setSelectedRole] = useState<RoleKey>('admin');
```

Find:

```tsx
  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const found = ROLES.find(r => r.key === selectedRole)!;
    login(found.role);
    navigate(found.path);
  }
```

Replace with:

```tsx
  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const found = ROLES.find(r => r.key === selectedRole)!;
    login(found.role, { name: found.label, email: `${found.key}@gurukripa.com` });
    navigate(found.path);
  }
```

- [ ] **Step 3: Update the Role Selector grid from 3 columns to 4 columns**

Find:

```tsx
          <div className="grid grid-cols-3 gap-2 mb-4">
```

Replace with:

```tsx
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
```

- [ ] **Step 4: Update the Demo Credentials section**

Find:

```tsx
              <CredRow role="Admin"    user="admin"  pass="admin123" />
              <CredRow role="Agent"    user="suresh" pass="agent123" />
              <CredRow role="Customer" user="ramesh" pass="cust123"  />
```

Replace with:

```tsx
              <CredRow role="Admin"    user="admin"   pass="admin123" />
              <CredRow role="Manager"  user="manager" pass="mgr123"   />
              <CredRow role="Agent"    user="suresh"  pass="agent123" />
              <CredRow role="Customer" user="ramesh"  pass="cust123"  />
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc -b --noEmit 2>&1 | head -30`

Expected: errors only in `AgentDashboard.tsx` and `CustomerDashboard.tsx`

- [ ] **Step 6: Commit**

```bash
git add src/pages/LoginPage.tsx
git commit -m "feat: add manager role to LoginPage, use authStore"
```

---

## Task 10: Migrate AgentDashboard + CustomerDashboard to authStore

**Files:**
- Modify: `src/pages/AgentDashboard.tsx`
- Modify: `src/pages/CustomerDashboard.tsx`

- [ ] **Step 1: Update AgentDashboard import**

In `src/pages/AgentDashboard.tsx`, find:

```tsx
import { useAuth } from '../context/AuthContext';
```

Replace with:

```tsx
import { useAuthStore } from '../store/authStore';
```

Then find:

```tsx
  const { logout } = useAuth();
```

Replace with:

```tsx
  const { logout } = useAuthStore();
```

- [ ] **Step 2: Update CustomerDashboard import**

In `src/pages/CustomerDashboard.tsx`, find:

```tsx
import { useAuth } from '../context/AuthContext';
```

Replace with:

```tsx
import { useAuthStore } from '../store/authStore';
```

Then find:

```tsx
  const { logout } = useAuth();
```

Replace with:

```tsx
  const { logout } = useAuthStore();
```

- [ ] **Step 3: Verify TypeScript compiles cleanly (zero errors)**

Run: `npx tsc -b --noEmit 2>&1`

Expected: no output (zero errors)

- [ ] **Step 4: Commit**

```bash
git add src/pages/AgentDashboard.tsx src/pages/CustomerDashboard.tsx
git commit -m "feat: migrate AgentDashboard and CustomerDashboard to useAuthStore"
```

---

## Task 11: Delete AuthContext.tsx

**Files:**
- Delete: `src/context/AuthContext.tsx`

- [ ] **Step 1: Confirm no remaining imports**

Run: `grep -r "AuthContext\|useAuth\b" src/ --include="*.ts" --include="*.tsx"`

Expected: no output

- [ ] **Step 2: Delete the file**

Run: `rm src/context/AuthContext.tsx`

- [ ] **Step 3: Final TypeScript build check**

Run: `npx tsc -b --noEmit 2>&1`

Expected: no output (zero errors)

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove AuthContext.tsx — replaced by useAuthStore"
```

---

## Task 12: Manual Smoke Test

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Test admin login**
  - Open `http://localhost:5173`
  - Select Admin → sign in
  - Verify: redirected to `/admin`, all 10 nav items visible, sidebar footer shows "AD / Admin"
  - Verify: keyboard shortcut `1`–`0` navigate to correct admin pages

- [ ] **Step 3: Test manager login**
  - Logout, select Manager → sign in
  - Verify: redirected to `/manager/daybook`
  - Verify: only 2 nav items in sidebar (Daybook, Udhar Khata)
  - Verify: sidebar footer shows "MG / Manager"
  - Verify: manually navigating to `/admin` redirects back to `/`
  - Verify: keyboard shortcuts `1` → Daybook, `2` → Udhar Khata

- [ ] **Step 4: Test cross-role protection**
  - Log in as Customer, manually type `/admin` in the browser — should redirect to `/`
  - Log in as Agent, manually type `/manager/daybook` — should redirect to `/`

- [ ] **Step 5: Test persistence**
  - Log in as Manager, refresh the page
  - Verify: still on `/manager/daybook`, still logged in (Zustand persist)

- [ ] **Final commit**

```bash
git add -A
git commit -m "chore: smoke test passed — manager role + zustand auth complete"
```
