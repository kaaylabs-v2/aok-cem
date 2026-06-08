import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Users",          to: "/users",              match: (p: string) => p === "/users" },
  { label: "User Groups",    to: "/users/groups",       match: (p: string) => p.startsWith("/users/groups") },
  { label: "Approval Rules", to: "/approvals",          match: (p: string) => p.startsWith("/approvals") },
  { label: "Entitlements",   to: "/users?tab=entitlements", match: () => false },
  { label: "Audit Trail",    to: "/audit",              match: (p: string) => p.startsWith("/audit") },
  { label: "Delegations",    to: "/users/delegations",  match: (p: string) => p.startsWith("/users/delegations") },
];

export function UsersTabs({ currentPath }: { currentPath: string }) {
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
