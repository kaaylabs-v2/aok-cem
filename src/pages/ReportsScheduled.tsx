import { useState } from "react";
import { useLocation } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ReportsTabs } from "@/components/reports/ReportsTabs";
import { ScheduledReportsTable } from "@/components/reports/ScheduledReportsTable";
import { BIExportPanel } from "@/components/reports/BIExportPanel";
import { Button } from "@/components/ui/button";
import { CalendarClock } from "lucide-react";
import { ScheduleReportDialog } from "@/components/reports/ScheduleReportDialog";
import { REPORT_TEMPLATES } from "@/data/reportTemplates";

const ReportsScheduled = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  return (
    <AppShell onOpenNotification={() => {}}>
      <ReportsTabs currentPath={pathname} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Scheduled Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage cadence, recipients and delivery for automated reports.</p>
        </div>
        <Button size="sm" className="rounded-full" onClick={() => setOpen(true)}>
          <CalendarClock className="mr-1.5 h-4 w-4" /> New Schedule
        </Button>
      </div>
      <ScheduledReportsTable />
      <BIExportPanel />
      <ScheduleReportDialog template={REPORT_TEMPLATES[0]} open={open} onOpenChange={setOpen} />
    </AppShell>
  );
};

export default ReportsScheduled;
