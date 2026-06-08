import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DelegationRelationship, PERMISSION_GROUPS, PERMISSION_LABEL, principalLabel } from "@/data/delegations";
import { APPROVAL_TIER_LABEL, userById, userFullName } from "@/data/users";
import { EntitlementSummary } from "@/components/users/EntitlementSummary";
import { Check, X, ShieldAlert, PauseCircle, PlayCircle, Trash2, Clock } from "lucide-react";

interface Props {
  rel: DelegationRelationship | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSuspend: (r: DelegationRelationship) => void;
  onReactivate: (r: DelegationRelationship) => void;
  onRemove: (r: DelegationRelationship) => void;
}

export function DelegationDetailDrawer({ rel, open, onOpenChange, onSuspend, onReactivate, onRemove }: Props) {
  if (!rel) return null;
  const pa = userById(rel.paUserId);
  const principal = userById(rel.principalUserId);
  if (!pa || !principal) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {userFullName(pa)} <span className="text-muted-foreground">→</span> {userFullName(principal)}
          </SheetTitle>
          <SheetDescription>
            {pa.position} acting on behalf of {principal.position}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={rel.status === "active" ? "border-success/30 bg-success/10 text-success" : "border-muted bg-muted text-muted-foreground"}>
            {rel.status}
          </Badge>
          <Badge variant="outline">{APPROVAL_TIER_LABEL[principal.approvalTier]} (Principal)</Badge>
          <Badge variant="secondary">{rel.activeBookings} active bookings</Badge>
        </div>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <section className="rounded-lg border border-border/60 p-3">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Relationship Summary</h4>
              <dl className="grid grid-cols-2 gap-2 text-xs">
                <dt className="text-muted-foreground">Created</dt>
                <dd>{new Date(rel.createdAt).toLocaleDateString()}</dd>
                <dt className="text-muted-foreground">Last modified</dt>
                <dd>{new Date(rel.lastModifiedAt).toLocaleDateString()}</dd>
                <dt className="text-muted-foreground">Last action</dt>
                <dd>{new Date(rel.lastActionAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</dd>
                <dt className="text-muted-foreground">Created by</dt>
                <dd>{principalLabel(rel.createdById)}</dd>
              </dl>
            </section>

            <section className="rounded-lg border border-border/60 p-3">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Approval Routing</h4>
              <p className="flex items-center gap-2 text-xs">
                <ShieldAlert className="h-4 w-4 text-primary" />
                Bookings route via <strong>{userFullName(principal)}</strong> ({APPROVAL_TIER_LABEL[principal.approvalTier]}) — never PA hierarchy.
              </p>
            </section>

            <section className="rounded-lg border border-border/60 p-3">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Principal Entitlement Usage</h4>
              <EntitlementSummary ent={principal.entitlements} />
            </section>
          </TabsContent>

          <TabsContent value="permissions" className="mt-4 space-y-3">
            {PERMISSION_GROUPS.map((g) => (
              <div key={g.label} className="rounded-lg border border-border/60 p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g.label}</div>
                <ul className="space-y-1">
                  {g.keys.map((k) => (
                    <li key={k} className="flex items-center justify-between text-sm">
                      <span>{PERMISSION_LABEL[k]}</span>
                      {rel.permissions[k]
                        ? <Check className="h-4 w-4 text-success" />
                        : <X className="h-4 w-4 text-muted-foreground" />}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <ol className="space-y-3 border-l border-border/60 pl-4">
              {[
                { t: "Created booking BK-2241 (Chelsea vs Arsenal)", d: rel.lastActionAt },
                { t: "Added 4 guests to BK-2241", d: new Date(Date.now() - 86400000).toISOString() },
                { t: "Resent invite for John Doe", d: new Date(Date.now() - 2 * 86400000).toISOString() },
                { t: "Permission modified by CEM admin", d: rel.lastModifiedAt },
                { t: "Delegation created", d: rel.createdAt },
              ].map((e, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[1.4rem] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                  <p className="text-sm">{e.t}</p>
                  <p className="text-[11px] text-muted-foreground"><Clock className="mr-1 inline h-3 w-3" />{new Date(e.d).toLocaleString()}</p>
                </li>
              ))}
            </ol>
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            <div className="rounded-lg border border-border/60 p-3 text-xs text-muted-foreground">
              All actions performed under this delegation are recorded in the central <a href="/audit" className="text-primary hover:underline">Audit Trail</a>, tagged with PA + "Acting for" Principal. Filter by "Delegated only" + this principal to scope.
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-5" />
        <div className="flex flex-wrap items-center justify-end gap-2">
          {rel.status === "active"
            ? <Button variant="outline" size="sm" onClick={() => onSuspend(rel)}><PauseCircle className="mr-1.5 h-4 w-4" /> Suspend</Button>
            : <Button variant="outline" size="sm" onClick={() => onReactivate(rel)}><PlayCircle className="mr-1.5 h-4 w-4" /> Reactivate</Button>}
          <Button variant="outline" size="sm" onClick={() => onRemove(rel)} className="text-destructive hover:text-destructive">
            <Trash2 className="mr-1.5 h-4 w-4" /> Remove
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
