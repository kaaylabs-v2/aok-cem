import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X, GripVertical } from "lucide-react";
import { waitlist as initialWaitlist, events, WaitlistRequest } from "@/data/portfolio";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function WaitlistDialog({ open, onOpenChange }: Props) {
  const [items, setItems] = useState(initialWaitlist);
  const [dragId, setDragId] = useState<string | null>(null);

  const decide = (id: string, status: "approved" | "rejected") => {
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, status } : i)));
    toast.success(status === "approved" ? "Converted to booking" : "Request rejected");
  };

  const onDrop = (target: WaitlistRequest) => {
    if (!dragId || dragId === target.id) return;
    setItems((arr) => {
      const next = [...arr];
      const from = next.findIndex((x) => x.id === dragId);
      const to = next.findIndex((x) => x.id === target.id);
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      return next;
    });
    setDragId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Waitlist management</DialogTitle>
          <DialogDescription>Approve, reject or reorder priority. Drag rows to reprioritise.</DialogDescription>
        </DialogHeader>
        <div className="mt-2 max-h-[60vh] space-y-2 overflow-y-auto">
          {items.map((req) => {
            const event = events.find((e) => e.id === req.eventId);
            return (
              <div
                key={req.id}
                draggable
                onDragStart={() => setDragId(req.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(req)}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/40"
              >
                <button className="mt-1 cursor-grab text-muted-foreground active:cursor-grabbing">
                  <GripVertical className="h-4 w-4" />
                </button>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
                    {req.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{req.name}</p>
                    <Badge variant="outline" className="text-[10px]">{event?.name}</Badge>
                    {req.status !== "pending" && (
                      <Badge className={req.status === "approved" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
                        {req.status}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{req.justification}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Requested {req.requested}</p>
                </div>
                {req.status === "pending" && (
                  <div className="flex shrink-0 gap-1">
                    <Button size="icon" variant="outline" className="h-8 w-8 border-success/40 text-success hover:bg-success/10" onClick={() => decide(req.id, "approved")}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-8 w-8 border-destructive/40 text-destructive hover:bg-destructive/10" onClick={() => decide(req.id, "rejected")}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
