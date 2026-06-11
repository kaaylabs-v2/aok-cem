import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { VenueEngagement } from "@/data/venueSourcing";
import { toast } from "sonner";

interface Props {
  engagement: VenueEngagement | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (data: { venueRating: number; serviceRating: number; venueNotes: string; comments: string }) => void;
}

function RatingRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary tabular-nums">
          {value} / 10
        </span>
      </div>
      <Slider min={1} max={10} step={1} value={[value]} onValueChange={(v) => onChange(v[0])} />
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>Poor</span><span>Excellent</span>
      </div>
    </div>
  );
}

export function FeedbackFormDialog({ engagement, open, onOpenChange, onSubmit }: Props) {
  const [venueRating, setVenueRating] = useState(8);
  const [serviceRating, setServiceRating] = useState(8);
  const [venueNotes, setVenueNotes] = useState("");
  const [comments, setComments] = useState("");

  useEffect(() => {
    if (open) { setVenueRating(8); setServiceRating(8); setVenueNotes(""); setComments(""); }
  }, [open]);

  if (!engagement) return null;

  const handleSubmit = () => {
    onSubmit({ venueRating, serviceRating, venueNotes, comments });
    toast.success("Feedback successfully submitted to 3D CRM.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>How was your venue sourcing experience?</DialogTitle>
          <DialogDescription>
            {engagement.eventName} · {engagement.venue}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <RatingRow label="Venue Rating" value={venueRating} onChange={setVenueRating} />
          <RatingRow label="AOK Service Rating" value={serviceRating} onChange={setServiceRating} />
          <div>
            <Label className="text-xs">Venue Quality Notes</Label>
            <Textarea
              className="mt-1"
              rows={3}
              placeholder="Service, facilities, food, location…"
              value={venueNotes}
              onChange={(e) => setVenueNotes(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Additional Comments</Label>
            <Textarea
              className="mt-1"
              rows={3}
              placeholder="Anything else you'd like to share?"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
          <p className="rounded-lg border border-border/60 bg-secondary/40 px-3 py-2 text-[11px] text-muted-foreground">
            Your feedback will be written back to 3D CRM. AOK internal notes are never visible here.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit Feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
