import { ArrowDown, ArrowUp, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub: string;
  trend: number;
  accent?: "primary" | "success" | "warning";
  /** Optional sparkline data (relative magnitudes). If omitted, a deterministic series is generated from `value`. */
  sparkline?: number[];
}

// Deterministic pseudo-random sparkline generator so cards stay stable across renders.
function generateSparkline(seedSource: string | number, points = 12): number[] {
  const seedStr = String(seedSource);
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  const out: number[] = [];
  let v = 50;
  for (let i = 0; i < points; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const delta = ((seed % 100) / 100 - 0.45) * 22;
    v = Math.max(8, Math.min(95, v + delta));
    out.push(v);
  }
  return out;
}

function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  const w = 100;
  const h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const points = data.map((d, i) => {
    const x = i * step;
    const y = h - ((d - min) / range) * h;
    return [x, y] as const;
  });
  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  const stroke = up ? "hsl(var(--success))" : "hsl(var(--destructive))";
  const gradId = `spark-${up ? "up" : "down"}-${Math.round(min)}-${Math.round(max)}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-8 w-full">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={path} fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StatCard({ icon: Icon, label, value, sub, trend, sparkline }: StatCardProps) {
  const up = trend >= 0;
  const data = sparkline ?? generateSparkline(`${label}-${value}`);

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
        <Sparkline data={data} up={up} />
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
