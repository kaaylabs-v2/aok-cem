import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { BookingRequest, FLAG_LABEL, PRIORITY_TONE, PRIORITY_LABEL, SENIORITY_TONE } from "@/data/requests";
import {
  Calendar, CheckCircle2, XCircle, TrendingUp, TrendingDown, Minus,
  AlertCircle, Briefcase, Mail, Building2, BadgeCheck, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  request: BookingRequest | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function RequestHistoryDrawer({ request, open, onOpenChange }: Props) {
  if (!request) return null;

  const acceptedCount = Math.round((request.acceptanceRate / 100) * request.previousRequests);
  const trend = request.usageHistory.map((h) => h.score);
  const maxScore = Math.max(...trend, request.usageScore, 100);
  const minScore = Math.min(...trend, 0);
  const delta = trend.length >= 2 ? trend[trend.length - 1] - trend[0] : 0;
  const reliable = request.noShows === 0;

  const scoreTone =
    request.usageScore >= 75 ? "success" : request.usageScore >= 50 ? "warning" : "danger";

  const ringColor =
    scoreTone === "success" ? "hsl(var(--success))" :
    scoreTone === "warning" ? "hsl(var(--warning))" : "hsl(var(--destructive))";

  const initials = (request.firstName[0] + request.lastName[0]).toUpperCase();

  // Sparkline geometry
  const w = 280;
  const h = 70;
  const pad = 6;
  const range = Math.max(1, maxScore - minScore);
  const points = trend.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(1, trend.length - 1);
    const y = h - pad - ((v - minScore) / range) * (h - pad * 2);
    return [x, y] as const;
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const areaPath = `${path} L${points[points.length - 1][0]},${h - pad} L${points[0][0]},${h - pad} Z`;

  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendTone =
    delta > 0 ? "text-success" : delta < 0 ? "text-destructive" : "text-muted-foreground";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto bg-background p-0 sm:max-w-md">
        {/* Hero */}
        <div className="border-b border-border bg-card px-5 pb-5 pt-6">
          <SheetDescription className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Guest history
          </SheetDescription>



          <div className="relative mt-2 flex items-start gap-4">
            {/* Score Ring */}
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
              <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none" stroke={ringColor} strokeWidth="2.5"
                  strokeDasharray={`${(request.usageScore / 100) * 97.4} 97.4`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold tabular-nums">{request.usageScore}</span>
                <span className="text-[8px] font-medium uppercase tracking-wide text-muted-foreground">Score</span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <SheetTitle className="text-lg font-semibold leading-tight">
                  {request.firstName} {request.lastName}
                </SheetTitle>
                <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-semibold", PRIORITY_TONE[request.priority])}>
                  {PRIORITY_LABEL[request.priority]}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Briefcase className="h-3 w-3" /> {request.position} <span className="text-muted-foreground/50">·</span> {request.seniority}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" /> {request.company} <span className="text-muted-foreground/50">·</span> {request.department}
              </p>
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                <Mail className="h-3 w-3" /> <span className="truncate">{request.email}</span>
              </p>
            </div>
          </div>

          {/* Quick stats strip */}
          <div className="relative mt-4 grid grid-cols-3 gap-2">
            <QuickStat label="Acceptance" value={`${request.acceptanceRate}%`} tone={request.acceptanceRate >= 80 ? "success" : "muted"} />
            <QuickStat label="Bookings" value={request.previousBookings} />
            <QuickStat label="No-shows" value={request.noShows} tone={request.noShows > 0 ? "danger" : "success"} />
          </div>
        </div>

        <div className="space-y-4 px-5 py-5">
          {/* Usage Trend with sparkline */}
          <Section
            title="Usage Score · 3-month trend"
            badge={
              <span className={cn("inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold tabular-nums", trendTone)}>
                <TrendIcon className="h-2.5 w-2.5" />
                {delta > 0 ? "+" : ""}{delta}
              </span>
            }
          >
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={ringColor} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={ringColor} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#spark-fill)" />
              <path d={path} fill="none" stroke={ringColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {points.map((p, i) => (
                <circle key={i} cx={p[0]} cy={p[1]} r={i === points.length - 1 ? 3 : 2} fill={ringColor} />
              ))}
            </svg>
            <div className="mt-1 flex justify-between px-1">
              {request.usageHistory.map((p) => (
                <div key={p.month} className="flex flex-col items-center">
                  <span className="text-[10px] font-semibold tabular-nums text-foreground">{p.score}</span>
                  <span className="text-[9px] uppercase tracking-wide text-muted-foreground">{p.month}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Acceptance breakdown */}
          <Section title="Acceptance breakdown">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tabular-nums">{request.acceptanceRate}%</span>
                <span className="text-[11px] text-muted-foreground">accepted</span>
              </div>
              <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                {acceptedCount} / {request.previousRequests} requests
              </span>
            </div>
            <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-muted">
              <div className="bg-success" style={{ width: `${request.acceptanceRate}%` }} />
              <div className="bg-destructive/40" style={{ width: `${100 - request.acceptanceRate}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Accepted {acceptedCount}</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-destructive/40" /> Declined {request.previousRequests - acceptedCount}</span>
            </div>
          </Section>

          {/* Reliability */}
          <Section title="Reliability">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {reliable ? (
                  <BadgeCheck className="h-5 w-5 text-success" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-warning-foreground" />
                )}
                <div>
                  <p className="text-sm font-semibold">
                    {reliable ? "Perfect attendance" : `${request.noShows} no-show${request.noShows === 1 ? "" : "s"}`}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{request.attendanceSummary}</p>
                </div>
              </div>
              <span className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight",
                reliable
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-warning/40 bg-warning/10 text-warning-foreground"
              )}>
                {reliable ? "Trusted" : "Review"}
              </span>
            </div>
          </Section>

          {/* Flags */}
          {request.flags.length > 0 ? (
            <Section title="Compliance flags">
              <ul className="space-y-1.5">
                {request.flags.map((f) => (
                  <li key={f} className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-2.5 py-1.5 text-xs text-warning-foreground">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{FLAG_LABEL[f] ?? f.replace(/_/g, " ")}</span>
                  </li>
                ))}
              </ul>
            </Section>
          ) : (
            <Section title="Compliance">
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="h-4 w-4 text-success" />
                <span className="font-medium text-foreground">No flags raised</span>
                <span className="text-muted-foreground">— clean profile</span>
              </div>
            </Section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function QuickStat({ label, value, tone = "default" }: { label: string; value: number | string; tone?: "default" | "success" | "danger" | "muted" }) {
  const tones: Record<string, string> = {
    default: "text-foreground",
    success: "text-success",
    danger: "text-destructive",
    muted: "text-muted-foreground",
  };
  return (
    <div className="rounded-lg border border-border bg-card/60 px-2 py-1.5 backdrop-blur">
      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 text-sm font-bold tabular-nums leading-none", tones[tone])}>{value}</p>
    </div>
  );
}

function Section({ title, badge, children }: { title: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{title}</h4>
        {badge}
      </div>
      <div className="rounded-xl border border-border bg-card p-3 shadow-sm">{children}</div>
    </div>
  );
}
