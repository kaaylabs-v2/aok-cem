import { useMemo, useState } from "react";
import {
  Bell, Inbox, LayoutDashboard, Calendar, Boxes, Users2, BarChart3,
  Settings, Headphones, LogOut, Search, Filter, Sparkles,
  Calendar as CalendarIcon, TrendingUp, ListChecks,
  ArrowUpRight, Target, Smile, AlertTriangle, ClipboardList, LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  events as allEvents, eventTypes, venues, utilisation, isUnderperforming,
  PortfolioEvent, EventStatus,
} from "@/data/portfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventDrawer } from "@/components/EventDrawer";
import { WaitlistDialog } from "@/components/WaitlistDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Tag } from "lucide-react";

/* ---------- Sidebar ---------- */
type RailItem = { icon: any; label: string; active?: boolean };

function RailButton({ it }: { it: RailItem }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          aria-label={it.label}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
            it.active ? "bg-[hsl(140_55%_55%)] text-white" : "hover:bg-white/10"
          )}
        >
          <it.icon className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>{it.label}</TooltipContent>
    </Tooltip>
  );
}

function SideRail() {
  const top: RailItem[] = [
    { icon: Bell, label: "Notifications" },
    { icon: Inbox, label: "Inbox" },
  ];
  const main: RailItem[] = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: BookOpen, label: "Knowledge Base" },
    { icon: Users2, label: "Audience" },
    { icon: BarChart3, label: "Analytics" },
    { icon: LayoutGrid, label: "Apps" },
  ];
  const bottom: RailItem[] = [
    { icon: Settings, label: "Settings" },
    { icon: Headphones, label: "Support" },
    { icon: LogOut, label: "Log out" },
  ];

  return (
    <TooltipProvider delayDuration={150}>
      <aside className="flex h-full w-16 shrink-0 flex-col items-center gap-6 rounded-[2rem] bg-[hsl(150_15%_15%)] py-5 text-white/80">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[hsl(150_15%_15%)]">
              <Sparkles className="h-5 w-5" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>Portfolio</TooltipContent>
        </Tooltip>
        <div className="flex flex-col gap-3">
          {top.map((it, i) => <RailButton key={i} it={it} />)}
        </div>
        <div className="mt-4 flex flex-1 flex-col gap-2">
          {main.map((it, i) => <RailButton key={i} it={it} />)}
        </div>
        <div className="flex flex-col gap-2">
          {bottom.map((it, i) => <RailButton key={i} it={it} />)}
        </div>
      </aside>
    </TooltipProvider>
  );
}


/* ---------- Stat ---------- */
function SoftStat({ icon: Icon, tint, label, value }: { icon: any; tint: string; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2 text-sm text-foreground/70">
        <span className={cn("flex h-6 w-6 items-center justify-center rounded-md", tint)}>
          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</div>
    </div>
  );
}

/* ---------- Bookings line chart (real data: per upcoming event by date) ---------- */
function BookingsChart({ events }: { events: PortfolioEvent[] }) {
  const sorted = [...events].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const points = sorted.map((e) => ({ e, util: utilisation(e), booked: e.booked }));
  const [hover, setHover] = useState<number | null>(points.length ? Math.max(0, points.findIndex((p) => p.util === Math.max(...points.map(x => x.util)))) : null);

  const w = 560, h = 180, p = 24;
  const max = Math.max(...points.map((x) => x.util), 100);
  const xs = points.map((_, i) => p + (i * (w - p * 2)) / Math.max(1, points.length - 1));
  const ys = points.map((x) => h - p - (x.util / max) * (h - p * 2));
  const path = points.map((_, i) => `${i === 0 ? "M" : "L"}${xs[i].toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  // capacity baseline (booked vs capacity → second line as booked-share scaled)
  const ys2 = points.map((x) => h - p - (Math.min(100, (x.booked / Math.max(...points.map(p => p.booked))) * 100) / max) * (h - p * 2));
  const path2 = points.map((_, i) => `${i === 0 ? "M" : "L"}${xs[i].toFixed(1)},${ys2[i].toFixed(1)}`).join(" ");

  const hi = hover ?? 0;
  const hp = points[hi];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <path d={path2} fill="none" stroke="hsl(220 15% 80%)" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d={path} fill="none" stroke="hsl(18 85% 58%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {hp && (
          <>
            <line x1={xs[hi]} y1={p} x2={xs[hi]} y2={h - p} stroke="hsl(220 15% 70%)" strokeDasharray="2 3" />
            <circle cx={xs[hi]} cy={ys[hi]} r="4" fill="hsl(18 85% 58%)" stroke="white" strokeWidth="2" />
          </>
        )}
        {points.map((_, i) => (
          <rect
            key={i}
            x={xs[i] - 12}
            y={0}
            width={24}
            height={h}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            style={{ cursor: "pointer" }}
          />
        ))}
      </svg>
      {hp && (
        <div
          className="pointer-events-none absolute rounded-xl border border-black/5 bg-white px-3 py-2 text-xs shadow-md"
          style={{ left: `${(xs[hi] / w) * 100}%`, top: 0, transform: "translate(-50%, -10%)" }}
        >
          <div className="text-foreground/60">{new Date(hp.e.date).toLocaleDateString(undefined, { weekday: "short" })},</div>
          <div className="font-semibold">{new Date(hp.e.date).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}</div>
          <div className="mt-1 text-foreground/60">Bookings: <span className="font-semibold text-foreground">{hp.e.booked}</span></div>
          <div className="text-[hsl(140_55%_45%)] font-medium">{hp.util}% utilisation</div>
        </div>
      )}
      <div className="mt-2 flex justify-between px-5 text-xs text-foreground/50">
        {points.slice(0, 5).map((x, i) => (
          <span key={i}>{new Date(x.e.date).toLocaleDateString(undefined, { weekday: "short" })}</span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-5 text-xs text-foreground/60">
        <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded bg-[hsl(220_15%_80%)]" /> Bookings</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded bg-[hsl(18_85%_58%)]" /> Utilisation</span>
      </div>
    </div>
  );
}

/* ---------- Type bars (real: events grouped by type) ---------- */
const TYPE_COLORS: Record<string, { bar: string; chip: string }> = {
  Conference: { bar: "bg-[hsl(220_85%_70%)]", chip: "bg-[hsl(220_85%_55%)]" },
  Workshop:   { bar: "bg-[hsl(45_95%_70%)]",  chip: "bg-[hsl(35_85%_50%)]" },
  Networking: { bar: "bg-[hsl(140_55%_60%)]", chip: "bg-[hsl(140_55%_40%)]" },
  Webinar:    { bar: "bg-[hsl(330_75%_75%)]", chip: "bg-[hsl(330_70%_55%)]" },
  Gala:       { bar: "bg-[hsl(18_85%_70%)]",  chip: "bg-[hsl(18_85%_55%)]" },
};

function TypeBars({ events }: { events: PortfolioEvent[] }) {
  const groups = eventTypes.map((t) => {
    const list = events.filter((e) => e.type === t);
    return { type: t, count: list.length, booked: list.reduce((s, e) => s + e.booked, 0) };
  });
  const max = Math.max(...groups.map((g) => g.booked), 1);
  return (
    <div>
      <div className="flex h-[180px] items-end justify-around gap-3 px-2">
        {groups.map((g) => {
          const c = TYPE_COLORS[g.type];
          const h = Math.max(18, (g.booked / max) * 100);
          return (
            <div key={g.type} className={cn("relative flex w-12 flex-col items-center justify-start rounded-2xl pt-2", c.bar)} style={{ height: `${h}%` }}>
              <span className={cn("flex h-7 w-7 items-center justify-center rounded-md text-white text-[11px] font-semibold", c.chip)}>
                {g.count}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-around gap-3 px-2 text-[11px] text-foreground/60">
        {groups.map((g) => <span key={g.type} className="w-12 truncate text-center">{g.type}</span>)}
      </div>
    </div>
  );
}

/* ---------- Attention side card (real underperforming events) ---------- */
function AttentionCard({ events, onOpen }: { events: PortfolioEvent[]; onOpen: (e: PortfolioEvent) => void }) {
  const items = events.filter(isUnderperforming).slice(0, 3);
  const fallback = events.slice(0, 2);
  const list = items.length ? items : fallback;
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Needs attention</h3>
        <span className="rounded-full bg-[hsl(0_75%_95%)] px-2 py-0.5 text-xs font-medium text-[hsl(0_75%_45%)]">{items.length}</span>
      </div>
      <div className="mt-3 space-y-3">
        {list.map((e) => {
          const u = utilisation(e);
          const days = Math.ceil((+new Date(e.date) - Date.now()) / 86400000);
          return (
            <button
              key={e.id}
              onClick={() => onOpen(e)}
              className="block w-full rounded-2xl border border-black/5 bg-[hsl(220_20%_98%)] p-4 text-left transition hover:border-[hsl(18_85%_70%)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-white">
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{e.name}</div>
                    <div className="mt-0.5 text-xs text-foreground/50">
                      {e.venue} · in {days}d
                    </div>
                  </div>
                </div>
                <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", u < 50 ? "bg-[hsl(0_75%_95%)] text-[hsl(0_75%_45%)]" : "bg-[hsl(45_95%_92%)] text-[hsl(35_85%_40%)]")}>
                  {u}%
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
                <div className="h-full rounded-full bg-[hsl(18_85%_58%)]" style={{ width: `${u}%` }} />
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-foreground/60">
                <span className={cn("rounded-md px-2 py-0.5 font-medium text-white", TYPE_COLORS[e.type].chip)}>{e.type}</span>
                <span>{e.booked} / {e.capacity} booked</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Status pill ---------- */
function StatusPill({ status }: { status: EventStatus }) {
  const map: Record<EventStatus, string> = {
    available: "border-[hsl(140_55%_55%)] text-[hsl(140_55%_40%)]",
    partial: "border-[hsl(220_85%_60%)] text-[hsl(220_85%_55%)]",
    full: "border-[hsl(0_75%_60%)] text-[hsl(0_75%_55%)]",
    waitlisted: "border-[hsl(45_95%_55%)] text-[hsl(35_85%_45%)]",
    cancelled: "border-foreground/20 text-foreground/50",
  };
  return (
    <span className={cn("rounded-full border bg-white px-3 py-1 text-xs font-medium", map[status])}>
      {status[0].toUpperCase() + status.slice(1)}
    </span>
  );
}

/* ---------- Utilisation bar (real %) ---------- */
function UtilBar({ pct }: { pct: number }) {
  const tone = pct >= 70 ? "hsl(140_55%_50%)" : pct >= 40 ? "hsl(220_85%_60%)" : "hsl(0_75%_60%)";
  const label = pct >= 70 ? "High" : pct >= 40 ? "Medium" : "Low";
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="h-1.5 w-2 rounded-sm" style={{ background: i < Math.round(pct / 10) ? tone : "hsl(220 10% 90%)" }} />
        ))}
      </div>
      <span className="text-xs font-medium" style={{ color: tone }}>{label}</span>
    </div>
  );
}

/* ---------- Main page ---------- */
export default function IndexV2() {
  const [tab, setTab] = useState<"all" | EventStatus>("all");
  const [venue, setVenue] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PortfolioEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  const upcoming = allEvents.filter((e) => !e.past);

  const filtered = useMemo(() => {
    let list = upcoming;
    if (tab !== "all") list = list.filter((e) => e.status === tab);
    if (venue !== "all") list = list.filter((e) => e.venue === venue);
    if (type !== "all") list = list.filter((e) => e.type === type);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  }, [upcoming, tab, venue, type, query]);

  const summary = useMemo(() => {
    const totalBookings = upcoming.reduce((s, e) => s + e.booked, 0);
    const totalCap = upcoming.reduce((s, e) => s + e.capacity, 0);
    const avg = totalCap ? Math.round((totalBookings / totalCap) * 100) : 0;
    return {
      totalEvents: upcoming.length,
      bookings: totalBookings,
      avgUtil: avg,
      attention: upcoming.filter(isUnderperforming).length,
    };
  }, [upcoming]);

  const openEvent = (e: PortfolioEvent) => { setSelected(e); setDrawerOpen(true); };

  return (
    <div className="min-h-screen w-full bg-[hsl(220_30%_94%)] p-3">
      <div className="flex gap-3">
        <div className="sticky top-3 h-[calc(100vh-1.5rem)] shrink-0">
          <SideRail />
        </div>

        <div className="flex-1 rounded-[2rem] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-lg font-medium text-foreground/70">
                Hey Elena <span>👋</span>
              </div>
              <h1 className="mt-2 font-display text-5xl font-semibold leading-[1.1] tracking-tight text-foreground/30">
                {summary.attention} events <ArrowUpRight className="inline h-8 w-8 text-foreground/40" strokeWidth={1.5} />
              </h1>
              <h2 className="font-display text-5xl font-semibold leading-[1.1] tracking-tight text-foreground">
                need your attention
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="rounded-full border-black/10 bg-white" onClick={() => setWaitlistOpen(true)}>
                <ClipboardList className="mr-1.5 h-4 w-4" /> Waitlist
              </Button>
            </div>
          </div>

          {/* Stat row */}
          <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SoftStat icon={CalendarIcon} tint="bg-[hsl(220_85%_92%)] text-[hsl(220_85%_50%)]" label="Total Events" value={summary.totalEvents} />
            <SoftStat icon={Users2} tint="bg-[hsl(45_95%_88%)] text-[hsl(35_85%_45%)]" label="Total Bookings" value={summary.bookings.toLocaleString()} />
            <SoftStat icon={Target} tint="bg-[hsl(140_55%_88%)] text-[hsl(140_55%_35%)]" label="Avg. Utilisation" value={`${summary.avgUtil}%`} />
            <SoftStat icon={Smile} tint="bg-[hsl(330_75%_92%)] text-[hsl(330_70%_50%)]" label="Need Attention" value={summary.attention} />
          </div>

          {/* Charts row */}
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Bookings Over Time</h3>
                <span className="text-xs text-foreground/50">Upcoming events</span>
              </div>
              <div className="mt-3"><BookingsChart events={upcoming} /></div>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Bookings by Type</h3>
                <span className="text-xs text-foreground/50">{upcoming.length} events</span>
              </div>
              <div className="mt-3"><TypeBars events={upcoming} /></div>
            </div>
            <AttentionCard events={upcoming} onOpen={openEvent} />
          </div>

          {/* Table section */}
          <div className="mt-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 rounded-xl border border-black/10 p-1">
                {(["all", "available", "partial", "full", "waitlisted"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium capitalize",
                      tab === t ? "bg-[hsl(220_20%_96%)] text-foreground" : "text-foreground/50"
                    )}
                  >
                    {t === "all" ? <ListChecks className="h-3.5 w-3.5" /> : t === "full" ? <TrendingUp className="h-3.5 w-3.5" /> : <LayoutGrid className="h-3.5 w-3.5" />}
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/40" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-9 w-[200px] rounded-xl border-black/10 bg-[hsl(220_20%_97%)] pl-9 text-xs"
                    placeholder="Search events"
                  />
                </div>
                <Select value={venue} onValueChange={setVenue}>
                  <SelectTrigger className="h-9 w-[170px] rounded-xl border-black/10 bg-[hsl(220_20%_97%)] px-3 text-xs font-medium text-foreground shadow-none hover:bg-[hsl(220_20%_95%)] focus:ring-0 focus:ring-offset-0 [&>svg]:text-foreground/40">
                    <MapPin className="mr-1.5 h-3.5 w-3.5 text-foreground/50" />
                    <SelectValue placeholder="Venue" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-black/5 bg-white shadow-lg">
                    <SelectItem value="all" className="rounded-lg text-xs">All venues</SelectItem>
                    {venues.map((v) => (
                      <SelectItem key={v} value={v} className="rounded-lg text-xs">{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-9 w-[150px] rounded-xl border-black/10 bg-[hsl(220_20%_97%)] px-3 text-xs font-medium text-foreground shadow-none hover:bg-[hsl(220_20%_95%)] focus:ring-0 focus:ring-offset-0 [&>svg]:text-foreground/40">
                    <Tag className="mr-1.5 h-3.5 w-3.5 text-foreground/50" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-black/5 bg-white shadow-lg">
                    <SelectItem value="all" className="rounded-lg text-xs">All types</SelectItem>
                    {eventTypes.map((t) => {
                      const c = TYPE_COLORS[t];
                      return (
                        <SelectItem key={t} value={t} className="rounded-lg text-xs">
                          <span className="flex items-center gap-2">
                            <span className={cn("h-2.5 w-2.5 rounded-sm", c?.chip)} />
                            {t}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 overflow-hidden">
              <div className="grid grid-cols-[120px_1.6fr_1.2fr_1fr_1.2fr_1fr_1fr_110px] items-center gap-3 border-b border-black/5 px-3 py-3 text-xs font-medium text-foreground/50">
                <span>Event ID</span>
                <span>Subject</span>
                <span>Venue</span>
                <span>Type</span>
                <span>Utilisation</span>
                <span>Date</span>
                <span>Booked</span>
                <span>Status</span>
              </div>
              {filtered.length === 0 && (
                <div className="px-3 py-8 text-center text-sm text-foreground/50">No events match your filters.</div>
              )}
              {filtered.map((e, i) => {
                const u = utilisation(e);
                return (
                  <button
                    key={e.id}
                    onClick={() => openEvent(e)}
                    className={cn(
                      "grid w-full grid-cols-[120px_1.6fr_1.2fr_1fr_1.2fr_1fr_1fr_110px] items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors",
                      i % 2 === 1 ? "bg-[hsl(220_20%_98%)]" : "hover:bg-[hsl(220_20%_98%)]"
                    )}
                  >
                    <span className="font-medium text-foreground">EVT-{1024 + i}</span>
                    <span className="truncate text-foreground/80">{e.name}</span>
                    <span className="truncate text-foreground/60">{e.venue}</span>
                    <span className="flex items-center gap-1.5 text-xs text-foreground/70">
                      <span className={cn("h-4 w-4 rounded", TYPE_COLORS[e.type].chip)} />
                      {e.type}
                    </span>
                    <UtilBar pct={u} />
                    <span className="text-xs text-foreground/70">
                      {new Date(e.date).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                    <span className="text-xs text-foreground/70 tabular-nums">{e.booked} / {e.capacity}</span>
                    <StatusPill status={e.status} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <EventDrawer event={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
      <WaitlistDialog open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </div>
  );
}
