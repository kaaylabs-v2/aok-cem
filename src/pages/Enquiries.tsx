import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { EnquiriesView } from "@/components/EnquiriesView";
import { WaitlistDialog } from "@/components/WaitlistDialog";
import { EventDrawer } from "@/components/EventDrawer";
import { events as allEvents, NotificationItem, PortfolioEvent } from "@/data/portfolio";

const Enquiries = () => {
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
    <div className="min-h-screen w-full bg-gradient-bg">
      <TopBar onOpenNotification={onNotification} />
      <main className="px-4 py-6 md:px-6 md:py-6">
        <div className="mx-auto w-full max-w-[1600px]">
          <section className="rounded-[2rem] border border-border/60 bg-card/80 p-6 shadow-panel md:p-8">
            <EnquiriesView />
          </section>
        </div>
      </main>
      <EventDrawer event={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
      <WaitlistDialog open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </div>
  );
};

export default Enquiries;
