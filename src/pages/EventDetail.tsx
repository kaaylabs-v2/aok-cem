import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Calendar, MapPin, Users, CheckCircle2, PauseCircle,
  FileText, Shirt, CalendarClock, Box, AlertCircle, Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/AppShell";
import { CircularUtilisation } from "@/components/CircularUtilisation";
import { GuestList } from "@/components/GuestList";
import { GuestFormDialog } from "@/components/GuestFormDialog";
import { AuditTrail } from "@/components/AuditTrail";
import {
  events as allEvents,
  PortfolioEvent,
  utilisation,
  utilisationTone,
  getDescription,
  getDressCode,
  getBookingDeadline,
  NotificationItem,
} from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type PublishState = "published" | "hidden";
const publishStateStore: Record<string, PublishState> = {};

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const [publishState, setPublishState] = useState<PublishState>("published");
  const [bookOpen, setBookOpen] = useState(false);

  const event: PortfolioEvent | undefined = allEvents.find((e) => e.id === id);

  useEffect(() => {
    if (event) {
      setTab("overview");
      setPublishState(publishStateStore[event.id] ?? "published");
    }
  }, [event?.id]);

  if (!event) {
    return (
      <AppShell onOpenNotification={() => {}}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="mt-4 text-xl font-semibold">Event not found</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The event you are looking for does not exist.
          </p>
          <Button className="mt-6 rounded-xl" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Go back
          </Button>
        </div>
      </AppShell>
    );
  }

  const pct = utilisation(event);
  const tone = utilisationTone(pct);
  const date = new Date(event.date);
  const seatsLeft = Math.max(event.capacity - event.booked, 0);
  const isFull = seatsLeft === 0 && !event.past && event.status !== "cancelled";
  const description = getDescription(event);
  const dressCode = getDressCode(event);
  const bookingDeadline = new Date(getBookingDeadline(event));
  const deadlinePassed = bookingDeadline.getTime() < Date.now();

  const toneRing: Record<string, string> = {
    success: "bg-success/10 text-success ring-success/20",
    warning: "bg-warning/15 text-warning-foreground ring-warning/30",
    danger: "bg-destructive/10 text-destructive ring-destructive/20",
    muted: "bg-muted text-muted-foreground ring-border",
  };

  const handleNotification = (n: NotificationItem) => {
    if (n.eventId && n.eventId !== event.id) {
      navigate(`/events/${n.eventId}`);
    }
  };

  return (
    <AppShell onOpenNotification={handleNotification}>
      {/* Breadcrumb + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" className="h-8 gap-1 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
          <span>/</span>
          <span>Events</span>
          <span>/</span>
          <span className="font-medium text-foreground">{event.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {publishState === "published" ? (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => {
                publishStateStore[event.id] = "hidden";
                setPublishState("hidden");
                toast.info("Event hidden");
              }}
            >
              <PauseCircle className="mr-1.5 h-4 w-4" /> Hide
            </Button>
          ) : (
            <Button
              size="sm"
              className="rounded-xl bg-gradient-primary shadow-elegant"
              onClick={() => {
                publishStateStore[event.id] = "published";
                setPublishState("published");
                toast.success("Event published");
              }}
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Publish
            </Button>
          )}
          <Button
            size="sm"
            className="rounded-xl"
            disabled={isFull || event.past || event.status === "cancelled" || publishState === "hidden"}
            onClick={() => setBookOpen(true)}
          >
            <Users className="mr-1.5 h-4 w-4" /> Book
          </Button>
        </div>
      </div>

      {/* Hero header */}
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-hero p-5 shadow-panel sm:p-6 md:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-info/15 blur-3xl" />

        <div className="relative">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Booking details
          </p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
            <h1 className="max-w-2xl text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              {event.name}
            </h1>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset",
                toneRing[tone] ?? toneRing.muted,
              )}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {pct}% booked
              </span>
              <span className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset",
                publishState === "published"
                  ? "bg-primary/10 text-primary ring-primary/20"
                  : "bg-muted text-muted-foreground ring-border",
              )}>
                {publishState === "published" ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <PauseCircle className="h-3 w-3" />
                )}
                {publishState === "published" ? "Published" : "Hidden"}
              </span>
              <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wide">
                {event.type}
              </Badge>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {date.toLocaleDateString(undefined, { dateStyle: "medium" })} · {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />{event.venue}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />{event.booked}/{event.capacity}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Box className="h-3.5 w-3.5" />{event.asset}
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Utilisation */}
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-5">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />
            <div className="relative flex items-center gap-5">
              <CircularUtilisation value={pct} tone={tone} size={96} stroke={10} />
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Utilisation</p>
                <p className="text-3xl font-bold tracking-tight">{event.booked}<span className="text-xl text-muted-foreground">/{event.capacity}</span></p>
                <p className="mt-0.5 text-sm text-muted-foreground">{seatsLeft} seat{seatsLeft === 1 ? "" : "s"} remaining · {event.asset}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab} className="flex flex-col">
            <div className="shrink-0 border-b border-border/60">
              <TabsList className="h-auto w-full justify-start gap-1 rounded-none border-0 bg-transparent p-0">
                {[
                  { v: "overview", label: "Overview" },
                  { v: "guests", label: "Guest list" },
                  { v: "audit", label: "Audit" },
                ].map((t) => (
                  <TabsTrigger
                    key={t.v}
                    value={t.v}
                    className="relative h-10 rounded-none border-0 bg-transparent px-3 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-transparent data-[state=active]:after:bg-primary"
                  >
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="min-h-0 min-w-0 mt-5">
              <TabsContent value="overview" className="m-0 space-y-5">
                {isFull && (
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-emerald-900">Full — join waitlist</p>
                        <p className="text-xs text-emerald-800/80">
                          This event is fully booked. {event.waitlist} guest{event.waitlist === 1 ? "" : "s"} already on waitlist.
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="shrink-0 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800"
                      onClick={() => toast.success("Added to waitlist — you'll be notified if a seat opens")}
                    >
                      Join waitlist
                    </Button>
                  </div>
                )}

                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">About this event</p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-secondary/40 p-3">
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                        <Users className="h-3.5 w-3.5" /> Capacity
                      </div>
                      <p className="mt-1 text-sm font-semibold tabular-nums">{event.capacity}</p>
                    </div>
                    <div className="rounded-xl bg-secondary/40 p-3">
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                        <Box className="h-3.5 w-3.5" /> Asset
                      </div>
                      <p className="mt-1 truncate text-sm font-semibold">{event.asset}</p>
                    </div>
                    <div className="rounded-xl bg-secondary/40 p-3">
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                        <Shirt className="h-3.5 w-3.5" /> Dress code
                      </div>
                      <p className="mt-1 text-sm font-semibold">{dressCode}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "mt-3 flex items-center justify-between gap-3 rounded-xl border p-3",
                    deadlinePassed ? "border-destructive/30 bg-destructive/5" : "border-border/60 bg-secondary/30"
                  )}>
                    <div className="flex items-center gap-2">
                      <CalendarClock className={cn("h-4 w-4", deadlinePassed ? "text-destructive" : "text-muted-foreground")} />
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Booking deadline</p>
                        <p className="text-sm font-semibold">
                          {bookingDeadline.toLocaleDateString(undefined, { dateStyle: "medium" })} · {bookingDeadline.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    {deadlinePassed && (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">Closed</span>
                    )}
                  </div>
                </div>

                {pct < 50 && !event.past && (
                  <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-warning-foreground" />
                      <p className="text-sm font-semibold text-warning-foreground">Suggested actions</p>
                    </div>
                    <ul className="mt-2 space-y-1.5 text-xs text-warning-foreground/90">
                      <li>• Promote event in newsletter</li>
                      <li>• Expand visibility to broader user groups</li>
                      <li>• Release inventory to partner channels</li>
                    </ul>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Restrict visibility</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="mt-1.5 h-10 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All members</SelectItem>
                        <SelectItem value="vip">VIP tier only</SelectItem>
                        <SelectItem value="internal">Internal teams</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Internal note</Label>
                    <Textarea
                      placeholder="Add context for the team…"
                      className="mt-1.5 min-h-[88px] rounded-xl"
                      onChange={() => setPendingUpdate(true)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="guests" className="m-0">
                <GuestList
                  eventId={event.id}
                  hasPendingUpdate={pendingUpdate}
                  onSendUpdateAck={() => setPendingUpdate(false)}
                />
              </TabsContent>

              <TabsContent value="audit" className="m-0">
                <AuditTrail eventId={event.id} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Side column */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <p className="text-sm font-semibold">Quick stats</p>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Booking Availability</span>
                <span className={cn(
                  "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                  event.status === "available" ? "bg-sky-100 text-sky-700" :
                  event.status === "partial" ? "bg-amber-100 text-amber-700" :
                  event.status === "full" ? "bg-emerald-100 text-emerald-700" :
                  event.status === "waitlisted" ? "bg-pink-100 text-pink-700" :
                  "bg-rose-100 text-rose-700"
                )}>
                  {event.status[0].toUpperCase() + event.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Waitlist</span>
                <span className="text-sm font-semibold">{event.waitlist}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Wishlist</span>
                <span className="text-sm font-semibold">{event.wishlist}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Event type</span>
                <span className="text-sm font-medium">{event.type}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <p className="text-sm font-semibold">Related events</p>
            <div className="mt-4 space-y-3">
              {allEvents
                .filter((e) => e.id !== event.id && (e.venue === event.venue || e.type === event.type))
                .slice(0, 4)
                .map((e) => (
                  <Link
                    key={e.id}
                    to={`/events/${e.id}`}
                    className="flex items-center gap-3 rounded-xl border border-border/40 bg-secondary/30 p-3 transition hover:bg-secondary/60"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{e.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(e.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {e.venue}
                      </p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>

      <GuestFormDialog open={bookOpen} onOpenChange={setBookOpen} eventId={event.id} />
    </AppShell>
  );
}
