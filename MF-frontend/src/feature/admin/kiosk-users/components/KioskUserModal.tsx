// src/feature/admin/kiosk-users/components/KioskUserModal.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, MonitorCheck } from "lucide-react";
import {
  kioskUserSchema,
  type KioskUserFormData,
} from "../schemas/kiosk-user.schema";
import type { KioskUser } from "../types";

interface KioskUserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: KioskUserFormData) => void;
  user?: KioskUser | null;
  isPending?: boolean;
}

export function KioskUserModal({
  open,
  onClose,
  onSave,
  user,
  isPending,
}: KioskUserModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<KioskUserFormData>({
    resolver: zodResolver(kioskUserSchema),
  });

  useEffect(() => {
    if (open) {
      if (user) {
        reset({
          username: user.username,
          name: user.name,
          phone: user.phone,
          address: user.address || "",
          password: "",
        });
      } else {
        reset({
          username: "",
          name: "",
          phone: "",
          address: "",
          password: "",
        });
      }
    }
  }, [open, user, reset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121c28]/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-[#c1c6d5]/20 flex items-center justify-between bg-[#f8f9ff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#005eb0]/10 flex items-center justify-center text-[#005eb0]">
              <MonitorCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#121c28]">
                {user ? "Edit Kiosk User" : "Add New Kiosk User"}
              </h2>
              <p className="text-xs text-[#717784] font-medium">
                {user
                  ? "Update kiosk user details"
                  : "Create a new kiosk login"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#c1c6d5]/20 rounded-full transition-colors text-[#717784]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form
            id="kiosk-user-form"
            onSubmit={handleSubmit(onSave)}
            className="space-y-5"
          >
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <label className="text-xs font-bold text-[#43474f] uppercase tracking-wider">
                  Full Name <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  {...register("name")}
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c1c6d5]/30 rounded-xl focus:outline-none focus:border-[#005eb0] transition-colors"
                  placeholder="e.g. Rahul Kiosk"
                />
                {errors.name && (
                  <p className="text-xs text-[#ba1a1a] mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <label className="text-xs font-bold text-[#43474f] uppercase tracking-wider">
                  Phone Number <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  {...register("phone")}
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c1c6d5]/30 rounded-xl focus:outline-none focus:border-[#005eb0] transition-colors"
                  placeholder="10-digit number"
                />
                {errors.phone && (
                  <p className="text-xs text-[#ba1a1a] mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[#43474f] uppercase tracking-wider">
                  Address
                </label>
                <textarea
                  {...register("address")}
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c1c6d5]/30 rounded-xl focus:outline-none focus:border-[#005eb0] transition-colors resize-none"
                  placeholder="Kiosk location or address"
                  rows={2}
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <label className="text-xs font-bold text-[#43474f] uppercase tracking-wider">
                  Username <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  {...register("username")}
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c1c6d5]/30 rounded-xl focus:outline-none focus:border-[#005eb0] transition-colors"
                  placeholder="e.g. kiosk_01"
                  disabled={!!user}
                />
                {errors.username && (
                  <p className="text-xs text-[#ba1a1a] mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <label className="text-xs font-bold text-[#43474f] uppercase tracking-wider">
                  Password {!user && <span className="text-[#ba1a1a]">*</span>}
                </label>
                <input
                  type="password"
                  {...register("password")}
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c1c6d5]/30 rounded-xl focus:outline-none focus:border-[#005eb0] transition-colors"
                  placeholder={
                    user ? "Leave blank to keep same" : "Min 6 chars"
                  }
                />
                {errors.password && (
                  <p className="text-xs text-[#ba1a1a] mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-[#c1c6d5]/20 bg-[#f8f9ff] flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-[#43474f] hover:bg-[#c1c6d5]/20 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="kiosk-user-form"
            disabled={isPending}
            className="px-5 py-2.5 bg-[#005eb0] hover:bg-[#004a8b] text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-ambient disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save Kiosk User"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
