import { Lock, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AuditRecord } from "@/data/audit";

interface Props {
  record: AuditRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function AuditDetailDrawer({ record, open, onOpenChange }: Props) {
  if (!record) return null;
  const ts = new Date(record.timestamp);
  const ret = new Date(record.retentionDate);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between gap-2">
            <SheetTitle>Audit Entry</SheetTitle>
            <Badge variant="outline" className="gap-1 border-warning/40 bg-warning/10 text-warning-foreground">
              <Lock className="h-3 w-3" /> Audit Protected
            </Badge>
          </div>
          <SheetDescription>Immutable record. No edit, no delete, no modification controls.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 text-sm">
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Summary</h4>
            <div className="rounded-xl border border-border bg-card p-3">
              <Row label="Action" value={<Badge variant="secondary">{record.actionType}</Badge>} />
              <Row label="Date" value={ts.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} />
              <Row label="User" value={record.userName} />
              <Row label="Role" value={record.role} />
              {record.actingForName && (
                <Row
                  label="Acting For"
                  value={
                    <span className="inline-flex items-center gap-1 text-primary">
                      <ChevronRight className="h-3.5 w-3.5" /> {record.actingForName}
                    </span>
                  }
                />
              )}
              <Row label="Booking" value={`${record.bookingId} · ${record.eventName}`} />
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Change Details</h4>
            <div className="rounded-xl border border-border bg-card p-3">
              <Row label="Guest" value={record.guestName} />
              <Row label="Field" value={record.fieldChanged} />
              <Row label="Previous" value={<code className="rounded bg-muted px-1.5 py-0.5 text-xs">{record.previousValue}</code>} />
              <Row label="New" value={<code className="rounded bg-muted px-1.5 py-0.5 text-xs">{record.newValue}</code>} />
            </div>
          </section>

          <Separator />

          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">System Metadata</h4>
            <div className="rounded-xl border border-border bg-card p-3">
              <Row label="Source" value={record.source} />
              <Row label="Tenant" value={record.tenant} />
              <Row label="Entry ID" value={<code className="text-xs">{record.id}</code>} />
              <Row label="Retention Date" value={ret.toLocaleDateString(undefined, { dateStyle: "medium" })} />
              <Row label="Immutable" value={<Badge variant="outline" className="gap-1"><Lock className="h-3 w-3" /> Locked</Badge>} />
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
