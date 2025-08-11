"use client";

import Link from "next/link";
import { useSidebarStore } from "@/store/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import SidebarThemeControl from "@/components/sidebar/SidebarThemeControl";
import { useEffect } from "react";
import { cn } from "@/utils/cn";
import {
  Home,
  Users,
  Briefcase,
  User,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  LogOut,
  type LucideIcon,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };

const mainItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/projects", label: "Projects", icon: Briefcase },
  { href: "/users", label: "Users", icon: Users },
  { href: "/reports", label: "Reports / Analytics", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

const personalItems: NavItem[] = [];

const bottomItems: NavItem[] = [
  { href: "/login", label: "Logout", icon: LogOut },
];

const Sidebar = () => {
  const { collapsed, toggle, showProfile, showSidebarTheme, showBottomActions, hasHydrated, setHasHydrated } = useSidebarStore();

  useEffect(() => {
    // ensure hydration flag in case onRehydrateStorage didn't run
    if (!hasHydrated) setHasHydrated(true);
  }, [hasHydrated, setHasHydrated]);

  const handleToggle = () => toggle();

  return (
    <aside
      className={cn(
        "border-r border-border bg-sidebar text-sidebar-foreground h-dvh sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
      style={{ visibility: hasHydrated ? undefined : "hidden" }}
      aria-label="Primary"
    >
      <div className="flex h-dvh flex-col">
        <div className="flex items-center justify-between px-3 py-3 border-b border-sidebar-border">
          <span className={cn("font-semibold", collapsed && "sr-only")}>Studio Admin</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            onClick={handleToggle}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="px-2 py-2 flex-1 flex flex-col">
          <ul className="space-y-1">
            {mainItems.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                    collapsed && "justify-center"
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  <span className={cn(collapsed && "sr-only")}>{label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {personalItems.length > 0 ? (
            <>
              <div className="mt-4 border-t border-sidebar-border pt-2" />
              <ul className="space-y-1">
                {personalItems.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                        collapsed && "justify-center"
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                      <span className={cn(collapsed && "sr-only")}>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <div className="mt-auto border-t border-sidebar-border pt-2">
            {showProfile ? (
              <div
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2",
                  collapsed && "justify-center"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>ST</AvatarFallback>
                </Avatar>
                <div className={cn("text-sm", collapsed && "sr-only")}>
                  <div className="font-medium">Sam Taylor</div>
                  <div className="text-xs text-muted-foreground">sam@example.com</div>
                </div>
              </div>
            ) : null}
            <div className="px-2 pt-2">
              {showSidebarTheme ? <SidebarThemeControl collapsed={collapsed} /> : null}
            </div>
            {showBottomActions ? (
              <ul className="space-y-1">
                {bottomItems.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                        collapsed && "justify-center"
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                      <span className={cn(collapsed && "sr-only")}>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;


