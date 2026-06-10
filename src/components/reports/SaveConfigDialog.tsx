import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function SaveConfigDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [vis, setVis] = useState("Private");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Custom Report</DialogTitle>
          <DialogDescription>Persist filters, columns, visualisations, and schedule preferences.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Report Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Q4 Entertainment Summary" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Optional description" rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Visibility</Label>
            <Select value={vis} onValueChange={setVis}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Private">Private</SelectItem>
                <SelectItem value="Team">Team</SelectItem>
                <SelectItem value="Tenant">Tenant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (!name.trim()) { toast.error("Name is required"); return; }
              toast.success(`"${name}" saved`);
              onOpenChange(false);
              setName(""); setDesc("");
            }}
          >Save Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
