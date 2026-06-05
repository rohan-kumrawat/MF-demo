import { Menu, Bell } from "lucide-react";
import { GoSidebarCollapse } from "react-icons/go";
import { GoSidebarExpand } from "react-icons/go";

interface Props {
  title: string;
  subtitle: string;
  sidebarExpanded: boolean;
  onToggle: () => void;
}

export function AdminHeader({
  title,
  subtitle,
  sidebarExpanded,
  onToggle,
}: Props) {
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;

  return (
    <header className="glass border-b border-[#c3c6d1]/20 px-4 lg:px-6 py-3.5 flex items-center gap-4 shrink-0 z-20 sticky top-0 shadow-ambient">
      {/* Sidebar toggle */}
      <button
        onClick={onToggle}
        className="w-9 h-9 rounded-xl bg-[#f8f9ff] hover:bg-[#eef4ff] border border-[#c3c6d1]/30 flex items-center justify-center transition-all duration-150 shadow-ambient shrink-0"
      >
        {!isDesktop ? (
          <Menu className="w-4 h-4 text-[#43474f]" />
        ) : sidebarExpanded ? (
          <GoSidebarExpand className="w-4 h-4 text-[#43474f]" />
        ) : (
          <GoSidebarCollapse className="w-4 h-4 text-[#43474f]" />
        )}
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1
          className="text-base font-bold text-[#121c28] leading-tight truncate"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          {title}
        </h1>
        <p className="text-xs text-[#43474f] leading-tight hidden sm:block">
          {subtitle}
        </p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-xl bg-[#f8f9ff] hover:bg-[#eef4ff] border border-[#c3c6d1]/30 flex items-center justify-center transition-colors shadow-ambient">
          <Bell className="w-4 h-4 text-[#43474f]" />
        </button>
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">AD</span>
        </div>
      </div>
    </header>
  );
}
