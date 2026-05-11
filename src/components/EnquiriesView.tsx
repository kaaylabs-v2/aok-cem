import { useMemo, useState } from "react";
import {
  Search, Plus, FileSearch, MapPin, Tag, Users, DollarSign, CalendarDays,
  CheckCircle2, XCircle, Sparkles, Clock, FileText, Download, FileSpreadsheet, Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Enquiry, EnquiryStatus, ENQUIRY_STATUS_LABEL, enquiries as seedEnquiries,
  eventTypes, events as allEvents, NotificationItem,
} from "@/data/portfolio";
import { format } from "date-fns";
import { toast } from "sonner";

const STATUS_CHIP: Record<EnquiryStatus, string> = {
  submitted: "bg-[hsl(220_10%_92%)] text-[hsl(220_10%_35%)]",
  in_progress: "bg-[hsl(220_85%_94%)] text-[hsl(220_85%_45%)]",
  proposal_received: "bg-[hsl(280_70%_94%)] text-[hsl(280_60%_45%)]",
  accepted: "bg-[hsl(140_55%_92%)] text-[hsl(140_55%_30%)]",
  declined: "bg-[hsl(0_75%_94%)] text-[hsl(0_75%_45%)]",
  cancelled: "bg-[hsl(220_10%_94%)] text-[hsl(220_10%_45%)]",
  pending_approval: "bg-[hsl(45_95%_92%)] text-[hsl(35_85%_40%)]",
};

const STATUS_ORDER: EnquiryStatus[] = ["submitted", "in_progress", "proposal_received", "accepted"];

function StatusChip({ s }: { s: EnquiryStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold", STATUS_CHIP[s])}>
      {ENQUIRY_STATUS_LABEL[s]}
    </span>
  );
}

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

interface Props {
  pushNotification?: (n: NotificationItem) => void;
}

export function EnquiriesView({ pushNotification }: Props) {
  const [list, setList] = useState<Enquiry[]>(seedEnquiries);
  const [query, setQuery] = useState("");
  const [statusF, setStatusF] = useState<string>("all");
  const [typeF, setTypeF] = useState<string>("all");
  const [submitterF, setSubmitterF] = useState<string>("all");
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const submitters = useMemo(() => Array.from(new Set(list.map((e) => e.submittedBy))), [list]);

  const filtered = useMemo(() => {
    let r = list;
    if (statusF !== "all") r = r.filter((e) => e.status === statusF);
    if (typeF !== "all") r = r.filter((e) => e.eventType === typeF);
    if (submitterF !== "all") r = r.filter((e) => e.submittedBy === submitterF);
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((e) =>
        e.ref.toLowerCase().includes(q) ||
        e.eventType.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.submittedBy.toLowerCase().includes(q),
      );
    }
    return [...r].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [list, statusF, typeF, submitterF, query]);

  const openEnquiry = (e: Enquiry) => { setSelected(e); setDrawerOpen(true); };

  const updateEnquiry = (id: string, patch: Partial<Enquiry>, activity?: string) => {
    setList((xs) =>
      xs.map((e) => {
        if (e.id !== id) return e;
        const updated: Enquiry = {
          ...e,
          ...patch,
          updatedAt: new Date().toISOString(),
          timeline: patch.status && patch.status !== e.status
            ? [...e.timeline, { status: patch.status, at: new Date().toISOString() }]
            : e.timeline,
          activity: activity ? [...e.activity, { at: new Date().toISOString(), text: activity }] : e.activity,
        };
        if (selected?.id === id) setSelected(updated);
        return updated;
      }),
    );
  };

  const handleAddEnquiry = (e: Enquiry) => {
    setList((xs) => [e, ...xs]);
    pushNotification?.({
      id: `n-${e.id}`, type: "inventory", title: "Enquiry submitted",
      body: `${e.ref} · ${e.eventType} for ${e.guests} guests`, time: "just now", unread: true,
    });
    toast.success(`Enquiry ${e.ref} submitted`);
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-base font-medium text-foreground/70 sm:text-lg">
            Enquiries <FileSearch className="h-4 w-4" />
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {list.length} enquiries
          </h1>
          <p className="mt-1 text-sm text-foreground/60">Track requests and proposals across your portfolio.</p>
        </div>
        <Button
          onClick={() => setNewOpen(true)}
          className="rounded-full bg-[hsl(140_55%_45%)] px-4 text-white shadow-sm hover:bg-[hsl(140_55%_40%)] sm:px-5"
        >
          <Plus className="mr-1.5 h-4 w-4" /> <span className="hidden sm:inline">New Enquiry</span><span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Table card */}
      <div className="mt-6 rounded-2xl border border-black/5 bg-white p-3 shadow-sm sm:mt-7 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/40" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search enquiries"
              className="h-9 w-full rounded-xl border-black/10 bg-[hsl(220_20%_97%)] pl-9 text-xs sm:w-[240px]"
            />
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <Select value={statusF} onValueChange={setStatusF}>
              <SelectTrigger className="h-9 flex-1 rounded-xl border-black/10 bg-[hsl(220_20%_97%)] text-xs sm:w-[160px] sm:flex-none">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {Object.entries(ENQUIRY_STATUS_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeF} onValueChange={setTypeF}>
              <SelectTrigger className="h-9 flex-1 rounded-xl border-black/10 bg-[hsl(220_20%_97%)] text-xs sm:w-[140px] sm:flex-none">
                <Tag className="mr-1.5 h-3.5 w-3.5 text-foreground/50" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {eventTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={submitterF} onValueChange={setSubmitterF}>
              <SelectTrigger className="h-9 flex-1 rounded-xl border-black/10 bg-[hsl(220_20%_97%)] text-xs sm:w-[160px] sm:flex-none">
                <Users className="mr-1.5 h-3.5 w-3.5 text-foreground/50" />
                <SelectValue placeholder="Submitter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All submitters</SelectItem>
                {submitters.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="-mx-3 mt-4 overflow-x-auto sm:mx-0">
          <div className="min-w-[900px] px-3 sm:min-w-0 sm:px-0">
          <div className="grid grid-cols-[110px_1fr_1.2fr_70px_100px_140px_120px_100px] items-center gap-3 border-b border-black/5 px-3 py-3 text-xs font-medium text-foreground/50">
            <span>Ref</span>
            <span>Event Type</span>
            <span>Preferred Dates</span>
            <span>Guests</span>
            <span>Budget</span>
            <span>Status</span>
            <span>Submitted By</span>
            <span>Updated</span>
          </div>
          {filtered.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-foreground/50">No enquiries match your filters.</div>
          )}
          {filtered.map((e, i) => (
            <button
              key={e.id}
              onClick={() => openEnquiry(e)}
              className={cn(
                "grid w-full grid-cols-[110px_1fr_1.2fr_70px_100px_140px_120px_100px] items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors",
                i % 2 === 1 ? "bg-[hsl(220_20%_98%)]" : "hover:bg-[hsl(220_20%_98%)]"
              )}
            >
              <span className="font-medium text-foreground">{e.ref}</span>
              <span className="text-foreground/80">{e.eventType}</span>
              <span className="truncate text-xs text-foreground/70">
                {e.preferredDates.map((d) => format(new Date(d), "d MMM")).join(" · ")}
              </span>
              <span className="text-xs tabular-nums text-foreground/70">{e.guests}</span>
              <span className="text-xs tabular-nums text-foreground/70">${e.budget.toLocaleString()}</span>
              <StatusChip s={e.status} />
              <span className="truncate text-xs text-foreground/70">{e.submittedBy}</span>
              <span className="text-xs text-foreground/50">{relTime(e.updatedAt)}</span>
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selected && (
            <>
              <SheetHeader>
                <SheetDescription className="text-xs uppercase tracking-wide">{selected.ref}</SheetDescription>
                <SheetTitle className="flex items-center gap-3 text-2xl leading-tight">
                  {selected.eventType}
                  <StatusChip s={selected.status} />
                </SheetTitle>
              </SheetHeader>

              {selected.lastSyncedAt && (
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-foreground/50">
                  <Clock className="h-3 w-3" /> Last synced {relTime(selected.lastSyncedAt)} from 3D CRM
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <Field icon={<CalendarDays className="h-4 w-4" />} label="Preferred dates"
                  value={selected.preferredDates.map((d) => format(new Date(d), "PP")).join(" · ")} />
                <Field icon={<Users className="h-4 w-4" />} label="Guests" value={String(selected.guests)} />
                <Field icon={<DollarSign className="h-4 w-4" />} label="Budget" value={`$${selected.budget.toLocaleString()}`} />
                <Field icon={<MapPin className="h-4 w-4" />} label="Location" value={selected.location} />
                <Field icon={<Users className="h-4 w-4" />} label="Submitted by" value={selected.submittedBy} />
                <Field icon={<Tag className="h-4 w-4" />} label="Audience" value={selected.audience} />
              </div>

              {selected.notes && (
                <div className="mt-4 rounded-xl border border-black/5 bg-[hsl(220_20%_98%)] p-3 text-sm text-foreground/80">
                  {selected.notes}
                </div>
              )}

              {/* Timeline */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold">Status timeline</h4>
                <div className="mt-3 flex items-center gap-2">
                  {STATUS_ORDER.map((s, i) => {
                    const reached = selected.timeline.some((t) => t.status === s);
                    const isCurrent = selected.status === s;
                    return (
                      <div key={s} className="flex flex-1 items-center gap-2">
                        <div className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold",
                          reached ? "bg-[hsl(140_55%_45%)] text-white" : "bg-black/5 text-foreground/40",
                          isCurrent && "ring-2 ring-[hsl(140_55%_45%)] ring-offset-2",
                        )}>
                          {reached ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                        </div>
                        {i < STATUS_ORDER.length - 1 && (
                          <div className={cn("h-0.5 flex-1 rounded", reached ? "bg-[hsl(140_55%_45%)]" : "bg-black/5")} />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-foreground/50">
                  {STATUS_ORDER.map((s) => <span key={s} className="flex-1">{ENQUIRY_STATUS_LABEL[s]}</span>)}
                </div>
              </div>

              {/* Documents from AOK */}
              {selected.documents && selected.documents.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Documents from AOK</h4>
                    <span className="text-[11px] text-foreground/50">{selected.documents.length} files</span>
                  </div>
                  <ul className="mt-2 divide-y divide-black/5 rounded-xl border border-black/5 bg-[hsl(220_20%_98%)]">
                    {selected.documents.map((doc) => {
                      const Icon = doc.type === "xlsx" ? FileSpreadsheet : doc.type === "image" ? ImageIcon : FileText;
                      const tone = doc.type === "xlsx" ? "text-[hsl(140_55%_40%)] bg-[hsl(140_55%_92%)]"
                        : doc.type === "image" ? "text-[hsl(280_60%_45%)] bg-[hsl(280_70%_94%)]"
                        : "text-[hsl(220_85%_45%)] bg-[hsl(220_85%_94%)]";
                      return (
                        <li key={doc.id} className="flex items-center gap-3 px-3 py-2.5">
                          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", tone)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-medium text-foreground">{doc.name}</div>
                            <div className="truncate text-[11px] text-foreground/50">
                              {doc.size} · Uploaded by {doc.uploadedBy} · {relTime(doc.uploadedAt)}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 rounded-lg px-2 text-foreground/70 hover:bg-black/5"
                            onClick={() => toast.success(`Downloading ${doc.name}`)}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* AOK Notes */}
              <div className="mt-6">
                <Label className="text-xs">AOK Notes</Label>
                <Textarea
                  value={selected.aokNotes}
                  onChange={(ev) => updateEnquiry(selected.id, { aokNotes: ev.target.value })}
                  placeholder="Add internal AOK notes…"
                  className="mt-1.5 min-h-[70px]"
                />
              </div>

              {/* Activity */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold">Activity</h4>
                <ul className="mt-2 space-y-2">
                  {[...selected.activity].reverse().map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/30" />
                      <div>
                        <span className="text-foreground/80">{a.text}</span>
                        <span className="ml-2 text-foreground/40">{relTime(a.at)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap gap-2">
                {selected.status === "proposal_received" && (
                  <>
                    <Button
                      className="flex-1 bg-[hsl(140_55%_45%)] text-white hover:bg-[hsl(140_55%_40%)]"
                      onClick={() => {
                        updateEnquiry(selected.id, { status: "accepted" }, "Proposal accepted");
                        pushNotification?.({ id: `n-acc-${selected.id}-${Date.now()}`, type: "inventory",
                          title: `Proposal accepted`, body: `${selected.ref} marked as accepted.`, time: "just now", unread: true });
                        toast.success("Proposal accepted");
                      }}
                    >
                      <CheckCircle2 className="mr-1.5 h-4 w-4" /> Accept Proposal
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        updateEnquiry(selected.id, { status: "declined" }, "Proposal declined");
                        toast.info("Proposal declined");
                      }}
                    >
                      <XCircle className="mr-1.5 h-4 w-4" /> Decline Proposal
                    </Button>
                  </>
                )}
                {selected.status !== "cancelled" && selected.status !== "accepted" && selected.status !== "declined" && (
                  <Button variant="outline" className="flex-1 border-[hsl(0_75%_60%)]/40 text-[hsl(0_75%_45%)]"
                    onClick={() => setCancelOpen(true)}>
                    Cancel Enquiry
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Cancel reason dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel enquiry</DialogTitle>
            <DialogDescription>Provide a reason — this will be recorded in the activity log.</DialogDescription>
          </DialogHeader>
          <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason…" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Back</Button>
            <Button
              className="bg-[hsl(0_75%_55%)] text-white hover:bg-[hsl(0_75%_50%)]"
              disabled={!cancelReason.trim()}
              onClick={() => {
                if (selected) updateEnquiry(selected.id, { status: "cancelled" }, `Cancelled: ${cancelReason.trim()}`);
                setCancelOpen(false); setCancelReason("");
                toast.info("Enquiry cancelled");
              }}
            >Cancel enquiry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New enquiry */}
      <NewEnquiryDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        nextRef={`ENQ-${1027 + list.length}`}
        onSubmit={handleAddEnquiry}
      />
    </>
  );
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-black/5 bg-white px-3 py-2">
      <span className="mt-0.5 text-foreground/50">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-foreground/50">{label}</p>
        <p className="truncate text-sm font-medium capitalize">{value}</p>
      </div>
    </div>
  );
}

/* ---------- New Enquiry conversational dialog ---------- */
function NewEnquiryDialog({
  open, onOpenChange, nextRef, onSubmit,
}: {
  open: boolean; onOpenChange: (o: boolean) => void; nextRef: string;
  onSubmit: (e: Enquiry) => void;
}) {
  const [step, setStep] = useState(0);
  const [eventType, setEventType] = useState<Enquiry["eventType"]>("Conference");
  const [dates, setDates] = useState<Date[]>([]);
  const [guests, setGuests] = useState<number>(50);
  const [budget, setBudget] = useState<number>(10000);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [audience, setAudience] = useState<"business" | "personal">("business");

  const reset = () => {
    setStep(0); setEventType("Conference"); setDates([]); setGuests(50);
    setBudget(10000); setLocation(""); setNotes(""); setAudience("business");
  };

  const close = () => { onOpenChange(false); setTimeout(reset, 200); };

  const similar = useMemo(
    () => allEvents.filter((e) => e.type === eventType && !e.past && e.status !== "cancelled").slice(0, 3),
    [eventType],
  );

  const submit = () => {
    const now = new Date().toISOString();
    const enq: Enquiry = {
      id: `q-${Date.now()}`,
      ref: nextRef,
      eventType,
      preferredDates: dates.map((d) => d.toISOString()),
      guests,
      budget,
      location: location || "—",
      notes,
      audience,
      status: "submitted",
      submittedBy: "Elena Rossi",
      submittedAt: now,
      updatedAt: now,
      timeline: [{ status: "submitted", at: now }],
      aokNotes: "",
      activity: [{ at: now, text: `Enquiry ${nextRef} submitted` }],
    };
    onSubmit(enq);
    close();
  };

  const steps = ["Type", "Dates", "Guests & budget", "Location & notes", "Review"];

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogDescription className="text-xs uppercase tracking-wide">{nextRef}</DialogDescription>
          <DialogTitle>New enquiry · {steps[step]}</DialogTitle>
        </DialogHeader>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className={cn(
              "h-1 flex-1 rounded-full",
              i <= step ? "bg-[hsl(140_55%_45%)]" : "bg-black/10",
            )} />
          ))}
        </div>

        <div className="min-h-[200px]">
          {step === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-foreground/70">What kind of event are you planning?</p>
              <div className="flex flex-wrap gap-2">
                {eventTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setEventType(t)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition-colors",
                      eventType === t
                        ? "border-[hsl(140_55%_45%)] bg-[hsl(140_55%_94%)] text-[hsl(140_55%_30%)]"
                        : "border-black/10 hover:bg-black/5",
                    )}
                  >{t}</button>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                {(["business", "personal"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setAudience(a)}
                    className={cn(
                      "flex-1 rounded-xl border px-3 py-2 text-sm capitalize",
                      audience === a ? "border-foreground bg-foreground/5" : "border-black/10",
                    )}
                  >{a}</button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-foreground/70">Pick one or more preferred dates.</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {dates.length ? dates.map((d) => format(d, "PP")).join(", ") : "Pick dates"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="multiple"
                    selected={dates}
                    onSelect={(d) => setDates((d as Date[]) ?? [])}
                    className="pointer-events-auto p-3"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Number of guests</Label>
                <Input type="number" min={1} value={guests} onChange={(e) => setGuests(+e.target.value || 0)} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-xs">Budget (USD)</Label>
                <Input type="number" min={0} step={500} value={budget} onChange={(e) => setBudget(+e.target.value || 0)} className="mt-1.5" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Location preference</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. London, Online" className="mt-1.5" />
              </div>
              <div>
                <Label className="text-xs">Additional notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything we should know…" className="mt-1.5" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border border-black/5 bg-[hsl(220_20%_98%)] p-3">
                <p><span className="text-foreground/50">Type:</span> {eventType} · {audience}</p>
                <p><span className="text-foreground/50">Dates:</span> {dates.length ? dates.map((d) => format(d, "PP")).join(", ") : "—"}</p>
                <p><span className="text-foreground/50">Guests / Budget:</span> {guests} · ${budget.toLocaleString()}</p>
                <p><span className="text-foreground/50">Location:</span> {location || "—"}</p>
                {notes && <p className="mt-1 text-foreground/70">{notes}</p>}
              </div>
              {similar.length > 0 && (
                <div className="flex items-start gap-2 rounded-xl border border-[hsl(220_85%_60%)]/30 bg-[hsl(220_85%_97%)] p-3">
                  <Sparkles className="mt-0.5 h-4 w-4 text-[hsl(220_85%_55%)]" />
                  <div className="text-xs">
                    <p className="font-semibold text-[hsl(220_85%_45%)]">Smart suggestion</p>
                    <p className="mt-0.5 text-foreground/70">
                      You already have {similar.length} similar {eventType.toLowerCase()} event{similar.length > 1 ? "s" : ""} available in your inventory.
                    </p>
                    <ul className="mt-1.5 space-y-0.5 text-foreground/60">
                      {similar.map((s) => <li key={s.id}>· {s.name} — {s.venue}</li>)}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {step > 0 && <Button variant="outline" onClick={() => setStep((s) => s - 1)}>Back</Button>}
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}
              className="bg-[hsl(140_55%_45%)] text-white hover:bg-[hsl(140_55%_40%)]">
              Next
            </Button>
          ) : (
            <Button onClick={submit} className="bg-[hsl(140_55%_45%)] text-white hover:bg-[hsl(140_55%_40%)]">
              Submit enquiry
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
