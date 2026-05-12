import { useMemo, useState } from "react";
import {
  Search, ShieldCheck, Filter, CheckCircle2, XCircle, RotateCcw, Clock,
  ArrowRight, AlertCircle, User, Sparkles, Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  approvals as seedApprovals, rules as seedRules,
  ApprovalRequest, ApprovalStatus, APPROVAL_STATUS_LABEL, APPROVAL_STATUS_CHIP,
  SENIORITY_ORDER, ApprovalRule,
} from "@/data/approvals";

function StatusChip({ s }: { s: ApprovalStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap", APPROVAL_STATUS_CHIP[s])}>
      {APPROVAL_STATUS_LABEL[s]}
    </span>
  );
}

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function expiryLabel(iso: string, status: ApprovalStatus) {
  if (status === "approved" || status === "auto_approved" || status === "rejected") return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return { label: "Expired", tone: "text-[hsl(0_75%_45%)]" };
  const h = Math.round(ms / 3600000);
  if (h < 24) return { label: `${h}h left`, tone: "text-[hsl(25_90%_40%)]" };
  return { label: `${Math.round(h / 24)}d left`, tone: "text-foreground/60" };
}

export function ApprovalsView() {
  const [list, setList] = useState<ApprovalRequest[]>(seedApprovals);
  const [rules, setRules] = useState<ApprovalRule[]>(seedRules);
  const [tab, setTab] = useState<"queue" | "rules">("queue");

  const [query, setQuery] = useState("");
  const [statusF, setStatusF] = useState<string>("all");
  const [typeF, setTypeF] = useState<string>("all");
  const [requesterF, setRequesterF] = useState<string>("all");
  const [seniorityF, setSeniorityF] = useState<string>("all");
  const [eventF, setEventF] = useState<string>("all");

  const [selected, setSelected] = useState<ApprovalRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reasonOpen, setReasonOpen] = useState<null | "reject" | "return">(null);
  const [reason, setReason] = useState("");

  const requesters = useMemo(() => Array.from(new Set(list.map((a) => a.requester))), [list]);
  const events = useMemo(() => Array.from(new Set(list.map((a) => a.eventName))), [list]);

  const filtered = useMemo(() => {
    let r = list;
    if (statusF !== "all") r = r.filter((a) => a.status === statusF);
    if (typeF !== "all") r = r.filter((a) => a.type === typeF);
    if (requesterF !== "all") r = r.filter((a) => a.requester === requesterF);
    if (seniorityF !== "all") r = r.filter((a) => a.requesterRole === seniorityF);
    if (eventF !== "all") r = r.filter((a) => a.eventName === eventF);
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((a) =>
        a.ref.toLowerCase().includes(q) ||
        a.eventName.toLowerCase().includes(q) ||
        a.requester.toLowerCase().includes(q),
      );
    }
    return [...r].sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt));
  }, [list, statusF, typeF, requesterF, seniorityF, eventF, query]);

  const summary = useMemo(() => ({
    pending: list.filter((a) => a.status === "pending_approval" || a.status === "submitted").length,
    approved: list.filter((a) => a.status === "approved" || a.status === "auto_approved").length,
    returned: list.filter((a) => a.status === "returned").length,
    expired: list.filter((a) => a.status === "expired").length,
  }), [list]);

  const openRow = (a: ApprovalRequest) => { setSelected(a); setDrawerOpen(true); };

  const updateRequest = (id: string, patch: Partial<ApprovalRequest>, audit?: { action: string; reason?: string }) => {
    setList((xs) =>
      xs.map((a) => {
        if (a.id !== id) return a;
        const updated: ApprovalRequest = {
          ...a,
          ...patch,
          audit: audit ? [...a.audit, { at: new Date().toISOString(), user: "You", ...audit }] : a.audit,
        };
        if (selected?.id === id) setSelected(updated);
        return updated;
      }),
    );
  };

  const currentApprover = (a: ApprovalRequest) =>
    a.chain.find((s) => s.status === "pending")?.approver ?? "—";

  const handleApprove = (a: ApprovalRequest) => {
    const idx = a.chain.findIndex((s) => s.status === "pending");
    const newChain = a.chain.map((s, i) =>
      i === idx ? { ...s, status: "approved" as const, actedAt: new Date().toISOString() } : s,
    );
    const stillPending = newChain.some((s) => s.status === "pending");
    updateRequest(a.id, {
      chain: newChain,
      status: stillPending ? "pending_approval" : "approved",
    }, { action: stillPending ? "Approved (step)" : "Approved (final)" });
    toast.success(stillPending ? "Step approved — moved to next approver" : `${a.ref} approved`);
  };

  const handleReject = (a: ApprovalRequest, why: string) => {
    const idx = a.chain.findIndex((s) => s.status === "pending");
    const newChain = a.chain.map((s, i) =>
      i === idx ? { ...s, status: "rejected" as const, actedAt: new Date().toISOString(), comment: why } : s,
    );
    updateRequest(a.id, { chain: newChain, status: "rejected" },
      { action: "Rejected", reason: why });
    toast.error(`${a.ref} rejected`);
  };

  const handleReturn = (a: ApprovalRequest, why: string) => {
    const idx = a.chain.findIndex((s) => s.status === "pending");
    const newChain = a.chain.map((s, i) =>
      i === idx ? { ...s, status: "returned" as const, actedAt: new Date().toISOString(), comment: why } : s,
    );
    updateRequest(a.id, { chain: newChain, status: "returned" },
      { action: "Returned for amendment", reason: why });
    toast.message(`${a.ref} returned for amendment`);
  };

  const activeFilterCount =
    (statusF !== "all" ? 1 : 0) + (typeF !== "all" ? 1 : 0) +
    (requesterF !== "all" ? 1 : 0) + (seniorityF !== "all" ? 1 : 0) + (eventF !== "all" ? 1 : 0);

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-base font-medium text-foreground/70 sm:text-lg">
            Approvals <ShieldCheck className="h-4 w-4" />
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {summary.pending} awaiting action
          </h1>
          <p className="mt-1 text-sm text-foreground/60">Review booking and enquiry approvals across your tenant.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Stat label="Pending" value={summary.pending} tone="bg-[hsl(45_95%_92%)] text-[hsl(35_85%_40%)]" />
          <Stat label="Approved" value={summary.approved} tone="bg-[hsl(140_55%_92%)] text-[hsl(140_55%_30%)]" />
          <Stat label="Returned" value={summary.returned} tone="bg-[hsl(25_90%_94%)] text-[hsl(25_90%_40%)]" />
          <Stat label="Expired" value={summary.expired} tone="bg-[hsl(220_10%_94%)] text-[hsl(220_10%_45%)]" />
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mt-6">
        <TabsList className="rounded-full border border-black/5 bg-white p-1">
          <TabsTrigger value="queue" className="rounded-full px-4 text-xs">Queue</TabsTrigger>
          <TabsTrigger value="rules" className="rounded-full px-4 text-xs">
            <Settings2 className="mr-1.5 h-3.5 w-3.5" /> Approval Rules
          </TabsTrigger>
        </TabsList>

        {/* QUEUE */}
        <TabsContent value="queue" className="mt-4">
          <div className="rounded-2xl border border-black/5 bg-white p-3 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/40" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by ref, event or requester"
                  className="h-9 w-full rounded-xl border-black/10 bg-[hsl(220_20%_97%)] pl-9 text-xs sm:w-[280px]"
                />
              </div>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl border-black/10 bg-[hsl(220_20%_97%)] px-3 text-xs">
                      <Filter className="h-3.5 w-3.5" /> Filters
                      {activeFilterCount > 0 && (
                        <Badge className="ml-0.5 h-4 min-w-4 rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-72 space-y-3 p-3">
                    <FilterSelect label="Status" value={statusF} onChange={setStatusF}
                      options={[{ v: "all", l: "All" }, ...Object.entries(APPROVAL_STATUS_LABEL).map(([v, l]) => ({ v, l }))]} />
                    <FilterSelect label="Request Type" value={typeF} onChange={setTypeF}
                      options={[{ v: "all", l: "All" }, { v: "Booking", l: "Booking" }, { v: "Enquiry", l: "Enquiry" }]} />
                    <FilterSelect label="Requester" value={requesterF} onChange={setRequesterF}
                      options={[{ v: "all", l: "All" }, ...requesters.map((r) => ({ v: r, l: r }))]} />
                    <FilterSelect label="Seniority" value={seniorityF} onChange={setSeniorityF}
                      options={[{ v: "all", l: "All" }, ...SENIORITY_ORDER.map((s) => ({ v: s, l: s }))]} />
                    <FilterSelect label="Event" value={eventF} onChange={setEventF}
                      options={[{ v: "all", l: "All" }, ...events.map((e) => ({ v: e, l: e }))]} />
                    {activeFilterCount > 0 && (
                      <Button variant="ghost" size="sm" className="h-8 w-full rounded-lg text-xs"
                        onClick={() => { setStatusF("all"); setTypeF("all"); setRequesterF("all"); setSeniorityF("all"); setEventF("all"); }}>
                        Clear all
                      </Button>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="-mx-3 mt-4 overflow-x-auto sm:mx-0">
              <div className="min-w-[1100px] px-3 sm:min-w-0 sm:px-0">
                <div className="grid grid-cols-[100px_90px_1.4fr_1fr_110px_120px_140px_140px_100px] items-center gap-3 border-b border-black/5 px-3 py-3 text-xs font-medium text-foreground/50">
                  <span>Ref</span>
                  <span>Type</span>
                  <span>Event</span>
                  <span>Requester</span>
                  <span>Value</span>
                  <span>Approval</span>
                  <span>Current Approver</span>
                  <span>Status</span>
                  <span>Submitted</span>
                </div>
                {filtered.length === 0 && (
                  <div className="px-3 py-8 text-center text-sm text-foreground/50">No approval requests match.</div>
                )}
                {filtered.map((a, i) => {
                  const exp = expiryLabel(a.expiresAt, a.status);
                  return (
                    <button
                      key={a.id}
                      onClick={() => openRow(a)}
                      className={cn(
                        "grid w-full grid-cols-[100px_90px_1.4fr_1fr_110px_120px_140px_140px_100px] items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors",
                        i % 2 === 1 ? "bg-[hsl(220_20%_98%)]" : "hover:bg-[hsl(220_20%_98%)]"
                      )}
                    >
                      <span className="font-medium text-foreground">{a.ref}</span>
                      <span className="text-xs text-foreground/70">{a.type}</span>
                      <span className="truncate text-foreground/80">{a.eventName}</span>
                      <span className="truncate text-xs text-foreground/70">
                        {a.requester} <span className="text-foreground/40">· {a.requesterRole}</span>
                      </span>
                      <span className="text-xs tabular-nums text-foreground/80">${a.bookingValue.toLocaleString()}</span>
                      <span className="text-xs text-foreground/70">{a.approvalType}</span>
                      <span className="truncate text-xs text-foreground/70">{currentApprover(a)}</span>
                      <div className="flex items-center gap-1.5">
                        <StatusChip s={a.status} />
                        {exp && <span className={cn("text-[10px]", exp.tone)}>{exp.label}</span>}
                      </div>
                      <span className="text-xs text-foreground/50">{relTime(a.submittedAt)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* RULES */}
        <TabsContent value="rules" className="mt-4">
          <RulesPanel rules={rules} setRules={setRules} />
        </TabsContent>
      </Tabs>

      {/* Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selected && (
            <>
              <SheetHeader>
                <SheetDescription className="text-xs uppercase tracking-wide">{selected.ref} · {selected.type}</SheetDescription>
                <SheetTitle className="flex flex-wrap items-center gap-3 text-2xl leading-tight">
                  {selected.eventName}
                  <StatusChip s={selected.status} />
                </SheetTitle>
              </SheetHeader>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <Field label="Booking Value" value={`$${selected.bookingValue.toLocaleString()}`} />
                <Field label="Event Type" value={selected.eventType} />
                <Field label="Requester" value={`${selected.requester} · ${selected.requesterRole}`} />
                <Field label="Audience" value={
                  <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    selected.audience === "business"
                      ? "bg-[hsl(220_85%_94%)] text-[hsl(220_85%_45%)]"
                      : "bg-[hsl(280_70%_94%)] text-[hsl(280_60%_45%)]")}>
                    {selected.audience}
                  </span>
                } />
                <Field label="Approval Type" value={selected.approvalType} />
                <Field label="Submitted" value={format(new Date(selected.submittedAt), "PPp")} />
              </div>

              {selected.delegated && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-black/5 bg-[hsl(280_70%_97%)] px-3 py-2 text-xs text-foreground/80">
                  <User className="h-3.5 w-3.5 text-[hsl(280_60%_45%)]" />
                  Delegated booking on behalf of <span className="font-medium">{selected.delegated.principal}</span>
                  <span className="text-foreground/50">· {selected.delegated.principalRole}</span>
                </div>
              )}

              {selected.notes && (
                <div className="mt-3 rounded-xl border border-black/5 bg-[hsl(220_20%_98%)] p-3 text-sm text-foreground/80">
                  {selected.notes}
                </div>
              )}

              {/* Approval chain */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold">Approval chain</h4>
                <div className="mt-3 space-y-2">
                  {selected.chain.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl border border-black/5 bg-white p-3">
                      <div className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        step.status === "approved" && "bg-[hsl(140_55%_92%)] text-[hsl(140_55%_30%)]",
                        step.status === "rejected" && "bg-[hsl(0_75%_94%)] text-[hsl(0_75%_45%)]",
                        step.status === "returned" && "bg-[hsl(25_90%_94%)] text-[hsl(25_90%_40%)]",
                        step.status === "pending" && "bg-[hsl(45_95%_92%)] text-[hsl(35_85%_40%)]",
                        step.status === "skipped" && "bg-[hsl(220_10%_94%)] text-[hsl(220_10%_45%)]",
                      )}>
                        {step.status === "approved" ? <CheckCircle2 className="h-4 w-4" />
                          : step.status === "rejected" ? <XCircle className="h-4 w-4" />
                          : step.status === "returned" ? <RotateCcw className="h-4 w-4" />
                          : step.status === "skipped" ? <Sparkles className="h-4 w-4" />
                          : i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-foreground">{step.approver}</span>
                          <span className="text-xs text-foreground/50">· {step.role}</span>
                        </div>
                        <div className="mt-0.5 text-[11px] capitalize text-foreground/60">
                          {step.status}{step.actedAt && ` · ${relTime(step.actedAt)}`}
                        </div>
                        {step.comment && <div className="mt-1 text-xs text-foreground/70">{step.comment}</div>}
                      </div>
                      {i < selected.chain.length - 1 && (
                        <ArrowRight className="mt-2 h-3.5 w-3.5 shrink-0 text-foreground/30" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold">Audit trail</h4>
                <ul className="mt-2 space-y-2">
                  {[...selected.audit].reverse().map((entry, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/30" />
                      <div className="min-w-0">
                        <div>
                          <span className="font-medium text-foreground">{entry.user}</span>
                          <span className="ml-1 text-foreground/70">{entry.action}</span>
                          <span className="ml-2 text-foreground/40">{relTime(entry.at)}</span>
                        </div>
                        {entry.reason && <div className="text-foreground/60">Reason: {entry.reason}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              {(selected.status === "pending_approval" || selected.status === "submitted") && (
                <div className="sticky bottom-0 -mx-6 mt-6 flex flex-wrap gap-2 border-t border-black/5 bg-white/95 px-6 py-3 backdrop-blur">
                  <Button
                    className="flex-1 bg-[hsl(140_55%_45%)] text-white hover:bg-[hsl(140_55%_40%)]"
                    onClick={() => handleApprove(selected)}
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-[hsl(25_90%_85%)] text-[hsl(25_90%_40%)] hover:bg-[hsl(25_90%_94%)]"
                    onClick={() => { setReason(""); setReasonOpen("return"); }}
                  >
                    <RotateCcw className="mr-1.5 h-4 w-4" /> Return
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-[hsl(0_75%_85%)] text-[hsl(0_75%_45%)] hover:bg-[hsl(0_75%_94%)]"
                    onClick={() => { setReason(""); setReasonOpen("reject"); }}
                  >
                    <XCircle className="mr-1.5 h-4 w-4" /> Reject
                  </Button>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Reason dialog */}
      <Dialog open={reasonOpen !== null} onOpenChange={(o) => !o && setReasonOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reasonOpen === "reject" ? "Reject request" : "Return for amendment"}</DialogTitle>
            <DialogDescription>
              {reasonOpen === "reject"
                ? "A reason is required and shared with the requester."
                : "Add comments or instructions for the requester."}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={reasonOpen === "reject" ? "Explain why this request is rejected…" : "What needs to be amended?"}
            className="min-h-[110px]"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReasonOpen(null)}>Cancel</Button>
            <Button
              disabled={reasonOpen === "reject" && !reason.trim()}
              onClick={() => {
                if (!selected) return;
                if (reasonOpen === "reject") handleReject(selected, reason.trim() || "—");
                else handleReturn(selected, reason.trim() || "Please review");
                setReasonOpen(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1.5 shadow-sm">
      <span className={cn("inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums", tone)}>
        {value}
      </span>
      <span className="text-xs text-foreground/70">{label}</span>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-foreground/50">{label}</div>
      <div className="mt-0.5 text-sm text-foreground/85">{value}</div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }:
  { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ---------- Rules panel ---------- */

function RulesPanel({ rules, setRules }: { rules: ApprovalRule[]; setRules: (r: ApprovalRule[]) => void }) {
  const toggle = (id: string) => {
    setRules(rules.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));
    toast.success("Rule updated");
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Approval Rules</h3>
            <p className="mt-1 text-xs text-foreground/60">
              Configure routing logic without developer involvement. Rules evaluate in order and route to equal-or-higher seniority only.
            </p>
          </div>
          <Button size="sm" className="rounded-full">+ New rule</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
          <Tag>Auto-approve</Tag><Tag>Single approver</Tag><Tag>Multi-step</Tag>
          <Tag>Fallback approvers</Tag><Tag>Expiry SLA</Tag>
        </div>
      </div>

      {rules.map((r) => (
        <div key={r.id} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground">{r.name}</h4>
                <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  r.action === "Auto-approve" ? "bg-[hsl(180_60%_92%)] text-[hsl(180_60%_30%)]"
                    : r.action === "Single" ? "bg-[hsl(220_85%_94%)] text-[hsl(220_85%_45%)]"
                    : "bg-[hsl(280_70%_94%)] text-[hsl(280_60%_45%)]")}>
                  {r.action}
                </span>
                {r.expiryHours > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-foreground/60">
                    <Clock className="h-3 w-3" /> Expires in {r.expiryHours}h
                  </span>
                )}
              </div>

              <div className="mt-3">
                <div className="text-[10px] uppercase tracking-wide text-foreground/50">When</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {r.conditions.map((c, i) => (
                    <span key={i} className="inline-flex items-center rounded-md bg-[hsl(220_20%_97%)] px-2 py-0.5 text-[11px] text-foreground/80">
                      {c.field} {opLabel(c.op)} <strong className="ml-1 font-semibold">{String(c.value)}</strong>
                    </span>
                  ))}
                </div>
              </div>

              {r.approverChain.length > 0 && (
                <div className="mt-3">
                  <div className="text-[10px] uppercase tracking-wide text-foreground/50">Then route to</div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {r.approverChain.map((step, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="inline-flex items-center rounded-md border border-black/5 bg-white px-2 py-0.5 text-[11px] text-foreground/80">
                          {step.role}
                          {step.fallback && <span className="ml-1 text-foreground/40">(fallback: {step.fallback})</span>}
                        </span>
                        {i < r.approverChain.length - 1 && <ArrowRight className="h-3 w-3 text-foreground/30" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={r.enabled} onCheckedChange={() => toggle(r.id)} />
            </div>
          </div>
        </div>
      ))}

      <div className="flex items-start gap-2 rounded-xl border border-black/5 bg-[hsl(45_95%_97%)] px-3 py-2 text-xs text-foreground/70">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(35_85%_40%)]" />
        Approvals can never route downward. Routing back to the requester or principal is automatically blocked.
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full bg-[hsl(220_20%_97%)] px-2 py-0.5 text-[11px] text-foreground/70">{children}</span>;
}

function opLabel(op: string) {
  return op === "lt" ? "<" : op === "lte" ? "≤" : op === "gt" ? ">" : op === "gte" ? "≥" : "=";
}
