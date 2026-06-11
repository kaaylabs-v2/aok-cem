import { Check, Gift } from "lucide-react";
import { Concession } from "@/data/venueSourcing";

export function ConcessionList({ items, dense = false }: { items: Concession[]; dense?: boolean }) {
  if (!items.length) {
    return <p className="text-xs text-muted-foreground">No concessions recorded — Pending.</p>;
  }
  return (
    <div className={dense ? "flex flex-wrap gap-1.5" : "grid grid-cols-1 gap-2 sm:grid-cols-2"}>
      {items.map((c, i) =>
        dense ? (
          <span key={i} className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/5 px-2 py-0.5 text-[11px] text-success">
            <Check className="h-3 w-3" /> {c.label}
          </span>
        ) : (
          <div key={i} className="flex items-start gap-2 rounded-xl border border-border/60 bg-card p-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
              <Gift className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium">{c.label}</div>
              <div className="text-[11px] text-muted-foreground">{c.type}</div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
