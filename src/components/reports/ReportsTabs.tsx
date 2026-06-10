import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Report Library",    to: "/reports",            match: (p: string) => p === "/reports" },
  { label: "Custom Reports",    to: "/reports/custom",     match: (p: string) => p.startsWith("/reports/custom") },
  { label: "Scheduled Reports", to: "/reports/scheduled",  match: (p: string) => p.startsWith("/reports/scheduled") },
];

export function ReportsTabs({ currentPath }: { currentPath: string }) {
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
