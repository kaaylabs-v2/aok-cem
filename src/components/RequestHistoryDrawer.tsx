import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { BookingRequest } from "@/data/requests";
import { Calendar, CheckCircle2, XCircle, Activity, TrendingUp, AlertCircle } from "lucide-react";

interface Props {
  request: BookingRequest | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function RequestHistoryDrawer({ request, open, onOpenChange }: Props) {
  if (!request) return null;
  const acceptedCount = Math.round((request.acceptanceRate / 100) * request.previousRequests);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetDescription className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Guest history
        </SheetDescription>
        <SheetTitle className="text-xl font-semibold leading-tight">
          {request.firstName} {request.lastName}
        </SheetTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          {request.position} · {request.company}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Metric icon={Calendar} label="Prev. bookings" value={request.previousBookings} />
          <Metric icon={Activity} label="Prev. requests" value={request.previousRequests} />
          <Metric icon={CheckCircle2} label="Accepted" value={`${acceptedCount}/${request.previousRequests}`} tone="success" />
          <Metric icon={XCircle} label="No-shows" value={request.noShows} tone={request.noShows > 0 ? "danger" : "muted"} />
        </div>

        <Section title="Attendance summary">
          <p className="text-sm text-muted-foreground">{request.attendanceSummary}</p>
        </Section>

        <Section title="Usage score history">
          <div className="flex items-end gap-2">
            {request.usageHistory.map((p) => (
              <div key={p.month} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-primary/70"
                  style={{ height: `${Math.max(8, p.score * 0.8)}px` }}
                />
                <span className="text-[10px] text-muted-foreground">{p.month}</span>
                <span className="text-[11px] font-semibold tabular-nums">{p.score}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
            <TrendingUp className="h-3 w-3" /> Current score: {request.usageScore}/100
          </div>
        </Section>

        {request.flags.length > 0 && (
          <Section title="Compliance flags">
            <ul className="space-y-1.5">
              {request.flags.map((f) => (
                <li key={f} className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-2.5 py-1.5 text-xs text-warning-foreground">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="capitalize">{f.replace(/_/g, " ")}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Metric({ icon: Icon, label, value, tone = "default" }: { icon: any; label: string; value: number | string; tone?: "default" | "success" | "danger" | "muted" }) {
  const tones: Record<string, string> = {
    default: "text-foreground",
    success: "text-success",
    danger: "text-destructive",
    muted: "text-muted-foreground",
  };
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${tones[tone]}`}>{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      <div className="rounded-xl border border-border bg-card p-3">{children}</div>
    </div>
  );
}
