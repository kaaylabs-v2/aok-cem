import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell, Inbox, Home, BookOpen, Users2, BarChart3, LayoutGrid,
  Settings, Headphones, LogOut, Search, Filter, Plus, Sparkles,
  Mail, MessageSquare, Calendar as CalendarIcon, TrendingUp, ListChecks,
  ArrowUpRight, ChevronRight, Ticket, CheckCircle2, Target, Smile,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { events as allEvents, utilisation, isUnderperforming, PortfolioEvent } from "@/data/portfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ---------- Sidebar ---------- */
function SideRail() {
  const items = [
    { icon: Bell }, { icon: Inbox },
  ];
  const main = [
    { icon: Home, active: true }, { icon: BookOpen }, { icon: Users2 },
    { icon: Ticket }, { icon: BarChart3 }, { icon: LayoutGrid },
  ];
  const bottom = [{ icon: Settings }, { icon: Headphones }, { icon: LogOut }];

  return (
    <aside className="flex w-16 shrink-0 flex-col items-center gap-6 rounded-[2rem] bg-[hsl(150_15%_15%)] py-5 text-white/80">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[hsl(150_15%_15%)]">
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="flex flex-col gap-3">
        {items.map((it, i) => (
          <button key={i} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-white/10">
            <it.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-1 flex-col gap-2">
        {main.map((it, i) => (
          <button
            key={i}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
              it.active ? "bg-[hsl(140_55%_55%)] text-white" : "hover:bg-white/10"
            )}
          >
            <it.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {bottom.map((it, i) => (
          <button key={i} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-white/10">
            <it.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
          </button>
        ))}
      </div>
    </aside>
  );
}

/* ---------- Stat card (soft style) ---------- */
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

/* ---------- Line chart ---------- */
function LineChart() {
  const last = [42, 55, 48, 62, 50, 58, 47, 60, 65, 58, 72, 68, 75, 70];
  const cur =  [48, 60, 53, 70, 58, 64, 55, 72, 78, 70, 88, 82, 96, 90];
  const w = 560, h = 180, p = 20;
  const max = Math.max(...last, ...cur) * 1.1;
  const toPath = (arr: number[]) =>
    arr.map((v, i) => {
      const x = p + (i * (w - p * 2)) / (arr.length - 1);
      const y = h - p - (v / max) * (h - p * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");

  const peakIdx = 12;
  const peakX = p + (peakIdx * (w - p * 2)) / (cur.length - 1);
  const peakY = h - p - (cur[peakIdx] / max) * (h - p * 2);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <path d={toPath(last)} fill="none" stroke="hsl(220 15% 80%)" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d={toPath(cur)} fill="none" stroke="hsl(18 85% 58%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1={peakX} y1={p} x2={peakX} y2={h - p} stroke="hsl(220 15% 70%)" strokeDasharray="2 3" />
        <circle cx={peakX} cy={peakY} r="4" fill="hsl(18 85% 58%)" stroke="white" strokeWidth="2" />
      </svg>
      <div
        className="absolute rounded-xl border border-black/5 bg-white px-3 py-2 text-xs shadow-md"
        style={{ left: `${(peakX / w) * 100}%`, top: 0, transform: "translate(-50%, -10%)" }}
      >
        <div className="text-foreground/60">Wed,</div>
        <div className="font-semibold">12 Mar 2026</div>
        <div className="mt-1 text-foreground/60">Total bookings: <span className="font-semibold text-foreground">96</span></div>
        <div className="text-[hsl(140_55%_45%)] font-medium">+8% previous day</div>
      </div>
      <div className="mt-2 flex justify-between px-5 text-xs text-foreground/50">
        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="mt-3 flex items-center justify-center gap-5 text-xs text-foreground/60">
        <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded bg-[hsl(220_15%_80%)]" /> Last Month</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded bg-[hsl(18_85%_58%)]" /> This Month</span>
      </div>
    </div>
  );
}

/* ---------- Channel bars (colorful) ---------- */
function ChannelBars() {
  const bars = [
    { color: "bg-[hsl(45_95%_70%)]", h: 70, icon: Mail, iconBg: "bg-[hsl(0_75%_60%)]" },
    { color: "bg-[hsl(220_85%_70%)]", h: 95, icon: () => <span className="text-white font-bold text-xl leading-none">f</span>, iconBg: "" },
    { color: "bg-[hsl(330_75%_85%)]", h: 60, icon: () => <span className="text-[hsl(330_70%_55%)] font-bold">●</span>, iconBg: "" },
    { color: "bg-[hsl(140_55%_55%)]", h: 80, icon: MessageSquare, iconBg: "" },
    { color: "bg-[hsl(140_45%_85%)]", h: 40, icon: MessageSquare, iconBg: "bg-[hsl(140_55%_45%)]" },
  ];
  return (
    <div className="flex h-[180px] items-end justify-around gap-3 px-3">
      {bars.map((b, i) => {
        const Icon: any = b.icon;
        return (
          <div key={i} className={cn("relative flex w-14 flex-col items-center justify-start rounded-2xl pt-3", b.color)}
               style={{ height: `${b.h}%` }}>
            <span className={cn("flex h-7 w-7 items-center justify-center rounded-md", b.iconBg)}>
              <Icon className="h-4 w-4 text-white" />
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Knowledge / "Top events" side card ---------- */
function SideCard({ events }: { events: PortfolioEvent[] }) {
  const items = events.slice(0, 2);
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Knowledge Base</h3>
        <button className="text-foreground/40 hover:text-foreground">⋯</button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/40" />
          <Input className="h-9 rounded-xl border-black/10 bg-[hsl(220_20%_97%)] pl-9 text-xs" placeholder="Search" />
        </div>
        <Button size="sm" className="h-9 rounded-xl bg-white border border-black/10 text-foreground hover:bg-[hsl(220_20%_97%)]">
          <Sparkles className="h-3.5 w-3.5 mr-1 text-[hsl(45_95%_55%)]" /> Test AI reply
        </Button>
        <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10"><Filter className="h-3.5 w-3.5" /></button>
        <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10"><Plus className="h-3.5 w-3.5" /></button>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((e, idx) => {
          const tag = idx === 0 ? "Authentication" : "Account Access";
          const tagColor = idx === 0 ? "bg-[hsl(220_85%_60%)]" : "bg-[hsl(18_85%_58%)]";
          return (
            <div key={e.id} className="rounded-2xl border border-black/5 bg-[hsl(220_20%_98%)] p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-white">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{e.name}</div>
                    <div className="mt-0.5 text-xs text-foreground/50">
                      Capacity: <span className="font-medium text-foreground/80">{e.capacity}</span>{" "}
                      · Booked: <span className="font-medium text-foreground/80">{e.booked}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-foreground/50">AI reply</span>
                  <div className={cn("relative h-4 w-7 rounded-full", idx === 1 ? "bg-[hsl(140_55%_50%)]" : "bg-foreground/20")}>
                    <span className={cn("absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all", idx === 1 ? "left-3.5" : "left-0.5")} />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className={cn("rounded-md px-2 py-0.5 font-medium text-white", tagColor)}>{tag}</span>
                <span className="text-foreground/40">·</span>
                <span className="text-foreground/50">Last edited: <span className="text-foreground/80 font-medium">18 Dec 2025</span></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Priority bar ---------- */
function PriorityBar({ level }: { level: "High" | "Medium" | "Low" }) {
  const cfg = {
    High: { color: "bg-[hsl(0_75%_60%)]", segs: 10 },
    Medium: { color: "bg-[hsl(220_85%_60%)]", segs: 5 },
    Low: { color: "bg-[hsl(45_95%_55%)]", segs: 2 },
  }[level];
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className={cn("h-1.5 w-2 rounded-sm", i < cfg.segs ? cfg.color : "bg-foreground/10")} />
        ))}
      </div>
      <span className={cn("text-xs font-medium", level === "High" ? "text-[hsl(0_75%_55%)]" : level === "Medium" ? "text-[hsl(220_75%_55%)]" : "text-foreground/60")}>{level}</span>
    </div>
  );
}

/* ---------- Status pill ---------- */
function StatusPill({ status }: { status: PortfolioEvent["status"] }) {
  const map: Record<PortfolioEvent["status"], string> = {
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

/* ---------- Main page ---------- */
export default function IndexV2() {
  const [tab, setTab] = useState<"list" | "board" | "pipeline">("list");

  const upcoming = allEvents.filter((e) => !e.past);
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

  const tableEvents = upcoming.slice(0, 4);
  const priorities: ("High" | "Medium" | "Low")[] = ["High", "Medium", "Medium", "Low"];

  return (
    <div className="min-h-screen w-full bg-[hsl(220_30%_94%)] p-3">
      <div className="flex gap-3">
        <SideRail />

        {/* Main panel */}
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
            <div className="flex -space-x-2">
              {[
                "hsl(220_85%_60%)", "hsl(18_85%_58%)", "hsl(140_55%_50%)", "hsl(330_70%_60%)",
              ].map((c, i) => (
                <div key={i} className="relative h-10 w-10 rounded-full border-2 border-white" style={{ background: c }}>
                  <span className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white", i % 2 === 0 ? "bg-[hsl(140_55%_50%)]" : "bg-[hsl(0_75%_60%)]")} />
                </div>
              ))}
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
            <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm lg:col-span-1">
              <h3 className="font-semibold">Bookings Over Time</h3>
              <div className="mt-3"><LineChart /></div>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <h3 className="font-semibold">Bookings by Channel</h3>
              <div className="mt-3"><ChannelBars /></div>
            </div>
            <SideCard events={upcoming} />
          </div>

          {/* Table section */}
          <div className="mt-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 rounded-xl border border-black/10 p-1">
                {(["list", "board", "pipeline"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium capitalize",
                      tab === t ? "bg-[hsl(220_20%_96%)] text-foreground" : "text-foreground/50"
                    )}
                  >
                    {t === "list" ? <ListChecks className="h-3.5 w-3.5" /> : t === "board" ? <LayoutGrid className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/40" />
                  <Input className="h-9 w-[200px] rounded-xl border-black/10 bg-[hsl(220_20%_97%)] pl-9 text-xs" placeholder="Search" />
                </div>
                <button className="flex h-9 items-center gap-1.5 rounded-xl border border-black/10 px-3 text-xs">
                  <Filter className="h-3.5 w-3.5" /> Filter
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-hidden">
              <div className="grid grid-cols-[40px_120px_1.5fr_1fr_1fr_1fr_1fr_1fr_100px] items-center gap-3 border-b border-black/5 px-3 py-3 text-xs font-medium text-foreground/50">
                <span></span>
                <span>Event ID</span>
                <span>Subject</span>
                <span>Venue</span>
                <span>Type</span>
                <span>Priority</span>
                <span>Date</span>
                <span>Assignee</span>
                <span>Status</span>
              </div>
              {tableEvents.map((e, i) => {
                const colors = ["hsl(330_70%_60%)", "hsl(220_85%_60%)", "hsl(140_55%_50%)", "hsl(18_85%_58%)"];
                return (
                  <div
                    key={e.id}
                    className={cn(
                      "grid grid-cols-[40px_120px_1.5fr_1fr_1fr_1fr_1fr_1fr_100px] items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors",
                      i === 1 ? "bg-[hsl(220_20%_98%)]" : "hover:bg-[hsl(220_20%_98%)]"
                    )}
                  >
                    <span className={cn("flex h-4 w-4 items-center justify-center rounded border", i === 1 ? "border-[hsl(220_85%_60%)] bg-[hsl(220_85%_60%)] text-white" : "border-foreground/20")}>
                      {i === 1 && <CheckCircle2 className="h-3 w-3" />}
                    </span>
                    <span className="font-medium text-foreground">EVT-{1024 + i}</span>
                    <span className="truncate text-foreground/80">{e.name}</span>
                    <span className="truncate text-foreground/60">{e.venue}</span>
                    <span className="flex items-center gap-1.5 text-xs text-foreground/70">
                      <span className="h-4 w-4 rounded" style={{ background: colors[i] }} />
                      {e.type}
                    </span>
                    <PriorityBar level={priorities[i]} />
                    <span className="text-xs text-foreground/70">
                      {new Date(e.date).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs">
                      <span className="h-5 w-5 rounded-full" style={{ background: colors[(i + 1) % 4] }} />
                      <span className="text-foreground/80">{["Alex J.", "Maria G.", "Kevin L.", "Emily B."][i]}</span>
                    </span>
                    <StatusPill status={e.status} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
