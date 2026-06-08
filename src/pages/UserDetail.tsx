import { useMemo, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PermissionMatrix } from "@/components/users/PermissionMatrix";
import { EntitlementSummary } from "@/components/users/EntitlementSummary";
import { SSOPanel } from "@/components/users/SSOPanel";
import { DeactivateUserDialog } from "@/components/users/DeactivateUserDialog";
import {
  USERS, USER_GROUPS, APPROVAL_TIER_LABEL, ApprovalTier, userById, userFullName, userInitials, User,
} from "@/data/users";
import { auditRecords } from "@/data/audit";
import { ChevronLeft, UserX, Mail, Building2, History, ChevronRight } from "lucide-react";
import { NotificationItem } from "@/data/portfolio";
import { toast } from "sonner";

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const initial = useMemo(() => userById(id ?? ""), [id]);
  const [user, setUser] = useState<User | undefined>(initial);
  const [deactivate, setDeactivate] = useState(false);

  if (!user) return <Navigate to="/users" replace />;

  const userAudit = auditRecords.filter((a) => a.userName === userFullName(user) || a.actingForName === userFullName(user));
  const grp = USER_GROUPS.find((g) => g.id === user.groupId);

  const update = (patch: Partial<User>) => setUser({ ...user, ...patch });

  const onOpenNotification = (_n: NotificationItem) => {};

  return (
    <>
      <AppShell onOpenNotification={onOpenNotification}>
        <div className="space-y-6">
          <div>
            <Link to="/users" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-3 w-3" /> Back to users
            </Link>
          </div>
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-lg font-bold text-primary-foreground shadow-elegant">
                {userInitials(user)}
              </div>
              <div>
                <h1 className="text-xl font-bold">{userFullName(user)}</h1>
                <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" /> {user.email}
                  <span>·</span>
                  <Building2 className="h-3.5 w-3.5" /> {user.department}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{user.seniority}</Badge>
                  <Badge variant="outline">{grp?.name ?? "No group"}</Badge>
                  <Badge variant="outline">{APPROVAL_TIER_LABEL[user.approvalTier]}</Badge>
                  {user.ssoEnabled && <Badge variant="outline" className="border-info/40 bg-info/10 text-info">SSO</Badge>}
                  {user.status === "active" && <Badge variant="outline" className="border-success/40 bg-success/10 text-success">Active</Badge>}
                  {user.status === "pending" && <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning">Pending</Badge>}
                  {user.status === "inactive" && <Badge variant="outline">Inactive</Badge>}
                </div>
              </div>
            </div>
            {user.status !== "inactive" && (
              <Button variant="outline" size="sm" onClick={() => setDeactivate(true)} className="text-destructive hover:text-destructive">
                <UserX className="mr-1.5 h-4 w-4" /> Deactivate User
              </Button>
            )}
          </div>

          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="entitlements">Entitlements</TabsTrigger>
              <TabsTrigger value="approvals">Approvals</TabsTrigger>
              <TabsTrigger value="audit">Audit History</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/60 bg-card p-4">
                <div><Label>Department</Label><Input value={user.department} onChange={(e) => update({ department: e.target.value })} /></div>
                <div><Label>Position</Label><Input value={user.position} onChange={(e) => update({ position: e.target.value })} /></div>
                <div>
                  <Label>User Group</Label>
                  <Select value={user.groupId} onValueChange={(v) => update({ groupId: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{USER_GROUPS.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <label className="flex w-full items-center justify-between rounded-xl border border-border bg-secondary/30 px-3 py-2.5">
                    <span className="text-sm font-medium">SSO Enabled</span>
                    <Switch checked={user.ssoEnabled} onCheckedChange={(v) => update({ ssoEnabled: v })} />
                  </label>
                </div>
              </div>
              <SSOPanel />
            </TabsContent>

            <TabsContent value="permissions" className="mt-4">
              <PermissionMatrix value={user.capabilities} onChange={(caps) => update({ capabilities: caps })} />
            </TabsContent>

            <TabsContent value="entitlements" className="mt-4">
              <div className="rounded-2xl border border-border/60 bg-card p-4">
                <EntitlementSummary ent={user.entitlements} />
              </div>
            </TabsContent>

            <TabsContent value="approvals" className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/60 bg-card p-4">
                <div>
                  <Label>Approval Rights</Label>
                  <Select value={user.approvalTier} onValueChange={(v) => update({ approvalTier: v as ApprovalTier })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{(Object.keys(APPROVAL_TIER_LABEL) as ApprovalTier[]).map((k) => <SelectItem key={k} value={k}>{APPROVAL_TIER_LABEL[k]}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Delegation (acts for)</Label>
                  <Select value={user.delegationFor ?? "none"} onValueChange={(v) => update({ delegationFor: v === "none" ? undefined : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {USERS.filter((u) => u.id !== user.id).map((u) => <SelectItem key={u.id} value={u.id}>{userFullName(u)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="audit" className="mt-4">
              <div className="rounded-2xl border border-border/60 bg-card p-4">
                <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <History className="h-3.5 w-3.5" /> Audit history ({userAudit.length})
                </div>
                {userAudit.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">No audit entries for this user.</p>
                ) : (
                  <ol className="space-y-2">
                    {userAudit.slice(0, 25).map((a) => (
                      <li key={a.id} className="rounded-xl border border-border bg-secondary/30 px-3 py-2.5">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="text-sm font-medium">{a.actionType} · {a.guestName}</p>
                          <time className="shrink-0 text-[11px] text-muted-foreground">
                            {new Date(a.timestamp).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                          </time>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{a.eventName} · {a.bookingId}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          By {a.userName}
                          {a.actingForName && <span className="inline-flex items-center gap-1 text-primary"> <ChevronRight className="h-3 w-3" /> acting for {a.actingForName}</span>}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </TabsContent>

            <TabsContent value="bookings" className="mt-4">
              <div className="rounded-2xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">
                Bookings owned by {userFullName(user)} will be listed here.
              </div>
            </TabsContent>
            <TabsContent value="enquiries" className="mt-4">
              <div className="rounded-2xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">
                Enquiries submitted by {userFullName(user)} will be listed here.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </AppShell>

      <DeactivateUserDialog
        open={deactivate}
        onOpenChange={setDeactivate}
        userName={userFullName(user)}
        onConfirm={() => { update({ status: "inactive" }); setDeactivate(false); toast.success(`${userFullName(user)} deactivated`); }}
      />
    </>
  );
};

export default UserDetail;
