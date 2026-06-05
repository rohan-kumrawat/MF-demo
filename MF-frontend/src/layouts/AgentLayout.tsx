// src/layouts/AgentLayout.tsx
import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  Home,
  Users,
  PlusCircle,
  History,
  UserCircle,
  LogOut,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuthStore } from "../store/authStore";
import { Button } from "@/components/ui/button";

export const AgentLayout: React.FC = () => {
  const { logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col font-sans">
      {/* Top Header - Mobile focused */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="font-black text-xs">GK</span>
          </div>
          <h1 className="font-black text-lg tracking-tight text-gray-900">
            Connect
          </h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          className="w-9 h-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={20} />
        </Button>
      </header>

      {/* Content Area */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 pb-32">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] sm:w-[92%] max-w-md bg-gray-900/95 backdrop-blur-xl rounded-[2.5rem] p-2 flex items-center justify-between shadow-2xl border border-white/10 z-50">
        <NavTab to="/agent" icon={Home} label="Home" exact />
        <NavTab to="/agent/customers" icon={Users} label="Clients" />

        {/* Added shrink-0 and reduced px slightly to balance space */}
        <div className="relative -top-6 shrink-0 px-1 sm:px-2">
          <NavLink
            to="/agent/collect"
            className={({ isActive }) =>
              cn(
                "w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 active:scale-90",
                isActive
                  ? "gradient-primary text-white scale-110 shadow-primary/40 ring-4 ring-white"
                  : "bg-white text-gray-900",
              )
            }
          >
            <PlusCircle size={32} strokeWidth={2.5} />
          </NavLink>
        </div>

        <NavTab to="/agent/history" icon={History} label="History" />
        <NavTab to="/agent/profile" icon={UserCircle} label="Account" />
      </nav>
    </div>
  );
};

interface NavTabProps {
  to: string;
  icon: React.ElementType;
  label: string;
  exact?: boolean;
}

const NavTab: React.FC<NavTabProps> = ({ to, icon: Icon, label, exact }) => {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        cn(
          // Added flex-1 to distribute width evenly, reduced rigid horizontal padding
          "flex flex-col items-center justify-center flex-1 px-1 py-2 rounded-2xl transition-all duration-300 min-w-0",
          isActive ? "text-white" : "text-gray-500 hover:text-gray-300",
        )
      }
    >
      <Icon
        size={22}
        className={cn(
          "transition-transform duration-300",
          label === "Home" ? "scale-100" : "",
        )}
      />
      {/* Adjusted tracking, added truncation, and made text responsive */}
      <span className="text-[9px] sm:text-[10px] font-bold mt-1 uppercase tracking-wide truncate max-w-full">
        {label}
      </span>
    </NavLink>
  );
};
