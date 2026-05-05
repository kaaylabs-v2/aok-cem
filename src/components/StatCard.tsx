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

export function StatCard({ icon: Icon, label, value, sub, trend, accent = "primary" }: StatCardProps) {
  const up = trend >= 0;
  const accents = {
    primary: "bg-gradient-primary",
    success: "bg-gradient-success",
    warning: "bg-gradient-warning",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-soft">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent/40 blur-2xl transition-opacity group-hover:opacity-70" />
      <div className="relative flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground shadow-md", accents[accent])}>
          <Icon className="h-5 w-5" strokeWidth={2.25} />
        </div>
        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
            up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          )}
        >
          {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div className="relative mt-5">
        <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="mt-1 text-sm font-medium text-foreground/80">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}
