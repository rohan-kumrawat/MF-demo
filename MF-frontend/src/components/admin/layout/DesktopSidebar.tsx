import { NavLink, useLocation } from "react-router-dom";
import { Shield, LogOut } from "lucide-react";
import type { NavItem } from "./constants";
import { ROLE_LABEL, ROLE_INITIALS } from "./constants";
import { type Role } from "../../../store/authStore";
import { CenterName } from "@/lib/utils";

interface Props {
  expanded: boolean;
  centerId: string;
  onLogout: () => void;
  navItems: NavItem[];
  role: Role;
}

export function DesktopSidebar({
  expanded,
  centerId,
  onLogout,
  navItems,
  role,
}: Props) {
  const location = useLocation();

  const currentCenter =
    CenterName.find((c) => c.id === centerId)?.name || "Guru Kripa";

  return (
    <aside
      className="hidden lg:flex flex-col shrink-0 transition-all duration-300 ease-in-out bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
      style={{ width: expanded ? "280px" : "72px" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 shadow-sm">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        {expanded && (
          <div className="overflow-hidden">
            <p
              className="text-sidebar-foreground text-sm font-bold leading-tight"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {currentCenter}{" "}
            </p>
            <p className="text-sidebar-foreground/50 text-[10px] leading-tight truncate">
              Connect
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(({ icon: Icon, label, sublabel, path }) => {
          const isActive =
            path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname === path ||
                location.pathname.startsWith(path + "/");

          return (
            <NavLink
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150 group relative
                ${
                  isActive
                    ? "bg-primary  text-white"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
            >
              <Icon
                className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-white" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground/90"}`}
              />
              {expanded && (
                <div className="overflow-hidden">
                  <p
                    className="text-[13px] font-semibold leading-tight"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    {label}
                  </p>
                  <p
                    className={`text-[10px] ${isActive ? "text-white" : "text-[#313337]"} leading-tight`}
                  >
                    {sublabel}
                  </p>
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-sidebar-border shrink-0">
        {expanded ? (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-sidebar-accent">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary text-xs font-bold">
                {ROLE_INITIALS[role]}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sidebar-foreground text-[12px] font-semibold leading-tight truncate">
                {ROLE_LABEL[role]}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="w-7 h-7 rounded-lg bg-sidebar-foreground/05 hover:bg-sidebar-foreground/10 flex items-center justify-center transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5 text-sidebar-foreground/60" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center py-2 rounded-xl bg-sidebar-foreground/05 hover:bg-sidebar-foreground/10 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-sidebar-foreground/60" />
          </button>
        )}
      </div>
    </aside>
  );
}
