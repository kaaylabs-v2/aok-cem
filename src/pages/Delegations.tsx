import { useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UsersTabs } from "@/components/users/UsersTabs";
import { CreateDelegationDialog } from "@/components/delegations/CreateDelegationDialog";
import { BulkAssignmentDialog } from "@/components/delegations/BulkAssignmentDialog";
import { DelegationDetailDrawer } from "@/components/delegations/DelegationDetailDrawer";
import { SuspendRemoveDialog } from "@/components/delegations/SuspendRemoveDialog";
import {
  DELEGATIONS, DelegationRelationship, countPermissions, relationshipType,
  summariseDelegations, principalLabel,
} from "@/data/delegations";
import { APPROVAL_TIER_LABEL, DEPARTMENTS, USERS, userById, userFullName } from "@/data/users";
import { NotificationItem } from "@/data/portfolio";
import {
  UserCog, Users, Crown, Network, GitBranch, Clock,
  Plus, Layers, Download, Search, Eye, PauseCircle, PlayCircle, Trash2,
} from "lucide-react";
import { toast } from "sonner";

function downloadCsv(rows: DelegationRelationship[]) {
  const headers = ["ID","Delegated Booker","Principal","Relationship Type","Permissions","Active Bookings","Approval Tier","Created By","Last Modified","Status"];
  const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) => [
    r.id,
    userById(r.paUserId)?.email ?? r.paUserId,
    userById(r.principalUserId)?.email ?? r.principalUserId,
    relationshipType(r),
    countPermissions(r.permissions).toString(),
    r.activeBookings.toString(),
    APPROVAL_TIER_LABEL[userById(r.principalUserId)?.approvalTier ?? "none"],
    principalLabel(r.createdById),
    r.lastModifiedAt,
    r.status,
  ].map((v) => esc(String(v))).join(","));
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `delegations-${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

const Delegations = () => {
  const { pathname } = useLocation();
  const [list, setList] = useState<DelegationRelationship[]>(DELEGATIONS);
  const [paF, setPaF] = useState("all");
  const [prF, setPrF] = useState("all");
  const [deptF, setDeptF] = useState("all");
  const [statusF, setStatusF] = useState("all");
  const [scopeF, setScopeF] = useState("all");
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [detail, setDetail] = useState<DelegationRelationship | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirm, setConfirm] = useState<{ rel: DelegationRelationship; mode: "suspend" | "remove" | "reactivate" } | null>(null);

  const kpis = useMemo(() => summariseDelegations(list), [list]);

  const filtered = useMemo(() => {
    let r = list;
    if (paF !== "all") r = r.filter((d) => d.paUserId === paF);
    if (prF !== "all") r = r.filter((d) => d.principalUserId === prF);
    if (deptF !== "all") r = r.filter((d) => userById(d.principalUserId)?.department === deptF);
    if (statusF !== "all") r = r.filter((d) => d.status === statusF);
    if (scopeF !== "all") {
      r = r.filter((d) => {
        if (scopeF === "full") return countPermissions(d.permissions) >= 10;
        if (scopeF === "bookings") return d.permissions.createBookings && !d.permissions.addGuests;
        if (scopeF === "guests") return d.permissions.addGuests && !d.permissions.createBookings;
        return true;
      });
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((d) => {
        const pa = userById(d.paUserId);
        const pr = userById(d.principalUserId);
        return (pa && userFullName(pa).toLowerCase().includes(q)) ||
               (pr && userFullName(pr).toLowerCase().includes(q));
      });
    }
    return r;
  }, [list, paF, prF, deptF, statusF, scopeF, query]);

  const handleCreate = (newRels: DelegationRelationship[]) =>
    setList((xs) => [...newRels, ...xs]);

  const performAction = () => {
    if (!confirm) return;
    const { rel, mode } = confirm;
    setList((xs) => {
      if (mode === "remove") return xs.filter((d) => d.id !== rel.id);
      const status = mode === "suspend" ? "suspended" : "active";
      return xs.map((d) => d.id === rel.id ? { ...d, status, lastModifiedAt: new Date().toISOString() } : d);
    });
    toast.success(
      mode === "remove" ? "Delegation removed" :
      mode === "suspend" ? "Delegation suspended" : "Delegation reactivated"
    );
    setConfirm(null);
    setDetailOpen(false);
  };

  const onOpenNotification = (_n: NotificationItem) => {};

  return (
    <>
      <AppShell onOpenNotification={onOpenNotification}>
        <div className="space-y-6">
          <UsersTabs currentPath={pathname} />

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Delegation Relationships</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage booking-on-behalf permissions between Delegated Bookers (PAs) and Principals.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> Create Delegation</Button>
              <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)}><Layers className="mr-1.5 h-4 w-4" /> Bulk Assignment</Button>
              <Button size="sm" variant="outline" onClick={() => downloadCsv(filtered)}><Download className="mr-1.5 h-4 w-4" /> Export Relationships</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard icon={UserCog}  label="Active Delegations"      value={kpis.active}             sub="In effect"   trend={4} variant="sparkline" />
            <StatCard icon={Users}    label="Delegated Bookers"       value={kpis.delegatedBookers}   sub="Unique PAs"  trend={2} variant="radial" />
            <StatCard icon={Crown}    label="Principals Covered"      value={kpis.principalsCovered}  sub="Unique"      trend={3} variant="matrix" />
            <StatCard icon={Network}  label="Multi-Principal (1→N)"   value={kpis.multiPrincipal}     sub="PA→many"     trend={1} variant="sparkline" />
            <StatCard icon={GitBranch} label="Multi-PA (N→1)"          value={kpis.multiPA}            sub="Many→Prin."  trend={2} variant="gauge" />
            <StatCard icon={Clock}    label="Recently Modified"       value={kpis.recentlyModified}   sub="7 days"      trend={1} variant="sparkline" />
          </div>

          {/* Filters */}
          <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-xs">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-4">
              <div className="relative lg:col-span-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search PA or Principal…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
              </div>
              <Select value={paF} onValueChange={setPaF}>
                <SelectTrigger><SelectValue placeholder="Delegated Booker" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All PAs</SelectItem>{USERS.map((u) => <SelectItem key={u.id} value={u.id}>{userFullName(u)}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={prF} onValueChange={setPrF}>
                <SelectTrigger><SelectValue placeholder="Principal" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All principals</SelectItem>{USERS.map((u) => <SelectItem key={u.id} value={u.id}>{userFullName(u)}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={deptF} onValueChange={setDeptF}>
                <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All departments</SelectItem>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={statusF} onValueChange={setStatusF}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={scopeF} onValueChange={setScopeF}>
                <SelectTrigger><SelectValue placeholder="Permission Scope" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any scope</SelectItem>
                  <SelectItem value="full">Full access</SelectItem>
                  <SelectItem value="bookings">Bookings only</SelectItem>
                  <SelectItem value="guests">Guests only</SelectItem>
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
                    <th className="px-3 py-3">Delegated Booker</th>
                    <th className="px-3 py-3">Principal</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">Permissions</th>
                    <th className="px-3 py-3 text-right">Active Bookings</th>
                    <th className="px-3 py-3">Approval Tier (Principal)</th>
                    <th className="px-3 py-3">Created By</th>
                    <th className="px-3 py-3">Last Modified</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const pa = userById(r.paUserId);
                    const pr = userById(r.principalUserId);
                    if (!pa || !pr) return null;
                    const type = relationshipType(r, list);
                    return (
                      <tr key={r.id} onClick={() => { setDetail(r); setDetailOpen(true); }} className="cursor-pointer border-b border-border/50 transition-colors hover:bg-secondary/40">
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col leading-tight">
                            <Link to={`/users/${pa.id}`} onClick={(e) => e.stopPropagation()} className="text-sm font-medium hover:text-primary">{userFullName(pa)}</Link>
                            <span className="text-[11px] text-muted-foreground">{pa.department}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col leading-tight">
                            <Link to={`/users/${pr.id}`} onClick={(e) => e.stopPropagation()} className="text-sm font-medium hover:text-primary">{userFullName(pr)}</Link>
                            <span className="text-[11px] text-muted-foreground">{pr.position} · {pr.department}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5"><Badge variant="outline" className="text-[10px]">{type}</Badge></td>
                        <td className="px-3 py-2.5"><Badge variant="secondary">{countPermissions(r.permissions)} caps</Badge></td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{r.activeBookings}</td>
                        <td className="px-3 py-2.5 text-xs">{APPROVAL_TIER_LABEL[pr.approvalTier]}</td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{principalLabel(r.createdById)}</td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{new Date(r.lastModifiedAt).toLocaleDateString()}</td>
                        <td className="px-3 py-2.5">
                          <Badge variant="outline" className={r.status === "active" ? "border-success/30 bg-success/10 text-success" : "border-muted bg-muted text-muted-foreground"}>
                            {r.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDetail(r); setDetailOpen(true); }}><Eye className="h-4 w-4" /></Button>
                          {r.status === "active"
                            ? <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setConfirm({ rel: r, mode: "suspend" }); }}><PauseCircle className="h-4 w-4" /></Button>
                            : <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setConfirm({ rel: r, mode: "reactivate" }); }}><PlayCircle className="h-4 w-4" /></Button>}
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setConfirm({ rel: r, mode: "remove" }); }} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={10} className="px-6 py-12 text-center text-sm text-muted-foreground">No delegations match the current filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppShell>

      <CreateDelegationDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={handleCreate} />
      <BulkAssignmentDialog open={bulkOpen} onOpenChange={setBulkOpen} onCreate={handleCreate} />
      <DelegationDetailDrawer
        rel={detail}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onSuspend={(r) => setConfirm({ rel: r, mode: "suspend" })}
        onReactivate={(r) => setConfirm({ rel: r, mode: "reactivate" })}
        onRemove={(r) => setConfirm({ rel: r, mode: "remove" })}
      />
      {confirm && (
        <SuspendRemoveDialog
          open={!!confirm}
          onOpenChange={(o) => !o && setConfirm(null)}
          mode={confirm.mode}
          paName={userFullName(userById(confirm.rel.paUserId)!)}
          principalName={userFullName(userById(confirm.rel.principalUserId)!)}
          onConfirm={performAction}
        />
      )}
    </>
  );
};

export default Delegations;
