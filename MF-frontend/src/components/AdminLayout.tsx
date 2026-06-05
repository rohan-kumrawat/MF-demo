import { useState, useEffect, lazy, Suspense } from "react";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

import {
  pageTitles,
  resolvePageKey,
  navItems,
  kioskNavItems,
} from "./admin/layout/constants";
import { DesktopSidebar } from "./admin/layout/DesktopSidebar";
import { AdminHeader } from "./admin/layout/AdminHeader";
import { MobileBottomNav } from "./admin/layout/MobileBottomNav";
import {
  useGlobalShortcuts,
  useFocusOnNavigate,
} from "../hooks/useKeyboardShortcuts";

const MobileDrawer = lazy(() =>
  import("./admin/layout/MobileDrawer").then((m) => ({
    default: m.MobileDrawer,
  })),
);

export function AdminLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { role, logout, user } = useAuthStore();

  const centerId = user?.centreId;

  const visibleNavItems = role === "kiosk" ? kioskNavItems : navItems;

  useEffect(() => {
    const handleResize = () => {
      setSidebarExpanded(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleHeaderToggle() {
    if (window.innerWidth < 1024) setMobileOpen(true);
    else setSidebarExpanded((prev) => !prev);
  }

  useFocusOnNavigate();

  const adminShortcuts =
    role === "kiosk"
      ? [
          {
            key: "1",
            action: () => navigate("/kiosk/daily-register"),
            description: "Daily Register",
          },
          {
            key: "2",
            action: () => navigate("/kiosk/udhar-khata"),
            description: "Udhar Khata",
          },
          {
            key: "b",
            ctrlKey: true,
            action: handleHeaderToggle,
            description: "Toggle Sidebar",
            allowInInput: true,
          },
        ]
      : [
          {
            key: "1",
            action: () => navigate("/admin"),
            description: "Dashboard",
          },
          {
            key: "2",
            action: () => navigate("/admin/customers"),
            description: "Customers",
          },
          {
            key: "3",
            action: () => navigate("/admin/loans"),
            description: "Loans",
          },
          {
            key: "4",
            action: () => navigate("/admin/diary"),
            description: "Savings Diary",
          },
          // {
          //   key: "5",
          //   action: () => navigate("/admin/collection"),
          //   description: "Collection",
          // },
          // {
          //   key: "6",
          //   action: () => navigate("/admin/daybook"),
          //   description: "Daybook",
          // },
          {
            key: "7",
            action: () => navigate("/admin/daily-register"),
            description: "Daily Register",
          },
          {
            key: "8",
            action: () => navigate("/admin/udhar-khata"),
            description: "Udhar Khata",
          },
          {
            key: "9",
            action: () => navigate("/admin/agents"),
            description: "Agents",
          },
          {
            key: "0",
            action: () => navigate("/admin/reports"),
            description: "Reports",
          },
          {
            key: "b",
            ctrlKey: true,
            action: handleHeaderToggle,
            description: "Toggle Sidebar",
            allowInInput: true,
          },
        ];

  useGlobalShortcuts(adminShortcuts);

  const pageInfo = pageTitles[resolvePageKey(location.pathname)];

  return (
    <div className="flex h-screen bg-primary-foreground overflow-hidden">
      <DesktopSidebar
        expanded={sidebarExpanded}
        onLogout={logout}
        navItems={visibleNavItems}
        role={role!}
        centerId={centerId}
      />

      {mobileOpen && (
        <Suspense fallback={null}>
          <MobileDrawer
            onClose={() => setMobileOpen(false)}
            onLogout={logout}
            navItems={visibleNavItems}
            role={role!}
            centerId={centerId}
          />
        </Suspense>
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminHeader
          title={pageInfo?.title ?? ""}
          subtitle={pageInfo?.subtitle ?? ""}
          sidebarExpanded={sidebarExpanded}
          onToggle={handleHeaderToggle}
        />

        <main
          className="flex-1 w-full overflow-y-auto outline-none flex flex-col"
          data-focus-target="page"
          tabIndex={-1}
        >
          <Outlet />
        </main>

        <MobileBottomNav navItems={visibleNavItems} />
      </div>
    </div>
  );
}
