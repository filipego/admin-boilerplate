"use client";

import Link from "next/link";
import { useSidebarStore } from "@/store/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SidebarThemeControl from "@/components/sidebar/SidebarThemeControl";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { mainItems as configMainItems, personalItems as configPersonalItems } from "@/components/layout/sidebar.config";

const mainItems = configMainItems;
const personalItems = configPersonalItems;

const Sidebar = () => {
  const { collapsed, toggle, showProfile, showSidebarTheme, showBottomActions, hasHydrated, setHasHydrated } = useSidebarStore();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const router = useRouter();
  type Profile = { username: string | null; email: string | null; avatar_url: string | null };
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    // ensure hydration flag in case onRehydrateStorage didn't run
    if (!hasHydrated) setHasHydrated(true);
  }, [hasHydrated, setHasHydrated]);

  const handleToggle = () => toggle();

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        if (isMounted) setProfile(null);
        return;
      }
      const { data: p } = await supabase
        .from("profiles")
        .select("username, email, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (isMounted) setProfile(p ?? { username: null, email: user.email ?? null, avatar_url: null });
    };
    load();
    const channel = supabase
      .channel("public:profiles")
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload: { new?: { id?: string; email?: string; username?: string | null; avatar_url?: string | null } }) => {
        const row = payload.new;
        if (row && row.email && profile && row.email === profile.email) {
          const next: Profile = {
            username: row.username ?? profile.username ?? null,
            email: row.email ?? profile.email ?? null,
            avatar_url: row.avatar_url ?? profile.avatar_url ?? null,
          };
          setProfile(next);
        }
      })
      .subscribe();
    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, [supabase, profile]);

  const initials = useMemo(() => {
    const src = profile?.username || profile?.email || "";
    const first = src.trim()[0]?.toUpperCase();
    const second = src.trim().split(" ")[1]?.[0]?.toUpperCase();
    return `${first || "U"}${second || ""}`;
  }, [profile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

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


