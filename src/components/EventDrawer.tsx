import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, CheckCircle2, PauseCircle, Sparkles } from "lucide-react";
import { PortfolioEvent, utilisation, utilisationTone } from "@/data/portfolio";
import { CircularUtilisation } from "./CircularUtilisation";
import { GuestList } from "./GuestList";
import { AuditTrail } from "./AuditTrail";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  event: PortfolioEvent | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function EventDrawer({ event, open, onOpenChange }: Props) {
  const [tab, setTab] = useState("overview");
  const [pendingUpdate, setPendingUpdate] = useState(false);

  useEffect(() => { if (open) setTab("overview"); }, [open, event?.id]);

  if (!event) return null;
  const pct = utilisation(event);
  const tone = utilisationTone(pct);
  const date = new Date(event.date);
  const seatsLeft = Math.max(event.capacity - event.booked, 0);

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
          <div className="relative shrink-0 border-b border-border/60 bg-gradient-to-br from-primary/8 via-background to-background px-6 pb-5 pt-6">
            <SheetDescription className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Booking details
            </SheetDescription>
            <div className="mt-1 flex items-start justify-between gap-4 pr-10">
              <SheetTitle className="text-2xl font-semibold leading-tight tracking-tight">
                {event.name}
              </SheetTitle>
              <span className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset",
                toneRing[tone] ?? toneRing.muted,
              )}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {pct}% booked
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{date.toLocaleDateString(undefined, { dateStyle: "medium" })} · {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{event.venue}</span>
              <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{event.booked}/{event.capacity}</span>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 border-b border-border/60 bg-background/95 px-6 pt-3 backdrop-blur supports-[backdrop-filter]:bg-background/70">
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

            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-5">
              <TabsContent value="overview" className="m-0 space-y-5">
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

            {/* Sticky footer (overview only) */}
            {tab === "overview" && (
              <div className="shrink-0 border-t border-border/60 bg-background/95 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70">
                <div className="flex gap-2">
                  <Button className="flex-1 rounded-xl bg-gradient-primary shadow-elegant" onClick={() => { toast.success("Event published"); onOpenChange(false); }}>
                    <CheckCircle2 className="mr-1.5 h-4 w-4" /> Publish
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => { toast.info("Event deferred"); onOpenChange(false); }}>
                    <PauseCircle className="mr-1.5 h-4 w-4" /> Defer
                  </Button>
                </div>
              </div>
            )}
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
