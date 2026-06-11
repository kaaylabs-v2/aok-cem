import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { VenueEngagement, fmtGbp, fmtPct, savingsValue, savingsPct, TENANT_CONFIG } from "@/data/venueSourcing";
import { SavingsWaterfall } from "./SavingsWaterfall";
import { ConcessionList } from "./ConcessionList";

interface Props {
  engagement: VenueEngagement | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const STATUS_TONE: Record<string, string> = {
  Completed: "border-success/30 bg-success/10 text-success",
  "Awaiting Contract": "border-primary/30 bg-primary/10 text-primary",
  "In Negotiation": "border-warning/30 bg-warning/10 text-warning",
  Active: "border-muted-foreground/30 bg-muted text-muted-foreground",
  Cancelled: "border-destructive/30 bg-destructive/10 text-destructive",
};

function Field({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  const pending = value === "Pending";
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 text-sm font-semibold ${mono ? "tabular-nums" : ""} ${pending ? "text-muted-foreground" : ""}`}>
        {value}
      </div>
    </div>
  );
}

export function EngagementDetailDrawer({ engagement, open, onOpenChange }: Props) {
  if (!engagement) return null;
  const e = engagement;
  const sv = savingsValue(e);
  const sp = savingsPct(e);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle className="text-base">{e.eventName}</SheetTitle>
            <Badge variant="outline" className={STATUS_TONE[e.status]}>{e.status}</Badge>
          </div>
          <SheetDescription className="text-xs">
            {e.id} · {e.venue} · {e.location}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="rounded-full">
            <Download className="mr-1.5 h-3.5 w-3.5" /> Procurement Export
          </Button>
          <Button size="sm" variant="outline" className="rounded-full">
            <FileText className="mr-1.5 h-3.5 w-3.5" /> Finance Summary
          </Button>
        </div>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="concessions">Concessions</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Engagement ID" value={e.id} mono={false} />
              <Field label="Venue" value={e.venue} mono={false} />
              <Field label="Savings Value" value={fmtGbp(sv)} />
              <Field label="Savings %" value={fmtPct(sp)} />
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-3">
              <div className="mb-2 text-xs font-semibold">Savings Calculation</div>
              <SavingsWaterfall e={e} />
            </div>
          </TabsContent>

          <TabsContent value="financial" className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Initial Quote"      value={fmtGbp(e.initialQuote)} />
              <Field label="Negotiated Price"   value={fmtGbp(e.negotiatedPrice)} />
              <Field label="Final Contract"     value={fmtGbp(e.finalContractPrice)} />
              <Field label="Savings Achieved"   value={fmtGbp(sv)} />
              <Field label="Savings %"          value={fmtPct(sp)} />
              <Field label="Concessions Value"  value={fmtGbp(e.concessionsValue)} />
              {TENANT_CONFIG.showCommission && e.commissionPct != null && (
                <>
                  <Field label="Commission %"     value={`${e.commissionPct}%`} />
                  <Field label="Commission Value" value={fmtGbp(e.commissionValue ?? null)} />
                </>
              )}
            </div>
            <div className="rounded-xl border border-dashed border-border/60 bg-secondary/40 p-2.5 text-[11px] text-muted-foreground">
              Last Synced: {new Date(e.lastSynced).toLocaleString()} · Source: {TENANT_CONFIG.source}
              {" "}· Financial fields are read-only.
            </div>
          </TabsContent>

          <TabsContent value="concessions" className="mt-4">
            <ConcessionList items={e.concessions} />
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <ol className="relative space-y-3 border-l border-border/60 pl-4">
              {e.history.map((h, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[1.4rem] mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div className="text-xs font-medium">{h.label}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(h.at).toLocaleString()} · {h.actor}
                  </div>
                </li>
              ))}
            </ol>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
