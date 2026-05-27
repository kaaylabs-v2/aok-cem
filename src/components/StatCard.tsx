import { ArrowDown, ArrowUp, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatChartVariant = "sparkline" | "radial" | "matrix" | "gauge";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub: string;
  trend: number;
  accent?: "primary" | "success" | "warning";
  /** Visualization style for the card chart area */
  variant?: StatChartVariant;
  /** Optional 0–100 progress value used by radial/gauge/matrix variants */
  progress?: number;
  /** Optional data series for sparkline */
  bars?: number[];
}

// Deterministic pseudo-random series so cards stay stable across renders.
function generateBars(seedSource: string | number, points = 16): number[] {
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

function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = Math.max(1, max - min);
  const stroke = up ? "hsl(var(--success))" : "hsl(var(--destructive))";
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 40 - ((v - min) / range) * 35 - 2;
    return [x, y] as const;
  });
  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L 100 40 L 0 40 Z`;
  const gradId = `spark-${up ? "u" : "d"}`;
  return (
    <div className="h-16 w-full">
      <svg className="h-full w-full" viewBox="0 0 100 40" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

function Radial({ progress, up }: { progress: number; up: boolean }) {
  const color = up ? "hsl(var(--success))" : "hsl(var(--destructive))";
  const pct = Math.max(0, Math.min(100, progress));
  return (
    <div className="flex h-16 items-center justify-center">
      <div className="relative h-16 w-16">
        <svg className="h-full w-full" viewBox="0 0 36 36">
          <path
            stroke="hsl(var(--muted))"
            strokeWidth="4"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            stroke={color}
            strokeWidth="4"
            strokeDasharray={`${pct}, 100`}
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div
          className={cn("absolute inset-0 flex items-center justify-center text-[10px] font-bold", up ? "text-success" : "text-destructive")}
        >
          {Math.round(pct)}%
        </div>
      </div>
    </div>
  );
}

function Matrix({ progress, up }: { progress: number; up: boolean }) {
  const cols = 5;
  const rows = 3;
  const total = cols * rows;
  const filled = Math.round((Math.max(0, Math.min(100, progress)) / 100) * total);
  const color = up ? "bg-success" : "bg-destructive";
  return (
    <div className="flex h-16 flex-col justify-center gap-1.5">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-1.5">
          {Array.from({ length: cols }).map((_, c) => {
            // fill from bottom-left to top-right for a chart-y feel
            const index = (rows - 1 - r) * cols + c;
            const on = index < filled;
            return <div key={c} className={cn("h-3 w-3 rounded-sm", on ? color : "bg-muted")} />;
          })}
        </div>
      ))}
    </div>
  );
}

function Gauge({ progress, up }: { progress: number; up: boolean }) {
  const pct = Math.max(0, Math.min(100, progress));
  const color = up ? "hsl(var(--success))" : "hsl(var(--destructive))";
  // Semi-circle arc from left (180°) to right (0°)
  const r = 30;
  const cx = 40;
  const cy = 36;
  const angle = Math.PI * (1 - pct / 100);
  const x = cx + r * Math.cos(angle);
  const y = cy - r * Math.sin(angle);
  const largeArc = pct > 50 ? 1 : 0;
  const startX = cx - r;
  const startY = cy;
  const trackPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const valuePath = `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${x.toFixed(2)} ${y.toFixed(2)}`;
  return (
    <div className="flex h-16 items-end justify-center">
      <svg viewBox="0 0 80 44" className="h-16 w-32">
        <path d={trackPath} stroke="hsl(var(--muted))" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d={valuePath} stroke={color} strokeWidth="8" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sub, trend, variant = "sparkline", progress, bars }: StatCardProps) {
  const up = trend >= 0;
  const series = bars ?? generateBars(`${label}-${value}`);
  // Derive a stable default progress from the value if not provided.
  const fallbackProgress = (() => {
    if (typeof progress === "number") return progress;
    const numeric = typeof value === "number" ? value : parseFloat(String(value).replace(/[^\d.]/g, ""));
    if (!Number.isFinite(numeric)) return 60;
    if (String(value).includes("%")) return numeric;
    // Map larger numbers into a 30–90 range deterministically
    return 40 + ((Math.abs(numeric) % 50));
  })();

  return (
    <div className="group rounded-3xl border border-border/60 bg-card/80 p-5 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-soft">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-foreground/70">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1 text-right">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-3xl font-bold leading-none tracking-tight tabular-nums">{value}</p>
        </div>
      </div>

      <div className="my-4">
        {variant === "sparkline" && <Sparkline data={series} up={up} />}
        {variant === "radial" && <Radial progress={fallbackProgress} up={up} />}
        {variant === "matrix" && <Matrix progress={fallbackProgress} up={up} />}
        {variant === "gauge" && <Gauge progress={fallbackProgress} up={up} />}
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
        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}
