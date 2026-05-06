import { Calendar, MapPin, Users, AlertTriangle, Heart, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TickBar } from "./TickBar";
import { PortfolioEvent, utilisation, utilisationTone, isUnderperforming } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  event: PortfolioEvent;
  onClick?: (e: PortfolioEvent) => void;
}

const statusBadge: Record<PortfolioEvent["status"], { label: string; cls: string }> = {
  available: { label: "Available", cls: "bg-sky-100 text-sky-700 border-sky-200" },
  partial: { label: "Partially booked", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  full: { label: "Full", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  waitlisted: { label: "Waitlisted", cls: "bg-pink-100 text-pink-700 border-pink-200" },
  cancelled: { label: "Cancelled", cls: "bg-rose-100 text-rose-700 border-rose-200" },
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
  const badge = statusBadge[event.status];
  const dateObj = new Date(event.date);

  return (
    <button
      onClick={() => onClick?.(event)}
      className={cn(
        "group relative flex w-full items-stretch gap-4 rounded-2xl border bg-card p-4 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-soft animate-fade-in",
        under ? "border-warning/60 ring-1 ring-warning/20" : "border-border/60"
      )}
    >
      {under && (
        <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-warning" aria-hidden />
      )}

      {/* Left: content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn("text-[10px] font-semibold uppercase tracking-wide", badge.cls)}>
            {badge.label}
          </Badge>
          <span className="text-[11px] text-muted-foreground">{event.type}</span>
          {under && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold text-warning">
                  <AlertTriangle className="h-3 w-3" strokeWidth={1.75} /> Underperforming
                </span>
              </TooltipTrigger>
              <TooltipContent>&lt;50% utilisation, ≤14 days out</TooltipContent>
            </Tooltip>
          )}
        </div>

        <h3 className="mt-1.5 truncate text-[15px] font-semibold leading-tight">{event.name}</h3>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{event.asset}</p>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
            {dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ·{" "}
            {dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className="inline-flex items-center gap-1 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{event.venue}</span>
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {event.waitlist > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">
              <Clock className="h-3 w-3" strokeWidth={1.75} /> {event.waitlist} waitlist
            </span>
          )}
          {event.wishlist > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-1.5 py-0.5 text-[10px] font-semibold text-pink-700">
              <Heart className="h-3 w-3" strokeWidth={1.75} /> {event.wishlist}
            </span>
          )}
        </div>
      </div>

      {/* Right: utilisation rail */}
      <div className="flex w-[120px] shrink-0 flex-col items-end justify-between border-l border-border/60 pl-4">
        <div className="text-right">
          <div className={cn("text-2xl font-bold tabular-nums leading-none", toneText[tone])}>{pct}%</div>
          <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">Utilisation</div>
        </div>
        <div className="w-full">
          <TickBar value={pct} tone={tone} ticks={20} />
          <div className="mt-1.5 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
            <Users className="h-3 w-3" strokeWidth={1.75} />
            <span className="tabular-nums">{remaining}/{event.capacity} left</span>
          </div>
        </div>
      </div>
    </button>
  );
}
