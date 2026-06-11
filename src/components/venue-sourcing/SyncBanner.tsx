import { CheckCircle2, AlertTriangle } from "lucide-react";
import { TENANT_CONFIG } from "@/data/venueSourcing";
import { cn } from "@/lib/utils";

export function SyncBanner({ lastSynced }: { lastSynced: string }) {
  const ok = TENANT_CONFIG.apiAvailable;
  const Icon = ok ? CheckCircle2 : AlertTriangle;
  return (
    <div className={cn(
      "flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2 text-xs",
      ok
        ? "border-success/30 bg-success/5 text-foreground/80"
        : "border-warning/40 bg-warning/10 text-foreground/80",
    )}>
      <Icon className={cn("h-4 w-4", ok ? "text-success" : "text-warning")} />
      {ok ? (
        <>
          <span>Last Updated: <strong>{new Date(lastSynced).toLocaleString()}</strong></span>
          <span className="text-muted-foreground">·</span>
          <span>Source: <strong>{TENANT_CONFIG.source}</strong></span>
        </>
      ) : (
        <span className="font-medium text-warning">
          Using last available synchronized data — 3D CRM unavailable.
        </span>
      )}
    </div>
  );
}
