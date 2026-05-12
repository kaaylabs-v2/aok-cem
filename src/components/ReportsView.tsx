import { useMemo, useState } from "react";
import {
  Search, Download, FileText, FileSpreadsheet, AlertTriangle, Calendar as CalendarIcon,
  Users, DollarSign, ShieldAlert, ClipboardList, Bookmark, Clock, Mail, Plus,
  ArrowUpDown, X, Building2, History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  complianceRows as seedRows, ComplianceRow, ReportFilters,
  STATUS_CHIP, SOURCE_CHIP, scheduledReports as seedSchedules,
  savedTemplates as seedTemplates, SavedTemplate, ScheduledReport,
} from "@/data/reports";

const EMPTY: ReportFilters = {
  query: "", hostName: "all", guestName: "", guestCompany: "all",
  eventType: "all", bookingType: "all", bookingStatus: "all", source: "all",
  costMin: "", costMax: "", from: "", to: "",
};

const HIGH_COST = 1000;
const HIGH_FREQ = 3;

function StatCard({ icon: Icon, label, value, hint, tone }: {
  icon: any; label: string; value: string | number; hint?: string;
  tone?: "default" | "warning" | "danger";
}) {
  const toneCls = tone === "warning" ? "text-[hsl(35_85%_40%)]"
    : tone === "danger" ? "text-[hsl(0_75%_45%)]" : "text-foreground";
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Icon className={cn("h-4 w-4", toneCls)} />
      </div>
      <div className={cn("mt-2 text-2xl font-semibold tracking-tight", toneCls)}>{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function fmtMoney(n?: number) {
  if (n === undefined || n === null) return "—";
  if (n === 0) return "£0";
  return `£${n.toLocaleString()}`;
}

type SortKey = "eventDate" | "costPerPerson" | "hostName" | "guestName" | "eventName" | "frequency";

export function ReportsView() {
  const [rows] = useState<ComplianceRow[]>(seedRows);
  const [schedules, setSchedules] = useState<ScheduledReport[]>(seedSchedules);
  const [templates, setTemplates] = useState<SavedTemplate[]>(seedTemplates);
  const [f, setF] = useState<ReportFilters>(EMPTY);
  const [sort, setSort] = useState<{ k: SortKey; dir: "asc" | "desc" }>({ k: "eventDate", dir: "desc" });
  const [selected, setSelected] = useState<ComplianceRow | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [tplName, setTplName] = useState("");
  const [schedDraft, setSchedDraft] = useState({ name: "", recipients: "", frequency: "Weekly" as ScheduledReport["frequency"] });

  const hosts = useMemo(() => Array.from(new Set(rows.map((r) => r.hostName))), [rows]);
  const companies = useMemo(() => Array.from(new Set(rows.map((r) => r.guestCompany))), [rows]);
  const eventTypes = useMemo(() => Array.from(new Set(rows.map((r) => r.eventType))), [rows]);
  const bookingTypes = useMemo(() => Array.from(new Set(rows.map((r) => r.bookingType))), [rows]);
  const statuses = ["Booked", "Confirmed", "In Negotiation", "Cancelled", "Waitlisted", "Proposal Received", "Declined"];

  // Frequency: how many bookings per guest within filtered date range
  const frequencyMap = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r) => {
      if (f.from && new Date(r.eventDate) < new Date(f.from)) return;
      if (f.to && new Date(r.eventDate) > new Date(f.to)) return;
      map.set(r.guestEmail, (map.get(r.guestEmail) ?? 0) + 1);
    });
    return map;
  }, [rows, f.from, f.to]);

  const filtered = useMemo(() => {
    let r = rows;
    if (f.query.trim()) {
      const q = f.query.toLowerCase();
      r = r.filter((x) =>
        [x.hostName, x.guestName, x.guestCompany, x.eventName].some((v) => v.toLowerCase().includes(q)),
      );
    }
    if (f.hostName !== "all") r = r.filter((x) => x.hostName === f.hostName);
    if (f.guestName.trim()) r = r.filter((x) => x.guestName.toLowerCase().includes(f.guestName.toLowerCase()));
    if (f.guestCompany !== "all") r = r.filter((x) => x.guestCompany === f.guestCompany);
    if (f.eventType !== "all") r = r.filter((x) => x.eventType === f.eventType);
    if (f.bookingType !== "all") r = r.filter((x) => x.bookingType === f.bookingType);
    if (f.bookingStatus !== "all") r = r.filter((x) => x.bookingStatus === f.bookingStatus);
    if (f.source !== "all") r = r.filter((x) => x.source === f.source);
    if (f.costMin) r = r.filter((x) => (x.costPerPerson ?? 0) >= Number(f.costMin));
    if (f.costMax) r = r.filter((x) => (x.costPerPerson ?? 0) <= Number(f.costMax));
    if (f.from) r = r.filter((x) => new Date(x.eventDate) >= new Date(f.from));
    if (f.to) r = r.filter((x) => new Date(x.eventDate) <= new Date(f.to));
    return r;
  }, [rows, f]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av: any, bv: any;
      if (sort.k === "frequency") { av = frequencyMap.get(a.guestEmail) ?? 0; bv = frequencyMap.get(b.guestEmail) ?? 0; }
      else if (sort.k === "costPerPerson") { av = a.costPerPerson ?? -1; bv = b.costPerPerson ?? -1; }
      else if (sort.k === "eventDate") { av = new Date(a.eventDate).getTime(); bv = new Date(b.eventDate).getTime(); }
      else { av = (a as any)[sort.k]; bv = (b as any)[sort.k]; }
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sort, frequencyMap]);

  const summary = useMemo(() => {
    const events = new Set(filtered.map((r) => r.eventId));
    const guests = filtered.length;
    const guestFreq = new Map<string, number>();
    filtered.forEach((r) => guestFreq.set(r.guestEmail, (guestFreq.get(r.guestEmail) ?? 0) + 1));
    const highFreq = Array.from(guestFreq.values()).filter((c) => c >= HIGH_FREQ).length;
    const highCost = new Set(filtered.filter((r) => (r.costPerPerson ?? 0) >= HIGH_COST).map((r) => r.eventId)).size;
    const pending = filtered.filter((r) => r.bookingStatus === "In Negotiation" || r.bookingStatus === "Proposal Received").length;
    return { events: events.size, guests, highFreq, highCost, pending };
  }, [filtered]);

  const toggleSort = (k: SortKey) =>
    setSort((s) => (s.k === k ? { k, dir: s.dir === "asc" ? "desc" : "asc" } : { k, dir: "desc" }));

  const exportCsv = () => {
    const headers = ["Host", "Guest", "Company", "Event", "Date", "Type", "Booking Type", "Status", "Cost/Person", "Frequency", "Source"];
    const lines = [headers.join(",")];
    sorted.forEach((r) => {
      lines.push([
        r.hostName, r.guestName, r.guestCompany, r.eventName,
        format(new Date(r.eventDate), "yyyy-MM-dd"), r.eventType, r.bookingType, r.bookingStatus,
        r.costPerPerson ?? "", frequencyMap.get(r.guestEmail) ?? 0, r.source,
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `compliance-report-${format(new Date(), "yyyyMMdd-HHmm")}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported", { description: `${sorted.length} rows exported` });
  };

  const exportPdf = () => {
    const w = window.open("", "_blank");
    if (!w) return toast.error("Popup blocked");
    const css = `body{font-family:-apple-system,Segoe UI,sans-serif;color:#0f172a;padding:32px;}
      h1{font-size:20px;margin:0 0 4px;} .meta{color:#64748b;font-size:11px;margin-bottom:20px;}
      table{width:100%;border-collapse:collapse;font-size:11px;}
      th,td{text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;}
      th{background:#f8fafc;font-weight:600;} tr:nth-child(even){background:#fafafa;}
      .summary{display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap;}
      .card{border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;min-width:140px;}
      .label{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;}
      .value{font-size:18px;font-weight:600;margin-top:4px;}`;
    const filtersApplied = Object.entries(f).filter(([k, v]) => v && v !== "all" && v !== "").map(([k, v]) => `${k}: ${v}`).join(" · ") || "None";
    const body = `
      <h1>Compliance Report</h1>
      <div class="meta">Generated ${format(new Date(), "PPP p")} · Filters: ${filtersApplied}</div>
      <div class="summary">
        <div class="card"><div class="label">Events</div><div class="value">${summary.events}</div></div>
        <div class="card"><div class="label">Guests Entertained</div><div class="value">${summary.guests}</div></div>
        <div class="card"><div class="label">High-Frequency</div><div class="value">${summary.highFreq}</div></div>
        <div class="card"><div class="label">High-Cost Events</div><div class="value">${summary.highCost}</div></div>
        <div class="card"><div class="label">Pending Reviews</div><div class="value">${summary.pending}</div></div>
      </div>
      <table><thead><tr>
        <th>Host</th><th>Guest</th><th>Company</th><th>Event</th><th>Date</th>
        <th>Type</th><th>Booking</th><th>Status</th><th>Cost/Person</th><th>Freq</th><th>Source</th>
      </tr></thead><tbody>
      ${sorted.map((r) => `<tr>
        <td>${r.hostName}</td><td>${r.guestName}</td><td>${r.guestCompany}</td>
        <td>${r.eventName}</td><td>${format(new Date(r.eventDate), "PP")}</td>
        <td>${r.eventType}</td><td>${r.bookingType}</td><td>${r.bookingStatus}</td>
        <td>${r.costPerPerson != null ? "£" + r.costPerPerson.toLocaleString() : "—"}</td>
        <td>${frequencyMap.get(r.guestEmail) ?? 0}</td><td>${r.source}</td>
      </tr>`).join("")}
      </tbody></table>`;
    w.document.write(`<html><head><title>Compliance Report</title><style>${css}</style></head><body>${body}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
    toast.success("PDF ready", { description: "Use the print dialog to save as PDF" });
  };

  const applyTemplate = (t: SavedTemplate) => {
    setF({ ...EMPTY, ...t.filters });
    toast.success(`Applied: ${t.name}`);
  };

  const saveTemplate = () => {
    if (!tplName.trim()) return;
    setTemplates((prev) => [...prev, {
      id: `t${Date.now()}`, name: tplName, description: "Custom saved view", filters: { ...f },
    }]);
    toast.success("Template saved");
    setTplName(""); setSaveOpen(false);
  };

  const addSchedule = () => {
    if (!schedDraft.name.trim() || !schedDraft.recipients.trim()) return;
    const next = new Date(); next.setDate(next.getDate() + 7);
    setSchedules((p) => [...p, {
      id: `s${Date.now()}`, name: schedDraft.name,
      recipients: schedDraft.recipients.split(",").map((s) => s.trim()).filter(Boolean),
      frequency: schedDraft.frequency, nextRun: next.toISOString(),
    }]);
    toast.success("Report scheduled");
    setSchedDraft({ name: "", recipients: "", frequency: "Weekly" });
    setScheduleOpen(false);
  };

  const activeFilterCount = Object.entries(f).filter(([k, v]) => v && v !== "all" && v !== "").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Compliance Reports</h1>
          <p className="text-sm text-muted-foreground">Auditing for client entertainment, procurement, and governance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}><FileSpreadsheet className="h-4 w-4" /> CSV</Button>
          <Button variant="outline" size="sm" onClick={exportPdf}><FileText className="h-4 w-4" /> PDF</Button>
          <Button size="sm" onClick={() => setScheduleOpen(true)}><CalendarIcon className="h-4 w-4" /> Schedule</Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard icon={ClipboardList} label="Total Events" value={summary.events} />
        <StatCard icon={Users} label="Guests Entertained" value={summary.guests} />
        <StatCard icon={History} label="High-Frequency Guests" value={summary.highFreq}
          hint={`≥ ${HIGH_FREQ} events in range`} tone={summary.highFreq > 0 ? "warning" : "default"} />
        <StatCard icon={DollarSign} label="High-Cost Events" value={summary.highCost}
          hint={`≥ £${HIGH_COST}/person`} tone={summary.highCost > 0 ? "warning" : "default"} />
        <StatCard icon={ShieldAlert} label="Pending Reviews" value={summary.pending}
          tone={summary.pending > 0 ? "danger" : "default"} />
      </div>

      {/* Saved templates */}
      <div className="flex flex-wrap items-center gap-2">
        <Bookmark className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Saved templates:</span>
        {templates.map((t) => (
          <button key={t.id} onClick={() => applyTemplate(t)}
            className="rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-medium text-foreground/80 shadow-sm transition-colors hover:bg-muted">
            {t.name}
          </button>
        ))}
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setSaveOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Save current
        </Button>
      </div>

      {/* Filter bar — Tokenized Utility */}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        {/* Top utility row: search + actions */}
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-2.5">
          <div className="relative flex flex-1 items-center">
            <Search className="pointer-events-none absolute left-0 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search host, guest, company, event…"
              value={f.query}
              onChange={(e) => setF({ ...f, query: e.target.value })}
              className="w-full bg-transparent pl-7 pr-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="h-4 w-px bg-border" />
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setF(EMPTY)} className="h-7 px-2 text-xs">
              <X className="h-3.5 w-3.5" /> Clear ({activeFilterCount})
            </Button>
          )}
        </div>

        {/* Ribbon row: filter tokens */}
        <div className="flex flex-wrap items-center gap-2 bg-muted/30 p-2.5">
          {/* Date range token */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="group flex items-center gap-1.5 rounded-md border border-border bg-card pl-2.5 pr-1.5 py-1 transition-colors hover:border-foreground/30">
                <span className="text-[10px] font-medium uppercase tracking-tight text-muted-foreground">Date</span>
                <span className="text-xs font-medium text-foreground">
                  {f.from || f.to
                    ? `${f.from ? format(new Date(f.from), "d MMM") : "…"} – ${f.to ? format(new Date(f.to), "d MMM") : "…"}`
                    : "Any time"}
                </span>
                <svg className="h-3 w-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="start">
              <div className="space-y-2">
                <div>
                  <Label className="text-[11px] text-muted-foreground">From</Label>
                  <Input type="date" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} className="h-8" />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">To</Label>
                  <Input type="date" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} className="h-8" />
                </div>
                {(f.from || f.to) && (
                  <Button variant="ghost" size="sm" className="h-7 w-full text-xs" onClick={() => setF({ ...f, from: "", to: "" })}>
                    Clear date
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Cost range token */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="group flex items-center gap-1.5 rounded-md border border-border bg-card pl-2.5 pr-1.5 py-1 transition-colors hover:border-foreground/30">
                <span className="text-[10px] font-medium uppercase tracking-tight text-muted-foreground">Cost</span>
                <span className="text-xs font-medium text-foreground">
                  {f.costMin || f.costMax
                    ? `£${f.costMin || "0"} – £${f.costMax || "∞"}`
                    : "Any price"}
                </span>
                <svg className="h-3 w-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="space-y-2">
                <div>
                  <Label className="text-[11px] text-muted-foreground">Min £</Label>
                  <Input type="number" value={f.costMin} onChange={(e) => setF({ ...f, costMin: e.target.value })} className="h-8" />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Max £</Label>
                  <Input type="number" value={f.costMax} onChange={(e) => setF({ ...f, costMax: e.target.value })} className="h-8" />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Guest token */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="group flex items-center gap-1.5 rounded-md border border-border bg-card pl-2.5 pr-1.5 py-1 transition-colors hover:border-foreground/30">
                <span className="text-[10px] font-medium uppercase tracking-tight text-muted-foreground">Guest</span>
                <span className="text-xs font-medium text-foreground">{f.guestName || "Any"}</span>
                <svg className="h-3 w-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-3" align="start">
              <Label className="text-[11px] text-muted-foreground">Guest name</Label>
              <Input value={f.guestName} onChange={(e) => setF({ ...f, guestName: e.target.value })} className="h-8" placeholder="e.g. Priya" />
            </PopoverContent>
          </Popover>

          <div className="mx-1 h-4 w-px bg-border" />

          {/* Categorical dropdowns — ghost token style */}
          {[
            { key: "hostName", label: "Hosts", allLabel: "All hosts", options: hosts },
            { key: "guestCompany", label: "Companies", allLabel: "All companies", options: companies },
            { key: "eventType", label: "Types", allLabel: "All types", options: eventTypes },
            { key: "bookingType", label: "Bookings", allLabel: "All bookings", options: bookingTypes },
            { key: "bookingStatus", label: "Status", allLabel: "All statuses", options: statuses },
            { key: "source", label: "Source", allLabel: "All sources", options: ["Inventory", "Enquiry", "Venue"] },
          ].map((cfg) => {
            const val = (f as any)[cfg.key] as string;
            const active = val !== "all";
            return (
              <Select key={cfg.key} value={val} onValueChange={(v) => setF({ ...f, [cfg.key]: v } as ReportFilters)}>
                <SelectTrigger
                  className={cn(
                    "h-7 w-auto gap-1.5 rounded-md border-0 bg-transparent px-2.5 text-xs font-medium shadow-none hover:bg-muted focus:ring-0 focus:ring-offset-0",
                    active ? "bg-card text-foreground border border-border" : "text-muted-foreground",
                  )}
                >
                  {active ? <span className="text-foreground">{val}</span> : cfg.label}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{cfg.allLabel}</SelectItem>
                  {cfg.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        {/* Table */}
        <div className="rounded-xl border border-border/60 bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <div className="text-sm">
              <span className="font-semibold">{sorted.length}</span>
              <span className="text-muted-foreground"> of {rows.length} rows</span>
            </div>
            <div className="text-xs text-muted-foreground">One row per guest per booking · cross-pillar</div>
          </div>
          <div className="max-h-[640px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur">
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <Th onClick={() => toggleSort("hostName")} active={sort.k === "hostName"}>Host</Th>
                  <Th onClick={() => toggleSort("guestName")} active={sort.k === "guestName"}>Guest</Th>
                  <th className="px-3 py-2 font-medium">Company</th>
                  <Th onClick={() => toggleSort("eventName")} active={sort.k === "eventName"}>Event</Th>
                  <Th onClick={() => toggleSort("eventDate")} active={sort.k === "eventDate"}>Date</Th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Booking</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <Th onClick={() => toggleSort("costPerPerson")} active={sort.k === "costPerPerson"}>Cost/Person</Th>
                  <Th onClick={() => toggleSort("frequency")} active={sort.k === "frequency"}>Freq</Th>
                  <th className="px-3 py-2 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr><td colSpan={11} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No rows match the current filters.
                  </td></tr>
                ) : sorted.map((r) => {
                  const freq = frequencyMap.get(r.guestEmail) ?? 0;
                  const highFreq = freq >= HIGH_FREQ;
                  const highCost = (r.costPerPerson ?? 0) >= HIGH_COST;
                  return (
                    <tr key={r.id} onClick={() => setSelected(r)}
                      className="cursor-pointer border-t border-border/40 transition-colors hover:bg-muted/40">
                      <td className="px-3 py-2.5">
                        <div className="font-medium">{r.hostName}</div>
                        <div className="text-[11px] text-muted-foreground">{r.hostTeam}</div>
                      </td>
                      <td className="px-3 py-2.5 font-medium">{r.guestName}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{r.guestCompany}</td>
                      <td className="px-3 py-2.5">{r.eventName}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{format(new Date(r.eventDate), "dd MMM yyyy")}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{r.eventType}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{r.bookingType}</td>
                      <td className="px-3 py-2.5">
                        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap", STATUS_CHIP[r.bookingStatus])}>
                          {r.bookingStatus}
                        </span>
                      </td>
                      <td className={cn("px-3 py-2.5 whitespace-nowrap font-medium", highCost && "text-[hsl(35_85%_40%)]")}>
                        <div className="flex items-center gap-1">
                          {highCost && <AlertTriangle className="h-3 w-3" />}
                          {fmtMoney(r.costPerPerson)}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          highFreq ? "bg-[hsl(35_95%_92%)] text-[hsl(35_85%_38%)]" : "bg-muted text-muted-foreground")}>
                          {freq}{highFreq && <AlertTriangle className="ml-1 h-3 w-3" />}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold", SOURCE_CHIP[r.source])}>
                          {r.source}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side panel: scheduled reports */}
        <div className="space-y-3">
          <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Scheduled reports</h3>
              </div>
              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setScheduleOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="space-y-2">
              {schedules.map((s) => (
                <div key={s.id} className="rounded-lg border border-border/50 bg-background/50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{s.name}</div>
                      <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{s.recipients.join(", ")}</div>
                    </div>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                      {s.frequency}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    Next run: {format(new Date(s.nextRun), "PP")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-[560px]">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold", STATUS_CHIP[selected.bookingStatus])}>
                    {selected.bookingStatus}
                  </span>
                  <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold", SOURCE_CHIP[selected.source])}>
                    {selected.source}
                  </span>
                </div>
                <SheetTitle className="pt-2">{selected.eventName}</SheetTitle>
                <SheetDescription>
                  {format(new Date(selected.eventDate), "EEEE, dd MMM yyyy")} · {selected.eventType}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-5 space-y-5">
                <section className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Guest</h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-medium">{selected.guestName}</span></div>
                    <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">{selected.guestCompany}</span></div>
                    <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">{selected.guestEmail}</span></div>
                  </div>
                </section>

                <section className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Booking</h4>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div><dt className="text-[11px] text-muted-foreground">Host</dt><dd className="font-medium">{selected.hostName}</dd></div>
                    <div><dt className="text-[11px] text-muted-foreground">Team</dt><dd className="font-medium">{selected.hostTeam}</dd></div>
                    <div><dt className="text-[11px] text-muted-foreground">Booking type</dt><dd className="font-medium">{selected.bookingType}</dd></div>
                    <div><dt className="text-[11px] text-muted-foreground">Cost / person</dt><dd className="font-medium">{fmtMoney(selected.costPerPerson)}</dd></div>
                  </dl>
                </section>

                <section className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Guest history</h4>
                  <div className="space-y-2">
                    {rows.filter((r) => r.guestEmail === selected.guestEmail).slice(0, 6).map((r) => (
                      <div key={r.id} className="flex items-center justify-between rounded-md border border-border/40 bg-background px-3 py-2 text-sm">
                        <div className="min-w-0">
                          <div className="truncate font-medium">{r.eventName}</div>
                          <div className="text-[11px] text-muted-foreground">{format(new Date(r.eventDate), "PP")} · host {r.hostName}</div>
                        </div>
                        <div className="text-xs font-medium text-muted-foreground">{fmtMoney(r.costPerPerson)}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Audit trail</h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex gap-2"><span className="text-muted-foreground">{format(new Date(selected.eventDate), "PP")}</span><span>Booking created by {selected.hostName}</span></li>
                    <li className="flex gap-2"><span className="text-muted-foreground">{format(new Date(selected.eventDate), "PP")}</span><span>Guest invited — {selected.guestName}</span></li>
                    <li className="flex gap-2"><span className="text-muted-foreground">{format(new Date(selected.eventDate), "PP")}</span><span>Status set to {selected.bookingStatus}</span></li>
                    {(selected.costPerPerson ?? 0) >= HIGH_COST && (
                      <li className="flex gap-2 text-[hsl(35_85%_40%)]"><AlertTriangle className="h-3.5 w-3.5 shrink-0" /><span>Flagged for compliance review — high cost per person</span></li>
                    )}
                  </ul>
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Save template dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save report template</DialogTitle>
            <DialogDescription>Save the current filter configuration to re-run later.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="tpl-name">Template name</Label>
            <Input id="tpl-name" value={tplName} onChange={(e) => setTplName(e.target.value)} placeholder="e.g. Q1 Compliance Review" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>Cancel</Button>
            <Button onClick={saveTemplate}>Save template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule report dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule report</DialogTitle>
            <DialogDescription>Send this report on a recurring schedule.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Report name</Label>
              <Input value={schedDraft.name} onChange={(e) => setSchedDraft({ ...schedDraft, name: e.target.value })} placeholder="Weekly Compliance Digest" />
            </div>
            <div className="space-y-2">
              <Label>Recipients (comma-separated)</Label>
              <Input value={schedDraft.recipients} onChange={(e) => setSchedDraft({ ...schedDraft, recipients: e.target.value })} placeholder="compliance@firm.com, audit@firm.com" />
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={schedDraft.frequency} onValueChange={(v) => setSchedDraft({ ...schedDraft, frequency: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button onClick={addSchedule}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Th({ children, onClick, active }: { children: React.ReactNode; onClick: () => void; active: boolean }) {
  return (
    <th className="px-3 py-2 font-medium">
      <button onClick={onClick} className={cn("inline-flex items-center gap-1 hover:text-foreground", active && "text-foreground")}>
        {children}<ArrowUpDown className="h-3 w-3" />
      </button>
    </th>
  );
}
