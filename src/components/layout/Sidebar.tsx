"use client";

import Link from "next/link";
import { useSidebarStore } from "@/store/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SidebarThemeControl from "@/components/sidebar/SidebarThemeControl";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { mainItems as configMainItems, personalItems as configPersonalItems } from "@/components/layout/sidebar.config";

const mainItems = configMainItems;
const personalItems = configPersonalItems;

const Sidebar = () => {
  const { collapsed, toggle, showProfile, showSidebarTheme, showBottomActions, hasHydrated, setHasHydrated } = useSidebarStore();
  // Client Supabase used only for realtime profile updates; reads gated by RLS
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  type Profile = { username: string | null; email: string | null; avatar_url: string | null };
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // ensure hydration flag in case onRehydrateStorage didn't run
    if (!hasHydrated) setHasHydrated(true);
  }, [hasHydrated, setHasHydrated]);

  const handleToggle = () => toggle();

  // Initial load of current user's profile
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const res = await fetch('/api/me', { cache: 'no-store' });
      if (!res.ok) { if (isMounted) setProfile(null); return; }
      const json = await res.json();
      const p = json.profile as { id: string; email: string | null; username: string | null; avatar_url: string | null } | null;
      if (isMounted) {
        setCurrentUserId(p?.id ?? null);
        setProfile(p ? { username: p.username, email: p.email, avatar_url: p.avatar_url } : null);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Realtime updates (subscribe once per user id)
  useEffect(() => {
    if (!currentUserId) return;
    const channel = supabase
      .channel("public:profiles")
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload: { new?: { id?: string } }) => {
        const row = payload.new;
        if (!row || row.id !== currentUserId) return;
        supabase
          .from("profiles")
          .select("username, email, avatar_url")
          .eq("id", currentUserId)
          .maybeSingle()
          .then(({ data: p }) => { if (p) setProfile(p); });
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [supabase, currentUserId]);

  const initials = useMemo(() => {
    const src = profile?.username || profile?.email || "";
    const first = src.trim()[0]?.toUpperCase();
    const second = src.trim().split(" ")[1]?.[0]?.toUpperCase();
    return `${first || "U"}${second || ""}`;
  }, [profile]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.replace("/login");
  };

  return (
    <aside
      data-ui="sidebar"
      className={cn(
        "border-r border-border bg-sidebar text-sidebar-foreground h-dvh sticky top-0",
        collapsed ? undefined : undefined
      )}
      style={{
        visibility: hasHydrated ? undefined : "hidden",
        width: collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)'
      }}
      aria-label="Primary"
    >
      <div className="flex h-dvh flex-col">
        <div data-ui="sidebar-header" className="flex items-center justify-between px-3 py-3 border-b border-sidebar-border">
          <Link
            href="/dashboard"
            data-ui="sidebar-logo"
            className={cn(
              "font-semibold focus:outline-none focus:ring-2 focus:ring-ring rounded-sm",
              collapsed && "sr-only"
            )}
          >
            Studio Admin
          </Link>
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

        <nav data-ui="sidebar-nav" className="px-2 py-2 flex-1 flex flex-col">
          <ul data-ui="sidebar-nav-main" className="space-y-1">
            {mainItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    data-ui={`sidebar-nav-item:${label.toLowerCase().replace(/\s+/g, '-')}`}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-accent text-accent-foreground",
                      collapsed && "justify-center"
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                    <span className={cn(collapsed && "sr-only")}>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {personalItems.length > 0 ? (
            <>
              <div className="mt-4 border-t border-sidebar-border pt-2" />
              <ul data-ui="sidebar-nav-personal" className="space-y-1">
                {personalItems.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        data-ui={`sidebar-nav-item:${label.toLowerCase().replace(/\s+/g, '-')}`}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                          isActive && "bg-accent text-accent-foreground",
                          collapsed && "justify-center"
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden />
                        <span className={cn(collapsed && "sr-only")}>{label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}

          <div data-ui="sidebar-footer" className="mt-auto border-t border-sidebar-border pt-2">
            {showProfile ? (
              <div
                data-ui="sidebar-profile"
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2",
                  collapsed && "justify-center"
                )}
              >
                <Avatar className="h-8 w-8">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={profile?.username ?? profile?.email ?? ""} />
                  ) : null}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className={cn("text-sm", collapsed && "sr-only")}>
                  <div className="font-medium">{profile?.username || "Profile"}</div>
                  <div className="text-xs text-muted-foreground">{profile?.email || ""}</div>
                </div>
              </div>
            ) : null}
            <div className="px-2 pt-2">
              {showSidebarTheme ? <SidebarThemeControl collapsed={collapsed} /> : null}
            </div>
            {showBottomActions ? (
              <div className="space-y-1">
                <button
                  type="button"
                  data-ui="sidebar-logout"
                  onClick={handleLogout}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    collapsed && "justify-center"
                  )}
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" aria-hidden />
                  <span className={cn(collapsed && "sr-only")}>Logout</span>
                </button>
              </div>
            ) : null}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

