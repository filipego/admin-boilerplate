import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { cookies } from "next/headers";

export function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    );
  }

  type CookiePair = { name: string; value: string };
  type PossibleCookiesStore = {
    getAll?: () => CookiePair[];
    set?: (name: string, value: string, options?: Record<string, unknown>) => void;
  };

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      const store = cookies() as unknown as PossibleCookiesStore;
      const all = typeof store.getAll === "function" ? store.getAll() ?? [] : [];
      return all.map((c) => ({ name: c.name, value: c.value }));
    },
    setAll(cookiesToSet) {
      const store = cookies() as unknown as PossibleCookiesStore;
      if (typeof store.set !== "function") return;
      cookiesToSet.forEach(({ name, value, options }) => {
        store.set?.(name, value, options as Record<string, unknown>);
      });
    },
  };

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: cookieMethods,
  });
}


