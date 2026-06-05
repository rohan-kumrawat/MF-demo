import { NavLink, useLocation } from "react-router-dom";
import type { NavItem } from "./constants";

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
        const isActive =
          path === "/admin"
            ? location.pathname === "/admin"
            : location.pathname === path ||
              location.pathname.startsWith(path + "/");

        return (
          <NavLink
            key={path}
            to={path}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors
              ${isActive ? "text-[#001e40]" : "text-[#43474f]"}`}
          >
            <Icon
              className={`w-5 h-5 ${isActive ? "text-white" : "text-[#313337]"}`}
            />
            <span className="text-[10px] font-semibold">{label}</span>
            {isActive && <div className="w-1 h-1 rounded-full bg-[#4edea3]" />}
          </NavLink>
        );
      })}
    </nav>
  );
}
