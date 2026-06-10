import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileBarChart2, CalendarClock, Bookmark, ShieldAlert, Activity, DollarSign,
  Plus, Sparkles, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/StatCard";
import { REPORT_TEMPLATES, KPI_SUMMARY, ReportTemplate } from "@/data/reportTemplates";
import { ReportConfigDrawer } from "./ReportConfigDrawer";
import { ScheduleReportDialog } from "./ScheduleReportDialog";
import { SaveConfigDialog } from "./SaveConfigDialog";
import { formatDistanceToNow } from "date-fns";

export function ReportLibrary() {
  const k = KPI_SUMMARY();
  const navigate = useNavigate();
  const [configTpl, setConfigTpl] = useState<ReportTemplate | null>(null);
  const [scheduleTpl, setScheduleTpl] = useState<ReportTemplate | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight">Report Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate, customize, export, and schedule reports across Inventory, Enquiries, Compliance, and Spend Management.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => setSaveOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Create Custom Report
          </Button>
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => setScheduleTpl(REPORT_TEMPLATES[0])}>
            <CalendarClock className="mr-1.5 h-4 w-4" /> Schedule Report
          </Button>
          <Button size="sm" className="rounded-full" onClick={() => setConfigTpl(REPORT_TEMPLATES[0])}>
            <Sparkles className="mr-1.5 h-4 w-4" /> Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatCard variant="sparkline" icon={FileBarChart2} label="Reports This Month" value={k.generatedThisMonth} sub="vs last month" trend={9} />
        <StatCard variant="radial" progress={70} icon={CalendarClock} label="Scheduled Active" value={k.activeScheduled} sub="active" trend={2} />
        <StatCard variant="matrix" icon={Bookmark} label="Saved Templates" value={k.savedTemplates} sub="library" trend={1} />
        <StatCard variant="gauge" progress={65} icon={ShieldAlert} label="Compliance Runs" value={k.complianceRuns} sub="last 30d" trend={3} />
        <StatCard variant="radial" progress={72} icon={Activity} label="Avg. Utilisation" value={k.avgUtilisation} sub="portfolio" trend={4} />
        <StatCard variant="sparkline" icon={DollarSign} label="Entertainment Spend" value={k.totalSpend} sub="last 90d" trend={8} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Pre-Built Report Templates</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {REPORT_TEMPLATES.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.id} className="group flex flex-col rounded-2xl border border-border/60 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground/70">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-medium">{t.pillar}</Badge>
                </div>
                <h3 className="mt-3 text-sm font-semibold">{t.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{t.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {t.visualizations.slice(0, 4).map((v) => (
                    <span key={v} className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{v}</span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" /> Last generated {formatDistanceToNow(new Date(t.lastGenerated), { addSuffix: true })}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" className="flex-1 rounded-full" onClick={() => setConfigTpl(t)}>Generate</Button>
                  <Button size="sm" variant="outline" className="flex-1 rounded-full" onClick={() => setScheduleTpl(t)}>Schedule</Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ReportConfigDrawer
        template={configTpl}
        open={!!configTpl}
        onOpenChange={(o) => !o && setConfigTpl(null)}
        onGenerate={(tpl) => { setConfigTpl(null); navigate(`/reports/view/${tpl.id}`); }}
        onSaveConfig={() => { setSaveOpen(true); }}
      />
      <ScheduleReportDialog
        template={scheduleTpl}
        open={!!scheduleTpl}
        onOpenChange={(o) => !o && setScheduleTpl(null)}
      />
      <SaveConfigDialog open={saveOpen} onOpenChange={setSaveOpen} />
    </>
  );
}
