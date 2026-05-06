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
    <div className={cn("relative h-2.5 w-full overflow-hidden rounded-full bg-foreground/[0.08]", className)}>
      <div
        className="relative h-full rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${pct}%`,
          backgroundColor: color,
          backgroundImage:
            "linear-gradient(135deg, rgba(255,255,255,0.25) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.25) 75%, transparent 75%, transparent)",
          backgroundSize: "14px 14px",
          animation: "tickbar-stripes 1.2s linear infinite",
        }}
      >
        <span
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            backgroundImage:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "tickbar-shimmer 2.2s ease-in-out infinite",
          }}
        />
      </div>
      {showKnob && pct > 0 && (
        <span
          className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card shadow-sm"
          style={{ left: `${pct}%`, backgroundColor: color }}
        />
      )}
      <style>{`
        @keyframes tickbar-stripes {
          from { background-position: 0 0; }
          to { background-position: 14px 0; }
        }
        @keyframes tickbar-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
