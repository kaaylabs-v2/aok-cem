import { AppShell } from "@/components/AppShell";
import { ReportViewer } from "@/components/reports/ReportViewer";

const ReportView = () => (
  <AppShell onOpenNotification={() => {}}>
    <ReportViewer />
  </AppShell>
);

export default ReportView;
