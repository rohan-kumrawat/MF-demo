// src/feature/admin/agents/components/AgentModal.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Loader2,
  Shield,
  User,
  Phone,
  MapPin,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import { agentSchema, type AgentFormData } from "../schemas/agent.schema";
import type { Agent } from "../types";

interface AgentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: AgentFormData) => void;
  agent?: Agent | null;
  isPending?: boolean;
}

export function AgentModal({
  open,
  onClose,
  onSave,
  agent,
  isPending,
}: AgentModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleClose = () => {
    setShowPassword(false);
    onClose();
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (agent) {
        reset({
          username: agent.username,
          password: "",
          name: agent.name,
          phone: agent.phone,
          address: agent.address || "",
        });
      } else {
        reset({
          username: "",
          password: "",
          name: "",
          phone: "",
          address: "",
        });
      }
    }
  }, [open, agent, reset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#121c28]/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-2xl shadow-ambient-xl w-full max-w-md overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#c1c6d5]/20 flex items-center justify-between bg-[#f8f9ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#005eb0]/10 flex items-center justify-center text-[#005eb0]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3
                className="text-base font-extrabold text-[#121c28]"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {agent ? "Update Agent" : "Add New Agent"}
              </h3>
              <p className="text-[11px] text-[#717784] font-bold uppercase tracking-wider">
                Field Operations
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[#f0f2f5] rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-[#43474f]" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Username - Only for creation */}
            {!agent && (
              <div>
                <label className="text-xs font-bold text-[#43474f] mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#005eb0]" /> Username
                </label>
                <input
                  {...register("username")}
                  placeholder="e.g. agent_mohan"
                  className={`w-full px-4 py-2.5 bg-[#f8f9ff] border rounded-xl text-sm focus:outline-none transition-all ${
                    errors.username
                      ? "border-[#ba1a1a] focus:border-[#ba1a1a]"
                      : "border-[#c3c6d1]/30 focus:border-[#005eb0]"
                  }`}
                />
                {errors.username && (
                  <p className="text-[10px] text-[#ba1a1a] mt-1 font-medium">
                    {errors.username.message}
                  </p>
                )}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="text-xs font-bold text-[#43474f] mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#005eb0]" /> Full Name
              </label>
              <input
                {...register("name")}
                placeholder="Mohan Lal"
                className={`w-full px-4 py-2.5 bg-[#f8f9ff] border rounded-xl text-sm focus:outline-none transition-all ${
                  errors.name
                    ? "border-[#ba1a1a] focus:border-[#ba1a1a]"
                    : "border-[#c3c6d1]/30 focus:border-[#005eb0]"
                }`}
              />
              {errors.name && (
                <p className="text-[10px] text-[#ba1a1a] mt-1 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-bold text-[#43474f] mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#005eb0]" /> Phone Number
              </label>
              <input
                {...register("phone")}
                placeholder="9876543210"
                className={`w-full px-4 py-2.5 bg-[#f8f9ff] border rounded-xl text-sm focus:outline-none transition-all ${
                  errors.phone
                    ? "border-[#ba1a1a] focus:border-[#ba1a1a]"
                    : "border-[#c3c6d1]/30 focus:border-[#005eb0]"
                }`}
              />
              {errors.phone && (
                <p className="text-[10px] text-[#ba1a1a] mt-1 font-medium">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-bold text-[#43474f] mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#005eb0]" /> Assigned Area
                / Address
              </label>
              <input
                {...register("address")}
                placeholder="Ward 5, North Zone"
                className="w-full px-4 py-2.5 bg-[#f8f9ff] border border-[#c3c6d1]/30 rounded-xl text-sm focus:outline-none focus:border-[#005eb0] transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-[#43474f] mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#005eb0]" />{" "}
                {agent ? "New Password (Optional)" : "Initial Password"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder={agent ? "Leave blank to keep same" : "••••••••"}
                  className={`w-full px-4 py-2.5 bg-[#f8f9ff] border rounded-xl text-sm focus:outline-none transition-all pr-10 ${
                    errors.password
                      ? "border-[#ba1a1a] focus:border-[#ba1a1a]"
                      : "border-[#c3c6d1]/30 focus:border-[#005eb0]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#717784] hover:text-[#005eb0] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-[#ba1a1a] mt-1 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 border border-[#c3c6d1] rounded-xl text-sm font-bold text-[#43474f] hover:bg-[#f8f9ff] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 gradient-primary rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-ambient"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {agent ? "Update Agent" : "Create Agent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
