// src/pages/agent/AgentProfile.tsx
import React from "react";
import { useAuthStore } from "../../store/authStore";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/axios";
import {
  UserCircle,
  Award,
  MapPin,
  LogOut,
  Phone,
  User,
  Calendar,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AgentProfile: React.FC = () => {
  const { logout } = useAuthStore();
  const { user } = useAuthStore();
  const agentId = user?.id || "";

  // Fetch full user profile
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["userProfile", agentId],
    queryFn: async () => {
      const res = await apiClient.get(`/users/${agentId}`);
      return res.data;
    },
    enabled: !!agentId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in pb-24 max-w-md mx-auto px-4 pt-4">
      {/* Header Profile Section */}
      <div className="flex flex-col items-center py-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-xl group-hover:bg-primary/30 transition-all" />
          <Avatar className="w-24 h-24 border-4 border-background shadow-2xl rounded-[2.5rem] relative">
            <AvatarImage src="" />
            <AvatarFallback className="bg-muted text-primary">
              <UserCircle size={54} strokeWidth={1.5} />
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-2xl bg-card border border-border shadow-lg flex items-center justify-center text-amber-500">
            <Award size={20} className="relative z-10" />
          </div>
        </div>

        <div className="flex flex-col items-center mt-5 gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              {userProfile?.name || "Agent"}
            </h2>
            {userProfile?.isActive && (
              <Badge className="bg-green-500/10 text-green-600 border-none text-[10px] font-black h-5 px-2">
                ACTIVE
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-primary" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {userProfile?.address || "Address not set"}
            </span>
          </div>
        </div>
      </div>

      {/* Account Details Card */}
      <Card className="rounded-[2rem] border-border/40 shadow-sm bg-card overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 bg-muted/30 border-b border-border/40">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Account Information
            </h3>
          </div>
          <div className="divide-y divide-border/40">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <User size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                    Username
                  </p>
                  <p className="text-sm font-black">{userProfile?.username}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                    Phone Number
                  </p>
                  <p className="text-sm font-black">{userProfile?.phone}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                    Join Date
                  </p>
                  <p className="text-sm font-black">
                    {userProfile?.createdAt
                      ? new Date(userProfile.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logout Button */}
      <Button
        variant="destructive"
        onClick={logout}
        className="w-full h-14 rounded-2xl font-black text-sm shadow-xl shadow-destructive/10 active:scale-95 transition-all mt-2"
      >
        <LogOut size={18} className="mr-2" strokeWidth={3} />
        SIGN OUT
      </Button>
    </div>
  );
};

export default AgentProfile;
