import { Calendar, MapPin, Users, AlertTriangle, Heart, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CircularUtilisation } from "./CircularUtilisation";
import { PortfolioEvent, utilisation, utilisationTone, isUnderperforming } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  event: PortfolioEvent;
  onClick?: (e: PortfolioEvent) => void;
}

const statusBadge: Record<PortfolioEvent["status"], { label: string; cls: string }> = {
  available: { label: "Available", cls: "bg-info/10 text-info border-info/20" },
  partial: { label: "Partially booked", cls: "bg-warning/10 text-warning border-warning/30" },
  full: { label: "Full", cls: "bg-success/10 text-success border-success/20" },
  waitlisted: { label: "Waitlisted", cls: "bg-primary/10 text-primary border-primary/20" },
  cancelled: { label: "Cancelled", cls: "bg-destructive/10 text-destructive border-destructive/20" },
};

export function EventCard({ event, onClick }: Props) {
  const pct = utilisation(event);
  const tone = utilisationTone(pct);
  const remaining = Math.max(event.capacity - event.booked, 0);
  const under = isUnderperforming(event);
  const badge = statusBadge[event.status];
  const dateObj = new Date(event.date);

  return (
    <button
      onClick={() => onClick?.(event)}
      className={cn(
        "group relative flex w-full flex-col gap-4 rounded-2xl border bg-card p-5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-soft animate-fade-in",
        under ? "border-warning/60 ring-1 ring-warning/20" : "border-border"
      )}
    >
      {under && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-warning/15 text-warning">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </TooltipTrigger>
          <TooltipContent>Underperforming — &lt;50% utilisation, ≤14 days out</TooltipContent>
        </Tooltip>
      )}

      <div className="flex items-start gap-4">
        <CircularUtilisation value={pct} tone={tone} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("text-[10px] font-semibold uppercase tracking-wide", badge.cls)}>
              {badge.label}
            </Badge>
            <span className="text-[11px] text-muted-foreground">{event.type}</span>
          </div>
          <h3 className="mt-1.5 truncate text-base font-semibold leading-tight">{event.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{event.asset}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{event.venue}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>
            {dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ·{" "}
            {dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      <div className="rounded-xl bg-secondary/50 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-foreground/80">Bookings</span>
          <span className="font-semibold tabular-nums">
            {event.booked}<span className="text-muted-foreground">/{event.capacity}</span>
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: `hsl(var(--${tone}))` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" /> {remaining} seats left
          </span>
          <div className="flex items-center gap-2">
            {event.waitlist > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">
                <Clock className="h-3 w-3" /> {event.waitlist} waitlist
              </span>
            )}
            {event.wishlist > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent px-1.5 py-0.5 font-semibold text-accent-foreground">
                <Heart className="h-3 w-3" /> {event.wishlist}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
