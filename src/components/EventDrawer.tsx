import { Link } from "react-router-dom";
import { useEffect, useState, useTransition } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, CheckCircle2, PauseCircle, Sparkles, FileText, Shirt, CalendarClock, Box, AlertCircle, ExternalLink } from "lucide-react";
import { PortfolioEvent, utilisation, utilisationTone, getDescription, getDressCode, getBookingDeadline } from "@/data/portfolio";
import { CircularUtilisation } from "./CircularUtilisation";
import { GuestList } from "./GuestList";
import { RequestsList } from "./RequestsList";
import { GuestFormDialog } from "./GuestFormDialog";
import { AuditTrail } from "./AuditTrail";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  event: PortfolioEvent | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

type PublishState = "published" | "hidden";
const publishStateStore: Record<string, PublishState> = {};

export function EventDrawer({ event, open, onOpenChange }: Props) {
  const [tab, setTab] = useState("overview");
  const [, startTabTransition] = useTransition();
  const handleTabChange = (v: string) => startTabTransition(() => setTab(v));
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const [publishState, setPublishState] = useState<PublishState>("published");
  const [bookOpen, setBookOpen] = useState(false);

  useEffect(() => {
    if (open && event) {
      setTab("overview");
      setPublishState(publishStateStore[event.id] ?? "published");
    }
  }, [open, event?.id]);

  if (!event) return null;
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn(
          "flex w-full flex-col gap-0 overflow-hidden border-0 bg-transparent p-0 shadow-none sm:max-w-xl lg:max-w-3xl",
          "sm:inset-y-3 sm:right-3 sm:h-[calc(100%-1.5rem)]",
        )}
      >
        <div className="flex h-full flex-col overflow-hidden bg-background sm:rounded-2xl sm:border sm:border-border/60 sm:shadow-2xl">
          {/* Sticky header */}
          <div className="relative shrink-0 border-b border-border/60 bg-gradient-to-br from-primary/8 via-background to-background px-6 pb-3 pt-5">
            <SheetDescription className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground pr-10">
              Booking details
            </SheetDescription>
            <div className="flex items-start justify-between gap-4 pr-10">
              <SheetTitle className="text-2xl font-semibold leading-tight tracking-tight">
                {event.name}
              </SheetTitle>
              <div className="flex shrink-0 items-center gap-1.5">
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
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 shadow-sm">
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-indigo-100/60 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <Calendar className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                <span className="whitespace-nowrap text-[13px] font-semibold tracking-tight text-foreground tabular-nums leading-none">
                  {date.toLocaleDateString(undefined, { dateStyle: "medium" })} <span className="mx-0.5 font-normal text-muted-foreground">·</span> {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                </span>
              </span>
              <span className="h-3.5 w-px bg-border" />
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-rose-100/60 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                <span className="whitespace-nowrap text-[13px] font-semibold tracking-tight text-foreground leading-none">{event.venue}</span>
              </span>
              <span className="h-3.5 w-px bg-border" />
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-emerald-100/60 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <Users className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                <span className="whitespace-nowrap text-[13px] font-semibold tracking-tight text-foreground tabular-nums leading-none">{event.booked}/{event.capacity}</span>
              </span>
              <Link
                to={`/events/${event.id}`}
                onClick={() => onOpenChange(false)}
                className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                View full details <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={tab} onValueChange={handleTabChange} className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 border-b border-border/60 bg-background/95 px-6 pt-3 backdrop-blur supports-[backdrop-filter]:bg-background/70">
              <TabsList className="h-auto w-full justify-start gap-1 rounded-none border-0 bg-transparent p-0">
                {[
                  { v: "overview", label: "Overview" },
                  { v: "guests", label: "Guest list" },
                  { v: "requests", label: "Requests" },
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

            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-5">
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

                {/* Hero utilisation card */}
                <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-5">
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />
                  <div className="relative flex items-center gap-5">
                    <CircularUtilisation value={pct} tone={tone} size={84} stroke={9} />
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Utilisation</p>
                      <p className="text-3xl font-bold tracking-tight">{event.booked}<span className="text-xl text-muted-foreground">/{event.capacity}</span></p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{seatsLeft} seat{seatsLeft === 1 ? "" : "s"} remaining · {event.asset}</p>
                    </div>
                  </div>
                </div>

                {/* Event details */}
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

              <TabsContent value="requests" className="m-0">
                <RequestsList eventId={event.id} />
              </TabsContent>



              <TabsContent value="audit" className="m-0">
                <AuditTrail eventId={event.id} />
              </TabsContent>
            </div>

            {/* Sticky footer (overview only) */}
            {tab === "overview" && (
              <div className="shrink-0 border-t border-border/60 bg-background/95 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70">
                <div className="flex gap-2">
                  {publishState === "published" ? (
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl"
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
                      className="flex-1 rounded-xl bg-gradient-primary shadow-elegant"
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
                    className="flex-1 rounded-xl"
                    disabled={isFull || event.past || event.status === "cancelled" || publishState === "hidden"}
                    onClick={() => setBookOpen(true)}
                  >
                    <Users className="mr-1.5 h-4 w-4" /> Book
                  </Button>
                </div>
              </div>
            )}
          </Tabs>
        </div>
      </SheetContent>
      <GuestFormDialog open={bookOpen} onOpenChange={setBookOpen} eventId={event.id} />
    </Sheet>
  );
}
