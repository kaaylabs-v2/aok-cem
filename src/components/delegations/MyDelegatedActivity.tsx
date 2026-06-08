import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { auditRecords } from "@/data/audit";

interface Props { principalId: string; principalName?: string; }

export function MyDelegatedActivity({ principalId, principalName }: Props) {
  const items = auditRecords
    .filter((r) => r.actingForId === principalId)
    .slice(0, 5);
  if (items.length === 0) return null;
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">My Delegated Activity</h3>
          <p className="text-xs text-muted-foreground">
            Actions performed on behalf of {principalName ?? "you"}.
          </p>
        </div>
        <Link to="/audit" className="inline-flex items-center text-xs text-primary hover:underline">
          View all <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </div>
      <ul className="space-y-2">
        {items.map((r) => (
          <li key={r.id} className="flex items-start justify-between gap-3 rounded-lg border border-border/40 px-3 py-2">
            <div className="min-w-0">
              <p className="text-sm font-medium">{r.actionType} · <span className="text-muted-foreground">{r.eventName}</span></p>
              <p className="text-[11px] text-muted-foreground">{r.userName} · {new Date(r.timestamp).toLocaleString()}</p>
            </div>
            <Badge variant="secondary" className="shrink-0 text-[10px]">{r.bookingId}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
