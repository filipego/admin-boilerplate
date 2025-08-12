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
    getAll?: () => CookiePair[] | Promise<CookiePair[]>;
    set?: (name: string, value: string, options?: Record<string, unknown>) => void | Promise<void>;
  };

  const cookieMethods: CookieMethodsServer = {
    async getAll() {
      const store = (await (cookies() as unknown as Promise<ReturnType<typeof cookies>>)) as unknown as PossibleCookiesStore;
      const all = typeof store.getAll === "function" ? await store.getAll() : [];
      return all.map((c) => ({ name: c.name, value: c.value }));
    },
  };

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: cookieMethods,
  });
}


