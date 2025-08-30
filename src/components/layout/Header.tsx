"use client";

import MobileSidebar from "@/components/layout/MobileSidebar";
import ModeToggle from "@/components/theme/ModeToggle";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import UserAvatarMenu from "@/components/common/UserAvatarMenu";
import CommandPalette from "@/components/common/CommandPalette";

const Header = () => {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  type Profile = { username: string | null; email: string | null; avatar_url: string | null };
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
  }, [supabase]);

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

  // initials and handleLogout kept previously; remove unused to satisfy linter

  return (
    <header data-ui="header" className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60" style={{ height: 'var(--header-height)' }}>
      <div data-ui="header-container" className="w-full px-2 md:px-4 h-full flex items-center">
        <div data-ui="header-mobile-nav" className="md:hidden mr-1">
          <MobileSidebar showProfile={true} showSidebarTheme={true} showBottomActions={true} />
        </div>
        <div data-ui="header-actions" className="ml-auto flex items-center gap-1 md:gap-2">
          <CommandPalette
            items={[
              { id: "dashboard", label: "Go to Dashboard", href: "/dashboard" },
              { id: "users", label: "Open Users", href: "/users" },
              { id: "profile", label: "Open Profile", href: "/profile" },
            ]}
            placeholder="Search pages or actions..."
          />
          <Button data-ui="header-notifications" variant="ghost" size="icon" aria-label="Notifications" className="h-8 w-8 md:h-10 md:w-10">
            <Bell className="h-5 w-5" />
          </Button>
          <ModeToggle />
          <UserAvatarMenu user={{ name: profile?.username ?? null, email: profile?.email ?? null, avatarUrl: profile?.avatar_url ?? null }} fallbackTransparent={false} />
        </div>
      </div>
    </header>
  );
};

export default Header;

