import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload, FileCheck2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Props { open: boolean; onOpenChange: (o: boolean) => void; }

const STEPS = ["Download Template", "Upload File", "Preview & Validate", "Import"];

export function BulkImportDialog({ open, onOpenChange }: Props) {
  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState("");

  const reset = () => { setStep(0); setFileName(""); };
  const close = (o: boolean) => { if (!o) reset(); onOpenChange(o); };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Bulk Import Users</DialogTitle>
          <DialogDescription>Upload a CSV/XLSX of users with department, group, capabilities and entitlements.</DialogDescription>
        </DialogHeader>

        <ol className="mb-4 flex items-center gap-2 text-xs">
          {STEPS.map((s, i) => (
            <li key={s} className={`flex flex-1 items-center gap-1.5 ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{i + 1}</span>
              <span className="truncate">{s}</span>
              {i < STEPS.length - 1 && <span className="ml-1 flex-1 border-t border-border" />}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <div className="space-y-3 text-sm">
            <p>Download the CSV template, fill in your users, then come back to upload.</p>
            <Button onClick={() => { toast.success("Template downloaded"); setStep(1); }}><Download className="mr-2 h-4 w-4" /> Download CSV template</Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3 text-sm">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/30 p-8 text-center hover:bg-secondary/50">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="font-medium">Click to upload CSV or XLSX</span>
              <span className="text-xs text-muted-foreground">Max 5MB</span>
              <Input
                type="file" className="hidden" accept=".csv,.xlsx"
                onChange={(e) => { setFileName(e.target.files?.[0]?.name ?? ""); }}
              />
            </label>
            {fileName && <p className="text-xs text-muted-foreground">Selected: {fileName}</p>}
            <Button disabled={!fileName} onClick={() => setStep(2)}>Continue</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium"><FileCheck2 className="h-4 w-4 text-success" /> Validation summary</div>
              <ul className="space-y-1 text-xs">
                <li className="flex justify-between"><span>Rows detected</span><span className="font-semibold">42</span></li>
                <li className="flex justify-between"><span>Valid</span><span className="font-semibold text-success">38</span></li>
                <li className="flex justify-between"><span>Warnings</span><span className="font-semibold text-warning">3</span></li>
                <li className="flex justify-between"><span>Errors</span><span className="font-semibold text-destructive">1</span></li>
              </ul>
            </div>
            <Button onClick={() => setStep(3)}>Import 38 valid rows</Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <div>
                <div className="font-semibold">Import complete</div>
                <p className="text-xs text-muted-foreground">Created 35 · Updated 3 · Failed 1</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => close(false)}>{step === 3 ? "Close" : "Cancel"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
