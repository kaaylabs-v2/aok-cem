import { ArrowDown } from "lucide-react";
import { VenueEngagement, fmtGbp, savingsValue, savingsPct } from "@/data/venueSourcing";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
  value: number | null;
  tone?: "default" | "savings";
}

export function SavingsWaterfall({ e }: { e: VenueEngagement }) {
  const steps: Step[] = [
    { label: "Initial Quote",       value: e.initialQuote },
    { label: "Negotiated Price",    value: e.negotiatedPrice },
    { label: "Final Contract Value",value: e.finalContractPrice },
    { label: "Total Savings",       value: savingsValue(e), tone: "savings" },
  ];
  const max = Math.max(
    e.initialQuote ?? 0,
    e.negotiatedPrice ?? 0,
    e.finalContractPrice ?? 0,
    1,
  );
  return (
    <div className="space-y-2">
      {steps.map((s, i) => {
        const isLast = i === steps.length - 1;
        const pct = s.value != null && s.tone !== "savings"
          ? Math.max(8, Math.min(100, (s.value / max) * 100))
          : s.tone === "savings" && s.value != null && e.initialQuote
            ? Math.max(8, Math.min(100, (s.value / e.initialQuote) * 100))
            : 8;
        const pending = s.value == null;
        return (
          <div key={s.label}>
            <div className="flex items-end justify-between text-xs">
              <span className="font-medium text-foreground/80">{s.label}</span>
              <span className={cn(
                "tabular-nums",
                s.tone === "savings" && !pending && "font-semibold text-success",
                pending && "text-muted-foreground",
              )}>
                {pending ? "Pending" : fmtGbp(s.value)}
                {s.tone === "savings" && !pending && savingsPct(e) != null && (
                  <span className="ml-1.5 rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                    {savingsPct(e)!.toFixed(1)}%
                  </span>
                )}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  s.tone === "savings" ? "bg-success" : "bg-primary/70",
                  pending && "bg-muted",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            {!isLast && (
              <div className="my-1 flex justify-center">
                <ArrowDown className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
