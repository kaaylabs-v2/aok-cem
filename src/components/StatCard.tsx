import { ArrowDown, ArrowUp, ChevronDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub: string;
  trend: number;
  accent?: "primary" | "success" | "warning";
  /** Optional series (relative magnitudes). If omitted, a deterministic series is generated. */
  bars?: number[];
}

// Deterministic pseudo-random series so cards stay stable across renders.
function generateSeries(seedSource: string | number, points = 7): number[] {
  const seedStr = String(seedSource);
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  const out: number[] = [];
  let v = 50;
  for (let i = 0; i < points; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const delta = ((seed % 100) / 100 - 0.45) * 32;
    v = Math.max(18, Math.min(92, v + delta));
    out.push(v);
  }
  return out;
}

// Catmull–Rom → cubic Bezier for buttery smooth curves
function smoothPath(pts: ReadonlyArray<readonly [number, number]>): string {
  if (pts.length < 2) return "";
  const d: string[] = [`M ${pts[0][0]} ${pts[0][1]}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d.push(`C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`);
  }
  return d.join(" ");
}

function CleanAreaChart({
  data,
  up,
  value,
  gradId,
}: {
  data: number[];
  up: boolean;
  value: string | number;
  gradId: string;
}) {
  const w = 320;
  const h = 110;
  const padL = 28;
  const padR = 12;
  const padT = 14;
  const padB = 22;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const max = 100;
  const min = 0;
  const range = max - min;

  const stepX = innerW / (data.length - 1);
  const pts = data.map((d, i) => {
    const x = padL + i * stepX;
    const y = padT + innerH - ((d - min) / range) * innerH;
    return [x, y] as const;
  });

  const linePath = smoothPath(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1][0]} ${padT + innerH} L ${pts[0][0]} ${padT + innerH} Z`;

  const last = pts[pts.length - 1];
  const lineColor = up ? "hsl(var(--primary))" : "hsl(var(--destructive))";

  const yTicks = [100, 50, 0];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Tooltip placement — keep inside the card
  const tipW = 86;
  const tipH = 38;
  const tipX = Math.min(w - padR - tipW, Math.max(padL, last[0] - tipW / 2));
  const tipY = Math.max(padT, last[1] - tipH - 12);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[110px] w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity={0.22} />
          <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* horizontal gridlines */}
      {yTicks.map((t) => {
        const y = padT + innerH - ((t - min) / range) * innerH;
        return (
          <g key={t}>
            <line
              x1={padL}
              x2={w - padR}
              y1={y}
              y2={y}
              stroke="hsl(var(--border))"
              strokeOpacity={0.55}
              strokeWidth={1}
            />
            <text
              x={padL - 6}
              y={y + 3}
              textAnchor="end"
              fontSize="8"
              fill="hsl(var(--muted-foreground))"
              opacity={0.7}
            >
              {t}
            </text>
          </g>
        );
      })}

      {/* area + line */}
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={lineColor}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* x-axis labels */}
      {pts.map((p, i) => (
        <text
          key={i}
          x={p[0]}
          y={h - 6}
          textAnchor="middle"
          fontSize="8"
          fill="hsl(var(--muted-foreground))"
          opacity={i === pts.length - 1 ? 1 : 0.65}
          fontWeight={i === pts.length - 1 ? 600 : 400}
        >
          {days[i] ?? ""}
        </text>
      ))}

      {/* vertical indicator on latest */}
      <line
        x1={last[0]}
        x2={last[0]}
        y1={padT}
        y2={padT + innerH}
        stroke="hsl(var(--foreground))"
        strokeOpacity={0.85}
        strokeWidth={1}
      />
      {/* latest point */}
      <circle cx={last[0]} cy={last[1]} r={3.5} fill="hsl(var(--background))" stroke="hsl(var(--foreground))" strokeWidth={1.5} />

      {/* floating dark tooltip */}
      <g>
        <rect
          x={tipX}
          y={tipY}
          width={tipW}
          height={tipH}
          rx={9}
          ry={9}
          fill="hsl(var(--foreground))"
        />
        <text x={tipX + tipW / 2} y={tipY + 15} textAnchor="middle" fontSize="8" fill="hsl(var(--background))" opacity={0.7}>
          Today
        </text>
        <text x={tipX + tipW / 2} y={tipY + 29} textAnchor="middle" fontSize="11" fontWeight={600} fill="hsl(var(--background))">
          {value}
        </text>
      </g>
    </svg>
  );
}

export function StatCard({ icon: Icon, label, value, sub, trend, bars }: StatCardProps) {
  const up = trend >= 0;
  const data = bars ?? generateSeries(`${label}-${value}`);
  const gradId = `sc-grad-${String(label).replace(/\s+/g, "-")}`;

  return (
    <div className="group flex h-full flex-col rounded-3xl border border-border/60 bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:shadow-soft">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/70 text-foreground/70">
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-[15px] font-semibold tracking-tight">{label}</p>
            <p className="text-[11px] text-muted-foreground">{sub}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground/80 hover:bg-secondary/60"
          >
            Weekly
            <ChevronDown className="h-3 w-3" />
          </button>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-semibold",
              up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {up ? "+" : ""}
            {trend}%
          </span>
        </div>
      </div>

      {/* Value */}
      <div className="mt-3">
        <p className="text-3xl font-bold leading-none tracking-tight tabular-nums">{value}</p>
      </div>

      {/* Chart */}
      <div className="mt-3 flex-1">
        <CleanAreaChart data={data} up={up} value={value} gradId={gradId} />
      </div>
    </div>
  );
}
