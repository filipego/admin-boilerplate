"use client";

import MobileSidebar from "@/components/layout/MobileSidebar";
import ModeToggle from "@/components/theme/ModeToggle";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import UserAvatarMenu from "@/components/common/UserAvatarMenu";
import CommandPalette from "@/components/common/CommandPalette";

const Header = () => {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  type Profile = { username: string | null; email: string | null; avatar_url: string | null };
  const [profile, setProfile] = useState<Profile | null>(null);

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

  // initials and handleLogout kept previously; remove unused to satisfy linter

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-2 md:px-4 py-2 md:py-3 flex items-center">
        <div className="md:hidden mr-1">
          <MobileSidebar showProfile={true} showSidebarTheme={true} showBottomActions={true} />
        </div>
        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <CommandPalette
            items={[
              { id: "dashboard", label: "Go to Dashboard", href: "/dashboard" },
              { id: "users", label: "Open Users", href: "/users" },
              { id: "profile", label: "Open Profile", href: "/profile" },
            ]}
            placeholder="Search pages or actions..."
          />
          <Button variant="ghost" size="icon" aria-label="Notifications" className="h-8 w-8 md:h-10 md:w-10">
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


