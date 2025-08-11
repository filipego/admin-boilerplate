import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const admin = getSupabaseAdminClient();
    // Some Supabase versions require RPC to create buckets; fall back to insert
    const { data: exists } = await admin.from("storage.buckets").select("id").eq("id", "avatars").maybeSingle();
    if (!exists) {
      const { error: createErr } = await admin.from("storage.buckets").insert({ id: "avatars", name: "avatars", public: true });
      if (createErr) throw createErr;
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}


