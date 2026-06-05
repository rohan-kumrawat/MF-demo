import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupee } from "../../../../data/demoData";
import { useKhatedarDetail, useUdharKhata } from "../hooks/useUdharKhata";
import { EntryTable } from "../components/EntryTable";
import { AddEntryModal } from "../components/AddEntryModal";
import { DeleteConfirmDialog } from "../components/DeleteConfirmDialog";
import { AddKhatedarModal } from "../components/AddKhatedarModal";
import { usePageShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { CreateUdharEntryDto } from "../types";
import { Kbd } from "@/components/ui/kbd";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";

export default function KhatedarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { person, entries, isLoadingPerson, isLoadingEntries } =
    useKhatedarDetail(id!);

  const {
    editKhatedar,
    removeKhatedar,
    addEntry,
    editEntry,
    removeEntry,
    isEditingPerson,
    isDeletingPerson,
    isAddingEntry,
    isEditingEntry,
    isDeletingEntry,
  } = useUdharKhata();

  const [addEntryOpen, setAddEntryOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any | null>(null);
  const [pendingDeleteEntryId, setPendingDeleteEntryId] = useState<
    string | null
  >(null);
  const [deletePersonOpen, setDeletePersonOpen] = useState(false);
  const [editPersonOpen, setEditPersonOpen] = useState(false);

  usePageShortcuts("khatedar-detail", [
    {
      key: "n",
      altKey: true,
      description: "Add entry",
      action: () => setAddEntryOpen(true),
    },
    {
      key: "e",
      altKey: true,
      description: "Edit khatedar",
      action: () => setEditPersonOpen(true),
    },
    {
      key: "Escape",
      description: "Go back",
      action: () => navigate(-1),
    },
  ]);

  const handleSaveEntry = useCallback(
    async (khatedarId: string, dto: CreateUdharEntryDto) => {
      if (editingEntry) {
        await editEntry(editingEntry.id, dto);
        setEditingEntry(null);
      } else {
        await addEntry(khatedarId, dto);
        setAddEntryOpen(false);
      }
    },
    [addEntry, editEntry, editingEntry],
  );

  const handleEditEntry = useCallback((entry: any) => {
    setEditingEntry(entry);
    setAddEntryOpen(true);
  }, []);

  const handleDeletePerson = useCallback(async () => {
    await removeKhatedar(id!);
    navigate(-1);
  }, [removeKhatedar, id, navigate]);

  const handleUpdatePerson = useCallback(
    async (dto: any) => {
      await editKhatedar(id!, dto);
      setEditPersonOpen(false);
    },
    [editKhatedar, id],
  );

  const handleDeleteEntryConfirm = useCallback(async () => {
    if (pendingDeleteEntryId) {
      await removeEntry(id!, pendingDeleteEntryId);
      setPendingDeleteEntryId(null);
    }
  }, [removeEntry, id, pendingDeleteEntryId]);

  const entryStats = useMemo(() => {
    let totalLiya = 0;
    let totalDiya = 0;

    for (const entry of entries) {
      const baseAmount =
        (entry.liye ?? entry.diye ?? 0) + (entry.interestAmount ?? 0);

      if (entry.liye != null) {
        totalLiya += baseAmount;
      } else if (entry.diye != null) {
        totalDiya += baseAmount;
      }
    }

    const latestEntryDate = entries[0]?.date
      ? new Date(entries[0].date).toLocaleDateString("en-IN")
      : "-";

    return {
      totalEntries: entries.length,
      totalLiya,
      totalDiya,
      latestEntryDate,
    };
  }, [entries]);

  if (isLoadingPerson) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner className="size-8 text-primary" />
        <p className="text-sm text-muted-foreground font-medium">
          Load ho raha hai...
        </p>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="p-10 text-center text-sm text-muted-foreground">
        Khatedar nahi mila.{" "}
        <Button
          variant="link"
          onClick={() => navigate(-1)}
          className="text-primary h-auto p-0"
        >
          Wapas jayen
        </Button>
      </div>
    );
  }

  const balance = parseFloat(person.netBalance);
  const positive = balance >= 0;

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-6 animate-fade-in ">
      {/* Integrated Profile Header Card */}
      <Card className="border-border/50 shadow-sm relative overflow-hidden bg-linear-to-br from-card to-muted/20">
        <CardContent className="px-4 flex flex-col gap-4">
          {/* Navigation & Actions Row */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="-ml-2.5 h-8 px-2.5 text-muted-foreground hover:bg-muted/50 rounded-lg group"
            >
              <ArrowLeft className="size-4 mr-1.5 transition-transform group-hover:-translate-x-0.5" />
              Wapas
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditPersonOpen(true)}
                className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                title="Edit Khatedar"
              >
                <Edit2 className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeletePersonOpen(true)}
                className="size-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-lg"
                title="Delete Khatedar"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          {/* Profile & Balance Section */}
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "size-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-lg",
                  positive
                    ? "bg-green-600 shadow-green-600/20"
                    : "bg-destructive shadow-destructive/20",
                )}
              >
                {person.name[0].toUpperCase()}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-foreground tracking-tight leading-tight">
                    {person.name}
                  </h1>
                  {person.personCode && (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono font-bold bg-background/50"
                    >
                      {person.personCode}
                    </Badge>
                  )}
                  {person.isActive ? (
                    <Badge
                      variant="default"
                      className="text-[9px] h-4 px-1.5 font-black uppercase"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-[9px] h-4 px-1.5 font-black uppercase"
                    >
                      Inactive
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mt-1">
                  {person.phone && <span>{person.phone}</span>}
                  {person.phone && person.address && (
                    <span className="opacity-40">•</span>
                  )}
                  {person.address && (
                    <span className="truncate max-w-[200px]">
                      {person.address}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right ml-auto sm:ml-0">
              <p
                className={cn(
                  "text-3xl font-black tracking-tighter leading-none mb-1",
                  positive ? "text-green-600" : "text-destructive",
                )}
              >
                {positive ? "+" : ""}
                {formatRupee(balance)}
              </p>
              <p
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest opacity-60",
                  positive ? "text-green-600" : "text-destructive",
                )}
              >
                {positive ? "Hamare bache hain" : "Hume dene hain"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <Card className="border-cyan-100/80 bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-cyan-500/10 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700/80">
              Total Entries
            </p>
            <p className="text-2xl font-black text-cyan-700 mt-1">
              {entryStats.totalEntries}
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100/80 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-emerald-500/10 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700/80">
              Total Liya
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 tabular-nums">
              {formatRupee(entryStats.totalLiya)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-rose-100/80 bg-gradient-to-br from-rose-500/10 via-red-500/5 to-rose-500/10 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-700/80">
              Total Diya
            </p>
            <p className="text-xl sm:text-2xl font-black text-rose-700 mt-1 tabular-nums">
              {formatRupee(entryStats.totalDiya)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-violet-100/80 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-violet-500/10 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-700/80">
              Latest Entry
            </p>
            <p className="text-lg sm:text-xl font-black text-violet-700 mt-1 tabular-nums">
              {entryStats.latestEntryDate}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Entries section */}
      <Card className="border-border/50 shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 h-14 border-b border-border/50 bg-muted/20">
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
            Entries
          </h3>
          <Button
            variant="default"
            size="lg"
            onClick={() => setAddEntryOpen(true)}
          >
            Nayi Entry{" "}
            <Kbd className="ml-2 bg-white/20 border-none text-white text-[10px] hidden sm:inline-flex">
              alt + n
            </Kbd>
          </Button>
        </div>

        <CardContent className="p-0">
          {isLoadingEntries ? (
            <div className="flex justify-center py-16">
              <Spinner className="size-8 text-primary/50" />
            </div>
          ) : (
            <div className="p-1 sm:px-4">
              <EntryTable
                entries={entries}
                onEditEntry={handleEditEntry}
                onDeleteEntry={setPendingDeleteEntryId}
                deletingId={isDeletingEntry ? pendingDeleteEntryId : null}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <AddEntryModal
        khatedar={addEntryOpen ? person : null}
        initialData={editingEntry}
        onSave={handleSaveEntry}
        onClose={() => {
          setAddEntryOpen(false);
          setEditingEntry(null);
        }}
        isPending={isAddingEntry || isEditingEntry}
      />

      <DeleteConfirmDialog
        open={!!pendingDeleteEntryId}
        title="Entry delete karein?"
        description="Yeh entry hamesha ke liye hat jayegi aur baaki entries ka balance recalculate hoga."
        onConfirm={handleDeleteEntryConfirm}
        onCancel={() => setPendingDeleteEntryId(null)}
        isPending={isDeletingEntry}
      />

      <DeleteConfirmDialog
        open={deletePersonOpen}
        title={`"${person.name}" ko delete karein?`}
        description="Is khatedar aur unki saari entries delete ho jayengi. Yeh action undo nahi ho sakta."
        onConfirm={handleDeletePerson}
        onCancel={() => setDeletePersonOpen(false)}
        isPending={isDeletingPerson}
      />
      <AddKhatedarModal
        open={editPersonOpen}
        initialData={person}
        onSave={handleUpdatePerson}
        onClose={() => setEditPersonOpen(false)}
        isPending={isEditingPerson}
      />
    </div>
  );
}
