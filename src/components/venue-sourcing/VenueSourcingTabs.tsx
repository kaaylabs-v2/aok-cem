import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Venue Savings",   to: "/venue-sourcing",          match: (p: string) => p === "/venue-sourcing" },
  { label: "Venue Feedback",  to: "/venue-sourcing/feedback", match: (p: string) => p.startsWith("/venue-sourcing/feedback") },
];

export function VenueSourcingTabs({ currentPath }: { currentPath: string }) {
  return (
    <div className="border-b border-border/60">
      <nav className="flex flex-wrap gap-1">
        {TABS.map((t) => {
          const active = t.match(currentPath);
          return (
            <NavLink
              key={t.label}
              to={t.to}
              className={cn(
                "rounded-t-lg px-3 py-2 text-xs font-medium transition-colors",
                active
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
