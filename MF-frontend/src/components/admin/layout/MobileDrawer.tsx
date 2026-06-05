import { NavLink, useLocation } from "react-router-dom";
import { Shield, X, LogOut } from "lucide-react";
import type { NavItem } from "./constants";
import { ROLE_LABEL, ROLE_INITIALS } from "./constants";
import type { Role } from "../../../store/authStore";
import { CenterName } from "@/lib/utils";
interface Props {
  onClose: () => void;
  centerId: string;
  onLogout: () => void;
  navItems: NavItem[];
  role: Role;
}

export function MobileDrawer({
  onClose,
  centerId,
  onLogout,
  navItems,
  role,
}: Props) {
  const location = useLocation();

  const Name = CenterName.find((c) => c.id === centerId)?.name || "Guru Kripa";

  return (
    <div className="lg:hidden fixed inset-0 z-40 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#121c28]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="absolute left-0 top-0 bottom-0 w-72 bg-sidebar text-sidebar-foreground flex flex-col animate-slide-in-right shadow-lg border-r border-sidebar-border">
        {/* Logo + close */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p
                className="text-sidebar-foreground text-sm font-bold"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {Name}
              </p>
              <p className="text-sidebar-foreground/50 text-[10px]">Connect</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-sidebar-foreground/10 hover:bg-sidebar-foreground/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-sidebar-foreground" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
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
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 relative
                  ${isActive ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"}`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : "text-sidebar-foreground/60"}`}
                />
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    {label}
                  </p>
                  <p className="text-[11px] text-sidebar-foreground/40">
                    {sublabel}
                  </p>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-sidebar-accent">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-xs font-bold">
                {ROLE_INITIALS[role]}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sidebar-foreground text-sm font-semibold">
                {ROLE_LABEL[role]}
              </p>
              <p className="text-sidebar-foreground/40 text-xs">
                {role}@gurukripa.com
              </p>
            </div>
            <button
              onClick={onLogout}
              className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
