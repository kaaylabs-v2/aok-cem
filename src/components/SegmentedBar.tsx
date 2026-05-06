import { cn } from "@/lib/utils";

interface SegmentedBarProps {
  value: number; // 0-100
  tone?: string;
  ticks?: number;
  className?: string;
}

export function SegmentedBar({ value, tone = "primary", ticks = 28, className }: SegmentedBarProps) {
  const pct = Math.min(Math.max(value, 0), 100);
  const filled = Math.round((pct / 100) * ticks);
  const color = `hsl(var(--${tone}))`;

  return (
    <div className={cn("flex h-3 w-full items-center gap-[2px]", className)}>
      {Array.from({ length: ticks }).map((_, i) => (
        <span
          key={i}
          className="h-full flex-1 rounded-[1px]"
          style={{ backgroundColor: i < filled ? color : "hsl(var(--foreground) / 0.08)" }}
        />
      ))}
    </div>
  );
}
