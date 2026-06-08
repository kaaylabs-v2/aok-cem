import { Entitlements } from "@/data/users";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";

interface Props { ent: Entitlements; currency?: string; }

function pct(used: number, max: number) {
  if (!max) return 0;
  return Math.min(100, Math.round((used / max) * 100));
}

function fmt(n: number) {
  return n.toLocaleString();
}

export function EntitlementSummary({ ent, currency = "GBP" }: Props) {
  const bookingPct = pct(ent.usedBookings, ent.maxBookings);
  const spendPct = pct(ent.usedSpend, ent.maxSpend);
  const monthlyPct = pct(ent.usedMonthly, ent.monthlyAllowance);
  const annualPct = pct(ent.usedSpend, ent.annualAllowance);

  const Row = ({ label, used, max, pctVal, suffix }: { label: string; used: number; max: number; pctVal: number; suffix?: string }) => (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className={pctVal >= 90 ? "text-destructive font-semibold" : "text-muted-foreground"}>
          {pctVal >= 90 && <AlertTriangle className="mr-1 inline h-3 w-3" />}
          {fmt(used)}{suffix ?? ""} / {fmt(max)}{suffix ?? ""} ({pctVal}%)
        </span>
      </div>
      <Progress value={pctVal} className="h-2" />
    </div>
  );

  return (
    <div className="space-y-3">
      <Row label="Bookings (period)" used={ent.usedBookings} max={ent.maxBookings} pctVal={bookingPct} />
      <Row label={`Spend (period, ${currency})`} used={ent.usedSpend} max={ent.maxSpend} pctVal={spendPct} />
      <Row label={`Monthly allowance (${currency})`} used={ent.usedMonthly} max={ent.monthlyAllowance} pctVal={monthlyPct} />
      <Row label={`Annual allowance (${currency})`} used={ent.usedSpend} max={ent.annualAllowance} pctVal={annualPct} />
    </div>
  );
}
