import { cn } from "@/lib/utils";

interface TickBarProps {
  value: number; // 0-100
  tone?: string; // CSS var name, e.g. "success"
  ticks?: number;
  showKnob?: boolean;
  className?: string;
}

export function TickBar({ value, tone = "primary", ticks = 48, showKnob = true, className }: TickBarProps) {
  const pct = Math.min(Math.max(value, 0), 100);
  const filled = Math.round((pct / 100) * ticks);
  const color = `hsl(var(--${tone}))`;

  return (
    <div className={cn("relative flex h-4 w-full items-center", className)}>
      <div className="flex h-full w-full items-center gap-[2px]">
        {Array.from({ length: ticks }).map((_, i) => {
          const active = i < filled;
          return (
            <span
              key={i}
              className="h-full flex-1 rounded-[1px]"
              style={{
                backgroundColor: active ? color : "hsl(var(--foreground) / 0.08)",
              }}
            />
          );
        })}
      </div>
      {showKnob && (
        <span
          className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card shadow-sm"
          style={{ left: `${pct}%`, backgroundColor: color }}
        />
      )}
    </div>
  );
}
