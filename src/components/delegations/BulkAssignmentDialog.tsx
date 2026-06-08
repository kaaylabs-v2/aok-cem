import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { allActiveUsers, DelegationPermissions, DelegationRelationship, DEFAULT_PERMISSIONS } from "@/data/delegations";
import { userFullName } from "@/data/users";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (newRels: DelegationRelationship[]) => void;
}

const PRESETS: Record<string, DelegationPermissions> = {
  "Full Access":   { ...DEFAULT_PERMISSIONS, removeGuests: true, manageEnquiries: true },
  "Bookings Only": { ...DEFAULT_PERMISSIONS, addGuests: false, editGuests: false, removeGuests: false, sendInvites: false, resendInvites: false, createEnquiries: false, manageEnquiries: false },
  "Guests Only":   { ...DEFAULT_PERMISSIONS, createBookings: false, modifyBookings: false, createEnquiries: false, manageEnquiries: false },
};

export function BulkAssignmentDialog({ open, onOpenChange, onCreate }: Props) {
  const [paId, setPaId] = useState<string>("");
  const [principalIds, setPrincipalIds] = useState<string[]>([]);
  const [preset, setPreset] = useState<keyof typeof PRESETS>("Full Access");
  const users = allActiveUsers();
  const filtered = useMemo(() => users.filter((u) => u.id !== paId), [users, paId]);

  const reset = () => { setPaId(""); setPrincipalIds([]); setPreset("Full Access"); };

  const submit = () => {
    if (!paId || principalIds.length === 0) return;
    const now = new Date().toISOString();
    const rels: DelegationRelationship[] = principalIds.map((pid, i) => ({
      id: `del-bulk-${Date.now()}-${i}`,
      paUserId: paId,
      principalUserId: pid,
      permissions: PRESETS[preset],
      status: "active",
      createdById: "u4",
      createdAt: now,
      lastModifiedAt: now,
      lastActionAt: now,
      activeBookings: 0,
    }));
    onCreate(rels);
    toast.success(`Bulk created ${rels.length} delegations`);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>Bulk Delegation Assignment</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Delegated Booker (PA)</Label>
            <Select value={paId} onValueChange={setPaId}>
              <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
              <SelectContent>
                {users.map((u) => <SelectItem key={u.id} value={u.id}>{userFullName(u)} · {u.department}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Permission Template</Label>
            <Select value={preset} onValueChange={(v) => setPreset(v as keyof typeof PRESETS)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(PRESETS).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Principals ({principalIds.length} selected)</Label>
            <ScrollArea className="mt-2 h-64 rounded-lg border border-border/60">
              <div className="divide-y divide-border/60">
                {filtered.map((u) => {
                  const checked = principalIds.includes(u.id);
                  return (
                    <label key={u.id} className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-secondary/40">
                      <Checkbox checked={checked} onCheckedChange={() => setPrincipalIds((xs) => xs.includes(u.id) ? xs.filter((x) => x !== u.id) : [...xs, u.id])} />
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-medium">{userFullName(u)}</span>
                        <span className="text-[11px] text-muted-foreground">{u.position} · {u.department}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!paId || principalIds.length === 0}>Create {principalIds.length || ""}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
