import { useState } from "react";
import { Bell, ChevronDown, Search, Building2, Check } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { notifications as initial, NotificationItem } from "@/data/portfolio";
import { cn } from "@/lib/utils";

const tenants = ["Acme Events Group", "Northwind Live", "Helix Conferences"];

interface Props {
  onOpenNotification: (n: NotificationItem) => void;
}

export function TopBar({ onOpenNotification }: Props) {
  const [tenant, setTenant] = useState(tenants[0]);
  const [notifs, setNotifs] = useState(initial);
  const unread = notifs.filter((n) => n.unread).length;

  const markAll = () => setNotifs((ns) => ns.map((n) => ({ ...n, unread: false })));

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-2 font-medium">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <span className="hidden sm:inline">{tenant}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Switch organisation</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {tenants.map((t) => (
            <DropdownMenuItem key={t} onClick={() => setTenant(t)} className="justify-between">
              {t}
              {t === tenant && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto hidden flex-1 max-w-md md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search events, venues, attendees…" className="pl-9 bg-secondary/60 border-transparent focus-visible:bg-background" />
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {unread}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-0">
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <p className="text-sm font-semibold">Notifications</p>
            <button onClick={markAll} className="text-xs text-primary hover:underline">Mark all read</button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifs.map((n) => (
              <button
                key={n.id}
                onClick={() => onOpenNotification(n)}
                className={cn(
                  "flex w-full gap-3 border-b border-border/60 px-3 py-3 text-left transition-colors hover:bg-secondary/60",
                  n.unread && "bg-accent/30"
                )}
              >
                <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", n.unread ? "bg-primary" : "bg-transparent")} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{n.time}</p>
                </div>
                <Badge variant="outline" className="h-5 shrink-0 text-[10px] capitalize">
                  {n.type === "underperform" ? "alert" : n.type}
                </Badge>
              </button>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full pr-2 transition-colors hover:bg-secondary/60">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-primary text-xs font-semibold text-primary-foreground">EM</AvatarFallback>
            </Avatar>
            <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Elena Martins</span>
              <span className="text-xs font-normal text-muted-foreground">elena@acme.events</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile settings</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Audit trail</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
