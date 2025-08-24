"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, LogOut } from "lucide-react";
import { cn } from "@/utils/cn";
import { mainItems, personalItems, bottomItems } from "@/components/layout/sidebar.config";
import SidebarThemeControl from "@/components/sidebar/SidebarThemeControl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type MobileSidebarProps = {
  showProfile: boolean;
  showSidebarTheme: boolean;
  showBottomActions: boolean;
};

type Profile = { username: string | null; email: string | null; avatar_url: string | null };

const MobileSidebar = ({ showProfile, showSidebarTheme, showBottomActions }: MobileSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
    const supabase = getSupabaseBrowserClient();
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
  }, [currentUserId]);

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
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-3/4 sm:max-w-[320px] p-0">
        <div className="sr-only">
          <SheetTitle>Navigation menu</SheetTitle>
        </div>
        <div className="flex h-dvh flex-col">
          <div className="px-3 py-3 border-b">Studio Admin</div>
          <nav className="px-2 py-2 flex-1 flex flex-col">
            <ul className="space-y-1">
              {mainItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                        isActive && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {personalItems.length > 0 ? (
              <>
                <div className="mt-4 border-t border-sidebar-border pt-2" />
                <ul className="space-y-1">
                  {personalItems.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href || pathname.startsWith(`${href}/`);
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                            isActive && "bg-accent text-accent-foreground"
                          )}
                        >
                          <Icon className="h-5 w-5" aria-hidden />
                          <span>{label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : null}

            <div className="mt-auto border-t border-sidebar-border pt-2">
              {showProfile ? (
                <div className="flex items-center gap-3 rounded-md px-3 py-2">
                  <Avatar className="h-8 w-8">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt={profile?.username ?? profile?.email ?? ""} />
                    ) : null}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <div className="font-medium">{profile?.username || "Profile"}</div>
                    <div className="text-xs text-muted-foreground">{profile?.email || ""}</div>
                  </div>
                </div>
              ) : null}
              {showSidebarTheme ? (
                <div className="px-2 pt-2">
                  <SidebarThemeControl collapsed={false} />
                </div>
              ) : null}
              {showBottomActions ? (
                <ul className="space-y-1">
                  {bottomItems.map(({ href, label, icon: Icon }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden />
                        <span>{label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="px-2 pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" aria-hidden />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;


