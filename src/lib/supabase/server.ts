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

  const cookieMethods: CookieMethodsServer = {
    async getAll() {
      const store = await cookies();
      const all = store.getAll();
      return all.map((c) => ({ name: c.name, value: c.value }));
    },
  };

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: cookieMethods,
  });
}

// Use this in Server Actions or Route Handlers where cookie writes are allowed
export function getSupabaseServerClientWritable() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    );
  }

  const cookieMethods: CookieMethodsServer = {
    async getAll() {
      const store = await cookies();
      const all = store.getAll();
      return all.map((c) => ({ name: c.name, value: c.value }));
    },
    async setAll(cookiesToSet) {
      const store = await cookies();
      for (const { name, value, options } of cookiesToSet) {
        store.set(name, value, options as Record<string, unknown>);
      }
    },
  };

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: cookieMethods,
  });
}


