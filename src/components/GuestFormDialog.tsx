import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Save } from "lucide-react";
import { Guest, guestApi } from "@/data/guests";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  eventId: string;
  guest?: Guest | null;
}

export function GuestFormDialog({ open, onOpenChange, eventId, guest }: Props) {
  const editing = !!guest;
  const [firstName, setFirstName] = useState(guest?.firstName ?? "");
  const [lastName, setLastName] = useState(guest?.lastName ?? "");
  const [email, setEmail] = useState(guest?.email ?? "");
  const [company, setCompany] = useState(guest?.company ?? "");
  const [dietary, setDietary] = useState(guest?.dietary ?? "");
  const [access, setAccess] = useState(guest?.access ?? "");

  // Reset on open
  const reset = () => {
    setFirstName(guest?.firstName ?? "");
    setLastName(guest?.lastName ?? "");
    setEmail(guest?.email ?? "");
    setCompany(guest?.company ?? "");
    setDietary(guest?.dietary ?? "");
    setAccess(guest?.access ?? "");
  };

  const handleSave = (sendInvite: boolean) => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    if (editing && guest) {
      guestApi.update(eventId, guest.id, { firstName, lastName, email, company, dietary, access });
      toast.success("Guest updated");
    } else {
      const res = guestApi.add(eventId, { firstName, lastName, email, company, dietary, access }, sendInvite);
      if (!res.ok) {
        toast.error("A guest with this email already exists for this event");
        return;
      }
      toast.success(sendInvite ? "Guest added & invite sent" : "Guest added");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit guest" : "Add guest"}</DialogTitle>
          <DialogDescription className="text-xs">
            Guest data is tenant-scoped to this event and follows the workspace data retention policy.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name"><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></Field>
            <Field label="Last name"><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></Field>
          </div>
          <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="Company"><Input value={company} onChange={(e) => setCompany(e.target.value)} /></Field>
          <Field label="Dietary requirements">
            <Textarea rows={2} value={dietary} onChange={(e) => setDietary(e.target.value)} placeholder="e.g. Vegetarian, nut allergy" />
          </Field>
          <Field label="Access needs">
            <Textarea rows={2} value={access} onChange={(e) => setAccess(e.target.value)} placeholder="e.g. Step-free access, BSL interpreter" />
          </Field>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {!editing && (
            <Button variant="outline" onClick={() => handleSave(false)}>
              <Save className="mr-1.5 h-4 w-4" /> Save guest
            </Button>
          )}
          <Button className="bg-gradient-primary shadow-elegant" onClick={() => handleSave(!editing)}>
            <Send className="mr-1.5 h-4 w-4" />
            {editing ? "Save changes" : "Save & send invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
