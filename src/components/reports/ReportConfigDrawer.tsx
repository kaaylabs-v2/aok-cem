import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ReportTemplate } from "@/data/reportTemplates";
import { cn } from "@/lib/utils";

interface Props {
  template: ReportTemplate | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onGenerate: (t: ReportTemplate) => void;
  onSaveConfig: () => void;
}

const PRESETS = ["Today", "Last 7 Days", "Last 30 Days", "Quarter", "Year", "Custom"];
const PILLARS = ["Inventory", "Enquiries", "Compliance", "Approvals", "Delegations"];
const FORMATS: { v: string; label: string }[] = [
  { v: "Dashboard", label: "Dashboard View" },
  { v: "PDF", label: "PDF" },
  { v: "CSV", label: "CSV" },
  { v: "Flat File", label: "Flat File Export" },
];

export function ReportConfigDrawer({ template, open, onOpenChange, onGenerate, onSaveConfig }: Props) {
  const [preset, setPreset] = useState("Last 30 Days");
  const [pillar, setPillar] = useState("all");
  const [department, setDepartment] = useState("");
  const [venue, setVenue] = useState("");
  const [bookingStatus, setBookingStatus] = useState("all");
  const [format, setFormat] = useState(template?.defaultFormat ?? "Dashboard");

  if (!template) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">{template.pillar}</Badge>
            <SheetTitle className="text-base">{template.name}</SheetTitle>
          </div>
          <SheetDescription className="text-xs">Configure parameters and choose an output format.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <section className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Date Range</Label>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPreset(p)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    preset === p
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/60 bg-card hover:bg-muted",
                  )}
                >{p}</button>
              ))}
            </div>
          </section>

          <section className="mt-5 space-y-2">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Pillar Filter</Label>
            <Select value={pillar} onValueChange={setPillar}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All pillars</SelectItem>
                {PILLARS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </section>

          <section className="mt-5 grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Department</Label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Capital Markets" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Venue</Label>
              <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Any" className="h-9" />
            </div>
          </section>

          <section className="mt-5 space-y-2">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Booking Status</Label>
            <Select value={bookingStatus} onValueChange={setBookingStatus}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Booked">Booked</SelectItem>
                <SelectItem value="In Negotiation">In Negotiation</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </section>

          <section className="mt-5 space-y-2">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Output Format</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {FORMATS.map((f) => (
                <button
                  key={f.v}
                  type="button"
                  onClick={() => setFormat(f.v as any)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs transition-colors",
                    format === f.v
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border/60 bg-card hover:bg-muted",
                  )}
                >{f.label}</button>
              ))}
            </div>
          </section>
        </div>

        <div className="border-t border-border/60 p-4">
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button variant="outline" size="sm" onClick={onSaveConfig}>Save Configuration</Button>
            <Button size="sm" onClick={() => onGenerate(template)}>Generate</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
