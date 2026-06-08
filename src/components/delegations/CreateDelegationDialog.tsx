import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Check } from "lucide-react";
import { allActiveUsers, DEFAULT_PERMISSIONS, DelegationPermissions, DelegationRelationship, PERMISSION_GROUPS, PERMISSION_LABEL } from "@/data/delegations";
import { User, userFullName } from "@/data/users";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (newRels: DelegationRelationship[]) => void;
}

export function CreateDelegationDialog({ open, onOpenChange, onCreate }: Props) {
  const [step, setStep] = useState(1);
  const [paId, setPaId] = useState<string | null>(null);
  const [principalIds, setPrincipalIds] = useState<string[]>([]);
  const [perms, setPerms] = useState<DelegationPermissions>(DEFAULT_PERMISSIONS);
  const [search, setSearch] = useState("");

  const users = allActiveUsers();
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => !q || userFullName(u).toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, search]);

  const reset = () => {
    setStep(1); setPaId(null); setPrincipalIds([]); setPerms(DEFAULT_PERMISSIONS); setSearch("");
  };

  const togglePrincipal = (id: string) =>
    setPrincipalIds((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));

  const handleSubmit = () => {
    if (!paId || principalIds.length === 0) return;
    const now = new Date().toISOString();
    const newRels: DelegationRelationship[] = principalIds.map((pid, i) => ({
      id: `del-new-${Date.now()}-${i}`,
      paUserId: paId,
      principalUserId: pid,
      permissions: perms,
      status: "active",
      createdById: "u4",
      createdAt: now,
      lastModifiedAt: now,
      lastActionAt: now,
      activeBookings: 0,
    }));
    onCreate(newRels);
    toast.success(`Created ${newRels.length} delegation${newRels.length === 1 ? "" : "s"}`);
    reset();
    onOpenChange(false);
  };

  const StepHeader = () => (
    <div className="flex items-center gap-2 text-xs">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${step >= n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {step > n ? <Check className="h-3 w-3" /> : n}
          </div>
          {n < 3 && <div className={`h-0.5 w-8 ${step > n ? "bg-primary" : "bg-muted"}`} />}
        </div>
      ))}
      <span className="ml-2 font-medium text-muted-foreground">
        {step === 1 && "Select Delegated Booker"}
        {step === 2 && "Select Principal(s)"}
        {step === 3 && "Configure Permissions"}
      </span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Delegation</DialogTitle>
        </DialogHeader>
        <StepHeader />

        {step === 1 && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search active users…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <ScrollArea className="h-72 rounded-lg border border-border/60">
              <div className="divide-y divide-border/60">
                {filtered.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setPaId(u.id)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-secondary/40 ${paId === u.id ? "bg-primary/5" : ""}`}
                  >
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-medium">{userFullName(u)}</span>
                      <span className="text-[11px] text-muted-foreground">{u.email} · {u.department}</span>
                    </div>
                    {paId === u.id && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Pick one or more principals. One PA can act for multiple principals.</p>
            <ScrollArea className="h-72 rounded-lg border border-border/60">
              <div className="divide-y divide-border/60">
                {users.filter((u) => u.id !== paId).map((u) => {
                  const checked = principalIds.includes(u.id);
                  return (
                    <label key={u.id} className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 hover:bg-secondary/40">
                      <Checkbox checked={checked} onCheckedChange={() => togglePrincipal(u.id)} />
                      <div className="flex min-w-0 flex-1 flex-col leading-tight">
                        <span className="text-sm font-medium">{userFullName(u)}</span>
                        <span className="text-[11px] text-muted-foreground">{u.position} · {u.department}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{u.seniority}</Badge>
                    </label>
                  );
                })}
              </div>
            </ScrollArea>
            <p className="text-[11px] text-muted-foreground">{principalIds.length} principal(s) selected</p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {PERMISSION_GROUPS.map((g) => (
              <div key={g.label} className="rounded-lg border border-border/60 p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g.label}</div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {g.keys.map((k) => (
                    <label key={k} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={perms[k]}
                        onCheckedChange={(v) => setPerms((p) => ({ ...p, [k]: !!v }))}
                      />
                      {PERMISSION_LABEL[k]}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          {step > 1 && <Button variant="outline" onClick={() => setStep((s) => s - 1)}>Back</Button>}
          {step < 3 && (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={(step === 1 && !paId) || (step === 2 && principalIds.length === 0)}
            >
              Next
            </Button>
          )}
          {step === 3 && <Button onClick={handleSubmit}>Create Delegation</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
