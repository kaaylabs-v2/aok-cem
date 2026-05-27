import { ArrowDown, ArrowUp, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub: string;
  trend: number;
  accent?: "primary" | "success" | "warning";
  /** Optional bar chart data (relative magnitudes). If omitted, a deterministic series is generated. */
  bars?: number[];
}

// Deterministic pseudo-random series so cards stay stable across renders.
function generateBars(seedSource: string | number, points = 12): number[] {
  const seedStr = String(seedSource);
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  const out: number[] = [];
  let v = 50;
  for (let i = 0; i < points; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const delta = ((seed % 100) / 100 - 0.45) * 28;
    v = Math.max(15, Math.min(95, v + delta));
    out.push(v);
  }
  return out;
}

function PairedBars({ current, previous, up, buckets = 5 }: { current: number[]; previous: number[]; up: boolean; buckets?: number }) {
  // Down-sample input series into `buckets` averaged groups
  const sample = (data: number[]) => {
    const size = Math.max(1, Math.floor(data.length / buckets));
    const out: number[] = [];
    for (let i = 0; i < buckets; i++) {
      const slice = data.slice(i * size, i === buckets - 1 ? data.length : (i + 1) * size);
      out.push(slice.reduce((a, b) => a + b, 0) / Math.max(1, slice.length));
    }
    return out;
  };
  const cur = sample(current);
  const prev = sample(previous);
  const max = Math.max(...cur, ...prev, 1);
  const color = up ? "hsl(var(--success))" : "hsl(var(--destructive))";

  return (
    <div className="flex h-16 items-end justify-between gap-2">
      {cur.map((c, i) => {
        const p = prev[i];
        return (
          <div key={i} className="group/bar flex h-full flex-1 items-end gap-0.5">
            <div
              className="flex-1 rounded-t-md bg-muted/70 transition-all"
              style={{ height: `${(p / max) * 100}%` }}
            />
            <div
              className="flex-1 rounded-t-md transition-all"
              style={{ height: `${(c / max) * 100}%`, backgroundColor: color }}
            />
          </div>
        );
      })}
    </div>
  );
}


export function StatCard({ icon: Icon, label, value, sub, trend, bars }: StatCardProps) {
  const up = trend >= 0;
  const current = bars ?? generateBars(`${label}-${value}`);
  const previous = generateBars(`${label}-${value}-prev`);

  return (
    <div className="group rounded-3xl border border-border/60 bg-card/80 p-5 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-soft">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground/70">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1 text-right">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-3xl font-bold leading-none tracking-tight tabular-nums">{value}</p>
        </div>
      </div>

      <div className="mt-4">
        <MiniArea current={current} previous={previous} up={up} />
      </div>

      <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className={cn("h-0.5 w-3 rounded-full", up ? "bg-success" : "bg-destructive")} />
          This month
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-0.5 w-3 rounded-full border-t border-dashed border-muted-foreground/60" />
          Last month
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
            up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          )}
        >
          {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {up ? "+" : ""}
          {trend}%
        </span>
        <span className="text-[11px] text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}
