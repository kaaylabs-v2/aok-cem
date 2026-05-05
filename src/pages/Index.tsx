import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, Filter, ListChecks, TrendingUp, Users2, ClipboardList, ArrowUpDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { events as allEvents, venues, eventTypes, utilisation, isUnderperforming, PortfolioEvent, EventStatus, NotificationItem } from "@/data/portfolio";
import { StatCard } from "@/components/StatCard";
import { EventCard } from "@/components/EventCard";
import { EventDrawer } from "@/components/EventDrawer";
import { WaitlistDialog } from "@/components/WaitlistDialog";
import { TopBar } from "@/components/TopBar";
import { Badge } from "@/components/ui/badge";

type StatusTab = "all" | EventStatus;

const Index = () => {
  const [scope, setScope] = useState<"upcoming" | "past">("upcoming");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [venue, setVenue] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [sort, setSort] = useState<"date" | "util" | "name">("date");
  const [selected, setSelected] = useState<PortfolioEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  const visible = useMemo(() => {
    let list = allEvents.filter((e) => (scope === "past" ? e.past : !e.past));
    if (statusTab !== "all") list = list.filter((e) => e.status === statusTab);
    if (venue !== "all") list = list.filter((e) => e.venue === venue);
    if (type !== "all") list = list.filter((e) => e.type === type);
    if (sort === "date") list = [...list].sort((a, b) => +new Date(a.date) - +new Date(b.date));
    if (sort === "util") list = [...list].sort((a, b) => utilisation(b) - utilisation(a));
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [scope, statusTab, venue, type, sort]);

  const summary = useMemo(() => {
    const upcoming = allEvents.filter((e) => !e.past);
    const totalBookings = upcoming.reduce((s, e) => s + e.booked, 0);
    const totalCapacity = upcoming.reduce((s, e) => s + e.capacity, 0);
    const avgUtil = totalCapacity ? Math.round((totalBookings / totalCapacity) * 100) : 0;
    return {
      totalEvents: upcoming.length,
      totalBookings,
      avgUtil,
      underperforming: upcoming.filter(isUnderperforming).length,
    };
  }, []);

  const openEvent = (e: PortfolioEvent) => { setSelected(e); setDrawerOpen(true); };
  const onNotification = (n: NotificationItem) => {
    if (n.type === "waitlist") setWaitlistOpen(true);
    else if (n.eventId) {
      const ev = allEvents.find((e) => e.id === n.eventId);
      if (ev) openEvent(ev);
    } else {
      const first = allEvents.find((e) => !e.past);
      if (first) openEvent(first);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-bg">
      <TopBar onOpenNotification={onNotification} />

      <main className="px-4 py-6 md:px-6 md:py-6">
            <div className="mx-auto w-full max-w-7xl space-y-6">
              {/* Hero panel */}
              <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-hero p-6 shadow-panel md:p-8">
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-info/15 blur-3xl" />

                <div className="relative flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-foreground/60">
                      {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                      Welcome back, Elena
                    </h1>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-full border-border/70 bg-card/70 backdrop-blur" onClick={() => setWaitlistOpen(true)}>
                      <ClipboardList className="mr-1.5 h-4 w-4" />
                      Waitlist
                      <Badge className="ml-2 h-5 bg-primary text-primary-foreground">4</Badge>
                    </Button>
                    <Button className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                      <Download className="mr-1.5 h-4 w-4" /> Export Data
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="relative mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard icon={CalendarIcon} label="Total Events" value={summary.totalEvents} sub="vs last month" trend={12} />
                  <StatCard icon={Users2} label="Total Bookings" value={summary.totalBookings.toLocaleString()} sub="vs last month" trend={8} />
                  <StatCard icon={TrendingUp} label="Avg. Utilisation" value={`${summary.avgUtil}%`} sub="vs last month" trend={summary.avgUtil >= 65 ? 4 : -3} />
                  <StatCard icon={ListChecks} label="Need Attention" value={summary.underperforming} sub="vs last month" trend={-15} />
                </div>
              </section>

              {/* Filters */}
              <section className="sticky top-16 z-20 -mx-4 border-y border-border bg-background/85 px-4 py-3 backdrop-blur-md md:-mx-8 md:px-8">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
                  <Tabs value={statusTab} onValueChange={(v) => setStatusTab(v as StatusTab)}>
                    <TabsList className="bg-secondary/70">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="available">Available</TabsTrigger>
                      <TabsTrigger value="partial">Partial</TabsTrigger>
                      <TabsTrigger value="full">Full</TabsTrigger>
                      <TabsTrigger value="waitlisted">Waitlisted</TabsTrigger>
                      <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    <div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs md:flex">
                      <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Filters:</span>
                    </div>
                    <Select value={venue} onValueChange={setVenue}>
                      <SelectTrigger className="h-9 w-[170px]"><SelectValue placeholder="Venue" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All venues</SelectItem>
                        {venues.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="h-9 w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {eventTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
                      <SelectTrigger className="h-9 w-[150px]">
                        <ArrowUpDown className="mr-1 h-3.5 w-3.5" /> <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Sort: Date</SelectItem>
                        <SelectItem value="util">Sort: Utilisation</SelectItem>
                        <SelectItem value="name">Sort: Name</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
                      <Label htmlFor="scope" className="text-xs text-muted-foreground">{scope === "upcoming" ? "Upcoming" : "Past"}</Label>
                      <Switch id="scope" checked={scope === "past"} onCheckedChange={(v) => setScope(v ? "past" : "upcoming")} />
                    </div>
                  </div>
                </div>
              </section>

              {/* Event grid */}
              <section>
                {visible.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <CalendarIcon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">No events yet</h3>
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">Adjust filters above, or request inventory to start populating your portfolio.</p>
                    <div className="mt-4 flex gap-2">
                      <Button className="bg-gradient-primary">Create event</Button>
                      <Button variant="outline">Request inventory</Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {visible.map((e) => <EventCard key={e.id} event={e} onClick={openEvent} />)}
                  </div>
                )}
              </section>
            </div>
          </main>

      <EventDrawer event={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
      <WaitlistDialog open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </div>
  );
};

export default Index;
