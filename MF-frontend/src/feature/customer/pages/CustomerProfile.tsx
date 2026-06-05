// src/feature/customer/pages/CustomerProfile.tsx
import React from "react";
import { useCustomerProfile } from "../hooks/useCustomerProfile";
import { getAvatarColor } from "@/data/demoData";
import {
  Phone,
  MapPin,
  ShieldCheck,
  Users,
  Calendar,
  LogOut,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

const CustomerProfile: React.FC = () => {
  const { user, isLoading } = useCustomerProfile();
  const { logout } = useAuthStore();

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
        <Loader2 className="w-10 h-10 animate-spin text-primary/20" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
          Loading Profile
        </p>
      </div>
    );
  }

  if (!user) return null;
  const displayName = user.name || user.username || "Customer";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const avatarColor = getAvatarColor(displayName);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Header */}
      <div className="flex flex-col items-center pt-4 pb-2">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-2xl ring-4 ring-white"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </div>
        <h2 className="mt-4 text-2xl font-black text-gray-900 tracking-tight">
          {displayName}
        </h2>
        <p className="text-sm text-gray-500 font-medium">ID: {user.username}</p>

        <div className="mt-3 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
          Customer Portal
        </div>
      </div>

      {/* Info Sections */}
      <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
        <InfoRow
          icon={Phone}
          label="Phone Number"
          value={user.phone}
          iconColor="text-blue-500"
        />
        <InfoRow
          icon={MapPin}
          label="Address"
          value={user.address}
          iconColor="text-red-500"
        />
        <InfoRow
          icon={ShieldCheck}
          label="Aadhar Number"
          value={user.aadharNumber}
          iconColor="text-green-500"
        />
        <InfoRow
          icon={Users}
          label="Father/Husband"
          value={user.fatherHusbandName || "N/A"}
          iconColor="text-purple-500"
        />
        <InfoRow
          icon={Calendar}
          label="Member Since"
          value={user.memberSince || "2024"}
          iconColor="text-amber-500"
        />
      </div>

      {/* Danger Zone */}
      <div className="pt-4">
        <button
          onClick={logout}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-4 rounded-3xl font-black flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>

      <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em] pt-4">
        Guru Kripa Connect v1.0
      </p>
    </div>
  );
};

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  iconColor: string;
}

const InfoRow: React.FC<InfoRowProps> = ({
  icon: Icon,
  label,
  value,
  iconColor,
}) => (
  <div className="px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center",
          iconColor,
        )}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-black text-gray-800">{value}</p>
      </div>
    </div>
    <ChevronRight size={16} className="text-gray-200" />
  </div>
);

export default CustomerProfile;
