import { cn } from "@/lib/utils";

interface TickBarProps {
  value: number; // 0-100
  tone?: string; // CSS var name, e.g. "success"
  ticks?: number; // unused, kept for API compatibility
  showKnob?: boolean;
  className?: string;
}

export function TickBar({ value, tone = "primary", showKnob = false, className }: TickBarProps) {
  const pct = Math.min(Math.max(value, 0), 100);
  const color = `hsl(var(--${tone}))`;

  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-foreground/[0.06]", className)}>
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${pct}%`,
          backgroundImage: `linear-gradient(90deg, ${color} 0%, hsl(var(--${tone}) / 0.75) 100%)`,
        }}
      />
      {showKnob && pct > 0 && (
        <span
          className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card shadow-sm"
          style={{ left: `${pct}%`, backgroundColor: color }}
        />
      )}
    </div>
  );
}
