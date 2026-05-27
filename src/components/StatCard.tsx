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

function MiniArea({ current, previous, up }: { current: number[]; previous: number[]; up: boolean }) {
  const all = [...current, ...previous];
  const max = Math.max(...all);
  const min = Math.min(...all);
  const range = Math.max(1, max - min);
  const w = 100;
  const h = 32;
  const toPts = (data: number[]) => {
    const stepX = w / (data.length - 1);
    return data.map((d, i) => {
      const x = i * stepX;
      const y = h - ((d - min) / range) * (h - 4) - 2;
      return [x, y] as const;
    });
  };
  const curPts = toPts(current);
  const prevPts = toPts(previous);
  const curLine = curPts.map(([x, y]) => `${x},${y}`).join(" ");
  const prevLine = prevPts.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `0,${h} ${curLine} ${w},${h}`;
  const last = curPts[curPts.length - 1];
  const color = up ? "hsl(var(--success))" : "hsl(var(--destructive))";
  const gradId = `mini-area-${up ? "u" : "d"}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-8 w-full overflow-visible">
      <polyline
        fill="none"
        stroke="hsl(var(--muted-foreground))"
        strokeOpacity={0.45}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="2 2"
        points={prevLine}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={curLine}
      />
      <circle cx={last[0]} cy={last[1]} r={2.5} fill={color} />
    </svg>
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
