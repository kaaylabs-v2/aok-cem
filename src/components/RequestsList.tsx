import { Fragment, useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle, ArrowDownUp, ArrowDown, ArrowUp, CheckCircle2, XCircle,
  History, Search, Filter, Download, Inbox, Clock, Flame, Flag,
  ChevronRight, ChevronDown, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useRequests, requestApi, BookingRequest, Priority, Seniority,
  FLAG_LABEL, SENIORITY_TONE, RiskFlag,
} from "@/data/requests";
import { Host, HOSTS, hostById, hostInitials, hostName } from "@/data/hosts";
import { guestApi, logAudit } from "@/data/guests";
import { RequestHistoryDrawer } from "./RequestHistoryDrawer";
import { HostSummaryDrawer } from "./HostSummaryDrawer";


interface Props {
  eventId: string;
}

type SortKey = "name" | "company" | "requestedAt" | "seniority" | "position" | "acceptanceRate" | "priority";
type SortDir = "asc" | "desc";

const COLLAPSED_PREVIEW = 2;


const SENIORITY_RANK: Record<Seniority, number> = {
  Partner: 5, Director: 4, VP: 3, Manager: 2, Associate: 1,
};
const PRIORITY_RANK: Record<Priority, number> = { High: 3, Medium: 2, Low: 1 };

export function RequestsList({ eventId }: Props) {
  const all = useRequests(eventId);
  const requests = useMemo(() => all.filter((r) => r.status === "pending"), [all]);

  const [query, setQuery] = useState("");
  const [seniorityF, setSeniorityF] = useState<string>("all");
  const [priorityF, setPriorityF] = useState<string>("all");
  const [deptF, setDeptF] = useState<string>("all");
  const [companyF, setCompanyF] = useState<string>("all");
  const [acceptRange, setAcceptRange] = useState<[number, number]>([0, 100]);
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>("requestedAt");
  const [sortDir, setSortDir] = useState<SortDir>("asc"); // oldest first (FCFS)

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [declineFor, setDeclineFor] = useState<BookingRequest | null>(null);
  const [bulkDeclineOpen, setBulkDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState<string>("");
  const [declineCustom, setDeclineCustom] = useState("");
  const [historyFor, setHistoryFor] = useState<BookingRequest | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState<Set<string>>(new Set());
  const [hostDrawer, setHostDrawer] = useState<Host | null>(null);
  const [hostDrawerOpen, setHostDrawerOpen] = useState(false);
  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  };
  const toggleShowAll = (id: string) => {
    const next = new Set(showAll);
    next.has(id) ? next.delete(id) : next.add(id);
    setShowAll(next);
  };
  const openHost = (h: Host) => { setHostDrawer(h); setHostDrawerOpen(true); };


  const departments = useMemo(
    () => Array.from(new Set(requests.map((r) => r.department))).sort(),
    [requests],
  );
  const companies = useMemo(
    () => Array.from(new Set(requests.map((r) => r.company))).sort(),
    [requests],
  );

  const filtered = useMemo(() => {
    let r = requests;
    if (seniorityF !== "all") r = r.filter((x) => x.seniority === seniorityF);
    if (priorityF !== "all") r = r.filter((x) => x.priority === priorityF);
    if (deptF !== "all") r = r.filter((x) => x.department === deptF);
    if (companyF !== "all") r = r.filter((x) => x.company === companyF);
    r = r.filter((x) => x.acceptanceRate >= acceptRange[0] && x.acceptanceRate <= acceptRange[1]);
    if (flaggedOnly) r = r.filter((x) => x.flags.length > 0);
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((x) =>
        `${x.firstName} ${x.lastName}`.toLowerCase().includes(q) ||
        x.company.toLowerCase().includes(q) ||
        x.email.toLowerCase().includes(q) ||
        x.position.toLowerCase().includes(q) ||
        x.department.toLowerCase().includes(q),
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    return [...r].sort((a, b) => {
      switch (sortKey) {
        case "name": return (`${a.firstName} ${a.lastName}`).localeCompare(`${b.firstName} ${b.lastName}`) * dir;
        case "company": return a.company.localeCompare(b.company) * dir;
        case "requestedAt": return (+new Date(a.requestedAt) - +new Date(b.requestedAt)) * dir;
        case "seniority": return (SENIORITY_RANK[a.seniority] - SENIORITY_RANK[b.seniority]) * dir;
        case "position": return a.position.localeCompare(b.position) * dir;
        case "acceptanceRate": return (a.acceptanceRate - b.acceptanceRate) * dir;
        case "priority": return (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]) * dir;
      }
    });
  }, [requests, seniorityF, priorityF, deptF, companyF, acceptRange, flaggedOnly, query, sortKey, sortDir]);

  const kpis = useMemo(() => ({
    pending: requests.length,
    awaiting: requests.filter((r) => r.flags.length === 0).length,
    high: requests.filter((r) => r.priority === "High").length,
    flagged: requests.filter((r) => r.flags.length > 0).length,
  }), [requests]);

  const flaggedRequests = useMemo(() => requests.filter((r) => r.flags.length > 0).slice(0, 4), [requests]);

  const activeFilterCount =
    (seniorityF !== "all" ? 1 : 0) +
    (priorityF !== "all" ? 1 : 0) +
    (deptF !== "all" ? 1 : 0) +
    (companyF !== "all" ? 1 : 0) +
    (acceptRange[0] !== 0 || acceptRange[1] !== 100 ? 1 : 0) +
    (flaggedOnly ? 1 : 0);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir(["requestedAt", "name", "company"].includes(key) ? "asc" : "desc"); }
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.id)));
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const moveToGuestList = (r: BookingRequest) => {
    guestApi.add(eventId, {
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      company: r.company,
    }, true);
  };

  const handleApprove = (r: BookingRequest) => {
    requestApi.approve(eventId, r.id);
    moveToGuestList(r);
    logAudit(eventId, "Request approved", `${r.firstName} ${r.lastName} · ${r.company}`);
    toast.success("Request approved successfully.");
  };

  const handleDecline = (r: BookingRequest, reason: string) => {
    requestApi.decline(eventId, r.id, reason);
    logAudit(eventId, "Request declined", `${r.firstName} ${r.lastName}`, reason);
    toast.message(`${r.firstName} ${r.lastName} declined`, { description: reason });
  };

  const handleBulkApprove = () => {
    const ids = Array.from(selected);
    const approved = requestApi.bulkApprove(eventId, ids);
    approved.forEach(moveToGuestList);
    logAudit(eventId, "Bulk request approval", `${approved.length} request${approved.length === 1 ? "" : "s"}`);
    toast.success(`${approved.length} request${approved.length === 1 ? "" : "s"} approved`);
    setSelected(new Set());
  };

  const handleExport = () => {
    const rows = filtered.length ? filtered : requests;
    const header = ["Name", "Email", "Company", "Department", "Position", "Seniority", "Group", "Acceptance Rate", "Requested At", "Flags"];
    const csv = [header.join(",")].concat(
      rows.map((r) => [
        `${r.firstName} ${r.lastName}`, r.email, r.company, r.department, r.position,
        r.seniority, r.priority, r.acceptanceRate, r.requestedAt,
        r.flags.map((f) => FLAG_LABEL[f]).join("; "),
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")),
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `requests-${eventId}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} request${rows.length === 1 ? "" : "s"}`);
  };

  const openHistory = (r: BookingRequest) => { setHistoryFor(r); setHistoryOpen(true); };

  const resetFilters = () => {
    setSeniorityF("all"); setPriorityF("all"); setDeptF("all"); setCompanyF("all");
    setAcceptRange([0, 100]); setFlaggedOnly(false);
  };

  const initials = (r: BookingRequest) => (r.firstName[0] + r.lastName[0]).toUpperCase();

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-4">
        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Kpi icon={Inbox} label="Pending Requests" value={kpis.pending} />
          <Kpi icon={Clock} label="Awaiting Review" value={kpis.awaiting} tone="muted" />
          <Kpi icon={Flame} label="Executive" value={kpis.high} tone="danger" />
          <Kpi icon={Flag} label="Flagged" value={kpis.flagged} tone="warning" />
        </div>

        {/* Flagged · Needs Review */}
        {flaggedRequests.length > 0 && (
          <div className="rounded-2xl border border-warning/40 bg-warning/5 p-3">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-warning-foreground" />
              <p className="text-xs font-semibold uppercase tracking-wide text-warning-foreground">Needs Review</p>
              <span className="text-[11px] text-warning-foreground/80">· {flaggedRequests.length} flagged request{flaggedRequests.length === 1 ? "" : "s"}</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {flaggedRequests.map((r) => (
                <button
                  key={r.id}
                  onClick={() => openHistory(r)}
                  className="flex items-start gap-2.5 rounded-xl border border-warning/30 bg-card p-2.5 text-left transition-colors hover:border-warning/50"
                >
                  {/* avatar removed */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.firstName} {r.lastName}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{r.position} · {r.company}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.flags.slice(0, 2).map((f) => (
                        <span key={f} className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-warning-foreground">
                          <AlertTriangle className="h-2.5 w-2.5" /> {FLAG_LABEL[f]}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, company, position…"
              className="h-9 rounded-full border border-border/60 bg-card pl-9 text-xs"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-full border-border/60 bg-card px-3 text-xs">
                <Filter className="h-3.5 w-3.5" /> Filters
                {activeFilterCount > 0 && (
                  <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 space-y-3 p-3">
              <FilterRow label="Seniority" value={seniorityF} onChange={setSeniorityF}
                options={[["all","All"],["Partner","Partner"],["Director","Director"],["VP","VP"],["Manager","Manager"],["Associate","Associate"]]} />
              <FilterRow label="Group" value={priorityF} onChange={setPriorityF}
                options={[["all","All"],["High","Executive"],["Medium","Team"],["Low","Guest"]]} />
              <FilterRow label="Department" value={deptF} onChange={setDeptF}
                options={[["all","All"], ...departments.map((d) => [d, d] as [string,string])]} />
              <FilterRow label="Company" value={companyF} onChange={setCompanyF}
                options={[["all","All"], ...companies.map((c) => [c, c] as [string,string])]} />
              <div>
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Acceptance rate · {acceptRange[0]}–{acceptRange[1]}%
                </Label>
                <Slider value={acceptRange} min={0} max={100} step={1}
                  onValueChange={(v) => setAcceptRange([v[0], v[1]] as [number, number])} className="mt-2" />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-card px-2.5 py-2">
                <Label htmlFor="flagged-only" className="text-xs">Flagged requests only</Label>
                <Switch id="flagged-only" checked={flaggedOnly} onCheckedChange={setFlaggedOnly} />
              </div>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" className="h-8 w-full rounded-lg text-xs" onClick={resetFilters}>
                  Clear all filters
                </Button>
              )}
            </PopoverContent>
          </Popover>

          <Button size="sm" variant="outline" className="h-9 rounded-full" onClick={handleExport}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Export
          </Button>
        </div>

        {/* Bulk action bar */}
        {selected.size > 1 && (
          <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 backdrop-blur">
            <p className="text-xs font-medium text-primary">
              {selected.size} selected
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-8 rounded-full" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
              <Button size="sm" variant="outline" className="h-8 rounded-full" onClick={() => setBulkDeclineOpen(true)}>
                <XCircle className="mr-1.5 h-3.5 w-3.5" /> Bulk Decline
              </Button>
              <Button size="sm" className="h-8 rounded-full bg-gradient-primary shadow-elegant" onClick={handleBulkApprove}>
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Bulk Approve
              </Button>
            </div>
          </div>
        )}

        {/* Grouped host → guest list */}
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          {/* Header bar */}
          <div className="flex items-center gap-2.5 border-b border-border bg-muted/40 px-4 py-2">
            <Checkbox
              checked={filtered.length > 0 && selected.size === filtered.length}
              onCheckedChange={toggleSelectAll}
              aria-label="Select all"
            />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {filtered.length} Pending
            </span>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="ghost" className="h-7 rounded-full px-3 text-[11px]"
                onClick={() => setExpanded(new Set(Array.from(new Set(filtered.map((r) => r.hostId)))))}>
                Expand all
              </Button>
              <Button size="sm" variant="ghost" className="h-7 rounded-full px-3 text-[11px]"
                onClick={() => { setExpanded(new Set()); setShowAll(new Set()); }}>
                Collapse all
              </Button>
            </div>
          </div>

          {/* Column headers */}
          <div className="hidden grid-cols-[minmax(200px,1fr),130px,110px,70px,70px,160px] items-center gap-3 border-b border-border bg-muted/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
            <span>Host / Requester</span>
            <span>Invited By</span>
            <button onClick={() => toggleSort("company")} className={cn("inline-flex items-center gap-1 text-left", sortKey === "company" ? "text-foreground" : "hover:text-foreground")}>
              Company {sortKey === "company" ? (sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowDownUp className="h-3 w-3 opacity-60" />}
            </button>
            <button onClick={() => toggleSort("seniority")} className={cn("inline-flex items-center gap-1 text-left", sortKey === "seniority" ? "text-foreground" : "hover:text-foreground")}>
              Seniority {sortKey === "seniority" ? (sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowDownUp className="h-3 w-3 opacity-60" />}
            </button>
            <button onClick={() => toggleSort("requestedAt")} className={cn("inline-flex items-center gap-1 text-left", sortKey === "requestedAt" ? "text-foreground" : "hover:text-foreground")}>
              Date {sortKey === "requestedAt" ? (sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowDownUp className="h-3 w-3 opacity-60" />}
            </button>
            <span className="text-right">Actions</span>
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No pending requests match this view
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {(() => {
                // Group filtered requests by hostId, preserving the current sort
                // order within each host group.
                const map = new Map<string, BookingRequest[]>();
                for (const r of filtered) {
                  const list = map.get(r.hostId) ?? [];
                  list.push(r);
                  map.set(r.hostId, list);
                }
                const groups = Array.from(map.entries()).map(([hid, items]) => ({
                  host: hostById(hid) ?? HOSTS[0],
                  items,
                }));
                return groups.map(({ host, items }) => {
                  const isOpen = expanded.has(host.id);
                  const visibleItems = showAll.has(host.id) ? items : items.slice(0, COLLAPSED_PREVIEW);
                  const hiddenCount = items.length - visibleItems.length;
                  const allSelected = items.every((i) => selected.has(i.id));
                  const someSelected = items.some((i) => selected.has(i.id));
                  const hostCtxFlags = Array.from(new Set(items.flatMap((i) => i.flags)));
                  const allHostFlags = Array.from(new Set([...host.flags, ...hostCtxFlags]));

                  return (
                    <li key={host.id}>
                      {/* Host row */}
                      <div className={cn("grid grid-cols-[minmax(200px,1fr),130px,110px,70px,70px,160px] items-center gap-3 bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/30",
                        someSelected && "bg-primary/5")}>
                        <div className="flex min-w-0 items-center gap-2">
                          <button onClick={() => toggleExpand(host.id)}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md hover:bg-muted"
                            aria-label={isOpen ? "Collapse" : "Expand"}>
                            {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          </button>
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={() => {
                              const next = new Set(selected);
                              if (allSelected) items.forEach((i) => next.delete(i.id));
                              else items.forEach((i) => next.add(i.id));
                              setSelected(next);
                            }}
                            aria-label="Select host group"
                          />
                          <button onClick={() => openHost(host)} className="min-w-0 flex-1 text-left">
                            <p className="truncate text-sm font-semibold">{hostName(host)}</p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {items.length} guest request{items.length === 1 ? "" : "s"}
                            </p>
                            {allHostFlags.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {allHostFlags.slice(0, 2).map((f) => <FlagChip key={f} flag={f} />)}
                                {allHostFlags.length > 2 && (
                                  <span className="inline-flex items-center rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                    +{allHostFlags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </button>
                        </div>
                        <div className="min-w-0 text-xs text-muted-foreground">
                          —
                        </div>
                        <div className="min-w-0 truncate text-xs text-muted-foreground">
                          {items.length} compan{items.length === 1 ? "y" : "ies"}
                        </div>
                        <div>
                          <span className={cn("inline-flex items-center rounded-full border px-1.5 py-px text-[10px] font-medium", SENIORITY_TONE[host.seniority])}>
                            {host.seniority}
                          </span>
                        </div>
                        <div className="text-xs tabular-nums text-muted-foreground">
                          {new Date(items[0].requestedAt).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}
                        </div>
                        <div className="flex shrink-0 items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="outline" className="h-7 w-7 shrink-0 rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  const next = new Set<string>(items.map((i) => i.id));
                                  setSelected(next);
                                  setBulkDeclineOpen(true);
                                }}>
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Decline all</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" className="h-7 w-7 shrink-0 rounded-lg bg-success text-white shadow-sm hover:bg-success/90"
                                onClick={() => {
                                  const ids = items.map((i) => i.id);
                                  const approved = requestApi.bulkApprove(eventId, ids);
                                  approved.forEach(moveToGuestList);
                                  logAudit(eventId, "Bulk request approval", `${approved.length} guest${approved.length === 1 ? "" : "s"} for ${hostName(host)}`);
                                  toast.success(`Approved ${approved.length} guest${approved.length === 1 ? "" : "s"} for ${hostName(host)}`);
                                }}>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Approve all</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      {/* Guest request rows */}
                      {isOpen && (
                        <ul className="divide-y divide-border/60 bg-background">
                          {visibleItems.map((r) => {
                            const d = new Date(r.requestedAt);
                            const uniqueFlags = r.flags.filter((f) => !host.flags.includes(f));
                            return (
                              <li key={r.id} className={cn("grid grid-cols-[minmax(200px,1fr),130px,110px,70px,70px,160px] items-center gap-3 px-4 py-2.5 text-sm",
                                selected.has(r.id) && "bg-primary/5")}>
                                <div className="flex min-w-0 items-start gap-2 pl-8">
                                  <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleOne(r.id)} className="mt-0.5" />
                                  <span className="mt-0.5 text-muted-foreground">↳</span>
                                  <div className="min-w-0">
                                    <p className="truncate font-medium leading-tight">{r.firstName} {r.lastName}</p>
                                    <p className="truncate text-[11px] text-muted-foreground">{r.position}</p>
                                    {uniqueFlags.length > 0 && (
                                      <div className="mt-1 flex flex-wrap gap-1">
                                        {uniqueFlags.slice(0, 2).map((f) => <FlagChip key={f} flag={f} />)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-[11px] text-muted-foreground">
                                  <p className="truncate">{hostName(host)}</p>
                                  <p className="truncate text-[10px]">{host.department}</p>
                                </div>
                                <div className="min-w-0 truncate text-xs text-foreground">{r.company}</div>
                                <div>
                                  <span className={cn("inline-flex items-center rounded-full border px-1.5 py-px text-[10px] font-medium", SENIORITY_TONE[r.seniority])}>
                                    {r.seniority}
                                  </span>
                                </div>
                                <div className="text-xs leading-tight tabular-nums text-muted-foreground">
                                  <p>{d.toLocaleDateString(undefined, { day: "2-digit", month: "short" })}</p>
                                  <p className="text-[10px]">{d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</p>
                                </div>
                                <div className="flex shrink-0 items-center justify-end gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => openHistory(r)}>
                                        <History className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>History</TooltipContent>
                                  </Tooltip>
                                  <Button size="sm" variant="outline" className="h-7 shrink-0 rounded-lg border-destructive/40 px-2 text-[11px] font-semibold text-destructive hover:bg-destructive/10" onClick={() => setDeclineFor(r)}>
                                    Decline
                                  </Button>
                                  <Button size="sm" className="h-7 shrink-0 rounded-lg bg-success px-2 text-[11px] font-semibold text-white shadow-sm hover:bg-success/90" onClick={() => handleApprove(r)}>
                                    Approve
                                  </Button>
                                </div>
                              </li>
                            );
                          })}
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
                });
              })()}
            </ul>
          )}
        </div>





        <p className="text-[11px] text-muted-foreground">
          Sorted by {sortKey === "requestedAt" ? "request date" : sortKey} ({sortDir === "asc" ? "ascending" : "descending"}).
          Default order follows First Come First Served. Approved requests move to the Guest List automatically.
        </p>

        {/* Decline dialog (single) */}
        <DeclineDialog
          open={!!declineFor}
          title={declineFor ? `Decline ${declineFor.firstName} ${declineFor.lastName}?` : ""}
          onOpenChange={(o) => { if (!o) { setDeclineFor(null); setDeclineReason(""); setDeclineCustom(""); } }}
          reason={declineReason}
          setReason={setDeclineReason}
          custom={declineCustom}
          setCustom={setDeclineCustom}
          onConfirm={() => {
            const finalReason = declineReason === "Other" ? declineCustom.trim() : declineReason;
            if (!finalReason) { toast.error("Decline reason is required"); return; }
            if (declineFor) handleDecline(declineFor, finalReason);
            setDeclineFor(null); setDeclineReason(""); setDeclineCustom("");
          }}
        />

        {/* Decline dialog (bulk) */}
        <DeclineDialog
          open={bulkDeclineOpen}
          title={`Decline ${selected.size} request${selected.size === 1 ? "" : "s"}?`}
          onOpenChange={(o) => { if (!o) { setBulkDeclineOpen(false); setDeclineReason(""); setDeclineCustom(""); } }}
          reason={declineReason}
          setReason={setDeclineReason}
          custom={declineCustom}
          setCustom={setDeclineCustom}
          onConfirm={() => {
            const finalReason = declineReason === "Other" ? declineCustom.trim() : declineReason;
            if (!finalReason) { toast.error("Decline reason is required"); return; }
            const declined = requestApi.bulkDecline(eventId, Array.from(selected), finalReason);
            logAudit(eventId, "Bulk request decline", `${declined.length} request${declined.length === 1 ? "" : "s"}`, finalReason);
            toast.message(`${declined.length} request${declined.length === 1 ? "" : "s"} declined`, { description: finalReason });
            setSelected(new Set());
            setBulkDeclineOpen(false); setDeclineReason(""); setDeclineCustom("");
          }}
        />

        <RequestHistoryDrawer request={historyFor} open={historyOpen} onOpenChange={setHistoryOpen} />

        <HostSummaryDrawer
          host={hostDrawer}
          context="requests"
          open={hostDrawerOpen}
          onOpenChange={setHostDrawerOpen}
          guestCount={hostDrawer ? requests.filter((r) => r.hostId === hostDrawer.id).length : 0}
          breakdown={hostDrawer
            ? requests.filter((r) => r.hostId === hostDrawer.id).map((r) => ({
                id: r.id,
                label: `${r.firstName} ${r.lastName}`,
                sub: `${r.company} · ${r.position}`,
              }))
            : []}
          contextFlags={hostDrawer ? Array.from(new Set(requests.filter((r) => r.hostId === hostDrawer.id).flatMap((r) => r.flags))) : []}
        />

      </div>
    </TooltipProvider>
  );
}

/* ---------- Sub-components ---------- */

function Kpi({ icon: Icon, label, value, tone = "default" }: { icon: any; label: string; value: number; tone?: "default" | "muted" | "warning" | "danger" }) {
  const tones: Record<string, string> = {
    default: "text-primary",
    muted: "text-muted-foreground",
    warning: "text-warning-foreground",
    danger: "text-destructive",
  };
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className={cn("text-base font-semibold leading-none tabular-nums", tones[tone])}>{value}</p>
    </div>
  );
}

function FilterRow({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div>
      <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-1 h-9 rounded-lg text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function SortHead({ label, k, sortKey, sortDir, onClick }: { label: string; k: SortKey; sortKey: SortKey; sortDir: SortDir; onClick: (k: SortKey) => void }) {
  const active = sortKey === k;
  const Icon = !active ? ArrowDownUp : sortDir === "asc" ? ArrowUp : ArrowDown;
  return (
    <TableHead className="px-3 text-xs">
      <button onClick={() => onClick(k)} className={cn("inline-flex items-center gap-1 transition-colors", active ? "text-foreground" : "hover:text-foreground")}>
        {label} <Icon className="h-3 w-3 opacity-70" />
      </button>
    </TableHead>
  );
}

function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium", className)}>
      {children}
    </span>
  );
}

function UsageScore({ value }: { value: number }) {
  const tone = value >= 75 ? "text-success" : value >= 50 ? "text-warning-foreground" : "text-destructive";
  const dot = value >= 75 ? "bg-success" : value >= 50 ? "bg-warning" : "bg-destructive";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      <span className={cn("text-xs font-semibold tabular-nums", tone)}>{value}</span>
    </span>
  );
}

function FlagChip({ flag }: { flag: RiskFlag }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-warning-foreground">
          <AlertTriangle className="h-2.5 w-2.5" /> {FLAG_LABEL[flag]}
        </span>
      </TooltipTrigger>
      <TooltipContent>{FLAG_LABEL[flag]} — requires additional review</TooltipContent>
    </Tooltip>
  );
}

function RiskCell({ score, acceptance, flags }: { score: number; acceptance: number; flags: RiskFlag[] }) {
  const tone = score >= 75 ? "success" : score >= 50 ? "warning" : "danger";
  const dot = tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-destructive";
  const txt = tone === "success" ? "text-success" : tone === "warning" ? "text-warning-foreground" : "text-destructive";
  const visible = flags.slice(0, 2);
  const extra = flags.length - visible.length;
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <div className="flex items-center gap-1.5 text-[11px]">
        <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
        <span className={cn("font-semibold tabular-nums", txt)}>Score {score}</span>
        <span className="text-muted-foreground">· {acceptance}%</span>
      </div>
      {visible.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {visible.map((f) => <FlagChip key={f} flag={f} />)}
          {extra > 0 && (
            <span className="inline-flex items-center rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              +{extra} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function ExpandStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground truncate">{sub}</p>}
    </div>
  );
}

const DECLINE_REASONS = [
  "Capacity constraints",
  "Priority allocation",
  "Eligibility criteria",
  "Compliance / risk review",
  "Other",
];

function DeclineDialog({ open, title, onOpenChange, reason, setReason, custom, setCustom, onConfirm }: {
  open: boolean; title: string;
  onOpenChange: (o: boolean) => void;
  reason: string; setReason: (s: string) => void;
  custom: string; setCustom: (s: string) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            A reason is required. The requester will be notified and the action recorded in the audit trail.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="mt-1 h-9 rounded-lg text-xs">
                <SelectValue placeholder="Select a reason…" />
              </SelectTrigger>
              <SelectContent>
                {DECLINE_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {reason === "Other" && (
            <div>
              <Label className="text-xs">Custom reason</Label>
              <Textarea
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Describe the reason for declining…"
                className="mt-1 min-h-[80px] rounded-lg text-sm"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={onConfirm}>
            Confirm decline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
