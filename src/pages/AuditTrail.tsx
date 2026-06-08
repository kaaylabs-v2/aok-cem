import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { UsersTabs } from "@/components/users/UsersTabs";
import { StatCard } from "@/components/StatCard";
import { AuditDetailDrawer } from "@/components/AuditDetailDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Activity, UserPlus, UserMinus, PenSquare, Server, UserCog,
  Search, Download, FileDown, BookmarkPlus, Lock, ChevronRight, Eye,
} from "lucide-react";
import {
  auditRecords, auditActionTypes, auditRoles, auditUsers, auditBookings, auditEvents,
  AuditRecord, AuditActionType,
} from "@/data/audit";
import { NotificationItem, events as allEvents, PortfolioEvent } from "@/data/portfolio";
import { EventDrawer } from "@/components/EventDrawer";
import { toast } from "sonner";

function downloadCsv(rows: AuditRecord[]) {
  const headers = ["Timestamp","Booking","Event","Guest","Action","Field","Previous","New","User","Role","Acting For","Source","Entry ID"];
  const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) => [
    r.timestamp, r.bookingId, r.eventName, r.guestName, r.actionType,
    r.fieldChanged, r.previousValue, r.newValue, r.userName, r.role,
    r.actingForName ?? "", r.source, r.id,
  ].map((v) => escape(String(v))).join(","));
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `audit-trail-${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

const AuditTrail = () => {
  const { pathname } = useLocation();
  const [query, setQuery] = useState("");
  const [bookingF, setBookingF] = useState("all");
  const [eventF, setEventF] = useState("all");
  const [userF, setUserF] = useState("all");
  const [roleF, setRoleF] = useState("all");
  const [actionF, setActionF] = useState<AuditActionType | "all">("all");
  const [tenantF, setTenantF] = useState("all");
  const [delegated, setDelegated] = useState("all"); // all | yes | no
  const [principalF, setPrincipalF] = useState("all");
  const [rangeF, setRangeF] = useState("all"); // all | 7 | 30 | 90
  const [selected, setSelected] = useState<AuditRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [eventDrawerEvent, setEventDrawerEvent] = useState<PortfolioEvent | null>(null);
  const [eventDrawerOpen, setEventDrawerOpen] = useState(false);

  const principals = useMemo(
    () => Array.from(new Set(auditRecords.map((a) => a.actingForName).filter(Boolean) as string[])),
    [],
  );
  const tenants = useMemo(() => Array.from(new Set(auditRecords.map((a) => a.tenant))), []);

  const filtered = useMemo(() => {
    let r = auditRecords.slice();
    if (bookingF !== "all") r = r.filter((x) => x.bookingId === bookingF);
    if (eventF !== "all") r = r.filter((x) => x.eventName === eventF);
    if (userF !== "all") r = r.filter((x) => x.userName === userF);
    if (roleF !== "all") r = r.filter((x) => x.role === roleF);
    if (actionF !== "all") r = r.filter((x) => x.actionType === actionF);
    if (tenantF !== "all") r = r.filter((x) => x.tenant === tenantF);
    if (delegated === "yes") r = r.filter((x) => !!x.actingForName);
    if (delegated === "no") r = r.filter((x) => !x.actingForName);
    if (principalF !== "all") r = r.filter((x) => x.actingForName === principalF);
    if (rangeF !== "all") {
      const cutoff = Date.now() - parseInt(rangeF, 10) * 86400000;
      r = r.filter((x) => new Date(x.timestamp).getTime() >= cutoff);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((x) =>
        x.guestName.toLowerCase().includes(q) ||
        x.bookingId.toLowerCase().includes(q) ||
        x.userName.toLowerCase().includes(q) ||
        x.eventName.toLowerCase().includes(q),
      );
    }
    return r.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  }, [query, bookingF, eventF, userF, roleF, actionF, tenantF, delegated, principalF, rangeF]);

  const kpis = useMemo(() => {
    const total = auditRecords.length;
    const additions = auditRecords.filter((a) => a.actionType === "Guest Added" || a.actionType === "Bulk Upload").length;
    const removals  = auditRecords.filter((a) => a.actionType === "Guest Removed").length;
    const updates   = auditRecords.filter((a) => ["Dietary Updated","RSVP Changed","Invite Resent","Approval Change"].includes(a.actionType)).length;
    const system    = auditRecords.filter((a) => a.userId === "system").length;
    const delegated = auditRecords.filter((a) => !!a.actingForName).length;
    return { total, additions, removals, updates, system, delegated };
  }, []);

  const onOpenNotification = (n: NotificationItem) => {
    if (n.eventId) {
      const ev = allEvents.find((e) => e.id === n.eventId);
      if (ev) { setEventDrawerEvent(ev); setEventDrawerOpen(true); }
    }
  };

  const openRow = (r: AuditRecord) => { setSelected(r); setDrawerOpen(true); };

  return (
    <>
      <AppShell onOpenNotification={onOpenNotification}>
        <div className="space-y-6">
          <UsersTabs currentPath={pathname} />
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Guest List Audit Trail</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Track every guest list change across bookings for compliance and accountability.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => downloadCsv(filtered)}>
                <Download className="mr-1.5 h-4 w-4" /> Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.success("PDF export queued")}>
                <FileDown className="mr-1.5 h-4 w-4" /> Export PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.success("Saved current filter view")}>
                <BookmarkPlus className="mr-1.5 h-4 w-4" /> Saved Filters
              </Button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard icon={Activity}  label="Total Entries"     value={kpis.total}     sub="All time"  trend={4}   variant="sparkline" />
            <StatCard icon={UserPlus}  label="Guest Additions"   value={kpis.additions} sub="Add + bulk" trend={6}   variant="sparkline" />
            <StatCard icon={UserMinus} label="Guest Removals"    value={kpis.removals}  sub="Removed"   trend={-2}  variant="matrix" />
            <StatCard icon={PenSquare} label="Guest Updates"     value={kpis.updates}   sub="RSVP/diet" trend={3}   variant="sparkline" />
            <StatCard icon={Server}    label="System Actions"    value={kpis.system}    sub="Automated" trend={1}   variant="radial" />
            <StatCard icon={UserCog}   label="Delegated Actions" value={kpis.delegated} sub="On behalf" trend={5}   variant="gauge" />
          </div>

          {/* Filters */}
          <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-xs">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-5">
              <div className="relative lg:col-span-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search guest name, booking ID, or user…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={bookingF} onValueChange={setBookingF}>
                <SelectTrigger><SelectValue placeholder="Booking" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All bookings</SelectItem>
                  {auditBookings.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={eventF} onValueChange={setEventF}>
                <SelectTrigger><SelectValue placeholder="Event" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All events</SelectItem>
                  {auditEvents.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={actionF} onValueChange={(v) => setActionF(v as any)}>
                <SelectTrigger><SelectValue placeholder="Action" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All actions</SelectItem>
                  {auditActionTypes.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={userF} onValueChange={setUserF}>
                <SelectTrigger><SelectValue placeholder="User" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All users</SelectItem>
                  {auditUsers.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={roleF} onValueChange={setRoleF}>
                <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All roles</SelectItem>
                  {auditRoles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={rangeF} onValueChange={setRangeF}>
                <SelectTrigger><SelectValue placeholder="Date range" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tenantF} onValueChange={setTenantF}>
                <SelectTrigger><SelectValue placeholder="Tenant" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All tenants</SelectItem>
                  {tenants.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={delegated} onValueChange={setDelegated}>
                <SelectTrigger><SelectValue placeholder="Delegated" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any booker</SelectItem>
                  <SelectItem value="yes">Delegated only</SelectItem>
                  <SelectItem value="no">Direct only</SelectItem>
                </SelectContent>
              </Select>
              <Select value={principalF} onValueChange={setPrincipalF}>
                <SelectTrigger><SelectValue placeholder="Principal user" /></SelectTrigger>
                <SelectContent><SelectItem value="all">Any principal</SelectItem>
                  {principals.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs">
            <div className="max-h-[640px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-secondary/60 backdrop-blur">
                  <tr className="border-b border-border/60 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-3">Timestamp</th>
                    <th className="px-3 py-3">Booking</th>
                    <th className="px-3 py-3">Event</th>
                    <th className="px-3 py-3">Guest</th>
                    <th className="px-3 py-3">Action</th>
                    <th className="px-3 py-3">Field</th>
                    <th className="px-3 py-3">Previous → New</th>
                    <th className="px-3 py-3">User</th>
                    <th className="px-3 py-3">Role</th>
                    <th className="px-3 py-3">Source</th>
                    <th className="px-3 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const ts = new Date(r.timestamp);
                    return (
                      <tr
                        key={r.id}
                        onClick={() => openRow(r)}
                        className="cursor-pointer border-b border-border/50 transition-colors hover:bg-secondary/40"
                      >
                        <td className="px-3 py-2.5 whitespace-nowrap text-xs text-muted-foreground">
                          {ts.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                        </td>
                        <td className="px-3 py-2.5 text-xs font-mono">{r.bookingId}</td>
                        <td className="px-3 py-2.5 max-w-[200px] truncate">{r.eventName}</td>
                        <td className="px-3 py-2.5">{r.guestName}</td>
                        <td className="px-3 py-2.5"><Badge variant="secondary">{r.actionType}</Badge></td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{r.fieldChanged}</td>
                        <td className="px-3 py-2.5 text-xs">
                          <span className="rounded bg-muted px-1.5 py-0.5 font-mono">{r.previousValue}</span>
                          <span className="mx-1 text-muted-foreground">→</span>
                          <span className="rounded bg-muted px-1.5 py-0.5 font-mono">{r.newValue}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col leading-tight">
                            <span className="text-sm font-medium">{r.userName}</span>
                            {r.actingForName && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-primary">
                                <ChevronRight className="h-3 w-3" /> acting for {r.actingForName}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{r.role}</td>
                        <td className="px-3 py-2.5">
                          <Badge variant="outline" className="gap-1 text-[10px]">
                            <Lock className="h-3 w-3" /> {r.source}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={11} className="px-6 py-12 text-center text-sm text-muted-foreground">No audit entries match the current filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppShell>
      <AuditDetailDrawer record={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
      <EventDrawer event={eventDrawerEvent} open={eventDrawerOpen} onOpenChange={setEventDrawerOpen} />
    </>
  );
};

export default AuditTrail;
