"use client";

import { createBrowserClient } from "@supabase/ssr";

let clientSingleton: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (clientSingleton) return clientSingleton;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    );
  }

  clientSingleton = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return clientSingleton;
}


