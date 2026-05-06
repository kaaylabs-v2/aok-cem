import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function DesignToggle() {
  const { pathname } = useLocation();
  const isV2 = pathname.startsWith("/v2");

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-1 rounded-full border border-border/60 bg-card/90 p-1 shadow-panel backdrop-blur">
      <Link
        to="/"
        className={cn(
          "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
          !isV2 ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
        )}
      >
        Classic
      </Link>
      <Link
        to="/v2"
        className={cn(
          "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
          isV2 ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
        )}
      >
        Soft
      </Link>
    </div>
  );
}
