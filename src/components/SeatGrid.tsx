import { Armchair } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeatGridProps {
  booked: number;
  capacity: number;
  tone?: string;
  maxSeats?: number;
  className?: string;
}

export function SeatGrid({ booked, capacity, tone = "primary", maxSeats = 60, className }: SeatGridProps) {
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
          <Armchair
            key={i}
            className="h-3 w-3"
            strokeWidth={1.75}
            style={{
              color: active ? color : "hsl(var(--foreground) / 0.18)",
            }}
          />
        );
      })}
    </div>
  );
}
