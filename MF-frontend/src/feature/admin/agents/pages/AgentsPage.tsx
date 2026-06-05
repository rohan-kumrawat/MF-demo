import { useState, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  Users,
  BadgeCheckIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  Edit2Icon,
  Trash2Icon,
} from "lucide-react";
import { useAgents } from "../hooks/useAgents";
import { AgentModal } from "../components/AgentModal";
import type { Agent } from "../types";
import type { AgentFormData } from "../schemas/agent.schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";

export default function AgentsPage() {
  const {
    agents,
    isLoading,
    createAgent,
    updateAgent,
    deleteAgent,
    isCreating,
    isUpdating,
    isDeleting,
  } = useAgents();

  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredAgents = useMemo(() => {
    if (!searchQuery) return agents;
    const lowSearch = searchQuery.toLowerCase();
    return agents.filter(
      (a) =>
        a.name.toLowerCase().includes(lowSearch) ||
        a.username.toLowerCase().includes(lowSearch) ||
        a.phone.includes(lowSearch),
    );
  }, [agents, searchQuery]);

  const handleOpenCreate = useCallback(() => {
    setEditingAgent(null);
    setModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((agent: Agent) => {
    setEditingAgent(agent);
    setModalOpen(true);
  }, []);

  const handleSave = async (data: AgentFormData) => {
    try {
      if (editingAgent) {
        await updateAgent({
          id: editingAgent.id,
          dto: {
            name: data.name,
            phone: data.phone,
            address: data.address,
            password: data.password || undefined,
          },
        });
      } else {
        await createAgent({
          username: data.username,
          password: data.password || "Pass@123",
          role: "agent",
          name: data.name,
          phone: data.phone,
          address: data.address,
        });
      }
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to save agent:", err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAgent(deleteId);
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete agent:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner className="size-8 text-primary" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Loading Agents...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-4 lg:p-8 animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Agents Directory
            </h1>
            <Badge
              variant="secondary"
              className="px-3 py-1 text-xs font-semibold"
            >
              {agents.length} Total
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage field agents and their performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenCreate}
            size="lg"
            id="add-agent-btn"
            className="rounded-xl font-bold"
          >
            <Plus className="size-4 mr-2" />
            Add New Agent
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, username, or phone..."
            className="pl-9"
            id="agent-search"
          />
        </div>
      </div>

      {/* Agents Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Agent Information</TableHead>
              <TableHead>Contact Details</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Joined On</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAgents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Users className="size-12 stroke-1 opacity-20" />
                    <p className="text-sm font-medium">No agents found</p>
                    <p className="text-xs opacity-60">
                      Try adjusting your search criteria
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAgents.map((agent) => (
                <TableRow key={agent.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {agent.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm">
                            {agent.name}
                          </span>
                          <BadgeCheckIcon className="size-3.5 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          @{agent.username}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <PhoneIcon className="size-3.5" />
                      <span className="font-mono text-xs">{agent.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground max-w-[200px]">
                      <MapPinIcon className="size-3.5 shrink-0" />
                      <span className="truncate" title={agent.address || ""}>
                        {agent.address || "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="size-3.5" />
                      <span className="text-xs font-medium">
                        {new Date(agent.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(agent)}
                        className="size-8"
                      >
                        <Edit2Icon className="size-4" />
                        <span className="sr-only">Edit agent</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(agent.id)}
                        disabled={isDeleting}
                        className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2Icon className="size-4" />
                        <span className="sr-only">Delete agent</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AgentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        agent={editingAgent}
        isPending={isCreating || isUpdating}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              agent account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Agent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
