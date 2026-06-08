import { Check, ChevronDown, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useActing } from "@/context/ActingContext";
import { userFullName } from "@/data/users";

export function PrincipalSwitcher() {
  const { currentUser, availablePrincipals, actingAs, setActingAs } = useActing();
  if (!currentUser || availablePrincipals.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hidden h-9 gap-1.5 rounded-full border-warning/40 bg-warning/10 px-3 text-warning hover:bg-warning/15 hover:text-warning sm:inline-flex"
        >
          <UserCog className="h-4 w-4" />
          <span className="text-xs font-semibold">
            {actingAs ? `Acting as ${userFullName(actingAs)}` : "Acting as Self"}
          </span>
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Currently Acting As</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setActingAs(null)} className="justify-between">
          <span>Self ({userFullName(currentUser)})</span>
          {!actingAs && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {availablePrincipals.map((p) => (
          <DropdownMenuItem
            key={p.id}
            onClick={() => setActingAs(p.id)}
            className="justify-between"
          >
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium">{userFullName(p)}</span>
              <span className="text-[11px] text-muted-foreground">{p.department}</span>
            </div>
            {actingAs?.id === p.id && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
