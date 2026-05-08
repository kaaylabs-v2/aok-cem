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

function MiniArea({ data, up }: { data: number[]; up: boolean }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(1, max - min);
  const w = 100;
  const h = 32;
  const stepX = w / (data.length - 1);
  const pts = data.map((d, i) => {
    const x = i * stepX;
    const y = h - ((d - min) / range) * (h - 4) - 2;
    return [x, y] as const;
  });
  const line = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const last = pts[pts.length - 1];
  const color = up ? "hsl(var(--success))" : "hsl(var(--destructive))";
  const gradId = `mini-area-${up ? "u" : "d"}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-8 w-full overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradId})`} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={line}
      />
      <circle cx={last[0]} cy={last[1]} r={2.5} fill={color} />
    </svg>
  );
}

export function StatCard({ icon: Icon, label, value, sub, trend, bars }: StatCardProps) {
  const up = trend >= 0;
  const data = bars ?? generateBars(`${label}-${value}`);

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
        <MiniSparkline data={data} up={up} />
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
