import { cn } from "@/lib/utils";

interface SeatGridProps {
  booked: number;
  capacity: number;
  tone?: string;
  maxSeats?: number;
  className?: string;
}

export function SeatGrid({ booked, capacity, tone = "primary", maxSeats = 60, className }: SeatGridProps) {
  // Scale to a manageable number of seat dots while preserving the booked ratio
  const total = Math.min(capacity, maxSeats);
  const filled = Math.round((Math.min(booked, capacity) / capacity) * total);
  const color = `hsl(var(--${tone}))`;

  return (
    <div
      className={cn("flex flex-wrap gap-[3px]", className)}
      role="img"
      aria-label={`${booked} of ${capacity} seats booked`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const active = i < filled;
        return (
          <span
            key={i}
            className="h-2 w-2 rounded-[2px] transition-colors"
            style={{
              backgroundColor: active ? color : "hsl(var(--foreground) / 0.08)",
            }}
          />
        );
      })}
    </div>
  );
}
