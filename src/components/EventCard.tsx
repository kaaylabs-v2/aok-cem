import { Calendar, MapPin, Users, AlertTriangle, Heart, Clock } from "lucide-react";
import { TickBar } from "./TickBar";
import { PortfolioEvent, utilisation, utilisationTone, isUnderperforming } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  event: PortfolioEvent;
  onClick?: (e: PortfolioEvent) => void;
}

const statusDot: Record<PortfolioEvent["status"], string> = {
  available: "bg-sky-500",
  partial: "bg-amber-500",
  full: "bg-emerald-500",
  waitlisted: "bg-pink-500",
  cancelled: "bg-rose-500",
};

const toneText: Record<"success" | "warning" | "destructive", string> = {
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

export function EventCard({ event, onClick }: Props) {
  const pct = utilisation(event);
  const tone = utilisationTone(pct);
  const remaining = Math.max(event.capacity - event.booked, 0);
  const under = isUnderperforming(event);
  const dateObj = new Date(event.date);

  return (
    <button
      onClick={() => onClick?.(event)}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-xl border bg-card px-3 py-2.5 text-left shadow-xs transition-all hover:shadow-soft animate-fade-in",
        under ? "border-warning/60" : "border-border/60"
      )}
    >
      {under && (
        <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-warning" aria-hidden />
      )}

      {/* Left: content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusDot[event.status])} />
          <h3 className="truncate text-[13px] font-semibold leading-tight">{event.name}</h3>
          {under && (
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangle className="h-3 w-3 shrink-0 text-warning" strokeWidth={2} />
              </TooltipTrigger>
              <TooltipContent>Underperforming · &lt;50% utilisation, ≤14 days out</TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" strokeWidth={1.75} />
            {dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })},{" "}
            {dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{event.venue}</span>
          </span>
          {event.waitlist > 0 && (
            <span className="inline-flex items-center gap-0.5 text-sky-600">
              <Clock className="h-3 w-3" strokeWidth={1.75} /> {event.waitlist}
            </span>
          )}
          {event.wishlist > 0 && (
            <span className="inline-flex items-center gap-0.5 text-pink-600">
              <Heart className="h-3 w-3" strokeWidth={1.75} /> {event.wishlist}
            </span>
          )}
        </div>
      </div>

      {/* Right: utilisation */}
      <div className="flex w-[88px] shrink-0 flex-col items-end gap-1 border-l border-border/60 pl-3">
        <div className={cn("text-sm font-bold tabular-nums leading-none", toneText[tone])}>{pct}%</div>
        <TickBar value={pct} tone={tone} ticks={14} />
        <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
          <Users className="h-2.5 w-2.5" strokeWidth={1.75} />
          <span className="tabular-nums">{remaining}/{event.capacity}</span>
        </div>
      </div>
    </button>
  );
}
