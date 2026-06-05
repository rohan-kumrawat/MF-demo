// src/layouts/CustomerLayout.tsx
import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Home, BookOpen, CreditCard, UserCircle } from "lucide-react";
import { cn } from "../lib/utils";

export const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col font-sans">
      {/* Top Header - Mobile focused */}
      {/* <header className="sticky top-0 z-40 bg-linear-to-r from-primary via-primary/90 to-primary backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="font-black text-xs">GK</span>
          </div>
          <h1 className="font-black text-lg tracking-tight text-gray-900">
            My Account
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
            <UserCircle size={20} />
          </div>
        </div>
      </header> */}

      {/* Content Area */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 pb-32">
        <Outlet />
      </main>

      {/* Bottom Navigation — 4 tabs distributed evenly, no FAB */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] sm:w-[92%] max-w-md bg-gray-900/95 backdrop-blur-xl rounded-[2.5rem] p-2 flex items-center justify-between shadow-2xl border border-white/10 z-50">
        <NavTab to="/customer" icon={Home} label="Home" exact />
        <NavTab to="/customer/diary" icon={BookOpen} label="Diary" />
        <NavTab to="/customer/loan" icon={CreditCard} label="Loan" />
        <NavTab to="/customer/profile" icon={UserCircle} label="Profile" />
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
          "flex flex-col items-center justify-center flex-1 px-1 py-2 rounded-2xl transition-all duration-300 min-w-0",
          isActive ? "text-white" : "text-gray-500 hover:text-gray-300",
        )
      }
    >
      <Icon size={22} className="transition-transform duration-300" />
      <span className="text-[9px] sm:text-[10px] font-bold mt-1 uppercase tracking-wide truncate max-w-full">
        {label}
      </span>
    </NavLink>
  );
};
