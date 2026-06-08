import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { UsersTabs } from "@/components/users/UsersTabs";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CreateUserDialog } from "@/components/users/CreateUserDialog";
import { BulkImportDialog } from "@/components/users/BulkImportDialog";
import { DeactivateUserDialog } from "@/components/users/DeactivateUserDialog";
import {
  USERS, USER_GROUPS, User, APPROVAL_TIER_LABEL, groupById, userFullName,
  DEPARTMENTS, SENIORITIES,
} from "@/data/users";
import { NotificationItem, events as allEvents, PortfolioEvent } from "@/data/portfolio";
import { EventDrawer } from "@/components/EventDrawer";
import {
  UserCheck, Mail, Users as UsersIcon, ShieldCheck, UserX, KeyRound,
  Search, UserPlus, Upload, FolderPlus, Download, Eye, MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_BADGE: Record<User["status"], string> = {
  active: "bg-success/10 text-success border-success/30",
  pending: "bg-warning/10 text-warning border-warning/30",
  inactive: "bg-muted text-muted-foreground border-border",
};

const Users = () => {
  const { pathname } = useLocation();
  const [list, setList] = useState<User[]>(USERS);
  const [query, setQuery] = useState("");
  const [groupF, setGroupF] = useState("all");
  const [deptF, setDeptF] = useState("all");
  const [senF, setSenF] = useState("all");
  const [statusF, setStatusF] = useState("all");
  const [approverF, setApproverF] = useState("all");
  const [ssoF, setSsoF] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [deactivate, setDeactivate] = useState<User | null>(null);

  const [evDrawer, setEvDrawer] = useState<PortfolioEvent | null>(null);
  const [evOpen, setEvOpen] = useState(false);
  const onOpenNotification = (n: NotificationItem) => {
    if (n.eventId) {
      const ev = allEvents.find((e) => e.id === n.eventId);
      if (ev) { setEvDrawer(ev); setEvOpen(true); }
    }
  };

  const filtered = useMemo(() => {
    let r = list;
    if (groupF !== "all") r = r.filter((u) => u.groupId === groupF);
    if (deptF !== "all") r = r.filter((u) => u.department === deptF);
    if (senF !== "all") r = r.filter((u) => u.seniority === senF);
    if (statusF !== "all") r = r.filter((u) => u.status === statusF);
    if (approverF !== "all") r = r.filter((u) => approverF === "yes" ? u.approvalTier !== "none" : u.approvalTier === "none");
    if (ssoF !== "all") r = r.filter((u) => ssoF === "yes" ? u.ssoEnabled : !u.ssoEnabled);
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((u) =>
        userFullName(u).toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
      );
    }
    return r;
  }, [list, query, groupF, deptF, senF, statusF, approverF, ssoF]);

  const kpis = useMemo(() => ({
    active: list.filter((u) => u.status === "active").length,
    pending: list.filter((u) => u.status === "pending").length,
    groups: USER_GROUPS.length,
    approvers: list.filter((u) => u.approvalTier !== "none").length,
    inactive: list.filter((u) => u.status === "inactive").length,
    sso: list.filter((u) => u.ssoEnabled).length,
  }), [list]);

  const handleCreate = (u: User) => setList((xs) => [u, ...xs]);
  const confirmDeactivate = () => {
    if (!deactivate) return;
    setList((xs) => xs.map((u) => (u.id === deactivate.id ? { ...u, status: "inactive" } : u)));
    toast.success(`${userFullName(deactivate)} deactivated`);
    setDeactivate(null);
  };

  return (
    <>
      <AppShell onOpenNotification={onOpenNotification}>
        <div className="space-y-6">
          <UsersTabs currentPath={pathname} />
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Users &amp; Permissions</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage onboarding, capability-based permissions, approval routing, seniority and entitlements.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={() => setCreateOpen(true)}><UserPlus className="mr-1.5 h-4 w-4" /> Create User</Button>
              <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)}><Upload className="mr-1.5 h-4 w-4" /> Bulk Import</Button>
              <Button size="sm" variant="outline" asChild><Link to="/users/groups"><FolderPlus className="mr-1.5 h-4 w-4" /> Create User Group</Link></Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Directory export queued")}><Download className="mr-1.5 h-4 w-4" /> Export Directory</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard icon={UserCheck}   label="Active Users"        value={kpis.active}    sub="In platform"  trend={3}  variant="sparkline" />
            <StatCard icon={Mail}        label="Pending Invites"     value={kpis.pending}   sub="Awaiting"     trend={1}  variant="matrix" />
            <StatCard icon={UsersIcon}   label="User Groups"         value={kpis.groups}    sub="Configured"   trend={0}  variant="radial" />
            <StatCard icon={ShieldCheck} label="Approvers"           value={kpis.approvers} sub="With rights"  trend={2}  variant="sparkline" />
            <StatCard icon={UserX}       label="Deactivated"         value={kpis.inactive}  sub="No access"    trend={-1} variant="matrix" />
            <StatCard icon={KeyRound}    label="SSO Connected"       value={kpis.sso}       sub="Azure AD"     trend={4}  variant="gauge" />
          </div>

          {/* Filters */}
          <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-xs">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-4">
              <div className="relative lg:col-span-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search name or email…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
              </div>
              <Select value={groupF} onValueChange={setGroupF}>
                <SelectTrigger><SelectValue placeholder="User Group" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All groups</SelectItem>{USER_GROUPS.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={deptF} onValueChange={setDeptF}>
                <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All departments</SelectItem>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={senF} onValueChange={setSenF}>
                <SelectTrigger><SelectValue placeholder="Seniority" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All seniorities</SelectItem>{SENIORITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={statusF} onValueChange={setStatusF}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={approverF} onValueChange={setApproverF}>
                <SelectTrigger><SelectValue placeholder="Approver" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="yes">Approvers only</SelectItem>
                  <SelectItem value="no">Non-approvers</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ssoF} onValueChange={setSsoF}>
                <SelectTrigger><SelectValue placeholder="SSO" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="yes">SSO enabled</SelectItem>
                  <SelectItem value="no">SSO disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Directory table */}
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs">
            <div className="max-h-[640px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-secondary/60 backdrop-blur">
                  <tr className="border-b border-border/60 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Department</th>
                    <th className="px-3 py-3">Seniority</th>
                    <th className="px-3 py-3">Group</th>
                    <th className="px-3 py-3 text-center">Permissions</th>
                    <th className="px-3 py-3">Approval Tier</th>
                    <th className="px-3 py-3 w-48">Entitlement Usage</th>
                    <th className="px-3 py-3">Last Login</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const grp = groupById(u.groupId);
                    const usage = u.entitlements.maxBookings ? Math.round((u.entitlements.usedBookings / u.entitlements.maxBookings) * 100) : 0;
                    return (
                      <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="px-3 py-2.5 font-medium">
                          <Link to={`/users/${u.id}`} className="hover:text-primary">{userFullName(u)}</Link>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{u.email}</td>
                        <td className="px-3 py-2.5">{u.department}</td>
                        <td className="px-3 py-2.5"><Badge variant="secondary">{u.seniority}</Badge></td>
                        <td className="px-3 py-2.5 text-xs">{grp?.name ?? "—"}</td>
                        <td className="px-3 py-2.5 text-center"><Badge variant="outline">{u.capabilities.length}</Badge></td>
                        <td className="px-3 py-2.5 text-xs">{APPROVAL_TIER_LABEL[u.approvalTier]}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <Progress value={usage} className="h-1.5 flex-1" />
                            <span className="w-9 text-right text-[11px] tabular-nums text-muted-foreground">{usage}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">
                          {new Date(u.lastLogin).toLocaleDateString(undefined, { dateStyle: "medium" })}
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge variant="outline" className={STATUS_BADGE[u.status]}>{u.status}</Badge>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <Button asChild variant="ghost" size="sm"><Link to={`/users/${u.id}`}><Eye className="h-4 w-4" /></Link></Button>
                          {u.status !== "inactive" && (
                            <Button variant="ghost" size="sm" onClick={() => setDeactivate(u)} className="text-destructive hover:text-destructive"><UserX className="h-4 w-4" /></Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={11} className="px-6 py-12 text-center text-sm text-muted-foreground">No users match the current filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppShell>

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={handleCreate} />
      <BulkImportDialog open={bulkOpen} onOpenChange={setBulkOpen} />
      <DeactivateUserDialog
        open={!!deactivate}
        onOpenChange={(o) => !o && setDeactivate(null)}
        userName={deactivate ? userFullName(deactivate) : ""}
        onConfirm={confirmDeactivate}
      />
      <EventDrawer event={evDrawer} open={evOpen} onOpenChange={setEvOpen} />
    </>
  );
};

export default Users;
