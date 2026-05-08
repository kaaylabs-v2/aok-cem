import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Calendar, Boxes, Users2, BarChart3, Settings, Inbox, Headphones, LogOut } from "lucide-react";
import logo from "@/assets/aok-logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Enquiries", url: "/enquiries", icon: Inbox },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Inventory", url: "/inventory", icon: Boxes },
  { title: "Waitlist", url: "/waitlist", icon: Users2 },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const bottomItems = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Support", url: "/support", icon: Headphones },
  { title: "Log out", url: "/logout", icon: LogOut },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-elegant">
            <img src={logo} alt="AOK Events" className="h-full w-full object-cover" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-sidebar-foreground">AOK Events</span>
              <span className="text-[11px] text-sidebar-foreground/75">Portfolio Console</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <NavLink to={item.url} className="flex items-center gap-3 rounded-lg">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          {bottomItems.map((item) => {
            const active = isActive(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                  <NavLink to={item.url} className="flex items-center gap-3 rounded-lg">
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
