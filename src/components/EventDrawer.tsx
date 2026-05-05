import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, CheckCircle2, PauseCircle } from "lucide-react";
import { PortfolioEvent, utilisation, utilisationTone } from "@/data/portfolio";
import { CircularUtilisation } from "./CircularUtilisation";
import { toast } from "sonner";

interface Props {
  event: PortfolioEvent | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function EventDrawer({ event, open, onOpenChange }: Props) {
  if (!event) return null;
  const pct = utilisation(event);
  const tone = utilisationTone(pct);
  const date = new Date(event.date);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetDescription className="text-xs uppercase tracking-wide">Inventory preview</SheetDescription>
          <SheetTitle className="text-2xl leading-tight">{event.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-gradient-card p-4">
          <CircularUtilisation value={pct} tone={tone} size={72} stroke={8} />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Utilisation</p>
            <p className="text-2xl font-bold">{event.booked}/{event.capacity}</p>
            <p className="text-xs text-muted-foreground">{Math.max(event.capacity - event.booked, 0)} seats remaining</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 text-sm">
          <Row icon={<Calendar className="h-4 w-4" />} label="Date & time" value={date.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })} />
          <Row icon={<MapPin className="h-4 w-4" />} label="Venue" value={event.venue} />
          <Row icon={<Users className="h-4 w-4" />} label="Asset" value={event.asset} />
        </div>

        {pct < 50 && !event.past && (
          <div className="mt-5 rounded-xl border border-warning/40 bg-warning/10 p-4">
            <p className="text-sm font-semibold text-warning-foreground">Suggested actions</p>
            <ul className="mt-2 space-y-1.5 text-xs text-warning-foreground/90">
              <li>• Promote event in newsletter</li>
              <li>• Expand visibility to broader user groups</li>
              <li>• Release inventory to partner channels</li>
            </ul>
          </div>
        )}

        <div className="mt-6 space-y-4">
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
            <Textarea placeholder="Add context for the team…" className="mt-1.5 min-h-[80px]" />
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Button className="flex-1 bg-gradient-primary shadow-elegant" onClick={() => { toast.success("Event published"); onOpenChange(false); }}>
            <CheckCircle2 className="mr-1.5 h-4 w-4" /> Publish
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => { toast.info("Event deferred"); onOpenChange(false); }}>
            <PauseCircle className="mr-1.5 h-4 w-4" /> Defer
          </Button>
        </div>
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
