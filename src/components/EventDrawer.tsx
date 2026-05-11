import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, CheckCircle2, PauseCircle } from "lucide-react";
import { PortfolioEvent, utilisation, utilisationTone } from "@/data/portfolio";
import { CircularUtilisation } from "./CircularUtilisation";
import { GuestList } from "./GuestList";
import { AuditTrail } from "./AuditTrail";
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl lg:max-w-3xl">
        <SheetHeader>
          <SheetDescription className="text-xs uppercase tracking-wide">Booking details</SheetDescription>
          <SheetTitle className="text-2xl leading-tight">{event.name}</SheetTitle>
        </SheetHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-5">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="guests">Guest list</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-5 space-y-5">
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-gradient-card p-4">
              <CircularUtilisation value={pct} tone={tone} size={72} stroke={8} />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Utilisation</p>
                <p className="text-2xl font-bold">{event.booked}/{event.capacity}</p>
                <p className="text-xs text-muted-foreground">{Math.max(event.capacity - event.booked, 0)} seats remaining</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm">
              <Row icon={<Calendar className="h-4 w-4" />} label="Date & time" value={date.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })} />
              <Row icon={<MapPin className="h-4 w-4" />} label="Venue" value={event.venue} />
              <Row icon={<Users className="h-4 w-4" />} label="Asset" value={event.asset} />
            </div>

            {pct < 50 && !event.past && (
              <div className="rounded-xl border border-warning/40 bg-warning/10 p-4">
                <p className="text-sm font-semibold text-warning-foreground">Suggested actions</p>
                <ul className="mt-2 space-y-1.5 text-xs text-warning-foreground/90">
                  <li>• Promote event in newsletter</li>
                  <li>• Expand visibility to broader user groups</li>
                  <li>• Release inventory to partner channels</li>
                </ul>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label className="text-xs">Restrict visibility</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All members</SelectItem>
                    <SelectItem value="vip">VIP tier only</SelectItem>
                    <SelectItem value="internal">Internal teams</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Internal note</Label>
                <Textarea
                  placeholder="Add context for the team…"
                  className="mt-1.5 min-h-[80px]"
                  onChange={() => setPendingUpdate(true)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-gradient-primary shadow-elegant" onClick={() => { toast.success("Event published"); onOpenChange(false); }}>
                <CheckCircle2 className="mr-1.5 h-4 w-4" /> Publish
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => { toast.info("Event deferred"); onOpenChange(false); }}>
                <PauseCircle className="mr-1.5 h-4 w-4" /> Defer
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="guests" className="mt-5">
            <GuestList
              eventId={event.id}
              hasPendingUpdate={pendingUpdate}
              onSendUpdateAck={() => setPendingUpdate(false)}
            />
          </TabsContent>

          <TabsContent value="audit" className="mt-5">
            <AuditTrail eventId={event.id} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
