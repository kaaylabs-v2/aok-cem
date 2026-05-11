import { AlertTriangle, Heart, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CircularUtilisation } from "./CircularUtilisation";
import { SegmentedBar } from "./SegmentedBar";
import { PortfolioEvent, utilisation, utilisationTone, isUnderperforming } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  events: PortfolioEvent[];
  onRowClick?: (e: PortfolioEvent) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
}

const statusBadge: Record<PortfolioEvent["status"], { label: string; cls: string }> = {
  available: { label: "Available", cls: "bg-sky-100 text-sky-700 border-sky-200" },
  partial: { label: "Partial", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  full: { label: "Full", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  waitlisted: { label: "Waitlisted", cls: "bg-pink-100 text-pink-700 border-pink-200" },
  cancelled: { label: "Cancelled", cls: "bg-rose-100 text-rose-700 border-rose-200" },
};

export function EventTable({ events, onRowClick, selectedIds, onToggleSelect, onToggleSelectAll }: Props) {
  const allSelected = events.length > 0 && events.every((e) => selectedIds?.has(e.id));
  const someSelected = !allSelected && events.some((e) => selectedIds?.has(e.id));
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-secondary/40 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 w-8">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={() => onToggleSelectAll?.()}
                  aria-label="Select all"
                />
              </th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Venue</th>
              <th className="px-4 py-3">Date & time</th>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Bookings</th>
              <th className="px-4 py-3 text-center">Utilisation</th>
              <th className="px-4 py-3 text-center">Demand</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => {
              const pct = utilisation(e);
              const tone = utilisationTone(pct);
              const remaining = Math.max(e.capacity - e.booked, 0);
              const under = isUnderperforming(e);
              const badge = statusBadge[e.status];
              const date = new Date(e.date);
              const isSelected = !!selectedIds?.has(e.id);

              return (
                <tr
                  key={e.id}
                  onClick={() => onRowClick?.(e)}
                  className={cn(
                    "cursor-pointer border-b border-border/50 transition-colors hover:bg-secondary/40",
                    under && "bg-warning/5",
                    isSelected && "bg-primary/5"
                  )}
                >
                  <td className="px-4 py-3" onClick={(ev) => { ev.stopPropagation(); onToggleSelect?.(e.id); }}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect?.(e.id)}
                      aria-label={`Select ${e.name}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-semibold leading-tight">{e.name}</p>
                        <p className="text-[11px] text-muted-foreground">{e.type}</p>
                      </div>
                      {under && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertTriangle className="h-3.5 w-3.5 text-warning" strokeWidth={1.75} />
                          </TooltipTrigger>
                          <TooltipContent>Underperforming — &lt;50%, ≤14 days out</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{e.venue}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ·{" "}
                    {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{e.asset}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn("text-[10px] font-semibold uppercase tracking-wide", badge.cls)}>
                      {badge.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className="font-semibold">{e.booked}</span>
                    <span className="text-muted-foreground">/{e.capacity}</span>
                    <p className="text-[11px] text-muted-foreground">{remaining} left</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <SegmentedBar value={pct} tone={tone} ticks={28} className="h-3 w-28" />
                      <span className="text-[11px] font-semibold tabular-nums" style={{ color: `hsl(var(--${tone}))` }}>{pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5 text-[11px]">
                      {e.waitlist > 0 && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-sky-100 px-1.5 py-0.5 font-semibold text-sky-700">
                          <Clock className="h-3.5 w-3.5" strokeWidth={1.75} /> {e.waitlist}
                        </span>
                      )}
                      {e.wishlist > 0 && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-pink-100 px-1.5 py-0.5 font-semibold text-pink-700">
                          <Heart className="h-3.5 w-3.5" strokeWidth={1.75} /> {e.wishlist}
                        </span>
                      )}
                      {e.waitlist === 0 && e.wishlist === 0 && <span className="text-muted-foreground">—</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
