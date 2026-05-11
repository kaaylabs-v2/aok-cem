import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { NotificationItem } from "@/data/portfolio";

interface AppShellProps {
  children: ReactNode;
  onOpenNotification: (n: NotificationItem) => void;
}

export function AppShell({ children, onOpenNotification }: AppShellProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-bg">
        <AppSidebar />
        <div className="min-w-0 flex-1 p-2 md:p-3">
          <div className="mx-auto flex min-w-0 max-w-[1600px] flex-col rounded-[2rem] border border-border/60 bg-card/70 shadow-panel backdrop-blur-xl">
            <TopBar onOpenNotification={onOpenNotification} showSidebarTrigger />
            <main className="px-3 py-4 sm:px-4 sm:py-6 md:px-6">
              <div className="w-full space-y-6">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
