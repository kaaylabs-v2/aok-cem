import { useState } from "react";
import { useLocation } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ReportsTabs } from "@/components/reports/ReportsTabs";
import { CustomReportsTable } from "@/components/reports/CustomReportsTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SaveConfigDialog } from "@/components/reports/SaveConfigDialog";
import { events as allEvents, NotificationItem } from "@/data/portfolio";

const ReportsCustom = () => {
  const { pathname } = useLocation();
  const [saveOpen, setSaveOpen] = useState(false);
  return (
    <AppShell onOpenNotification={() => {}}>
      <ReportsTabs currentPath={pathname} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Custom Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">Saved configurations created by you and your team.</p>
        </div>
        <Button size="sm" className="rounded-full" onClick={() => setSaveOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> New Custom Report
        </Button>
      </div>
      <CustomReportsTable />
      <SaveConfigDialog open={saveOpen} onOpenChange={setSaveOpen} />
    </AppShell>
  );
};

export default ReportsCustom;
