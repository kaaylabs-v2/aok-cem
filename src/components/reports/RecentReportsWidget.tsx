import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileBarChart2, CalendarClock, Bookmark, Sparkles } from "lucide-react";
import { REPORT_TEMPLATES, CUSTOM_REPORTS, SCHEDULED } from "@/data/reportTemplates";
import { formatDistanceToNow } from "date-fns";

export function RecentReportsWidget() {
  const navigate = useNavigate();
  const recent = REPORT_TEMPLATES.slice(0, 3);
  const scheduled = SCHEDULED.slice(0, 3);
  const saved = CUSTOM_REPORTS.slice(0, 3);

  return (
    <section className="rounded-3xl border border-border/60 bg-card/80 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold">Reports</h2>
          <p className="text-xs text-muted-foreground">Quick access to recent activity and saved configurations.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/reports")}>
          Open Library <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Column title="Recently Generated" icon={FileBarChart2}>
          {recent.map((t) => (
            <button key={t.id} onClick={() => navigate(`/reports/view/${t.id}`)} className="w-full rounded-xl border border-border/60 bg-background p-3 text-left transition-colors hover:bg-muted/40">
              <div className="text-xs font-medium">{t.name}</div>
              <div className="text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(t.lastGenerated), { addSuffix: true })}</div>
            </button>
          ))}
        </Column>
        <Column title="Scheduled" icon={CalendarClock}>
          {scheduled.map((s) => (
            <button key={s.id} onClick={() => navigate("/reports/scheduled")} className="w-full rounded-xl border border-border/60 bg-background p-3 text-left transition-colors hover:bg-muted/40">
              <div className="text-xs font-medium">{s.reportName}</div>
              <div className="text-[11px] text-muted-foreground">{s.frequency} · {s.status}</div>
            </button>
          ))}
        </Column>
        <Column title="Saved" icon={Bookmark}>
          {saved.map((s) => (
            <button key={s.id} onClick={() => navigate("/reports/custom")} className="w-full rounded-xl border border-border/60 bg-background p-3 text-left transition-colors hover:bg-muted/40">
              <div className="text-xs font-medium">{s.name}</div>
              <div className="text-[11px] text-muted-foreground">{s.owner} · {s.sharedWith}</div>
            </button>
          ))}
        </Column>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground self-center mr-1">Quick generate:</span>
        {REPORT_TEMPLATES.slice(0, 4).map((t) => (
          <Button key={t.id} size="sm" variant="outline" className="h-7 rounded-full text-xs" onClick={() => navigate(`/reports/view/${t.id}`)}>
            <Sparkles className="mr-1.5 h-3 w-3" /> {t.name.replace(" Report", "")}
          </Button>
        ))}
      </div>
    </section>
  );
}

function Column({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" /> {title}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}
