import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PermissionMatrix } from "./PermissionMatrix";
import { APPROVAL_TIER_LABEL, ApprovalTier, SENIORITIES, USER_GROUPS, USERS, User } from "@/data/users";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (u: User) => void;
}

export function CreateUserDialog({ open, onOpenChange, onCreate }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [seniority, setSeniority] = useState<User["seniority"]>("Associate");
  const [groupId, setGroupId] = useState(USER_GROUPS[0].id);
  const [approvalTier, setApprovalTier] = useState<ApprovalTier>("none");
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [maxBookings, setMaxBookings] = useState(10);
  const [maxSpend, setMaxSpend] = useState(50000);
  const [annual, setAnnual] = useState(120000);
  const [monthly, setMonthly] = useState(10000);
  const [sso, setSso] = useState(true);
  const [status, setStatus] = useState<User["status"]>("pending");

  const submit = () => {
    if (!firstName || !lastName || !email) { toast.error("Name and email are required"); return; }
    const u: User = {
      id: "u" + (USERS.length + Math.floor(Math.random() * 1000)),
      firstName, lastName, email, department, position, seniority, groupId,
      capabilities, approvalTier,
      entitlements: {
        maxBookings, maxSpend, annualAllowance: annual, monthlyAllowance: monthly,
        usedBookings: 0, usedSpend: 0, usedMonthly: 0,
      },
      ssoEnabled: sso, status, lastLogin: new Date().toISOString(),
    };
    onCreate(u);
    toast.success(`${firstName} ${lastName} created`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>Capability-based permissions. Assign to a group and configure entitlements.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="entitlements">Entitlements</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>First Name</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
              <div><Label>Last Name</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
            </div>
            <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Department</Label><Input value={department} onChange={(e) => setDepartment(e.target.value)} /></div>
              <div><Label>Position</Label><Input value={position} onChange={(e) => setPosition(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Seniority</Label>
                <Select value={seniority} onValueChange={(v) => setSeniority(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SENIORITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>User Group</Label>
                <Select value={groupId} onValueChange={setGroupId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{USER_GROUPS.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Approval Rights</Label>
                <Select value={approvalTier} onValueChange={(v) => setApprovalTier(v as ApprovalTier)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(Object.keys(APPROVAL_TIER_LABEL) as ApprovalTier[]).map((k) => <SelectItem key={k} value={k}>{APPROVAL_TIER_LABEL[k]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending invite</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <label className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 px-3 py-2.5">
              <span className="text-sm font-medium">SSO Enabled (Azure AD)</span>
              <Switch checked={sso} onCheckedChange={setSso} />
            </label>
          </TabsContent>

          <TabsContent value="permissions" className="mt-4">
            <PermissionMatrix value={capabilities} onChange={setCapabilities} />
          </TabsContent>

          <TabsContent value="entitlements" className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Max Bookings (period)</Label><Input type="number" value={maxBookings} onChange={(e) => setMaxBookings(+e.target.value)} /></div>
              <div><Label>Max Spend (period)</Label><Input type="number" value={maxSpend} onChange={(e) => setMaxSpend(+e.target.value)} /></div>
              <div><Label>Annual Allowance</Label><Input type="number" value={annual} onChange={(e) => setAnnual(+e.target.value)} /></div>
              <div><Label>Monthly Allowance</Label><Input type="number" value={monthly} onChange={(e) => setMonthly(+e.target.value)} /></div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Create user</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
