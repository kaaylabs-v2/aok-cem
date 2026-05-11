import { Calendar, MapPin, Users, AlertTriangle, Heart, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TickBar } from "./TickBar";
import { PortfolioEvent, utilisation, utilisationTone, isUnderperforming } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  event: PortfolioEvent;
  onClick?: (e: PortfolioEvent) => void;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

const statusBadge: Record<PortfolioEvent["status"], { label: string; cls: string }> = {
  available: { label: "Available", cls: "bg-sky-100 text-sky-700 border-sky-200" },
  partial: { label: "Partially booked", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  full: { label: "Full", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  waitlisted: { label: "Waitlisted", cls: "bg-pink-100 text-pink-700 border-pink-200" },
  cancelled: { label: "Cancelled", cls: "bg-rose-100 text-rose-700 border-rose-200" },
};

export function EventCard({ event, onClick, selected, onToggleSelect }: Props) {
  const pct = utilisation(event);
  const tone = utilisationTone(pct);
  const remaining = Math.max(event.capacity - event.booked, 0);
  const under = isUnderperforming(event);
  const badge = statusBadge[event.status];
  const dateObj = new Date(event.date);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(event)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick?.(event); } }}
      className={cn(
        "group relative flex w-full cursor-pointer flex-col gap-2.5 rounded-2xl border bg-card p-3.5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-soft animate-fade-in",
        under ? "border-warning/60 ring-1 ring-warning/20" : "border-border/60",
        selected && "ring-2 ring-primary"
      )}
    >
      <div
        className="absolute left-3 top-3 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={!!selected}
          onCheckedChange={() => onToggleSelect?.(event.id)}
          aria-label={`Select ${event.name}`}
          className="h-4 w-4 bg-card"
        />
      </div>
      {under && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-warning/15 text-warning">
              <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
            </div>
          </TooltipTrigger>
          <TooltipContent>Underperforming — &lt;50% utilisation, ≤14 days out</TooltipContent>
        </Tooltip>
      )}

      <div className="flex items-start gap-3 pl-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className={cn("text-[10px] font-semibold uppercase tracking-wide", badge.cls)}>
              {badge.label}
            </Badge>
            <span className="text-[11px] text-muted-foreground">{event.type}</span>
          </div>
          <h3 className="mt-1 truncate text-sm font-semibold leading-tight">{event.name}</h3>
          <p className="text-[11px] text-muted-foreground">{event.asset}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          <span className="truncate">{event.venue}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          <span>
            {dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ·{" "}
            {dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-border/60 rounded-xl bg-white/60 backdrop-blur-sm">
        <div className="p-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground/80">Bookings</span>
            <span className="font-semibold tabular-nums">
              {event.booked}<span className="text-muted-foreground">/{event.capacity}</span>
            </span>
          </div>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground/70 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Users className="h-3 w-3" strokeWidth={1.75} /> {remaining} left
            </span>
            {event.waitlist > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-1.5 py-0.5 text-[11px] font-semibold text-sky-700">
                <Clock className="h-3 w-3" strokeWidth={1.75} /> {event.waitlist}
              </span>
            )}
            {event.wishlist > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-1.5 py-0.5 text-[11px] font-semibold text-pink-700">
                <Heart className="h-3 w-3" strokeWidth={1.75} /> {event.wishlist}
              </span>
            )}
          </div>
        </div>
        <div className="p-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground/80">Utilisation</span>
            <span
              className="font-bold tabular-nums"
              style={{ color: `hsl(var(--${tone}))` }}
            >
              {pct}%
            </span>
          </div>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: `hsl(var(--${tone}))` }}
            />
          </div>
          <div className="mt-1.5 text-[11px] text-muted-foreground">
            {pct >= 70 ? "Healthy" : pct >= 40 ? "Needs attention" : "Underperforming"}
          </div>
        </div>
      </div>
    </div>
  );
}
