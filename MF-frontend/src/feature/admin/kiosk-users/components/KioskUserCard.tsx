import React from "react";
import { MapPin, Calendar, Trash2, Edit2, MonitorCheck } from "lucide-react";
import type { KioskUser } from "../types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface KioskUserCardProps {
  user: KioskUser;
  onEdit: (user: KioskUser) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export const KioskUserCard = React.memo(function KioskUserCard({
  user,
  onEdit,
  onDelete,
  isDeleting,
}: KioskUserCardProps) {
  return (
    <Card className="group border  border-gray-100 bg-card hover:shadow-md transition-all duration-200 max-w-sm">
      {/* Compact Header */}
      <CardHeader className=" space-y-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <MonitorCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold leading-none truncate text-foreground">
                {user.name}
              </h3>
              <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-1">
                <MapPin className="h-2.5 w-2.5" />
                <span className="truncate">{user.address || "Kiosk"}</span>
              </p>
            </div>
          </div>

          <Badge
            className={cn(
              "shrink-0 px-1.5 py-0 text-[9px] font-black uppercase tracking-tighter border shadow-none",
              user.isActive ? "status-green" : "status-red",
            )}
          >
            {user.isActive ? "Online" : "Offline"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-2">
        <div className="h-px bg-border/30 w-full mb-2" />

        {/* Compressed Data Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div>
            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase">
              User
            </p>
            <p className="text-xs font-semibold truncate">{user.username}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase">
              Phone
            </p>
            <p className="text-xs font-semibold truncate">{user.phone}</p>
          </div>
        </div>

        {/* Footer & Actions Row */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1 text-[9px] font-medium text-muted-foreground/80">
            <Calendar className="h-2.5 w-2.5" />
            {format(new Date(user.createdAt), "MMM yyyy")}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(user)}
              className="h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={isDeleting}
              onClick={() => onDelete(user.id)}
              className="h-7 w-7 rounded-md hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
