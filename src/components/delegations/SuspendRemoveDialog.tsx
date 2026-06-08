import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  mode: "suspend" | "remove" | "reactivate";
  paName: string;
  principalName: string;
  onConfirm: () => void;
}

export function SuspendRemoveDialog({ open, onOpenChange, mode, paName, principalName, onConfirm }: Props) {
  const titles = {
    suspend: `Suspend delegation?`,
    remove: `Remove delegation?`,
    reactivate: `Reactivate delegation?`,
  };
  const descs = {
    suspend: `${paName} will no longer be able to act on behalf of ${principalName}. The relationship is preserved for audit and can be reactivated.`,
    remove: `Permanently end this delegation. Audit history will be retained. ${paName} → ${principalName}.`,
    reactivate: `Restore ${paName}'s ability to act on behalf of ${principalName}.`,
  };
  const labels = {
    suspend: "Suspend",
    remove: "Remove",
    reactivate: "Reactivate",
  };
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titles[mode]}</AlertDialogTitle>
          <AlertDialogDescription>{descs[mode]}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={mode === "reactivate" ? "" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
          >
            {labels[mode]}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
