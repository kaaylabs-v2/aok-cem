import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import {
  DELEGATIONS, getPAsForPrincipal, countPermissions, PERMISSION_GROUPS, PERMISSION_LABEL,
} from "@/data/delegations";
import { APPROVAL_TIER_LABEL, userById, userFullName } from "@/data/users";
import { EntitlementSummary } from "@/components/users/EntitlementSummary";
import { NotificationItem } from "@/data/portfolio";

const DelegationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const rel = DELEGATIONS.find((d) => d.id === id);
  const principal = rel ? userById(rel.principalUserId) : undefined;
  const allForPrincipal = useMemo(
    () => (principal ? getPAsForPrincipal(principal.id, DELEGATIONS) : []),
    [principal],
  );

  if (!rel || !principal) {
    return (
      <AppShell onOpenNotification={() => {}}>
        <p className="text-sm text-muted-foreground">Delegation not found.</p>
        <Button asChild variant="outline" size="sm" className="mt-3"><Link to="/users/delegations">Back</Link></Button>
      </AppShell>
    );
  }

  return (
    <AppShell onOpenNotification={(_n: NotificationItem) => {}}>
      <div className="space-y-6">
        <div>
          <Link to="/users/delegations" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-3 w-3" /> Back to delegations
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Delegation Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">Principal-centric view: all PAs that can act for {userFullName(principal)}.</p>
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
            <h3 className="mb-3 text-sm font-semibold">Principal Information</h3>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Name</dt>          <dd className="font-medium">{userFullName(principal)}</dd>
              <dt className="text-muted-foreground">Department</dt>    <dd>{principal.department}</dd>
              <dt className="text-muted-foreground">Position</dt>      <dd>{principal.position}</dd>
              <dt className="text-muted-foreground">Seniority</dt>     <dd>{principal.seniority}</dd>
              <dt className="text-muted-foreground">Approval Tier</dt> <dd><Badge variant="secondary">{APPROVAL_TIER_LABEL[principal.approvalTier]}</Badge></dd>
            </dl>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
            <h3 className="mb-3 text-sm font-semibold">Entitlements</h3>
            <EntitlementSummary ent={principal.entitlements} />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs">
          <div className="border-b border-border/60 px-4 py-3">
            <h3 className="text-sm font-semibold">Assigned Delegated Bookers ({allForPrincipal.length})</h3>
            <p className="text-xs text-muted-foreground">Each PA can have different permissions; each relationship is managed independently.</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/40 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Department</th>
                <th className="px-3 py-3">Permissions</th>
                <th className="px-3 py-3 text-right">Active Bookings</th>
                <th className="px-3 py-3">Last Action</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {allForPrincipal.map((d) => {
                const pa = userById(d.paUserId);
                if (!pa) return null;
                return (
                  <tr key={d.id} className="border-b border-border/50">
                    <td className="px-3 py-2.5">
                      <Link to={`/users/delegations/${d.id}`} className="font-medium hover:text-primary">{userFullName(pa)}</Link>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{pa.department}</td>
                    <td className="px-3 py-2.5"><Badge variant="secondary">{countPermissions(d.permissions)} caps</Badge></td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{d.activeBookings}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{new Date(d.lastActionAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant="outline" className={d.status === "active" ? "border-success/30 bg-success/10 text-success" : "border-muted bg-muted text-muted-foreground"}>{d.status}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
          <h3 className="mb-3 text-sm font-semibold">Current Relationship Permissions</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {PERMISSION_GROUPS.map((g) => (
              <div key={g.label} className="rounded-lg border border-border/60 p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g.label}</div>
                <ul className="space-y-1 text-sm">
                  {g.keys.map((k) => (
                    <li key={k} className="flex items-center justify-between">
                      <span>{PERMISSION_LABEL[k]}</span>
                      <Badge variant={rel.permissions[k] ? "default" : "outline"} className="text-[10px]">
                        {rel.permissions[k] ? "Granted" : "—"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
};

export default DelegationDetail;
