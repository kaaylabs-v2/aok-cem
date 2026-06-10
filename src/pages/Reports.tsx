import { useState } from "react";
import { useLocation } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { EventDrawer } from "@/components/EventDrawer";
import { WaitlistDialog } from "@/components/WaitlistDialog";
import { events as allEvents, NotificationItem, PortfolioEvent } from "@/data/portfolio";
import { ReportsTabs } from "@/components/reports/ReportsTabs";
import { ReportLibrary } from "@/components/reports/ReportLibrary";

const Reports = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [selected, setSelected] = useState<PortfolioEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();

  const onNotification = (n: NotificationItem) => {
    if (n.type === "waitlist") setWaitlistOpen(true);
    else if (n.eventId) {
      const ev = allEvents.find((e) => e.id === n.eventId);
      if (ev) { setSelected(ev); setDrawerOpen(true); }
    }
  };

  return (
    <>
      <AppShell onOpenNotification={onNotification}>
        <ReportsTabs currentPath={pathname} />
        <ReportLibrary />
      </AppShell>
      <EventDrawer event={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
      <WaitlistDialog open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </>
  );
};

export default Reports;
