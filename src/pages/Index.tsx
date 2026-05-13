import { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, ListChecks, TrendingUp, Users2, ClipboardList, ArrowUpDown, Download, LayoutGrid, List, Table2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { events as allEvents, venues, eventTypes, utilisation, isUnderperforming, PortfolioEvent, EventStatus, NotificationItem } from "@/data/portfolio";
import { StatCard } from "@/components/StatCard";
import { EventCard } from "@/components/EventCard";
import { EventTable } from "@/components/EventTable";
import { EventDrawer } from "@/components/EventDrawer";
import { WaitlistDialog } from "@/components/WaitlistDialog";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/AppShell";

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
  const [view, setView] = useState<"grid" | "table">("grid");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const PAGE_SIZE = 9;
  const [page, setPage] = useState(1);
  const [cardLimit, setCardLimit] = useState(PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const visible = useMemo(() => {
    let list = allEvents.filter((e) => (scope === "past" ? e.past : !e.past));
    if (statusTab !== "all") list = list.filter((e) => e.status === statusTab);
    if (venue !== "all") list = list.filter((e) => e.venue === venue);
    if (type !== "all") list = list.filter((e) => e.type === type);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((e) =>
        e.name.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q)
      );
    }
    if (sort === "date") list = [...list].sort((a, b) => +new Date(a.date) - +new Date(b.date));
    if (sort === "util") list = [...list].sort((a, b) => utilisation(b) - utilisation(a));
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [scope, statusTab, venue, type, sort, query]);

  useEffect(() => { setPage(1); setCardLimit(PAGE_SIZE); }, [scope, statusTab, venue, type, sort, query, view]);

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
    <>
      <AppShell onOpenNotification={onNotification}>
              {/* Hero panel */}
              <section className="relative overflow-hidden rounded-[1.5rem] border border-border/60 bg-gradient-hero p-5 shadow-panel sm:rounded-[2rem] sm:p-6 md:p-8">
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-info/15 blur-3xl" />

                <div className="relative flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-foreground/60 sm:text-sm">
                      {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                      Welcome back, Elena
                    </h1>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="rounded-full border-border/70 bg-card/70 backdrop-blur sm:size-default" onClick={() => setWaitlistOpen(true)}>
                      <ClipboardList className="mr-1.5 h-4 w-4" />
                      Waitlist
                      <Badge className="ml-2 h-5 bg-primary text-primary-foreground">4</Badge>
                    </Button>
                    <Button size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90 sm:size-default">
                      <Download className="mr-1.5 h-4 w-4" /> <span className="hidden sm:inline">Export Data</span><span className="sm:hidden">Export</span>
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
              <section className="sticky top-16 z-20 rounded-2xl border border-border/60 bg-card/80 px-2.5 py-2.5 backdrop-blur-md sm:top-20 sm:px-3">
                <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 sm:gap-3">
                  {searchOpen ? (
                    <div className="relative w-full animate-fade-in sm:w-64">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onBlur={() => { if (!query) setSearchOpen(false); }}
                        placeholder="Search events…"
                        className="h-9 rounded-full border border-border/60 bg-card pl-9 pr-9 text-xs"
                      />
                      {query && (
                        <button
                          type="button"
                          onClick={() => { setQuery(""); setSearchOpen(false); }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          aria-label="Clear search"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => setSearchOpen(true)} aria-label="Open search">
                      <Search className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    {(() => {
                      const activeCount =
                        (statusTab !== "all" ? 1 : 0) +
                        (venue !== "all" ? 1 : 0) +
                        (type !== "all" ? 1 : 0);
                      return (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-full border border-border/60 bg-card px-3 text-xs">
                              <Filter className="h-3.5 w-3.5" strokeWidth={1.75} />
                              Filters
                              {activeCount > 0 && (
                                <Badge className="ml-0.5 h-4 min-w-4 rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                                  {activeCount}
                                </Badge>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-72 space-y-3 p-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filters</p>
                              {activeCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => { setStatusTab("all"); setVenue("all"); setType("all"); }}
                                  className="text-[11px] text-primary hover:underline"
                                >
                                  Clear all
                                </button>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[11px] text-muted-foreground">Status</Label>
                              <Select value={statusTab} onValueChange={(v) => setStatusTab(v as StatusTab)}>
                                <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All</SelectItem>
                                  <SelectItem value="available">Available</SelectItem>
                                  <SelectItem value="partial">Partial</SelectItem>
                                  <SelectItem value="full">Full</SelectItem>
                                  <SelectItem value="waitlisted">Waitlisted</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[11px] text-muted-foreground">Venue</Label>
                              <Select value={venue} onValueChange={setVenue}>
                                <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All venues</SelectItem>
                                  {venues.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[11px] text-muted-foreground">Type</Label>
                              <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All types</SelectItem>
                                  {eventTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          </PopoverContent>
                        </Popover>
                      );
                    })()}
                    <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
                      <SelectTrigger className="h-9 w-[150px] rounded-full border border-border/60 bg-card px-3 text-xs">
                        <ArrowUpDown className="mr-1 h-3.5 w-3.5" /> <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Sort: Date</SelectItem>
                        <SelectItem value="util">Sort: Utilisation</SelectItem>
                        <SelectItem value="name">Sort: Name</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex h-9 items-center gap-2 rounded-full border border-border/60 bg-card px-3">
                      <Label htmlFor="scope" className="text-xs text-muted-foreground">{scope === "upcoming" ? "Upcoming" : "Past"}</Label>
                      <Switch id="scope" checked={scope === "past"} onCheckedChange={(v) => setScope(v ? "past" : "upcoming")} />
                    </div>
                    <div className="flex h-9 items-center gap-0.5 rounded-full border border-border/60 bg-card px-1">
                      <Button
                        size="icon"
                        variant={view === "grid" ? "default" : "ghost"}
                        className="h-7 w-7 rounded-full"
                        onClick={() => setView("grid")}
                        aria-label="Grid view"
                      >
                        <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </Button>
                      <Button
                        size="icon"
                        variant={view === "table" ? "default" : "ghost"}
                        className="h-7 w-7 rounded-full"
                        onClick={() => setView("table")}
                        aria-label="Table view"
                      >
                        <List className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label="Download">
                      <Download className="h-4 w-4" />
                    </Button>
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
                ) : view === "grid" ? (
                  <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {visible.slice(0, cardLimit).map((e) => <EventCard key={e.id} event={e} onClick={openEvent} selected={selectedIds.has(e.id)} onToggleSelect={toggleSelect} />)}
                    </div>
                    {cardLimit < visible.length && (
                      <div className="mt-6 flex flex-col items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          Showing <span className="font-semibold text-foreground">{cardLimit}</span> of {visible.length}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full border-border/60 bg-card px-5"
                          onClick={() => setCardLimit((n) => n + PAGE_SIZE)}
                        >
                          Load more
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <EventTable
                      events={visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
                      onRowClick={openEvent}
                      selectedIds={selectedIds}
                      onToggleSelect={toggleSelect}
                      onToggleSelectAll={() => {
                        const pageRows = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
                        const allSelected = pageRows.length > 0 && pageRows.every((e) => selectedIds.has(e.id));
                        setSelectedIds(allSelected ? new Set() : new Set(pageRows.map((e) => e.id)));
                      }}
                    />
                    {visible.length > PAGE_SIZE && (() => {
                      const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
                      const current = Math.min(page, totalPages);
                      const start = (current - 1) * PAGE_SIZE + 1;
                      const end = Math.min(current * PAGE_SIZE, visible.length);
                      const pages: (number | "…")[] = [];
                      for (let i = 1; i <= totalPages; i++) {
                        if (i === 1 || i === totalPages || Math.abs(i - current) <= 1) pages.push(i);
                        else if (pages[pages.length - 1] !== "…") pages.push("…");
                      }
                      return (
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
                          <p className="text-xs text-muted-foreground">
                            Showing <span className="font-semibold text-foreground">{start}–{end}</span> of {visible.length}
                          </p>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              disabled={current === 1}
                              onClick={() => setPage((p) => Math.max(1, p - 1))}
                              aria-label="Previous page"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            {pages.map((p, i) =>
                              p === "…" ? (
                                <span key={`e${i}`} className="px-1 text-xs text-muted-foreground">…</span>
                              ) : (
                                <Button
                                  key={p}
                                  variant={p === current ? "default" : "ghost"}
                                  size="icon"
                                  className="h-8 w-8 rounded-full text-xs"
                                  onClick={() => setPage(p)}
                                >
                                  {p}
                                </Button>
                              )
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              disabled={current === totalPages}
                              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                              aria-label="Next page"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}
              </section>
      </AppShell>
      <EventDrawer event={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
      <WaitlistDialog open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </>
  );
};

export default Index;
