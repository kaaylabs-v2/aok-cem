import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, X } from "lucide-react";
import { ReportTemplate } from "@/data/reportTemplates";
import { toast } from "sonner";

interface Props {
  template: ReportTemplate | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const SAMPLE_INACTIVE = ["former.user@firm.com"];

export function ScheduleReportDialog({ template, open, onOpenChange }: Props) {
  const [frequency, setFrequency] = useState("Weekly");
  const [time, setTime] = useState("08:00");
  const [tz, setTz] = useState("Europe/London");
  const [format, setFormat] = useState("PDF");
  const [recipients, setRecipients] = useState<string[]>(["compliance@firm.com"]);
  const [draft, setDraft] = useState("");

  const inactive = useMemo(
    () => recipients.filter((r) => SAMPLE_INACTIVE.includes(r)),
    [recipients],
  );

  if (!template) return null;
  const addRecipient = () => {
    const v = draft.trim();
    if (!v || recipients.includes(v)) { setDraft(""); return; }
    setRecipients([...recipients, v]); setDraft("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule "{template.name}"</DialogTitle>
          <DialogDescription>Configure delivery cadence, recipients and output format.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Daily","Weekly","Monthly","Quarterly"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Delivery Time</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Timezone</Label>
            <Select value={tz} onValueChange={setTz}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Europe/London","Europe/Paris","America/New_York","Asia/Singapore"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Output Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["PDF","CSV","Flat File","Dashboard"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Recipients</Label>
          <div className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRecipient(); } }}
              placeholder="user@firm.com or distribution list"
            />
            <Button variant="outline" type="button" onClick={addRecipient}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {recipients.map((r) => {
              const isInactive = SAMPLE_INACTIVE.includes(r);
              return (
                <span key={r} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${isInactive ? "border-destructive/40 bg-destructive/5 text-destructive" : "border-border/60 bg-muted"}`}>
                  {r}
                  <button onClick={() => setRecipients(recipients.filter(x => x !== r))} className="opacity-60 hover:opacity-100">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
          {inactive.length > 0 && (
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Recipient no longer active</p>
                <p className="opacity-80">{inactive.join(", ")}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast.info("Replace recipient flow")}>Replace Recipient</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toast.info("Continuing delivery to inactive recipient")}>Continue Delivery</Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => {
              toast.success(`Scheduled ${frequency.toLowerCase()} delivery of "${template.name}"`);
              onOpenChange(false);
            }}
          >Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
