// src/feature/admin/kiosk-users/pages/KioskUsersPage.tsx
import { useState, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  Loader2,
  Users,
  MonitorCheck,
  ShieldCheck,
} from "lucide-react";
import { useKioskUsers } from "../hooks/useKioskUsers";
import { KioskUserCard } from "../components/KioskUserCard";
import { KioskUserModal } from "../components/KioskUserModal";
import type { KioskUser } from "../types";
import type { KioskUserFormData } from "../schemas/kiosk-user.schema";

export function KioskUsersPage() {
  const {
    kioskUsers,
    isLoading,
    createKioskUser,
    updateKioskUser,
    deleteKioskUser,
    isCreating,
    isUpdating,
    isDeleting,
  } = useKioskUsers();

  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<KioskUser | null>(null);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return kioskUsers;
    const lowSearch = searchQuery.toLowerCase();
    return kioskUsers.filter(
      (a) =>
        a.name.toLowerCase().includes(lowSearch) ||
        a.username.toLowerCase().includes(lowSearch) ||
        a.phone.includes(lowSearch),
    );
  }, [kioskUsers, searchQuery]);

  const handleOpenCreate = useCallback(() => {
    setEditingUser(null);
    setModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((user: KioskUser) => {
    setEditingUser(user);
    setModalOpen(true);
  }, []);

  const handleSave = async (data: KioskUserFormData) => {
    try {
      if (editingUser) {
        await updateKioskUser({
          id: editingUser.id,
          dto: {
            name: data.name,
            phone: data.phone,
            address: data.address,
            password: data.password || undefined,
          },
        });
      } else {
        await createKioskUser({
          username: data.username,
          password: data.password || "Pass@123",
          role: "kiosk",
          name: data.name,
          phone: data.phone,
          address: data.address,
        });
      }
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to save kiosk user:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this kiosk user?")) {
      try {
        await deleteKioskUser(id);
      } catch (err) {
        console.error("Failed to delete kiosk user:", err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white shadow-ambient flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#005eb0]" />
        </div>
        <p className="text-xs font-bold text-[#43474f] uppercase tracking-widest">
          Loading Kiosk Users...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2
              className="text-xl font-black text-[#121c28]"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Kiosk Users Module
            </h2>
            <div className="bg-[#005eb0]/10 text-[#005eb0] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
              Kiosk Operations
            </div>
          </div>
          <p className="text-xs text-background font-medium">
            Manage kiosk users and their login credentials
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 bg-[#005eb0] hover:bg-[#004a8b] text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-ambient transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add New Kiosk User
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-ambient flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#005eb0]/10 flex items-center justify-center text-[#005eb0]">
            <MonitorCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#717784] uppercase tracking-widest">
              Total Kiosks
            </p>
            <p className="text-2xl font-black text-[#121c28]">
              {kioskUsers.length}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#c1c6d5]/20 shadow-ambient flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#006c49]/10 flex items-center justify-center text-[#006c49]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#717784] uppercase tracking-widest">
              Active Users
            </p>
            <p className="text-2xl font-black text-[#121c28]">
              {kioskUsers.filter((u) => u.isActive).length}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#c1c6d5]/20 shadow-ambient flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#717784] uppercase tracking-widest">
              Verified
            </p>
            <p className="text-2xl font-black text-[#121c28]">
              {kioskUsers.length}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#717784]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, username or phone number..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-[#c1c6d5]/30 rounded-2xl text-sm focus:outline-none focus:border-[#005eb0] transition-all shadow-ambient"
        />
      </div>

      {/* Kiosk User Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-dashed border-[#c1c6d5] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#f0f2f5] rounded-2xl flex items-center justify-center mb-4">
              <MonitorCheck className="w-8 h-8 text-[#717784]" />
            </div>
            <h3 className="text-lg font-bold text-[#121c28]">
              No Kiosk Users Found
            </h3>
            <p className="text-sm text-[#43474f] mt-1 max-w-xs">
              No kiosk users matched your search criteria. Please add a new
              kiosk user.
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <KioskUserCard
              key={user.id}
              user={user}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          ))
        )}
      </div>

      <KioskUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        user={editingUser}
        isPending={isCreating || isUpdating}
      />
    </div>
  );
}
