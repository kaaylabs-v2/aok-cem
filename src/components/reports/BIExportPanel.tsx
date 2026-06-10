import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Download, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function BIExportPanel() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-foreground/70">
              <Database className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-semibold">BI Export</h2>
            <Badge variant="secondary" className="text-[10px]">Tenant scoped</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Consume report output in external BI tools via scheduled or manual export.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => toast.success("Manual export queued")}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Manual Export
          </Button>
          <Button size="sm" className="rounded-full" onClick={() => toast.success("Data package download started")}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Download Package
          </Button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-background p-3">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Destination</div>
          <div className="mt-1 text-sm font-medium">Snowflake — analytics_warehouse</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-background p-3">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Last Export</div>
          <div className="mt-1 text-sm font-medium">Today, 06:00</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-background p-3">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Status</div>
          <div className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-success">
            <CheckCircle2 className="h-3.5 w-3.5" /> Healthy
          </div>
        </div>
      </div>
    </div>
  );
}
