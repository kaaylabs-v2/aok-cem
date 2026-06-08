import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { AlertTriangle, Building2, Mail, History, CheckCircle2, Clock, XCircle, Shield, TrendingUp } from "lucide-react";
import { Host, hostInitials, hostName } from "@/data/hosts";
import { SENIORITY_TONE, FLAG_LABEL, RiskFlag } from "@/data/requests";

interface BreakdownItem {
  id: string;
  label: string;
  sub?: string;
  status?: "accepted" | "pending" | "declined";
}

interface Props {
  host: Host | null;
  context: "guests" | "requests";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guestCount: number;
  acceptedCount?: number;
  pendingCount?: number;
  declinedCount?: number;
  breakdown: BreakdownItem[];
  /** Extra host-level flags collected from the request stream (Requests tab). */
  contextFlags?: RiskFlag[];
}

export function HostSummaryDrawer({ host, context, open, onOpenChange, guestCount, acceptedCount = 0, pendingCount = 0, declinedCount = 0, breakdown, contextFlags = [] }: Props) {
  if (!host) return null;
  const flags = Array.from(new Set([...host.flags, ...contextFlags]));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="space-y-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">{hostInitials(host)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate text-left">{hostName(host)}</SheetTitle>
              <SheetDescription className="flex flex-col gap-0.5 text-left">
                <span>{host.department}</span>
                <span className="text-[11px]">{host.businessUnit}</span>
              </SheetDescription>
            </div>
            <span className={cn("inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", SENIORITY_TONE[host.seniority])}>
              {host.seniority}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5" /> {host.email}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Risk flags */}
          {flags.length > 0 && (
            <section>
              <SectionTitle icon={Shield}>Risk & Compliance Flags</SectionTitle>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {flags.map((f) => (
                  <span key={f} className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning-foreground">
                    <AlertTriangle className="h-3 w-3" /> {FLAG_LABEL[f]}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Stats grid */}
          <section>
            <SectionTitle icon={TrendingUp}>Host Summary</SectionTitle>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Stat label={context === "requests" ? "Guest Requests" : "Guests"} value={String(guestCount)} />
              <Stat label="Acceptance" value={`${host.acceptanceRate}%`} />
              <Stat label="Usage Score" value={String(host.usageScore)} />
              <Stat label="No-shows" value={String(host.noShows)} tone={host.noShows > 0 ? "warning" : "default"} />
            </div>
          </section>

          {/* Guest / request breakdown */}
          <section>
            <SectionTitle icon={Building2}>
              {context === "requests" ? "Guest Breakdown" : "Invited Guests"}
            </SectionTitle>
            {context === "guests" && (
              <div className="mt-2 flex gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-success" /> {acceptedCount} accepted</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {pendingCount} pending</span>
                <span className="inline-flex items-center gap-1"><XCircle className="h-3 w-3 text-destructive" /> {declinedCount} declined</span>
              </div>
            )}
            <ul className="mt-2 divide-y divide-border rounded-lg border border-border bg-card">
              {breakdown.length === 0 ? (
                <li className="px-3 py-4 text-center text-xs text-muted-foreground">No records</li>
              ) : breakdown.map((b) => (
                <li key={b.id} className="flex items-center gap-2 px-3 py-2 text-xs">
                  {b.status && (
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full",
                      b.status === "accepted" ? "bg-success" :
                      b.status === "declined" ? "bg-destructive" : "bg-muted-foreground/50")} />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{b.label}</p>
                    {b.sub && <p className="truncate text-[11px] text-muted-foreground">{b.sub}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Historical */}
          <section>
            <SectionTitle icon={History}>Historical Activity</SectionTitle>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <Stat label="Bookings" value={String(host.totalBookings)} />
              <Stat label="Requests" value={String(host.totalRequests)} />
              <Stat label="No-shows" value={String(host.noShows)} />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {host.acceptanceRate >= 85
                ? "Consistent acceptance behaviour — low-risk host."
                : host.acceptanceRate >= 60
                ? "Moderate acceptance pattern — monitor for compliance."
                : "Below-policy acceptance rate — requires review."}
            </p>
          </section>

          <section className="rounded-lg border border-border bg-muted/30 p-3 text-[11px] text-muted-foreground">
            Compliance: this host's invitations are subject to internal entertainment policy. Full audit history is available in the Reports module.
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <h4 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      <Icon className="h-3 w-3" /> {children}
    </h4>
  );
}

function Stat({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "warning" }) {
  return (
    <div className="rounded-lg border border-border bg-card px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 text-sm font-semibold tabular-nums", tone === "warning" ? "text-warning-foreground" : "text-foreground")}>{value}</p>
    </div>
  );
}
