import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VenueSourcingTabs } from "@/components/venue-sourcing/VenueSourcingTabs";
import { SyncBanner } from "@/components/venue-sourcing/SyncBanner";
import { EngagementDetailDrawer } from "@/components/venue-sourcing/EngagementDetailDrawer";
import { ConcessionList } from "@/components/venue-sourcing/ConcessionList";
import {
  ENGAGEMENTS, VenueEngagement, summariseVenueSourcing, fmtGbp, fmtPct,
  savingsValue, savingsPct, TENANT_CONFIG, ConcessionType,
} from "@/data/venueSourcing";
import { NotificationItem } from "@/data/portfolio";
import {
  Handshake, TrendingDown, Percent, CheckCircle2, MessageSquare, Activity,
  Download, FileBarChart2, ListChecks, Search, Eye,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_TONE: Record<string, string> = {
  Completed: "border-success/30 bg-success/10 text-success",
  "Awaiting Contract": "border-primary/30 bg-primary/10 text-primary",
  "In Negotiation": "border-warning/30 bg-warning/10 text-warning",
  Active: "border-muted-foreground/30 bg-muted text-muted-foreground",
  Cancelled: "border-destructive/30 bg-destructive/10 text-destructive",
};

const VENUES = Array.from(new Set(ENGAGEMENTS.map((e) => e.venue)));
const EVENTS = Array.from(new Set(ENGAGEMENTS.map((e) => e.eventName)));
const CONCESSIONS: ConcessionType[] = [
  "Meeting Room","AV Package","Parking","Catering","Accommodation","Cancellation Terms","WiFi","Branding",
];

function exportCsv(rows: VenueEngagement[]) {
  const headers = ["ID","Event","Venue","Status","Initial","Negotiated","Final","Savings","Savings %","Concessions","Last Synced"];
  const lines = rows.map((e) => [
    e.id, e.eventName, e.venue, e.status,
    e.initialQuote ?? "", e.negotiatedPrice ?? "", e.finalContractPrice ?? "",
    savingsValue(e) ?? "", savingsPct(e)?.toFixed(1) ?? "",
    e.concessions.map((c) => c.label).join("; "),
    e.lastSynced,
  ].map((v) => `"${String(v).replace(/"/g,'""')}"`).join(","));
  const blob = new Blob([[headers.join(","), ...lines].join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `venue-savings-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

const VenueSourcing = () => {
  const { pathname } = useLocation();
  const k = summariseVenueSourcing();

  const [venueF, setVenueF] = useState("all");
  const [eventF, setEventF] = useState("all");
  const [statusF, setStatusF] = useState("all");
  const [savingsRange, setSavingsRange] = useState("all");
  const [concessionF, setConcessionF] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<VenueEngagement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    let r = ENGAGEMENTS;
    if (venueF !== "all") r = r.filter((e) => e.venue === venueF);
    if (eventF !== "all") r = r.filter((e) => e.eventName === eventF);
    if (statusF !== "all") r = r.filter((e) => e.status === statusF);
    if (concessionF !== "all") r = r.filter((e) => e.concessions.some((c) => c.type === concessionF));
    if (savingsRange !== "all") {
      r = r.filter((e) => {
        const p = savingsPct(e);
        if (p == null) return savingsRange === "pending";
        if (savingsRange === "0-5") return p < 5;
        if (savingsRange === "5-10") return p >= 5 && p < 10;
        if (savingsRange === "10-20") return p >= 10 && p < 20;
        if (savingsRange === "20+") return p >= 20;
        return true;
      });
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((e) =>
        e.id.toLowerCase().includes(q) ||
        e.eventName.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q)
      );
    }
    return r;
  }, [venueF, eventF, statusF, savingsRange, concessionF, query]);

  const onOpen = (e: VenueEngagement) => { setSelected(e); setDrawerOpen(true); };
  const onOpenNotification = (_n: NotificationItem) => {};
  const lastSync = ENGAGEMENTS.reduce((m, e) => e.lastSynced > m ? e.lastSynced : m, ENGAGEMENTS[0].lastSynced);

  return (
    <>
      <AppShell onOpenNotification={onOpenNotification}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">Venue Sourcing</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Track venue sourcing engagements, negotiated savings, supplier performance, and post-event feedback.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => exportCsv(filtered)}>
                <Download className="mr-1.5 h-4 w-4" /> Export Report
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Savings report generation queued.")}>
                <FileBarChart2 className="mr-1.5 h-4 w-4" /> Generate Savings Report
              </Button>
              <Button size="sm" variant="outline" onClick={() => setStatusF("Completed")}>
                <ListChecks className="mr-1.5 h-4 w-4" /> Completed Engagements
              </Button>
            </div>
          </div>

          <SyncBanner lastSynced={lastSync} />

          {/* KPI summary */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <StatCard icon={Handshake}      label="Total Engagements"    value={k.totalEngagements}                sub="all-time"     trend={6} variant="sparkline" />
            <StatCard icon={TrendingDown}   label="Negotiated Savings"   value={fmtGbp(k.totalSavings)}            sub="vs initial"   trend={12} variant="radial" progress={Math.min(99, k.avgSavingPct * 4)} />
            <StatCard icon={Percent}        label="Average Saving %"     value={`${k.avgSavingPct.toFixed(1)}%`}   sub="portfolio"    trend={3} variant="gauge" progress={Math.min(99, k.avgSavingPct * 4)} />
            <StatCard icon={CheckCircle2}   label="Completed"            value={k.completed}                        sub="engagements"  trend={4} variant="matrix" />
            <StatCard icon={MessageSquare}  label="Pending Feedback"     value={k.pendingFeedback}                  sub="action req."  trend={-2} variant="sparkline" />
            <StatCard icon={Activity}       label="Active Requests"      value={k.active}                           sub="in flight"    trend={2} variant="radial" progress={70} />
          </div>

          <VenueSourcingTabs currentPath={pathname} />

          {/* Aggregate savings */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Total Initial Quote</div>
              <div className="mt-1 text-xl font-semibold tabular-nums">{fmtGbp(k.totalInitial)}</div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Total Negotiated</div>
              <div className="mt-1 text-xl font-semibold tabular-nums">{fmtGbp(k.totalNegotiated)}</div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Total Final Contract</div>
              <div className="mt-1 text-xl font-semibold tabular-nums">{fmtGbp(k.totalFinal)}</div>
            </div>
            <div className="rounded-2xl border border-success/30 bg-success/5 p-4">
              <div className="text-[11px] uppercase tracking-wide text-success/80">Total Concessions Value</div>
              <div className="mt-1 text-xl font-semibold tabular-nums text-success">{fmtGbp(k.totalConcessions)}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="sticky top-0 z-10 rounded-2xl border border-border/60 bg-card/95 p-3 shadow-xs backdrop-blur">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-6">
              <div className="relative lg:col-span-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search engagement, event or venue…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
              </div>
              <Select value={venueF} onValueChange={setVenueF}>
                <SelectTrigger><SelectValue placeholder="Venue" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All venues</SelectItem>{VENUES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={eventF} onValueChange={setEventF}>
                <SelectTrigger><SelectValue placeholder="Event" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All events</SelectItem>{EVENTS.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={statusF} onValueChange={setStatusF}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="In Negotiation">In Negotiation</SelectItem>
                  <SelectItem value="Awaiting Contract">Awaiting Contract</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={savingsRange} onValueChange={setSavingsRange}>
                <SelectTrigger><SelectValue placeholder="Savings %" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any savings</SelectItem>
                  <SelectItem value="0-5">Under 5%</SelectItem>
                  <SelectItem value="5-10">5–10%</SelectItem>
                  <SelectItem value="10-20">10–20%</SelectItem>
                  <SelectItem value="20+">20%+</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={concessionF} onValueChange={setConcessionF}>
                <SelectTrigger><SelectValue placeholder="Concession" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any concession</SelectItem>
                  {CONCESSIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Savings table */}
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs">
            <div className="max-h-[640px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-secondary/60 backdrop-blur">
                  <tr className="border-b border-border/60 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-3">Engagement</th>
                    <th className="px-3 py-3">Event / Venue</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3 text-right">Initial</th>
                    <th className="px-3 py-3 text-right">Negotiated</th>
                    <th className="px-3 py-3 text-right">Final</th>
                    <th className="px-3 py-3 text-right">Savings</th>
                    <th className="px-3 py-3 text-right">%</th>
                    <th className="px-3 py-3">Concessions</th>
                    {TENANT_CONFIG.showCommission && <th className="px-3 py-3 text-right">Commission</th>}
                    <th className="px-3 py-3">Last Synced</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => {
                    const sv = savingsValue(e);
                    const sp = savingsPct(e);
                    return (
                      <tr key={e.id} onClick={() => onOpen(e)} className="cursor-pointer border-b border-border/50 transition-colors hover:bg-secondary/40">
                        <td className="px-3 py-2.5 font-mono text-xs">{e.id}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col leading-tight">
                            <span className="text-sm font-medium">{e.eventName}</span>
                            <span className="text-[11px] text-muted-foreground">{e.venue} · {e.location}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5"><Badge variant="outline" className={STATUS_TONE[e.status]}>{e.status}</Badge></td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{fmtGbp(e.initialQuote)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{fmtGbp(e.negotiatedPrice)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{fmtGbp(e.finalContractPrice)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {sv == null ? <span className="text-muted-foreground">Pending</span> : <span className="font-semibold text-success">{fmtGbp(sv)}</span>}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{fmtPct(sp)}</td>
                        <td className="px-3 py-2.5 max-w-[220px]">
                          {e.concessions.length === 0
                            ? <span className="text-xs text-muted-foreground">Pending</span>
                            : <ConcessionList items={e.concessions.slice(0, 3)} dense />
                          }
                          {e.concessions.length > 3 && (
                            <span className="ml-1 text-[10px] text-muted-foreground">+{e.concessions.length - 3} more</span>
                          )}
                        </td>
                        {TENANT_CONFIG.showCommission && (
                          <td className="px-3 py-2.5 text-right tabular-nums text-xs">
                            {e.commissionPct != null ? `${e.commissionPct}% · ${fmtGbp(e.commissionValue ?? null)}` : <span className="text-muted-foreground">Pending</span>}
                          </td>
                        )}
                        <td className="px-3 py-2.5 text-[11px] text-muted-foreground">{new Date(e.lastSynced).toLocaleDateString()}</td>
                        <td className="px-3 py-2.5 text-right">
                          <Button size="sm" variant="ghost" onClick={(ev) => { ev.stopPropagation(); onOpen(e); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={TENANT_CONFIG.showCommission ? 12 : 11} className="px-6 py-12 text-center text-sm text-muted-foreground">No engagements match the current filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppShell>
      <EngagementDetailDrawer engagement={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
};

export default VenueSourcing;
