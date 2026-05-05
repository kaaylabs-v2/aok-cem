import { ArrowDown, ArrowUp, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub: string;
  trend: number;
  accent?: "primary" | "success" | "warning";
}

export function StatCard({ icon: Icon, label, value, sub, trend }: StatCardProps) {
  const up = trend >= 0;
  return (
    <div className="group rounded-3xl border border-border/60 bg-card/80 p-5 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-soft">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-foreground/70">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <p className="mt-5 text-sm font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-4xl font-bold tracking-tight">{value}</p>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-xs font-semibold",
            up ? "text-success" : "text-destructive"
          )}
        >
          {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {up ? "+" : ""}{trend}%
        </span>
        <span className="text-xs text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}
