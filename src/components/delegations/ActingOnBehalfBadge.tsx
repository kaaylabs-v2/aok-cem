import { UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useActing } from "@/context/ActingContext";
import { userFullName } from "@/data/users";
import { cn } from "@/lib/utils";

interface Props { className?: string; }

export function ActingOnBehalfBadge({ className }: Props) {
  const { actingAs } = useActing();
  if (!actingAs) return null;
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 border-warning/40 bg-warning/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-warning",
        className,
      )}
    >
      <UserCheck className="h-3.5 w-3.5" />
      Acting on behalf of {userFullName(actingAs)}
    </Badge>
  );
}
