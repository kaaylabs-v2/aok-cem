import { Fragment, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search, Plus, Send, MoreHorizontal, RefreshCw, Pencil, Trash2,
  AlertTriangle, BellRing, CheckCircle2, XCircle, Mail, MailX,
  Users, Clock, ChevronRight, ChevronDown, UtensilsCrossed, Accessibility,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Guest, RsvpStatus, InviteStatus, useGuests, guestApi, rsvpLabel, inviteLabel } from "@/data/guests";
import { Host, HOSTS, hostById, hostInitials, hostName } from "@/data/hosts";
import { FLAG_LABEL, SENIORITY_TONE } from "@/data/requests";
import { GuestFormDialog } from "./GuestFormDialog";
import { HostSummaryDrawer } from "./HostSummaryDrawer";
import { toast } from "sonner";

interface Props {
  eventId: string;
  hasPendingUpdate?: boolean;
  onSendUpdateAck?: () => void;
}

const COLLAPSED_PREVIEW = 2;

export function GuestList({ eventId, hasPendingUpdate, onSendUpdateAck }: Props) {
  const guests = useGuests(eventId);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | RsvpStatus | "failed">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [removing, setRemoving] = useState<Guest | null>(null);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState<Set<string>>(new Set());
  const [drawerHost, setDrawerHost] = useState<Host | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);


  const toggleExpand = (hostId: string) => {
    const next = new Set(expanded);
    next.has(hostId) ? next.delete(hostId) : next.add(hostId);
    setExpanded(next);
  };
  const toggleShowAll = (hostId: string) => {
    const next = new Set(showAll);
    next.has(hostId) ? next.delete(hostId) : next.add(hostId);
    setShowAll(next);
  };
  const openHost = (h: Host) => { setDrawerHost(h); setDrawerOpen(true); };

  const filtered = useMemo(() => guests.filter((g) => {
    if (filter === "failed" && g.invite !== "failed") return false;
    if (filter !== "all" && filter !== "failed" && g.rsvp !== filter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    const h = hostById(g.hostId);
    return (
      g.firstName.toLowerCase().includes(q) ||
      g.lastName.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q) ||
      (g.company ?? "").toLowerCase().includes(q) ||
      (h ? hostName(h).toLowerCase().includes(q) : false)
    );
  }), [guests, query, filter]);

  const groups = useMemo(() => {
    const map = new Map<string, Guest[]>();
    for (const g of filtered) {
      const list = map.get(g.hostId) ?? [];
      list.push(g);
      map.set(g.hostId, list);
    }
    return Array.from(map.entries())
      .map(([hostId, items]) => ({ host: hostById(hostId) ?? HOSTS[0], items }))
      .sort((a, b) => hostName(a.host).localeCompare(hostName(b.host)));
  }, [filtered]);

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
    <TooltipProvider delayDuration={150}>
      <div className="space-y-4">
        {/* Stat strip */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat icon={Users} label="Guests" value={counts.total} />
          <Stat icon={CheckCircle2} label="Accepted" value={counts.accepted} tone="success" />
          <Stat icon={Clock} label="Pending" value={counts.pending} tone="muted" />
          <Stat icon={AlertTriangle} label="Failed" value={counts.failed} tone="warning" />
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
              placeholder="Search by guest or host name…"
              className="h-9 rounded-full border border-border/60 bg-card pl-9 text-xs"
            />
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="h-9 w-auto min-w-[120px] rounded-full border-border/60 bg-card px-3 text-xs font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/60">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              {counts.failed > 0 && <SelectItem value="failed">Failed · {counts.failed}</SelectItem>}
            </SelectContent>
          </Select>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" className="h-9 rounded-full" onClick={handleSendAll} disabled={counts.notSent === 0}>
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Send invites{counts.notSent > 0 ? ` · ${counts.notSent}` : ""}
            </Button>
            <Button size="sm" className="h-9 rounded-full bg-gradient-primary shadow-elegant" onClick={openAdd}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add guest
            </Button>
          </div>
        </div>

        {/* Grouped host → guest table */}
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <div className="min-w-[640px]">
          {/* Column header */}
          <div className="sticky top-0 z-10 grid grid-cols-[minmax(160px,1.3fr),56px,90px,90px,64px,100px,28px] items-center gap-1 border-b border-border bg-muted/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="flex items-center gap-2">
              Host / Guest
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setExpanded(new Set(groups.map((g) => g.host.id)))}
                    className="flex h-5 w-5 items-center justify-center rounded hover:bg-muted"
                    aria-label="Expand all"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Expand all</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => { setExpanded(new Set()); setShowAll(new Set()); }}
                    className="flex h-5 w-5 items-center justify-center rounded hover:bg-muted"
                    aria-label="Collapse all"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Collapse all</TooltipContent>
              </Tooltip>
            </span>
            <span>Role</span>
            <span>Invited By</span>
            <span>Company</span>
            <span>Access</span>
            <span>Status</span>
            <span />
          </div>

          {groups.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">No guests match this view</div>
          ) : (
            <ul className="divide-y divide-border">
              {groups.map(({ host, items }) => {
                const isOpen = expanded.has(host.id);
                const accepted = items.filter((g) => g.rsvp === "accepted").length;
                const pending = items.filter((g) => g.rsvp === "pending").length;
                const declined = items.filter((g) => g.rsvp === "declined").length;
                const visibleItems = showAll.has(host.id) ? items : items.slice(0, COLLAPSED_PREVIEW);
                const hiddenCount = items.length - visibleItems.length;

                return (
                  <li key={host.id}>
                    {/* Host row */}
                    <div className="group grid grid-cols-[minmax(160px,1.3fr),56px,90px,90px,64px,100px,28px] items-center gap-1 bg-muted/20 px-2 py-1.5 transition-colors hover:bg-muted/40">
                      <div className="flex min-w-0 items-center gap-2">
                        <button
                          onClick={() => toggleExpand(host.id)}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md hover:bg-muted"
                          aria-label={isOpen ? "Collapse" : "Expand"}
                        >
                          {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => openHost(host)} className="min-w-0 flex-1 text-left">
                          <p className="truncate text-sm font-semibold">{hostName(host)}</p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {items.length} guest{items.length === 1 ? "" : "s"}
                            {host.flags.length > 0 && (
                              <span className="ml-1.5 inline-flex items-center gap-1 text-warning-foreground">
                                · <AlertTriangle className="h-3 w-3" /> {FLAG_LABEL[host.flags[0]]}{host.flags.length > 1 ? ` +${host.flags.length - 1}` : ""}
                              </span>
                            )}
                          </p>
                        </button>
                      </div>
                      <div className="min-w-0">
                        <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-1.5 py-px text-[10px] font-medium text-primary">
                          Host
                        </span>
                      </div>
                      <div className="min-w-0 text-xs text-muted-foreground">—</div>
                      <div className="min-w-0 truncate text-xs text-muted-foreground">—</div>
                      <div className="min-w-0 text-xs text-muted-foreground">—</div>
                      <div className="flex flex-wrap items-center gap-1 text-[11px]">
                        <SummaryChip count={accepted} tone="success" label="Accepted" />
                        <SummaryChip count={pending} tone="muted" label="Pending" />
                        <SummaryChip count={declined} tone="destructive" label="Declined" />
                      </div>
                      <div className="text-right">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openHost(host)}>
                              <Users className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Host summary</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {/* Guest rows */}
                    {isOpen && (
                      <ul className="divide-y divide-border/60 bg-background">
                        {visibleItems.map((g) => (
                          <li key={g.id} className="grid grid-cols-[minmax(200px,1.3fr),64px,110px,100px,72px,120px,32px] items-center gap-1 px-3 py-1.5 text-sm">
                            <div className="flex min-w-0 items-start gap-2 pl-7">
                              <span className="mt-1 shrink-0 text-muted-foreground">↳</span>
                              <Avatar className="h-7 w-7 shrink-0">
                                <AvatarFallback className="bg-muted text-[10px] font-semibold text-muted-foreground">
                                  {(g.firstName[0] + g.lastName[0]).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium leading-tight" title={`${g.firstName} ${g.lastName}`}>
                                  {g.firstName} {g.lastName}
                                </p>
                                <p className="truncate text-[11px] text-muted-foreground" title={g.email}>{g.email}</p>
                              </div>
                            </div>
                            <div className="min-w-0">
                              <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-1.5 py-px text-[10px] font-medium text-muted-foreground">
                                Guest
                              </span>
                            </div>
                            <div className="min-w-0 text-[11px] text-muted-foreground">
                              <span className="truncate block" title={hostName(host)}>{hostName(host)}</span>
                            </div>
                            <div className="min-w-0 truncate text-xs text-muted-foreground" title={g.company || ""}>{g.company || "—"}</div>
                            <div className="min-w-0 truncate text-xs text-muted-foreground">{g.access || "—"}</div>
                            <div className="flex flex-col items-start gap-1">
                              <RsvpChip status={g.rsvp} />
                              <InviteChip status={g.invite} />
                              <GuestFlags dietary={g.dietary} access={g.access} />
                            </div>
                            <div className="text-right">
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
                            </div>
                          </li>
                        ))}
                        {hiddenCount > 0 && (
                          <li className="px-4 py-2 pl-14">
                            <button onClick={() => toggleShowAll(host.id)} className="text-xs font-medium text-primary hover:underline">
                              + {hiddenCount} more guest{hiddenCount === 1 ? "" : "s"}
                            </button>
                          </li>
                        )}
                        {showAll.has(host.id) && items.length > COLLAPSED_PREVIEW && (
                          <li className="px-4 py-2 pl-14">
                            <button onClick={() => toggleShowAll(host.id)} className="text-xs font-medium text-muted-foreground hover:underline">
                              Show less
                            </button>
                          </li>
                        )}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          </div>
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
          Guests are grouped by host so compliance teams can quickly identify who invited whom. Click a host name to open the full summary.
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

        <HostSummaryDrawer
          host={drawerHost}
          context="guests"
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          guestCount={drawerHost ? guests.filter((g) => g.hostId === drawerHost.id).length : 0}
          acceptedCount={drawerHost ? guests.filter((g) => g.hostId === drawerHost.id && g.rsvp === "accepted").length : 0}
          pendingCount={drawerHost ? guests.filter((g) => g.hostId === drawerHost.id && g.rsvp === "pending").length : 0}
          declinedCount={drawerHost ? guests.filter((g) => g.hostId === drawerHost.id && g.rsvp === "declined").length : 0}
          breakdown={drawerHost
            ? guests.filter((g) => g.hostId === drawerHost.id).map((g) => ({
                id: g.id,
                label: `${g.firstName} ${g.lastName}`,
                sub: g.company ?? g.email,
                status: g.rsvp,
              }))
            : []}
        />
      </div>
    </TooltipProvider>
  );
}

/* ---------- Sub-components ---------- */

function Stat({ icon: Icon, label, value, tone = "default" }: { icon?: any; label: string; value: number; tone?: "default" | "success" | "warning" | "muted" }) {
  const tones: Record<string, string> = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning-foreground",
    muted: "text-muted-foreground",
  };
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />} {label}
      </div>
      <p className={cn("text-base font-semibold leading-none tabular-nums", tones[tone])}>{value}</p>
    </div>
  );
}

function SummaryChip({ count, tone, label }: { count: number; tone: "success" | "muted" | "destructive"; label: string }) {
  if (count === 0) return null;
  const map: Record<string, string> = {
    success: "bg-success/15 text-success border-success/30",
    muted: "bg-muted text-muted-foreground border-border",
    destructive: "bg-destructive/10 text-destructive border-destructive/30",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium", map[tone])}>
      +{count} {label}
    </span>
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
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-medium", map[status])}>
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
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-medium", map[status])}>
      {Icon && <Icon className="h-3 w-3 shrink-0" />}
      {inviteLabel[status]}
    </span>
  );
}

function GuestFlags({ dietary, access }: { dietary?: string; access?: string }) {
  const hasDietary = dietary && dietary !== "—";
  const hasAccess = access && access !== "—";
  if (!hasDietary && !hasAccess) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {hasDietary && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
              <UtensilsCrossed className="h-2.5 w-2.5" /> Dietary
            </span>
          </TooltipTrigger>
          <TooltipContent>{dietary}</TooltipContent>
        </Tooltip>
      )}
      {hasAccess && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
              <Accessibility className="h-2.5 w-2.5" /> Access
            </span>
          </TooltipTrigger>
          <TooltipContent>{access}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
