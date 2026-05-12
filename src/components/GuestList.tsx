import { useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search, Plus, Send, MoreHorizontal, RefreshCw, Pencil, Trash2,
  AlertTriangle, BellRing, CheckCircle2, XCircle, Mail, MailX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Guest, RsvpStatus, InviteStatus, useGuests, guestApi, rsvpLabel, inviteLabel } from "@/data/guests";
import { GuestFormDialog } from "./GuestFormDialog";
import { toast } from "sonner";

interface Props {
  eventId: string;
  /** True if the event details have changed since invites were sent. Triggers the "Send update to guests" CTA. */
  hasPendingUpdate?: boolean;
  onSendUpdateAck?: () => void;
}

export function GuestList({ eventId, hasPendingUpdate, onSendUpdateAck }: Props) {
  const guests = useGuests(eventId);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | RsvpStatus | "failed">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [removing, setRemoving] = useState<Guest | null>(null);

  const filtered = useMemo(() => {
    return guests.filter((g) => {
      if (filter === "failed" && g.invite !== "failed") return false;
      if (filter !== "all" && filter !== "failed" && g.rsvp !== filter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        g.firstName.toLowerCase().includes(q) ||
        g.lastName.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        (g.company ?? "").toLowerCase().includes(q)
      );
    });
  }, [guests, query, filter]);

  const counts = useMemo(() => ({
    total: guests.length,
    accepted: guests.filter((g) => g.rsvp === "accepted").length,
    declined: guests.filter((g) => g.rsvp === "declined").length,
    pending: guests.filter((g) => g.rsvp === "pending").length,
    failed: guests.filter((g) => g.invite === "failed").length,
    notSent: guests.filter((g) => g.invite === "not_sent").length,
  }), [guests]);

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (g: Guest) => { setEditing(g); setFormOpen(true); };

  const handleSendAll = () => {
    const n = guestApi.sendAll(eventId);
    if (n === 0) toast.info("All guests already have invites");
    else toast.success(`Invites sent to ${n} guest${n === 1 ? "" : "s"}`);
  };

  const handleSendUpdate = () => {
    const n = guestApi.sendUpdate(eventId);
    toast.success(`Update sent to ${n} guest${n === 1 ? "" : "s"}`);
    onSendUpdateAck?.();
  };

  return (
    <div className="space-y-4">
      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Guests" value={counts.total} />
        <Stat label="Accepted" value={counts.accepted} tone="success" />
        <Stat label="Pending" value={counts.pending} tone="muted" />
        <Stat label="Failed" value={counts.failed} tone="warning" />
      </div>

      {hasPendingUpdate && (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <BellRing className="mt-0.5 h-4 w-4 text-warning-foreground" />
            <div>
              <p className="text-sm font-semibold text-warning-foreground">Event details changed</p>
              <p className="text-xs text-warning-foreground/80">Notify guests so their calendars stay up to date.</p>
            </div>
          </div>
          <Button size="sm" onClick={handleSendUpdate} className="bg-warning text-warning-foreground hover:bg-warning/90">
            Send update to guests
          </Button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guests…"
            className="h-9 rounded-full border border-border/60 bg-card pl-9 text-xs"
          />
        </div>
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>All</FilterPill>
        <FilterPill active={filter === "accepted"} onClick={() => setFilter("accepted")}>Accepted</FilterPill>
        <FilterPill active={filter === "pending"} onClick={() => setFilter("pending")}>Pending</FilterPill>
        <FilterPill active={filter === "declined"} onClick={() => setFilter("declined")}>Declined</FilterPill>
        {counts.failed > 0 && (
          <FilterPill active={filter === "failed"} onClick={() => setFilter("failed")} tone="warning">
            Failed · {counts.failed}
          </FilterPill>
        )}
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" className="h-9 rounded-full" onClick={handleSendAll} disabled={counts.notSent === 0}>
            <Send className="mr-1.5 h-3.5 w-3.5" />
            Send invites{counts.notSent > 0 ? ` · ${counts.notSent}` : ""}
          </Button>
          <Button size="sm" className="h-9 rounded-full bg-gradient-primary shadow-elegant" onClick={openAdd}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add guest
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="px-3 text-xs">Guest</TableHead>
              <TableHead className="hidden px-3 text-xs md:table-cell">Company</TableHead>
              <TableHead className="hidden w-[90px] px-2 text-xs lg:table-cell">Dietary</TableHead>
              <TableHead className="hidden w-[90px] px-2 text-xs lg:table-cell">Access</TableHead>
              <TableHead className="w-[110px] px-2 text-xs">RSVP</TableHead>
              <TableHead className="w-[90px] px-2 text-xs">Invite</TableHead>
              <TableHead className="w-10 px-1" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">No guests match this view</TableCell></TableRow>
            ) : filtered.map((g) => (
              <TableRow key={g.id} className="text-sm">
                <TableCell className="px-3 py-3">
                  <div className="truncate font-medium leading-tight">{g.firstName} {g.lastName}</div>
                  <div className="truncate text-xs text-muted-foreground">{g.email}</div>
                  <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-muted-foreground md:hidden">
                    {g.company && <span className="truncate">{g.company}</span>}
                  </div>
                </TableCell>
                <TableCell className="hidden truncate px-3 py-3 text-xs text-muted-foreground md:table-cell">{g.company || "—"}</TableCell>
                <TableCell className="hidden truncate px-2 py-3 text-xs text-muted-foreground lg:table-cell">{g.dietary || "—"}</TableCell>
                <TableCell className="hidden truncate px-2 py-3 text-xs text-muted-foreground lg:table-cell">{g.access || "—"}</TableCell>
                <TableCell className="px-2 py-3"><RsvpChip status={g.rsvp} /></TableCell>
                <TableCell className="px-2 py-3"><InviteChip status={g.invite} /></TableCell>
                <TableCell className="px-1 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => openEdit(g)}>
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Edit guest
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { guestApi.resend(eventId, g.id); toast.success("Invite resent"); }}>
                        <RefreshCw className="mr-2 h-3.5 w-3.5" /> Resend invite
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => { guestApi.simulateRsvp(eventId, g.id, "accepted"); toast.success(`${g.firstName} accepted`); }}>
                        <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-success" /> Simulate accept
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { guestApi.simulateRsvp(eventId, g.id, "declined"); toast.message(`${g.firstName} declined`); }}>
                        <XCircle className="mr-2 h-3.5 w-3.5 text-destructive" /> Simulate decline
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setRemoving(g)} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Remove guest
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {counts.failed > 0 && (
        <div className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs text-warning-foreground">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <p className="font-semibold">{counts.failed} invitation{counts.failed === 1 ? "" : "s"} failed to deliver.</p>
            <p className="text-warning-foreground/80">Edit the guest's email address and resend the invite.</p>
          </div>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        Guest data is tenant-scoped and purged after the workspace retention window. Dietary &amp; access details are deleted automatically once the event closes.
      </p>

      <GuestFormDialog open={formOpen} onOpenChange={setFormOpen} eventId={eventId} guest={editing} />

      <AlertDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this guest?</AlertDialogTitle>
            <AlertDialogDescription>
              {removing ? `${removing.firstName} ${removing.lastName} (${removing.email}) will be removed from this event. This action is recorded in the audit trail.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (removing) { guestApi.remove(eventId, removing.id); toast.success("Guest removed"); } setRemoving(null); }}
            >
              Remove guest
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function Stat({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "success" | "warning" | "muted" }) {
  const tones: Record<string, string> = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning-foreground",
    muted: "text-muted-foreground",
  };
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("text-lg font-semibold tabular-nums", tones[tone])}>{value}</p>
    </div>
  );
}

function FilterPill({ children, active, onClick, tone }: { children: React.ReactNode; active?: boolean; onClick?: () => void; tone?: "warning" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 rounded-full border px-3 text-xs transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border/60 bg-card text-muted-foreground hover:text-foreground",
        tone === "warning" && !active && "border-warning/50 text-warning-foreground",
      )}
    >
      {children}
    </button>
  );
}

function RsvpChip({ status }: { status: RsvpStatus }) {
  const map: Record<RsvpStatus, string> = {
    accepted: "bg-success/15 text-success border-success/30",
    declined: "bg-destructive/10 text-destructive border-destructive/30",
    pending: "bg-muted text-muted-foreground border-border",
  };
  const Icon = status === "accepted" ? CheckCircle2 : status === "declined" ? XCircle : null;
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium", map[status])}>
      {Icon && <Icon className="h-3 w-3 shrink-0" />}
      {rsvpLabel[status]}
    </span>
  );
}

function InviteChip({ status }: { status: InviteStatus }) {
  const map: Record<InviteStatus, string> = {
    not_sent: "bg-muted text-muted-foreground border-border",
    sent: "bg-primary/10 text-primary border-primary/25",
    failed: "bg-warning/15 text-warning-foreground border-warning/40",
  };
  const Icon = status === "sent" ? Mail : status === "failed" ? MailX : null;
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium", map[status])}>
      {Icon && <Icon className="h-3 w-3 shrink-0" />}
      {inviteLabel[status]}
    </span>
  );
}
