import { useAudit } from "@/data/guests";
import { History } from "lucide-react";

export function AuditTrail({ eventId }: { eventId: string }) {
  const entries = useAudit(eventId);

  if (entries.length === 0) {
    return <p className="px-1 py-8 text-center text-sm text-muted-foreground">No activity recorded yet.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1 text-xs uppercase tracking-wide text-muted-foreground">
        <History className="h-3.5 w-3.5" /> Audit trail
      </div>
      <ol className="space-y-2">
        {entries.map((e) => (
          <li key={e.id} className="rounded-xl border border-border bg-card px-3 py-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium">{e.action}</p>
              <time className="shrink-0 text-[11px] text-muted-foreground">
                {new Date(e.timestamp).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
              </time>
            </div>
            {e.target && <p className="mt-0.5 text-xs text-muted-foreground">{e.target}</p>}
            <p className="mt-1 text-[11px] text-muted-foreground">By {e.actor}</p>
            {e.previous && (
              <p className="mt-1 truncate text-[11px] text-muted-foreground/80">
                Previous: <span className="font-mono">{e.previous}</span>
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
