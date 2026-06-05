// src/feature/admin/daily-register/pages/DailyRegisterPage.tsx
import { useState, useMemo } from "react";
import { Search, BookText, Plus } from "lucide-react";
import {
  useDayRegisters,
  useDailyRegisterMutations,
} from "../hooks/useDailyRegister";
import { DayRegisterCard } from "../components/DayRegisterCard";
import { DayEntriesView } from "../components/DayEntriesView";
import { OpenDayModal } from "../components/OpenDayModal";
import { localToday } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function DailyRegisterPage() {
  const [search, setSearch] = useState("");
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [openModalVisible, setOpenModalVisible] = useState(false);

  const { data: days = [], isLoading } = useDayRegisters();
  const { openDay, isOpening } = useDailyRegisterMutations();

  const selectedDay = useMemo(
    () => days.find((day) => day.id === selectedDayId) ?? null,
    [days, selectedDayId],
  );

  const latestDay = days[0] ?? null;

  const filteredDays = useMemo(() => {
    const q = search.toLowerCase();
    return days.filter((day) => day.entryDate?.includes(q));
  }, [days, search]);

  const handleOpenDay = async (dto: any) => {
    await openDay.mutateAsync(dto);
    setOpenModalVisible(false);
  };

  if (selectedDay) {
    return (
      <DayEntriesView day={selectedDay} onBack={() => setSelectedDayId(null)} />
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner className="size-8 text-primary" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Loading Registers...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-6 animate-fade-in max-w-7xl ">
      {/* Header Section */}
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
            <BookText className="size-6" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-foreground tracking-tight leading-tight">
              Daily Register
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              Manage daily income & expenses accurately
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <InputGroup className="flex-1 bg-muted/30 border-border/50 h-11 rounded-xl shadow-sm">
            <InputGroupAddon align="inline-start">
              <Search className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by date (YYYY-MM-DD)..."
              className="text-sm font-medium"
            />
          </InputGroup>

          <Button onClick={() => setOpenModalVisible(true)} size="lg">
            <Plus className="size-4" /> Open New Day
          </Button>
        </div>
      </div>

      {/* Grid or Empty State */}
      {filteredDays.length === 0 ? (
        <Card className="border-border/50 bg-card/50">
          <CardContent className="py-24">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-2">
                <Search className="size-8 text-muted-foreground/30" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-lg font-bold text-foreground">
                  No registers found
                </p>
                <p className="text-sm text-muted-foreground">
                  Try a different search term or open a new register.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenModalVisible(true)}
                className="rounded-xl font-bold mt-2"
              >
                Open today's register
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredDays.map((day) => (
            <DayRegisterCard
              key={day.id}
              day={day}
              onClick={() => setSelectedDayId(day.id)}
            />
          ))}
        </div>
      )}

      <OpenDayModal
        open={openModalVisible}
        onClose={() => setOpenModalVisible(false)}
        onSave={handleOpenDay}
        isPending={isOpening}
        defaultEntryDate={localToday()}
        defaultOpeningBalance={latestDay?.closingBalance ?? 0}
      />
    </div>
  );
}
