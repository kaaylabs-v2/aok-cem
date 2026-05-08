import { useMemo, useState } from "react";
import {
  Bell, Inbox, LayoutDashboard, Calendar, Boxes, Users2, BarChart3,
  Settings, Headphones, LogOut, Search, Filter, Sparkles,
  Calendar as CalendarIcon, TrendingUp, ListChecks,
  ArrowUpRight, Target, Smile, AlertTriangle, ClipboardList, LayoutGrid, ChevronsLeft, ChevronsRight,
  FileSearch, ChevronDown, Check,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { EnquiriesView } from "@/components/EnquiriesView";
import { cn } from "@/lib/utils";
import {
  events as allEvents, eventTypes, venues, utilisation, isUnderperforming, notifications as initialNotifications,
  PortfolioEvent, EventStatus, NotificationItem,
} from "@/data/portfolio";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventDrawer } from "@/components/EventDrawer";
import { WaitlistDialog } from "@/components/WaitlistDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Tag } from "lucide-react";

/* ---------- Sidebar ---------- */
type RailItem = { icon: any; label: string; active?: boolean; onClick?: () => void };

function RailButton({ it, expanded }: { it: RailItem; expanded: boolean }) {
  const btn = (
    <button
      aria-label={it.label}
      onClick={it.onClick}
      className={cn(
        "flex h-10 items-center rounded-xl transition-colors",
        expanded ? "w-full justify-start gap-3 px-3" : "w-10 justify-center",
        it.active ? "bg-[hsl(140_55%_55%)] text-white" : "hover:bg-white/10"
      )}
    >
      <it.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      {expanded && <span className="truncate text-sm font-medium">{it.label}</span>}
    </button>
  );
  if (expanded) return btn;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{btn}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>{it.label}</TooltipContent>
    </Tooltip>
  );
}

function SideRail({ expanded, onToggle, view, setView }: { expanded: boolean; onToggle: () => void; view: "dashboard" | "enquiries"; setView: (v: "dashboard" | "enquiries") => void }) {
  const top: RailItem[] = [
    { icon: Inbox, label: "Inbox" },
  ];
  const main: RailItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", active: view === "dashboard", onClick: () => setView("dashboard") },
    { icon: FileSearch, label: "Enquiries", active: view === "enquiries", onClick: () => setView("enquiries") },
    { icon: Calendar, label: "Events" },
    { icon: Boxes, label: "Inventory" },
    { icon: Users2, label: "Waitlist" },
    { icon: BarChart3, label: "Analytics" },
  ];
  const bottom: RailItem[] = [
    { icon: Settings, label: "Settings" },
    { icon: Headphones, label: "Support" },
    { icon: LogOut, label: "Log out" },
  ];

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn(
          "flex h-full shrink-0 flex-col gap-6 rounded-[2rem] bg-[hsl(150_15%_15%)] py-5 text-white/80 transition-[width] duration-300",
          expanded ? "w-56 px-3" : "w-16 items-center"
        )}
      >
        <div className={cn("flex items-center", expanded ? "justify-between" : "justify-center")}>
          <div className={cn("flex items-center gap-2", expanded ? "" : "")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[hsl(150_15%_15%)]">
              <Sparkles className="h-5 w-5" />
            </div>
            {expanded && <span className="text-sm font-semibold text-white">Portfolio</span>}
          </div>
          {expanded && (
            <button
              onClick={onToggle}
              aria-label="Collapse sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {!expanded && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggle}
                aria-label="Expand sidebar"
                className="flex h-8 w-10 items-center justify-center rounded-lg hover:bg-white/10"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>Expand</TooltipContent>
          </Tooltip>
        )}

        <div className={cn("flex flex-col gap-2", expanded ? "" : "items-center")}>
          {top.map((it, i) => <RailButton key={i} it={it} expanded={expanded} />)}
        </div>
        <div className={cn("mt-2 flex flex-1 flex-col gap-1.5", expanded ? "" : "items-center")}>
          {main.map((it, i) => <RailButton key={i} it={it} expanded={expanded} />)}
        </div>
        <div className={cn("flex flex-col gap-1.5", expanded ? "" : "items-center")}>
          {bottom.map((it, i) => <RailButton key={i} it={it} expanded={expanded} />)}
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
      <div className="flex h-[180px] items-end justify-around gap-2 px-1">
        {groups.map((g) => {
          const c = TYPE_COLORS[g.type];
          const h = Math.max(18, (g.booked / max) * 100);
          const isShort = h < 30;
          return (
            <div key={g.type} className="flex flex-col items-center justify-end" style={{ height: "100%" }}>
              {isShort && (
                <span className={cn("mb-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold text-white shadow-sm", c.chip)}>
                  {g.count}
                </span>
              )}
              <div className={cn("relative flex w-12 flex-col items-center justify-start rounded-2xl pt-2", c.bar)} style={{ height: `${h}%` }}>
                {!isShort && (
                  <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-white text-[11px] font-semibold", c.chip)}>
                    {g.count}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-around gap-2 px-1 text-[11px] text-foreground/60">
        {groups.map((g) => <span key={g.type} className="w-14 text-center leading-tight">{g.type}</span>)}
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
    <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
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
  const tone =
    pct >= 70 ? { bar: "hsl(140 55% 50%)", bg: "hsl(140 55% 94%)", text: "hsl(140 55% 30%)", label: "High" } :
    pct >= 40 ? { bar: "hsl(220 85% 60%)", bg: "hsl(220 85% 95%)", text: "hsl(220 85% 45%)", label: "Medium" } :
                { bar: "hsl(0 75% 60%)",   bg: "hsl(0 75% 95%)",   text: "hsl(0 75% 45%)",   label: "Low" };
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 w-20 overflow-hidden rounded-full bg-black/5">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tone.bar }} />
      </div>
      <span className="text-xs font-semibold tabular-nums" style={{ color: tone.text }}>{pct}%</span>
      <span
        className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
        style={{ background: tone.bg, color: tone.text }}
      >
        {tone.label}
      </span>
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
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [view, setView] = useState<"dashboard" | "enquiries">("dashboard");
  const [scope, setScope] = useState<"upcoming" | "past">("upcoming");
  const [notifs, setNotifs] = useState<NotificationItem[]>(initialNotifications);
  const unreadCount = notifs.filter((n) => n.unread).length;
  const markAllRead = () => setNotifs((ns) => ns.map((n) => ({ ...n, unread: false })));
  const handleNotifClick = (n: NotificationItem) => {
    setNotifs((ns) => ns.map((x) => (x.id === n.id ? { ...x, unread: false } : x)));
    if (n.eventId) {
      const ev = allEvents.find((e) => e.id === n.eventId);
      if (ev) { setSelected(ev); setDrawerOpen(true); }
    }
  };

  const upcoming = allEvents.filter((e) => !e.past);
  const past = allEvents.filter((e) => e.past);
  const scoped = scope === "upcoming" ? upcoming : past;

  const filtered = useMemo(() => {
    let list = scoped;
    if (tab !== "all") list = list.filter((e) => e.status === tab);
    if (venue !== "all") list = list.filter((e) => e.venue === venue);
    if (type !== "all") list = list.filter((e) => e.type === type);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  }, [scoped, tab, venue, type, query]);

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
          <SideRail expanded={sidebarExpanded} onToggle={() => setSidebarExpanded((v) => !v)} view={view} setView={setView} />
        </div>

        <div className="flex-1 rounded-[2rem] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] md:p-8">
          {/* Top bar */}
          <div className="mb-6 flex items-center gap-3 rounded-full border border-black/5 bg-[hsl(220_20%_98%)] py-1.5 pl-2 pr-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex shrink-0 items-center gap-2 rounded-full px-2 py-1 transition-colors hover:bg-white">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(150_15%_15%)] text-white">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">AOK Events</span>
                  <ChevronDown className="h-3.5 w-3.5 text-foreground/50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-2xl border-black/5 shadow-lg">
                <DropdownMenuLabel>Switch organisation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-between">AOK Events <Check className="h-4 w-4 text-[hsl(140_55%_45%)]" /></DropdownMenuItem>
                <DropdownMenuItem>Northwind Live</DropdownMenuItem>
                <DropdownMenuItem>Helix Conferences</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="ml-auto flex items-center gap-1.5">
              {searchOpen ? (
                <div className="relative animate-fade-in">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                  <Input
                    autoFocus
                    onBlur={() => setSearchOpen(false)}
                    placeholder="Search events, enquiries, venues…"
                    className="h-9 w-56 rounded-full border-transparent bg-white pl-9 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-black/10 md:w-72"
                  />
                </div>
              ) : (
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white" onClick={() => setSearchOpen(true)}>
                  <Search className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white">
                <Settings className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full hover:bg-white">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[hsl(0_75%_55%)] px-1 text-[10px] font-semibold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 rounded-2xl border-black/5 p-0 shadow-lg">
                  <div className="flex items-center justify-between border-b border-black/5 px-3 py-2.5">
                    <p className="text-sm font-semibold">Notifications</p>
                    <button onClick={markAllRead} className="text-xs font-medium text-[hsl(220_85%_55%)] hover:underline">
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifs.length === 0 && (
                      <div className="px-3 py-8 text-center text-sm text-foreground/50">No notifications</div>
                    )}
                    {notifs.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleNotifClick(n)}
                        className={cn(
                          "flex w-full gap-3 border-b border-black/5 px-3 py-3 text-left transition-colors hover:bg-[hsl(220_20%_98%)]",
                          n.unread && "bg-[hsl(220_85%_97%)]"
                        )}
                      >
                        <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", n.unread ? "bg-[hsl(220_85%_55%)]" : "bg-transparent")} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-foreground/60">{n.body}</p>
                          <p className="mt-1 text-[11px] text-foreground/40">{n.time}</p>
                        </div>
                        <Badge variant="outline" className="h-5 shrink-0 text-[10px] capitalize">
                          {n.type === "underperform" ? "alert" : n.type}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-1 flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 transition-colors hover:bg-[hsl(220_20%_96%)]">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-[hsl(140_55%_55%)] text-[11px] font-semibold text-white">EM</AvatarFallback>
                    </Avatar>
                    <div className="hidden text-left leading-tight sm:block">
                      <p className="text-xs font-semibold">Elena Martins</p>
                      <p className="text-[10px] text-foreground/50">Ev Manager</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-black/5 shadow-lg">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">Elena Martins</span>
                      <span className="text-xs font-normal text-foreground/60">elena@aok.events</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile settings</DropdownMenuItem>
                  <DropdownMenuItem>Billing</DropdownMenuItem>
                  <DropdownMenuItem>Audit trail</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-[hsl(0_75%_50%)]">Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Heading + actions */}
          <div className="flex items-start justify-between gap-6">
            {view === "dashboard" ? (
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
            ) : (
              <div>
                <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-foreground">
                  Enquiries
                </h1>
                <p className="mt-2 text-sm text-foreground/60">Track and manage all incoming event enquiries</p>
              </div>
            )}
            {view === "dashboard" && (
              <Button variant="outline" className="rounded-full border-black/10 bg-white" onClick={() => setWaitlistOpen(true)}>
                <ClipboardList className="mr-1.5 h-4 w-4" /> Waitlist
              </Button>
            )}
          </div>

          {view === "dashboard" && (<>
          {/* Stats + Charts + Attention */}
          <div className="mt-7 grid grid-cols-1 gap-3 lg:grid-cols-3">
            {/* Left + middle: 3 stat cards on top, 2 chart cards below */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <SoftStat icon={CalendarIcon} tint="bg-[hsl(220_85%_92%)] text-[hsl(220_85%_50%)]" label="Total Events" value={summary.totalEvents} />
                <SoftStat icon={Users2} tint="bg-[hsl(45_95%_88%)] text-[hsl(35_85%_45%)]" label="Total Bookings" value={summary.bookings.toLocaleString()} />
                <SoftStat icon={Target} tint="bg-[hsl(140_55%_88%)] text-[hsl(140_55%_35%)]" label="Avg. Utilisation" value={`${summary.avgUtil}%`} />
                <SoftStat icon={Smile} tint="bg-[hsl(330_75%_92%)] text-[hsl(330_70%_50%)]" label="Need Attention" value={summary.attention} />
              </div>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Bookings Over Time</h3>
                    <span className="text-xs text-foreground/50">Upcoming events</span>
                  </div>
                  <div className="mt-3"><BookingsChart events={upcoming} /></div>
                </div>
                <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Events by Type</h3>
                    <span className="text-xs text-foreground/50">{upcoming.length} events</span>
                  </div>
                  <div className="mt-3"><TypeBars events={upcoming} /></div>
                </div>
              </div>
            </div>

            {/* Right: AttentionCard full height */}
            <div className="flex flex-col gap-3">
              <AttentionCard events={upcoming} onOpen={openEvent} />
            </div>
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
                <div className="flex items-center gap-0.5 rounded-xl border border-black/10 bg-[hsl(220_20%_97%)] p-0.5">
                  {(["upcoming", "past"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setScope(s)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                        scope === s ? "bg-white text-foreground shadow-sm" : "text-foreground/50"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
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
          </>)}
          {view === "enquiries" && (
            <div className="mt-2">
              <EnquiriesView pushNotification={(n) => setNotifs((ns) => [n, ...ns])} />
            </div>
          )}
        </div>
      </div>

      <EventDrawer event={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
      <WaitlistDialog open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </div>
  );
}
