import { useState } from "react";
import { Bell, ChevronDown, Search, Check, Settings as SettingsIcon, Plus, HelpCircle, Sun, Moon, CalendarPlus, Inbox, Package } from "lucide-react";
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
import { SidebarTrigger } from "@/components/ui/sidebar";
import { notifications as initial, NotificationItem } from "@/data/portfolio";
import { cn } from "@/lib/utils";

const tenants = ["AOK Events", "Northwind Live", "Helix Conferences"];

interface Props {
  onOpenNotification: (n: NotificationItem) => void;
  showSidebarTrigger?: boolean;
}

export function TopBar({ onOpenNotification, showSidebarTrigger = false }: Props) {
  const [tenant, setTenant] = useState(tenants[0]);
  const [notifs, setNotifs] = useState(initial);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const unread = notifs.filter((n) => n.unread).length;

  const markAll = () => setNotifs((ns) => ns.map((n) => ({ ...n, unread: false })));
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <header className="sticky top-2 z-30 px-3 pt-3 md:px-4 md:pt-4 before:pointer-events-none before:absolute before:inset-x-0 before:-top-2 before:bottom-0 before:-z-10 before:bg-gradient-to-b before:from-card before:via-card/95 before:to-transparent">
      <div className="flex h-14 items-center gap-3 rounded-2xl border border-border/60 bg-card/95 px-4 shadow-panel backdrop-blur-xl supports-[backdrop-filter]:bg-card/80 md:px-5">
        {showSidebarTrigger && <SidebarTrigger className="h-8 w-8 md:hidden" />}

        {/* Tenant switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-secondary/60">
              <span className="hidden font-display text-sm font-semibold sm:inline">{tenant}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60">
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

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-1.5">
          {searchOpen ? (
            <div className="relative animate-fade-in">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                onBlur={() => setSearchOpen(false)}
                placeholder="Search events…"
                className="h-9 w-36 rounded-full border-border/60 bg-secondary/60 pl-9 sm:w-44 md:w-56"
              />
            </div>
          ) : (
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => setSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="hidden h-9 gap-1.5 rounded-full px-3 sm:inline-flex">
                <Plus className="h-4 w-4" />
                <span className="text-xs font-semibold">Create</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Quick create</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><CalendarPlus className="mr-2 h-4 w-4" />New event</DropdownMenuItem>
              <DropdownMenuItem><Inbox className="mr-2 h-4 w-4" />New enquiry</DropdownMenuItem>
              <DropdownMenuItem><Package className="mr-2 h-4 w-4" />New inventory item</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>


          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
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
              <button className="ml-1 flex items-center gap-2 rounded-full bg-card/70 py-1 pl-1 pr-3 transition-colors hover:bg-secondary/60">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-gradient-primary text-[11px] font-semibold text-primary-foreground">EM</AvatarFallback>
                </Avatar>
                <div className="hidden text-left leading-tight sm:block">
                  <p className="text-xs font-semibold">Elena Martins</p>
                  <p className="text-[10px] text-muted-foreground">Ev Manager</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Elena Martins</span>
                  <span className="text-xs font-normal text-muted-foreground">elena@aok.events</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile settings</DropdownMenuItem>
              
              <DropdownMenuItem>Audit trail</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
