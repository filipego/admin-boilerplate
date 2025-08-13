"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ModeToggle from "@/components/theme/ModeToggle";

type Props = {
  user?: { name?: string | null; email?: string | null; avatarUrl?: string | null };
  showTheme?: boolean; // header already has a theme toggle, so default to false
  fallbackTransparent?: boolean; // when true, hide the fallback letter (avoid flash); default false
  autoLoad?: boolean; // load current user/profile from Supabase when user prop not provided (default true)
};

export default function UserAvatarMenu({ user, showTheme = false, fallbackTransparent = false, autoLoad = true }: Props) {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [loaded, setLoaded] = useState<{ name?: string | null; email?: string | null; avatarUrl?: string | null } | null>(null);

  useEffect(() => {
    if (user || !autoLoad) return;
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!u) {
        if (mounted) setLoaded(null);
        return;
      }
      const { data: p } = await supabase
        .from("profiles")
        .select("username, email, avatar_url")
        .eq("id", u.id)
        .maybeSingle();
      if (mounted) setLoaded({ name: p?.username ?? null, email: p?.email ?? u.email ?? null, avatarUrl: p?.avatar_url ?? null });
    })();
    return () => { mounted = false; };
  }, [user, autoLoad, supabase]);

  const displayUser = user ?? loaded ?? null;
  const initials = useMemo(() => {
    const n = displayUser?.name || displayUser?.email || "U";
    return n.substring(0, 2).toUpperCase();
  }, [displayUser]);

  const envLabel = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "development";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="inline-flex items-center gap-2 rounded-full p-0.5 hover:bg-accent/50 cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarImage src={displayUser?.avatarUrl || undefined} alt="" />
            <AvatarFallback className={fallbackTransparent ? "bg-transparent" : undefined}>
              {fallbackTransparent ? null : initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-sm">
          <div className="font-medium">{displayUser?.name || displayUser?.email || "User"}</div>
          {displayUser?.email ? <div className="text-xs text-muted-foreground">{displayUser.email}</div> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        {showTheme ? (
          <DropdownMenuItem>
            <div className="flex w-full items-center justify-between">
              <span>Theme</span>
              <ModeToggle />
            </div>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>Environment: {envLabel}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace("/login");
          }}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


