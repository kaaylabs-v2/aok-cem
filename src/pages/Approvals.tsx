import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ApprovalsView } from "@/components/ApprovalsView";
import { WaitlistDialog } from "@/components/WaitlistDialog";
import { EventDrawer } from "@/components/EventDrawer";
import { events as allEvents, NotificationItem, PortfolioEvent } from "@/data/portfolio";

const Approvals = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [selected, setSelected] = useState<PortfolioEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
        <ApprovalsView />
      </AppShell>
      <EventDrawer event={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
      <WaitlistDialog open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </>
  );
};

export default Approvals;
